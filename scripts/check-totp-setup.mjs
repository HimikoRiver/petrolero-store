// Check the browser-side TOTP enrollment diagnostic against RFC 6238.
// Test vectors are public standards data, never real enrollment secrets.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("src/features/account/lib/checkTotpSetup.ts", "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const { checkTotpSetupCode } = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);

const uri = "otpauth://totp/Petrolero:sample%40example.test" +
  "?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ" +
  "&issuer=Petrolero&algorithm=SHA1&digits=8&period=30";

const realNow = Date.now;
try {
  Date.now = () => 59_000;
  assert.equal(await checkTotpSetupCode(uri, "94287082"), true,
    "RFC 6238 SHA-1 8-digit code must match");
  assert.equal(await checkTotpSetupCode(uri, "12345678"), false,
    "Incorrect code must not match the current QR");
  Date.now = () => 60_000; // Within adjacent time window
  assert.equal(await checkTotpSetupCode(uri, "94287082"), true,
    "One adjacent time window must remain valid");
  Date.now = () => 200_000;
  assert.equal(await checkTotpSetupCode(uri, "94287082"), false,
    "An expired code must not match");
} finally {
  Date.now = realNow;
}

assert.equal(await checkTotpSetupCode("not-a-totp-uri", "123456"), null,
  "Malformed URI should defer to the server rather than block enrollment");
console.log("PASS: local TOTP diagnostic matches RFC 6238 and time-window checks");
