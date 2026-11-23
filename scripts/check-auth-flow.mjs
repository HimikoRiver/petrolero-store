// Integration test against disposable PostgreSQL and Mailpit services.
// Uses real Better Auth API routes and real SMTP transport, without production credentials.
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import pg from "pg";

const origin = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3000";
const mailpit = process.env.MAILPIT_URL || "http://127.0.0.1:8025";
const email = "petrolero-auth-" + randomUUID() + "@example.test";
const firstPassword = "First-Auth-Test-2026!";
const newPassword = "Second-Auth-Test-2026!";

async function until(callback, label, timeoutMs = 90000) {
  const end = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < end) {
    try {
      const value = await callback();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(500);
  }
  throw new Error("Timed out: " + label + (lastError ? " (" + lastError.message + ")" : ""));
}

async function authRequest(path, { body, cookie, method = body ? "POST" : "GET" } = {}) {
  const headers = { origin };
  if (body) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;

  const response = await fetch(origin + path, {
    method,
    redirect: "manual",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = raw; }
  return { response, data };
}

function assertOkay(result, label) {
  assert.ok(
    result.response.ok,
    label + " HTTP " + result.response.status + " " + JSON.stringify(result.data).slice(0, 300),
  );
}

async function getEmail(subjectFragment, recipient = email) {
  return until(async () => {
    const listResponse = await fetch(mailpit + "/api/v1/messages");
    if (!listResponse.ok) return null;
    const { messages = [] } = await listResponse.json();
    const match = messages.find((message) =>
      String(message.Subject || "").toLowerCase().includes(subjectFragment) &&
      (message.To || []).some((to) => String(to.Address).toLowerCase() === recipient.toLowerCase())
    );
    if (!match) return null;
    const detailResponse = await fetch(mailpit + "/api/v1/message/" + encodeURIComponent(match.ID));
    if (!detailResponse.ok) return null;
    return detailResponse.json();
  }, "SMTP message for " + subjectFragment, 30000);
}

function linkIn(message, path) {
  const urls = String(message.Text || "").match(/https?:\/\/[^\s<>"']+/g) || [];
  const candidate = urls.find((value) => value.includes(path));
  assert.ok(candidate, "Email did not contain expected link " + path);
  const parsed = new URL(candidate.replace(/[.,;)}]+$/, ""));
  assert.equal(parsed.origin, origin, "Email links must point to the test application");
  return parsed;
}

function makeTotp(base32, timeMs = Date.now()) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, value = 0;
  const bytes = [];
  for (const char of base32.replace(/=+$/, "").toUpperCase()) {
    const digit = alphabet.indexOf(char);
    assert.ok(digit >= 0, "Unexpected character in TOTP secret");
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
    }
  }
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(timeMs / 30_000)));
  const hash = createHmac("sha1", Buffer.from(bytes)).update(counter).digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const number = (hash.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(number).padStart(6, "0");
}

function cookieOf(response) {
  const values = response.headers.getSetCookie();
  assert.ok(values.length > 0, "Sign-in response did not create a session cookie");
  return values.map((item) => item.split(";")[0]).join("; ");
}

console.log("Checking service readiness...");
await until(async () => {
  const result = await authRequest("/api/auth/get-session");
  return result.response.ok;
}, "Better Auth server");
await until(async () => {
  const response = await fetch(mailpit + "/api/v1/messages");
  return response.ok;
}, "Mailpit API");

// Test fixtures belong ONLY to this temporary PostgreSQL database.
// Production catalog is never seeded; it is populated via /admin.
console.log("0. Seed four test-only products for legacy cart and favorites cases");
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
try {
  for (const [id, sku, title, price, category, packaging] of [
    ["demo-fusion", "DEMO-FU-530", "PETROLERO FUSION 5W-30", 750000, "passenger", "drum"],
    ["demo-ninja", "DEMO-NI-530", "PETROLERO NINJA 5W-30", 259000, "passenger", "canister"],
    ["demo-elite", "DEMO-EL-530", "PETROLERO ELITE 5W-30", 800000, "passenger", "drum"],
    ["demo-performance", "DEMO-AD-P1", "PETROLERO PERFORMANCE 1", 139000, "additives", "bottle"],
  ]) {
    await db.query(
      'INSERT INTO "product" ("id","slug","sku","title","category","description","packaging","image","priceKopecks","stockQuantity","published") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT ("id") DO NOTHING',
      [id, id, sku, title, category, "Описание тестового товара для проверки магазина.", packaging,
        category === "additives" ? "/catalog/products/additives/performance-1.avif" : "/catalog/products/oils/petrolero-drum.avif",
        price, 12, true],
    );
  }
} finally {
  await db.end();
}

console.log("1. Create account and confirm verification email");
const signUp = await authRequest("/api/auth/sign-up/email", {
  body: {
    name: "Petrolero Test",
    email,
    password: firstPassword,
    callbackURL: "/account/login?verified=1",
  },
});
assertOkay(signUp, "sign up");
const verificationEmail = await getEmail("подтверждение почты");
const verifyLink = linkIn(verificationEmail, "/api/auth/verify-email");

console.log("2. Reject unverified sign-in");
const blockedLogin = await authRequest("/api/auth/sign-in/email", {
  body: { email, password: firstPassword },
});
assert.ok(!blockedLogin.response.ok, "Unverified email was allowed to sign in");

