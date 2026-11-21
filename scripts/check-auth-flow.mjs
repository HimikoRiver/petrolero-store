// Integration test against disposable PostgreSQL and Mailpit services.
// Uses real Better Auth API routes and real SMTP transport, without production credentials.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";

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

async function getEmail(subjectFragment) {
  return until(async () => {
    const listResponse = await fetch(mailpit + "/api/v1/messages");
    if (!listResponse.ok) return null;
    const { messages = [] } = await listResponse.json();
    const match = messages.find((message) =>
      String(message.Subject || "").toLowerCase().includes(subjectFragment) &&
      (message.To || []).some((to) => String(to.Address).toLowerCase() === email.toLowerCase())
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
const signOut = await authRequest("/api/auth/sign-out", {
  cookie: newCookie,
  body: {},
});
assertOkay(signOut, "sign out");
const afterSignOut = await authRequest("/api/auth/get-session", { cookie: newCookie });
assertOkay(afterSignOut, "get session after sign-out");
assert.equal(afterSignOut.data?.session, undefined, "Session survived sign-out");

console.log("PASS: DB migration + SMTP + signup + verification + profile + addresses CRUD + reset + logout");
