/**
 * Diagnostic ONLY for initial authenticator enrollment.
 *
 * The enrollment URI/secret is already delivered to the user's browser by
 * Better Auth to render the QR code. Match the displayed authenticator code
 * locally to distinguish a stale/wrong authenticator entry from an HTTP
 * session/server failure. This never enables 2FA: Better Auth must still
 * verify the code on the server before persisting twoFactorEnabled.
 *
 * Do not log, upload, cache or persist the URI, secret or generated codes.
 */
function decodeBase32(input: string): Uint8Array<ArrayBuffer> {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = input.toUpperCase().replace(/[\s=-]/g, "");
  const bytes: number[] = [];
  let accumulator = 0;
  let bitCount = 0;

  for (const char of normalized) {
    const digit = alphabet.indexOf(char);
    if (digit < 0) throw new Error("Invalid TOTP key");
    accumulator = (accumulator << 5) | digit;
    bitCount += 5;
    if (bitCount >= 8) {
      bitCount -= 8;
      bytes.push((accumulator >>> bitCount) & 0xff);
    }
  }

  const result = new Uint8Array(new ArrayBuffer(bytes.length));
  result.set(bytes);
  return result;
}

async function generateTotp(
  key: CryptoKey,
  counterValue: number,
  digits: number,
): Promise<string> {
  const counter = new Uint8Array(new ArrayBuffer(8));
  new DataView(counter.buffer).setBigUint64(0, BigInt(counterValue));
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, counter));
  const offset = mac[mac.length - 1] & 0x0f;
  const number = (
    ((mac[offset] & 0x7f) << 24) |
    (mac[offset + 1] << 16) |
    (mac[offset + 2] << 8) |
    mac[offset + 3]
  ) % 10 ** digits;
  return String(number).padStart(digits, "0");
}

/**
 * true: code belongs to the displayed QR (+/- one period)
 * false: code is not from this QR at the browser's current time
 * null: local crypto/time check unavailable; allow server to decide
 */
export async function checkTotpSetupCode(
  totpUri: string,
  code: string,
): Promise<boolean | null> {
  try {
    if (!globalThis.crypto?.subtle) return null;

    const url = new URL(totpUri);
    if (url.protocol !== "otpauth:" || url.hostname !== "totp") return null;
    const secret = url.searchParams.get("secret");
    if (!secret) return null;

    const digits = Number(url.searchParams.get("digits") ?? "6");
    const period = Number(url.searchParams.get("period") ?? "30");
    const algorithm = (url.searchParams.get("algorithm") ?? "SHA1").toUpperCase();
    if (![6, 8].includes(digits) || !Number.isFinite(period) ||
        period < 1 || period > 300) return null;

    const hash = algorithm === "SHA1" || algorithm === "SHA-1"
      ? "SHA-1"
      : algorithm === "SHA256" || algorithm === "SHA-256"
        ? "SHA-256"
        : algorithm === "SHA512" || algorithm === "SHA-512"
          ? "SHA-512"
          : null;
    if (!hash || code.length !== digits) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      decodeBase32(secret),
      { name: "HMAC", hash },
      false,
      ["sign"],
    );
    const counter = Math.floor(Date.now() / 1000 / period);
    for (const drift of [-1, 0, 1]) {
      if (await generateTotp(key, counter + drift, digits) === code) return true;
    }
    return false;
  } catch {
    // A missing browser crypto capability is not an authentication failure.
    return null;
  }
}