console.log("3. Verify email via actual mailed link");
const verifyResponse = await fetch(verifyLink, { redirect: "manual" });
assert.ok(
  verifyResponse.status >= 200 && verifyResponse.status < 400,
  "Verification failed: HTTP " + verifyResponse.status,
);

console.log("4. Sign in and read session");
const login = await authRequest("/api/auth/sign-in/email", {
  body: { email, password: firstPassword, rememberMe: true },
});
assertOkay(login, "verified sign in");
const cookie = cookieOf(login.response);
const session = await authRequest("/api/auth/get-session", { cookie });
assertOkay(session, "get session");
assert.equal(session.data?.user?.email, email);
assert.equal(session.data?.user?.emailVerified, true);

console.log("4. Check account navigation and session across the homepage");
const authenticatedHome = await authRequest("/", { cookie });
assertOkay(authenticatedHome, "homepage with active session");
assert.ok(String(authenticatedHome.data).includes('href="/account"'),
  "Header account icon must link to the protected account route");
const accountAfterHome = await authRequest("/account", { cookie });
assertOkay(accountAfterHome, "account remains accessible after visiting homepage");
assert.ok(String(accountAfterHome.data).includes("Личный кабинет"),
  "Active session must be usable after visiting the homepage");
assert.ok(!String(accountAfterHome.data).includes('href="/admin"'),
  "A customer must not see the admin navigation link");

console.log("4a. Check profile, owned addresses and unauthorized access");
const unauthProfile = await authRequest("/api/account/profile", {
  method: "PATCH",
  body: { name: "Not Authorized", phone: "+7 900 111 22 33" },
});
assert.equal(unauthProfile.response.status, 401, "Profile update must require a session");
const updateProfile = await authRequest("/api/account/profile", {
  cookie,
  method: "PATCH",
  body: { name: "Petrolero Customer", phone: "+7 900 111 22 33" },
});
assertOkay(updateProfile, "update profile");
assert.equal(updateProfile.data.profile.name, "Petrolero Customer");
assert.equal(updateProfile.data.profile.phone, "+7 900 111 22 33");

console.log("4a. Bound JSON requests to prevent oversized body exhaustion");
const oversizedProfile = await authRequest("/api/account/profile", {
  cookie,
  method: "PATCH",
  body: { name: "X".repeat(70_000), phone: "+7 900 111 22 33" },
});
assert.equal(oversizedProfile.response.status, 400,
  "Oversized request should be rejected before JSON parsing");
const incorrectContentType = await fetch(origin + "/api/account/profile", {
  method: "PATCH",
  headers: { origin, cookie, "content-type": "text/plain" },
  body: JSON.stringify({ name: "Wrong Content Type", phone: "+7 900 111 22 33" }),
});
assert.equal(incorrectContentType.status, 400, "Only JSON request bodies are accepted");

// Chunked JSON with no Content-Length is subject to the same byte limit.
const oversizedJson = JSON.stringify({
  name: "X".repeat(70_000),
  phone: "+7 900 111 22 33",
});
const chunkedStream = new ReadableStream({
  start(controller) {
    for (let offset = 0; offset < oversizedJson.length; offset += 8_000) {
      controller.enqueue(new TextEncoder().encode(oversizedJson.slice(offset, offset + 8_000)));
    }
    controller.close();
  },
});
const chunkedResponse = await fetch(origin + "/api/account/profile", {
  method: "PATCH",
  headers: { origin, cookie, "content-type": "application/json" },
  body: chunkedStream,
  duplex: "half",
});
assert.equal(chunkedResponse.status, 400,
  "Oversized chunked JSON must be rejected even without Content-Length");

const addressPayload = {
  label: "Дом",
  recipient: "Petrolero Customer",
  phone: "+7 900 111 22 33",
  city: "Москва",
  street: "Тестовая улица, 1",
  apartment: "кв. 2",
  postalCode: "101000",
  isDefault: true,
};
const unauthorizedAddress = await authRequest("/api/account/addresses");
assert.equal(unauthorizedAddress.response.status, 401, "Addresses must require a session");
const addAddress = await authRequest("/api/account/addresses", {
  cookie, body: addressPayload,
});
assert.equal(addAddress.response.status, 201, "Failed to add first address");
assert.equal(addAddress.data.address.isDefault, true);
const firstId = addAddress.data.address.id;

const secondaryAddress = await authRequest("/api/account/addresses", {
  cookie,
  body: {
    ...addressPayload,
    label: "Работа",
    street: "Деловая улица, 4",
    isDefault: false,
  },
});
assert.equal(secondaryAddress.response.status, 201);
const secondId = secondaryAddress.data.address.id;

const selectSecond = await authRequest("/api/account/addresses", {
  cookie,
  method: "PATCH",
  body: {
    ...addressPayload,
    id: secondId,
    label: "Работа",
    street: "Деловая улица, 4",
    isDefault: true,
  },
});
assertOkay(selectSecond, "change default address");

const listBeforeDelete = await authRequest("/api/account/addresses", { cookie });
assertOkay(listBeforeDelete, "list own addresses");
assert.equal(listBeforeDelete.data.addresses.length, 2);
assert.equal(listBeforeDelete.data.addresses.filter(a => a.isDefault).length, 1);
assert.equal(listBeforeDelete.data.addresses.find(a => a.isDefault).id, secondId);

