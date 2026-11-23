// Integration checks for the running storefront. ONLY run against an isolated
// test environment: repeated invalid logins deliberately exercise throttling.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const origin = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3000";
const invalidEmail = "unknown-security-" + randomUUID() + "@example.test";

async function request(path, options) {
  return fetch(new URL(path, origin), { redirect: "manual", ...options });
}

console.log("Security 1/4: headers on public and private pages");
const page = await request("/account/login");
assert.ok(page.ok, "Login screen unavailable: HTTP " + page.status);
for (const [header, value] of [
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", "DENY"],
  ["referrer-policy", "no-referrer"],
]) {
  assert.equal(page.headers.get(header), value, "Missing security header " + header);
}
const csp = page.headers.get("content-security-policy") ?? "";
for (const directive of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'"]) {
  assert.ok(csp.includes(directive), "Missing CSP directive " + directive);
}
assert.equal(page.headers.get("x-powered-by"), null, "Framework details exposed");
assert.match(page.headers.get("cache-control") ?? "", /no-store/);

console.log("Security 2/4: unauthenticated access to admin API");
const privateApi = await request("/api/admin/orders");
assert.equal(privateApi.status, 401, "Admin API accessible without a session");
assert.match(privateApi.headers.get("cache-control") ?? "", /no-store/);

console.log("Security 3/4: reject cross-origin and origin-less account writes");
for (const headers of [
  { origin: "https://attacker.invalid", "content-type": "application/json" },
  { "content-type": "application/json" },
]) {
  const forbidden = await request("/api/account/profile", {
    method: "PATCH",
    headers,
    body: JSON.stringify({ name: "Malicious edit", phone: "" }),
  });
  assert.equal(forbidden.status, 403,
    "CSRF attempt was not rejected (HTTP " + forbidden.status + ")");
}

console.log("Security 4/4: enforce rate limit even with spoofed forwarded IPs");
let throttled = false;
for (let index = 0; index < 24; index++) {
  const attempt = await request("/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      // Must NOT let an arbitrary client evade per-path throttling.
      "x-forwarded-for": "203.0.113." + (index + 1),
    },
    body: JSON.stringify({ email: invalidEmail, password: "Invalid-Password-For-Test-Only!" }),
  });
  if (attempt.status === 429) {
    throttled = true;
    break;
  }
  assert.ok(attempt.status >= 400 && attempt.status < 500,
    "Unexpected sign-in test response HTTP " + attempt.status);
}
assert.ok(throttled, "Authentication rate limit could be bypassed or is disabled");

console.log("PASS: response headers, private API, CSRF protection, brute-force throttling");