const deleteSecond = await authRequest("/api/account/addresses", {
  cookie, method: "DELETE", body: { id: secondId },
});
assertOkay(deleteSecond, "remove default address");
const listAfterDelete = await authRequest("/api/account/addresses", { cookie });
assertOkay(listAfterDelete, "list after deletion");
assert.equal(listAfterDelete.data.addresses.length, 1);
assert.equal(listAfterDelete.data.addresses[0].id, firstId);
assert.equal(listAfterDelete.data.addresses[0].isDefault, true);

console.log("4b. Verify account preview page renders editable sections");
for (const section of ["profile", "addresses"]) {
  const page = await fetch(origin + "/account/preview?section=" + section);
  assert.ok(page.ok, "Account preview page failed: " + section + " (" + page.status + ")");
  const html = await page.text();
  assert.ok(html.includes(section === "profile" ? "Контактная информация" : "Мои адреса"),
    "Account preview missing section content: " + section);
}

console.log("4c. Verify favorites merge, deduplication, validation and delete");
const publicFavorites = await authRequest("/api/account/favorites");
assert.equal(publicFavorites.response.status, 401, "Favorites must require a session");
const publicWrite = await authRequest("/api/account/favorites", {
  body: { id: "demo-fusion" },
});
assert.equal(publicWrite.response.status, 401, "Guests must not write account favorites");

const guestMerge = await authRequest("/api/account/favorites", {
  cookie, body: { ids: ["demo-fusion", "demo-performance", "demo-fusion"] },
});
assertOkay(guestMerge, "merge guest favorites");
assert.deepEqual([...guestMerge.data.ids].sort(), ["demo-fusion", "demo-performance"].sort());

const mergeAgain = await authRequest("/api/account/favorites", {
  cookie, body: { ids: ["demo-fusion"] },
});
assertOkay(mergeAgain, "idempotent guest merge");
assert.equal(mergeAgain.data.ids.length, 2);

const unknownFavorite = await authRequest("/api/account/favorites", {
  cookie, body: { id: "non-existent-product" },
});
assert.equal(unknownFavorite.response.status, 400, "Unknown product must be rejected");
const wrongOwner = await authRequest("/api/account/favorites", {
  cookie, body: { id: "demo-elite", ownerId: "some-other-account" },
});
assert.equal(wrongOwner.response.status, 403, "Favorite request must match the authenticated owner");

const addedFavorite = await authRequest("/api/account/favorites", {
  cookie, body: { id: "demo-ninja" },
});
assertOkay(addedFavorite, "save favorite from catalog");
assert.equal(addedFavorite.data.ids.length, 3);

const removedFavorite = await authRequest("/api/account/favorites", {
  cookie, method: "DELETE", body: { id: "demo-fusion" },
});
assertOkay(removedFavorite, "remove favorite from account");
assert.deepEqual([...removedFavorite.data.ids].sort(), ["demo-ninja", "demo-performance"].sort());

const storedFavorites = await authRequest("/api/account/favorites", { cookie });
assertOkay(storedFavorites, "load favorites on another device");
assert.deepEqual([...storedFavorites.data.ids].sort(), ["demo-ninja", "demo-performance"].sort());

console.log("4d. Confirm separate account does not inherit the first user's favorites");
const secondEmail = "petrolero-auth-second-" + randomUUID() + "@example.test";
const secondSignup = await authRequest("/api/auth/sign-up/email", {
  body: {
    name: "Second Buyer", email: secondEmail,
    password: firstPassword, callbackURL: "/account/login?verified=1",
  },
});
assertOkay(secondSignup, "register second account");
const secondVerification = await getEmail("подтверждение почты", secondEmail);
const secondVerifyResponse = await fetch(
  linkIn(secondVerification, "/api/auth/verify-email"),
  { redirect: "manual" },
);
assert.ok(secondVerifyResponse.status >= 200 && secondVerifyResponse.status < 400);
const secondLogin = await authRequest("/api/auth/sign-in/email", {
  body: { email: secondEmail, password: firstPassword },
});
assertOkay(secondLogin, "second account login");
const secondCookie = cookieOf(secondLogin.response);
const separateList = await authRequest("/api/account/favorites", { cookie: secondCookie });
assertOkay(separateList, "second user's own favorites");
assert.deepEqual(separateList.data.ids, [], "Other user's favorites leaked into the account");

const secondAdd = await authRequest("/api/account/favorites", {
  cookie: secondCookie, body: { id: "demo-elite" },
});
assertOkay(secondAdd, "second user favorites");
assert.deepEqual(secondAdd.data.ids, ["demo-elite"]);
const crossDelete = await authRequest("/api/account/favorites", {
  cookie: secondCookie, method: "DELETE", body: { id: "demo-ninja" },
});
assertOkay(crossDelete, "attempt to remove someone else's favorite");
assert.deepEqual(crossDelete.data.ids, ["demo-elite"]);

const firstListAfterSecond = await authRequest("/api/account/favorites", { cookie });
assertOkay(firstListAfterSecond, "first account must be unchanged");
assert.deepEqual([...firstListAfterSecond.data.ids].sort(), ["demo-ninja", "demo-performance"].sort());

console.log("4e. Check demo checkout validation and ownership");
const publicOrderList = await authRequest("/api/account/demo-orders");
assert.equal(publicOrderList.response.status, 401, "Orders list must be private");
const publicSubmit = await authRequest("/api/account/demo-orders", {
  body: { lines: [{ id: "demo-fusion", quantity: 1 }] },
});
assert.equal(publicSubmit.response.status, 401, "Anonymous order submission must be forbidden");

const orderInput = {
  recipient: "Petrolero Customer",
  phone: "+7 900 111 22 33",
  city: "Москва",
  street: "Тестовая улица, 1",
  apartment: "кв. 2",
  postalCode: "101000",
  note: "Только тест, без доставки",
  lines: [
    { id: "demo-fusion", quantity: 2, priceKopecks: 1 },
    { id: "demo-ninja", quantity: 1, priceKopecks: 1 },
  ],
};
for (const lines of [
  [{ id: "invalid-sku", quantity: 1 }],
  [{ id: "demo-fusion", quantity: 0 }],
  [{ id: "demo-fusion", quantity: 1 }, { id: "demo-fusion", quantity: 2 }],
]) {
  const invalidOrder = await authRequest("/api/account/demo-orders", {
    cookie, body: { ...orderInput, lines },
  });
  assert.equal(invalidOrder.response.status, 400, "Invalid cart line should be rejected");
}
const checkoutPage = await fetch(origin + "/checkout");
assert.ok(checkoutPage.ok, "Checkout preview page must render without authentication");
assert.ok((await checkoutPage.text()).includes("Оформление заказа"));

const createOrder = await authRequest("/api/account/demo-orders", {
  cookie, body: orderInput,
});
assert.equal(createOrder.response.status, 201, "Demo checkout must create a test record");
const orderId = createOrder.data.order?.id;
assert.ok(orderId && createOrder.data.order.reference.startsWith("PTR-"));

const listOrders = await authRequest("/api/account/demo-orders", { cookie });
assertOkay(listOrders, "Own demo order history");
assert.equal(listOrders.data.orders.length, 1);
const ownOrder = listOrders.data.orders[0];
assert.equal(ownOrder.id, orderId);
assert.equal(ownOrder.items.length, 2);
assert.equal(ownOrder.subtotalKopecks, 2 * 750000 + 259000,
  "Subtotal must be calculated with server catalog prices, not browser amounts");
assert.ok(ownOrder.items.some(item =>
  item.productId === "demo-fusion" && item.unitPriceKopecks === 750000 && item.quantity === 2));

const detailOrder = await authRequest(
  "/api/account/demo-orders/" + encodeURIComponent(orderId), { cookie },
);
assertOkay(detailOrder, "Read owned demo order");
assert.equal(detailOrder.data.order.id, orderId);

const foreignOrders = await authRequest("/api/account/demo-orders", { cookie: secondCookie });
assertOkay(foreignOrders, "Read second user's orders");
assert.deepEqual(foreignOrders.data.orders, [], "Another buyer must not see the first user's orders");
const foreignOrderDetail = await authRequest(
  "/api/account/demo-orders/" + encodeURIComponent(orderId), { cookie: secondCookie },
);
assert.equal(foreignOrderDetail.response.status, 404,
  "Foreign order must not be accessible by guessed ID");
const unauthOrderDetail = await authRequest(
  "/api/account/demo-orders/" + encodeURIComponent(orderId),
);
assert.equal(unauthOrderDetail.response.status, 401);

const ownOrderPage = await authRequest("/account/orders/" + encodeURIComponent(orderId), { cookie });
assertOkay(ownOrderPage, "SSR owned order page");
assert.ok(String(ownOrderPage.data).includes("Стоимость товаров"),
  "Owned order page should render its saved line items and subtotal");

const foreignOrderPage = await authRequest(
  "/account/orders/" + encodeURIComponent(orderId), { cookie: secondCookie },
);
assertOkay(foreignOrderPage, "SSR page for non-owned order");
assert.ok(String(foreignOrderPage.data).includes("Заказ не найден"),
  "Foreign order should not be rendered in the account workspace");

console.log("4f. Check administrator permissions, product CRUD and catalog publication");
const ordinaryAdminAttempt = await authRequest("/api/admin/products", { cookie: secondCookie });
assert.equal(ordinaryAdminAttempt.response.status, 403, "A buyer must not access admin products");
const unauthAdminAttempt = await authRequest("/api/admin/products");
assert.equal(unauthAdminAttempt.response.status, 401, "Anonymous admin access must be rejected");

// Use a dedicated, verified third account for admin enforcement. Keep both
// existing buyers unchanged so account and purchase isolation remain tested.
console.log("4f. Verify mandatory administrator two-factor enrollment");
const adminEmail = "petrolero-auth-admin-" + randomUUID() + "@example.test";
const adminSignup = await authRequest("/api/auth/sign-up/email", {
  body: { name: "Admin Test", email: adminEmail,
    password: firstPassword, callbackURL: "/account/login?verified=1" },
});
assertOkay(adminSignup, "admin sign-up");
const adminMail = await getEmail("подтверждение почты", adminEmail);
const adminVerified = await fetch(linkIn(adminMail, "/api/auth/verify-email"), { redirect: "manual" });
assert.ok(adminVerified.status >= 200 && adminVerified.status < 400);
const adminLogin = await authRequest("/api/auth/sign-in/email", {
  body: { email: adminEmail, password: firstPassword },
});
assertOkay(adminLogin, "admin initial login");
const adminCookie = cookieOf(adminLogin.response);

// Promotion simulates the separate, offline grant-admin.mjs command. It is
// intentionally NOT available as a public API endpoint.
const promoteDb = new pg.Client({ connectionString: process.env.DATABASE_URL });
await promoteDb.connect();
try {
  const promoted = await promoteDb.query(
    'UPDATE "user" SET "role" = $1 WHERE "email" = $2 AND "emailVerified" = TRUE RETURNING "id"',
    ["ADMIN", adminEmail],
  );
  assert.equal(promoted.rowCount, 1);
} finally {
  await promoteDb.end();
}

// A database role alone is never sufficient for administrative access.
const unenrolledAdmin = await authRequest("/api/admin/products", { cookie: adminCookie });
assert.equal(unenrolledAdmin.response.status, 428, "Admin without TOTP was granted access");
assert.equal(unenrolledAdmin.data?.setupUrl, "/account/security");
const unenrolledOrders = await authRequest("/api/admin/orders", { cookie: adminCookie });
assert.equal(unenrolledOrders.response.status, 428, "Unenrolled admin accessed customer orders");
const unenrolledWrite = await authRequest("/api/admin/products", {
  cookie: adminCookie, body: { published: true },
});
assert.equal(unenrolledWrite.response.status, 428, "Unenrolled admin wrote product data");

const adminEnrollment = await authRequest("/api/auth/two-factor/enable", {
  cookie: adminCookie, body: { password: firstPassword, method: "totp", issuer: "Petrolero" },
});
assertOkay(adminEnrollment, "enable admin TOTP");
const adminTotpUri = adminEnrollment.data?.totpURI;
assert.ok(adminTotpUri, "Admin TOTP URI missing");
const adminSecret = new URL(adminTotpUri).searchParams.get("secret");
assert.ok(adminSecret, "Admin TOTP secret missing");
const adminEnrollmentCookie = [
  adminCookie,
  ...adminEnrollment.response.headers.getSetCookie().map(c => c.split(";")[0]),
].join("; ");
const adminConfirmed = await authRequest("/api/auth/two-factor/verify-totp", {
  cookie: adminEnrollmentCookie, body: { code: makeTotp(adminSecret), trustDevice: false },
});
assertOkay(adminConfirmed, "verify admin TOTP enrollment");

// Enrollment may rotate the Better Auth session cookie. Prefer the newest
// Set-Cookie value per name, rather than reusing a pre-enrollment session.
const adminCookieJar = new Map();
for (const line of [
  ...adminLogin.response.headers.getSetCookie(),
  ...adminConfirmed.response.headers.getSetCookie(),
]) {
  const pair = line.split(";")[0];
  adminCookieJar.set(pair.split("=")[0], pair);
}
const verifiedAdminCookie = [...adminCookieJar.values()].join("; ");
const verifiedAdminSession = await authRequest("/api/auth/get-session", { cookie: verifiedAdminCookie });
assert.equal(verifiedAdminSession.data?.user?.email, adminEmail,
  "TOTP enrollment did not yield a valid administrator session");

console.log("4f. Check role-based account navigation");
const adminAccount = await authRequest("/account", { cookie: verifiedAdminCookie });
assertOkay(adminAccount, "admin account navigation");
assert.ok(String(adminAccount.data).includes('href="/admin"'),
  "Admin navigation link missing for confirmed ADMIN");
const customerAccount = await authRequest("/account", { cookie: secondCookie });
assertOkay(customerAccount, "buyer account navigation");
assert.ok(!String(customerAccount.data).includes('href="/admin"'),
  "Admin navigation link leaked to a buyer");
const firstAccountStillBuyer = await authRequest("/account", { cookie });
assert.ok(!String(firstAccountStillBuyer.data).includes('href="/admin"'),
  "First customer unexpectedly gained admin link");

const adminList = await authRequest("/api/admin/products", { cookie: verifiedAdminCookie });
assertOkay(adminList, "admin product list");
assert.ok(adminList.data.products.length >= 4);
const tokenSuffix = randomUUID().slice(0, 8);
const adminItem = {
  title: "PETROLERO TEST ADMIN " + tokenSuffix,
  slug: "petrolero-test-admin-" + tokenSuffix,
  sku: "ADMIN-" + tokenSuffix.toUpperCase(),
  category: "passenger",
  description: "Карточка, созданная в защищённой административной панели.",
  packaging: "canister",
  image: "/catalog/products/oils/petrolero-drum.avif",
  galleryImages: [],
  priceKopecks: 330000,
  stockQuantity: 7,
  published: false,
  viscosity: "5W-30",
  volumeLiters: 4,
  acea: ["C3"],
  api: ["SP"],
  approvals: [],
  ilsac: [],
};
const ordinaryWrite = await authRequest("/api/admin/products", {
  cookie: secondCookie, body: adminItem,
});
assert.equal(ordinaryWrite.response.status, 403, "Buyer could create admin products");
const createDraft = await authRequest("/api/admin/products", { cookie: verifiedAdminCookie, body: adminItem });
assert.equal(createDraft.response.status, 201,
  "Admin must be able to create product: " + JSON.stringify(createDraft.data));
const adminItemId = createDraft.data.product.id;
assert.ok(adminItemId);
const noPricePublished = await authRequest("/api/admin/products/" + adminItemId, { cookie: verifiedAdminCookie, method: "PUT",
  body: { ...adminItem, priceKopecks: null, published: true },
});
assert.equal(noPricePublished.response.status, 400, "Cannot publish without price");

const draftCatalog = await authRequest("/catalog");
assertOkay(draftCatalog, "draft catalog page");
assert.ok(!String(draftCatalog.data).includes(adminItem.title),
  "Draft product leaked into public catalog");

const publishProduct = await authRequest("/api/admin/products/" + adminItemId, { cookie: verifiedAdminCookie, method: "PUT", body: { ...adminItem, published: true },
});
assertOkay(publishProduct, "publish product from admin");
assert.equal(publishProduct.data.product.published, true);
const publicCatalog = await authRequest("/catalog");
assertOkay(publicCatalog, "published catalog page");
assert.ok(String(publicCatalog.data).includes(adminItem.title),
  "Published product not visible in catalog");

const unauthorizedDelete = await authRequest("/api/admin/products/" + adminItemId, {
  cookie: secondCookie, method: "DELETE",
});
assert.equal(unauthorizedDelete.response.status, 403);
const archiveProduct = await authRequest("/api/admin/products/" + adminItemId, { cookie: verifiedAdminCookie, method: "DELETE",
});
assertOkay(archiveProduct, "archive product");
const hiddenCatalog = await authRequest("/catalog");
assertOkay(hiddenCatalog, "catalog after archiving");
assert.ok(!String(hiddenCatalog.data).includes(adminItem.title),
  "Archived product remained visible");
const afterArchive = await authRequest("/api/admin/products", { cookie: verifiedAdminCookie });
assertOkay(afterArchive, "admin list after archiving");
assert.ok(!afterArchive.data.products.some(p => p.id === adminItemId),
  "Archived product remained in active admin product list");

console.log("4g. Verify admin management of demo orders and buyers");
for (const endpoint of ["/api/admin/orders", "/api/admin/customers"]) {
  const anonymous = await authRequest(endpoint);
  assert.equal(anonymous.response.status, 401, "Anonymous admin endpoint exposed: " + endpoint);
  const buyerAttempt = await authRequest(endpoint, { cookie: secondCookie });
  assert.equal(buyerAttempt.response.status, 403, "Buyer accessed protected admin endpoint: " + endpoint);
}
for (const pagePath of ["/admin/orders", "/admin/customers"]) {
  const browserPage = await authRequest(pagePath, { cookie: verifiedAdminCookie });
  assertOkay(browserPage, "Admin page " + pagePath);
  assert.ok(String(browserPage.data).includes(pagePath.endsWith("orders") ? "Заказы" : "Покупатели"));
  const blockedPage = await authRequest(pagePath, { cookie: secondCookie });
  // Next.js may stream an HTTP 200 shell before a server-side notFound().
  // Authorize by private content absence, not by the streamed status code.
  assert.ok(
    !String(blockedPage.data).includes(
      pagePath.endsWith("orders") ? "НАЙДЕНО ЗАЯВОК" : "НАЙДЕНО ПОКУПАТЕЛЕЙ",
    ),
    "A buyer must not see administrative data",
  );
}

const adminOrders = await authRequest("/api/admin/orders", { cookie: verifiedAdminCookie });
assertOkay(adminOrders, "admin orders");
assert.equal(adminOrders.data.total, 1);
assert.equal(adminOrders.data.items[0].id, orderId);
assert.equal(adminOrders.data.items[0].reviewStatus, "NEW");

const adminOrderDetails = await authRequest("/api/admin/orders/" + encodeURIComponent(orderId), { cookie: verifiedAdminCookie });
assertOkay(adminOrderDetails, "admin order detail");
assert.equal(adminOrderDetails.data.order.items.length, 2);
assert.equal(adminOrderDetails.data.order.buyer.email, email);

const foreignAdminDetail = await authRequest("/api/admin/orders/" + encodeURIComponent(orderId), {
  cookie: secondCookie,
});
assert.equal(foreignAdminDetail.response.status, 403);

const attemptChangePrice = await authRequest("/api/admin/orders/" + encodeURIComponent(orderId), { cookie: verifiedAdminCookie, method: "PATCH",
  body: { reviewStatus: "REVIEWED", staffNote: "Проверено", subtotalKopecks: 1 },
});
assert.equal(attemptChangePrice.response.status, 400, "Admin must not tamper with order price");
const invalidStatus = await authRequest("/api/admin/orders/" + encodeURIComponent(orderId), { cookie: verifiedAdminCookie, method: "PATCH", body: { reviewStatus: "PAID", staffNote: "Wrong" },
});
assert.equal(invalidStatus.response.status, 400, "Unexpected fulfillment status must be rejected");
const buyerUpdateOrder = await authRequest("/api/admin/orders/" + encodeURIComponent(orderId), {
  cookie: secondCookie, method: "PATCH",
  body: { reviewStatus: "CLOSED", staffNote: "Unauthorized" },
});
assert.equal(buyerUpdateOrder.response.status, 403);
const updateOrderReview = await authRequest("/api/admin/orders/" + encodeURIComponent(orderId), { cookie: verifiedAdminCookie, method: "PATCH",
  body: { reviewStatus: "REVIEWED", staffNote: "Тестовая проверка заявки" },
});
assertOkay(updateOrderReview, "admin review update");
assert.equal(updateOrderReview.data.order.reviewStatus, "REVIEWED");
assert.equal(updateOrderReview.data.order.staffNote, "Тестовая проверка заявки");
const filteredOrders = await authRequest("/api/admin/orders?status=REVIEWED", { cookie: verifiedAdminCookie });
assertOkay(filteredOrders, "filter reviewed orders");
assert.equal(filteredOrders.data.total, 1);
const noNewOrders = await authRequest("/api/admin/orders?status=NEW", { cookie: verifiedAdminCookie });
assertOkay(noNewOrders, "filter new orders");
assert.equal(noNewOrders.data.total, 0);
const buyerOrderAfterAdmin = await authRequest("/api/account/demo-orders/" + encodeURIComponent(orderId), { cookie });
assertOkay(buyerOrderAfterAdmin, "buyer read after staff review");
assert.equal(buyerOrderAfterAdmin.data.order.subtotalKopecks, 1759000);
assert.ok(!("staffNote" in buyerOrderAfterAdmin.data.order),
  "Internal notes must never be returned to the buyer");

const adminCustomers = await authRequest("/api/admin/customers", { cookie: verifiedAdminCookie });
assertOkay(adminCustomers, "admin customer list");
assert.equal(adminCustomers.data.total, 2, "Admins must not appear as customers");
const second = adminCustomers.data.items.find(item => item.email === secondEmail);
assert.ok(second?.id, "Customer must be present in admin list");
assert.equal(second.ordersCount, 0);

const customerDetail = await authRequest("/api/admin/customers/" + encodeURIComponent(second.id), { cookie: verifiedAdminCookie });
assertOkay(customerDetail, "admin customer detail");
assert.equal(customerDetail.data.customer.email, secondEmail);
assert.equal(customerDetail.data.customer.emailVerified, true);
const buyerOwnCustomerData = await authRequest("/api/admin/customers/" + encodeURIComponent(second.id), {
  cookie: secondCookie,
});
assert.equal(buyerOwnCustomerData.response.status, 403);
const forbiddenRoleChange = await authRequest("/api/admin/customers/" + encodeURIComponent(second.id), { cookie: verifiedAdminCookie, method: "PATCH", body: { role: "ADMIN", adminNote: "hi" },
});
assert.equal(forbiddenRoleChange.response.status, 400, "Admin UI must not change account roles");
const buyerCustomerNote = await authRequest("/api/admin/customers/" + encodeURIComponent(second.id), {
  cookie: secondCookie, method: "PATCH", body: { adminNote: "stolen" },
});
assert.equal(buyerCustomerNote.response.status, 403);
const savedNote = await authRequest("/api/admin/customers/" + encodeURIComponent(second.id), { cookie: verifiedAdminCookie, method: "PATCH", body: { adminNote: "Заметка только для администратора" },
});
assertOkay(savedNote, "save customer staff note");
assert.equal(savedNote.data.customer.adminNote, "Заметка только для администратора");
const searchedCustomers = await authRequest("/api/admin/customers?q=" + encodeURIComponent(secondEmail), { cookie: verifiedAdminCookie,
});
assertOkay(searchedCustomers, "search customer by email");
assert.equal(searchedCustomers.data.total, 1);

const adminDisable = await authRequest("/api/auth/two-factor/disable", {
  cookie: verifiedAdminCookie, body: { password: firstPassword },
});
assertOkay(adminDisable, "disable admin TOTP in isolated integration test");
const adminAfterDisable = await authRequest("/api/admin/products", { cookie: verifiedAdminCookie });
assert.ok([401, 428].includes(adminAfterDisable.response.status),
  "Disabling 2FA must revoke the admin session or block admin requests: HTTP " +
  adminAfterDisable.response.status);

console.log("5. Request password reset and collect the second email");
const resetRequest = await authRequest("/api/auth/request-password-reset", {
  body: { email, redirectTo: origin + "/account/reset-password" },
});
assertOkay(resetRequest, "request password reset");
const resetEmail = await getEmail("восстановление пароля");
const resetLink = linkIn(resetEmail, "/account/reset-password");
const token = resetLink.searchParams.get("token");
assert.ok(token, "Password reset token missing from the mailed link");

console.log("6. Reset password and revoke existing session");
const reset = await authRequest("/api/auth/reset-password", {
  body: { token, newPassword },
});
assertOkay(reset, "reset password");
const oldSession = await authRequest("/api/auth/get-session", { cookie });
assertOkay(oldSession, "get revoked session");
assert.equal(oldSession.data?.session, undefined, "Old session must be revoked");
const oldLogin = await authRequest("/api/auth/sign-in/email", {
  body: { email, password: firstPassword },
});
assert.ok(!oldLogin.response.ok, "Old password was accepted after reset");

console.log("7. Log in with new password and sign out");
const newLogin = await authRequest("/api/auth/sign-in/email", {
  body: { email, password: newPassword },
});
assertOkay(newLogin, "new password sign in");
const newCookie = cookieOf(newLogin.response);

console.log("8. Enroll TOTP second factor with a verified authenticator code");
const twoFactorEnable = await authRequest("/api/auth/two-factor/enable", {
  cookie: newCookie, body: { password: newPassword, method: "totp", issuer: "Petrolero" },
});
assertOkay(twoFactorEnable, "enable TOTP");
const totpURI = twoFactorEnable.data?.totpURI;
const backupCodes = twoFactorEnable.data?.backupCodes;
assert.ok(typeof totpURI === "string" && totpURI.startsWith("otpauth://totp/"));
assert.ok(Array.isArray(backupCodes) && backupCodes.length > 0);
const secret = new URL(totpURI).searchParams.get("secret");
assert.ok(secret, "TOTP URI does not contain an authenticator secret");

const enableCookie = [
  newCookie,
  ...twoFactorEnable.response.headers.getSetCookie().map(v => v.split(";")[0]),
].join("; ");
const confirmTotp = await authRequest("/api/auth/two-factor/verify-totp", {
  cookie: enableCookie, body: { code: makeTotp(secret), trustDevice: false },
});
assertOkay(confirmTotp, "verify authenticator enrollment");
const enrollmentDb = new pg.Client({ connectionString: process.env.DATABASE_URL });
await enrollmentDb.connect();
try {
  const enrolled = await enrollmentDb.query(
    'SELECT "twoFactorEnabled" FROM "user" WHERE "email" = $1', [email],
  );
  assert.equal(enrolled.rows[0]?.twoFactorEnabled, true, "TOTP was not enabled in the database");
} finally { await enrollmentDb.end(); }

console.log("9. Signing in must NOT issue a session before TOTP verification");
const signOut = await authRequest("/api/auth/sign-out", {
  cookie: newCookie,
  body: {},
});
assertOkay(signOut, "sign out");
const afterSignOut = await authRequest("/api/auth/get-session", { cookie: newCookie });
assertOkay(afterSignOut, "get session after sign-out");
assert.equal(afterSignOut.data?.session, undefined, "Session survived sign-out");

const challenge = await authRequest("/api/auth/sign-in/email", {
  body: { email, password: newPassword },
});
assertOkay(challenge, "2FA sign in starts challenge");
assert.equal(challenge.data?.twoFactorRedirect, true, "TOTP sign in bypassed second factor");
const challengeCookie = cookieOf(challenge.response);
const pendingSession = await authRequest("/api/auth/get-session", { cookie: challengeCookie });
assertOkay(pendingSession, "2FA pending session");
assert.equal(pendingSession.data?.session, undefined, "2FA exposed a session before verification");

const incorrect = await authRequest("/api/auth/two-factor/verify-totp", {
  cookie: challengeCookie, body: { code: "invalid", trustDevice: false },
});
assert.ok(!incorrect.response.ok, "Invalid TOTP was accepted");

let completed = await authRequest("/api/auth/two-factor/verify-totp", {
  cookie: challengeCookie, body: { code: makeTotp(secret), trustDevice: false },
});
if (completed.response.status === 429) {
  // The test admin and user share one CI loopback IP. Keep the production
  // 2FA brute-force limit strict; wait for its rate window instead of raising it.
  console.log("Waiting for shared-IP TOTP rate limit to reset...");
  await sleep(65_000);
  completed = await authRequest("/api/auth/two-factor/verify-totp", {
    cookie: challengeCookie, body: { code: makeTotp(secret), trustDevice: false },
  });
}
assertOkay(completed, "2FA completed");
const completedCookie = cookieOf(completed.response);
const completedSession = await authRequest("/api/auth/get-session", { cookie: completedCookie });
assertOkay(completedSession, "session after TOTP");
assert.equal(completedSession.data?.user?.email, email, "TOTP did not issue user session");

console.log("9a. Render authenticated security screen after second-factor login");
const securityPage = await authRequest("/account/security", { cookie: completedCookie });
assertOkay(securityPage, "authenticated 2FA security page");
const securityHtml = String(securityPage.data);
assert.ok(securityHtml.includes("Дополнительная защита"),
  "Authenticated security page should show two-factor controls");


console.log("10. Single-use backup code completes a new 2FA challenge");
const signOutAfter2fa = await authRequest("/api/auth/sign-out", { cookie: completedCookie, body: {} });
assertOkay(signOutAfter2fa, "sign out 2FA session");
const backupLogin = await authRequest("/api/auth/sign-in/email", {
  body: { email, password: newPassword },
});
assertOkay(backupLogin, "start recovery sign-in");
assert.equal(backupLogin.data?.twoFactorRedirect, true);
const backupChallengeCookie = cookieOf(backupLogin.response);
const recovered = await authRequest("/api/auth/two-factor/verify-backup-code", {
  cookie: backupChallengeCookie, body: { code: backupCodes[0], trustDevice: false },
});
assertOkay(recovered, "verify backup code");
const recoveredCookie = cookieOf(recovered.response);
const recoveredSession = await authRequest("/api/auth/get-session", { cookie: recoveredCookie });
assertOkay(recoveredSession, "session restored via backup code");
assert.equal(recoveredSession.data?.user?.email, email);

console.log("PASS: auth + 2FA (TOTP and backup code) + profile + favorites + cart + admin RBAC + products + orders");
