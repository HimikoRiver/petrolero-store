import "server-only";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function isTrustedWrite(request: Request) {
  const origin = request.headers.get("origin");
  const trustedOrigin = process.env.BETTER_AUTH_URL;
  if (!origin || !trustedOrigin) return false;
  try {
    // Compare with the configured public site origin, not Next's internal
    // request URL (which may be rewritten behind a reverse proxy).
    return new URL(origin).origin === new URL(trustedOrigin).origin;
  } catch {
    return false;
  }
}

export async function authAccount(request: Request) {
  if (!isAuthConfigured()) return { status: 503 as const, userId: null };
  const session = await getAuth().api.getSession({ headers: request.headers });
  return session
    ? { status: 200 as const, userId: session.user.id }
    : { status: 401 as const, userId: null };
}

export function accountPrisma() {
  return getPrisma();
}

// Reject oversized JSON before parsing. The 64 KiB cap safely covers product
// cards and all existing account/administration forms. The streaming limit
// also applies when Content-Length is missing or forged (chunked requests).
export const MAX_JSON_BODY_BYTES = 64 * 1024;

export async function readJsonLimited(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType.trim())) {
    throw new Error("Expected application/json");
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const size = Number(declaredLength);
    if (!Number.isSafeInteger(size) || size < 0 || size > MAX_JSON_BODY_BYTES) {
      throw new Error("JSON body size exceeds permitted limit");
    }
  }

  if (!request.body) throw new Error("JSON body is empty");
  const reader = request.body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_JSON_BODY_BYTES) {
        await reader.cancel();
        throw new Error("JSON body size exceeds permitted limit");
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let position = 0;
  for (const part of parts) {
    bytes.set(part, position);
    position += part.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export function field(value: unknown, maximum: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length <= maximum ? trimmed : null;
}

export function validPhone(value: string) {
  return /^[+()\d\s-]+$/.test(value) && (value.match(/\d/g) || []).length >= 10
    && (value.match(/\d/g) || []).length <= 18;
}

export function addressInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const data = input as Record<string, unknown>;
  const label = field(data.label, 32);
  const recipient = field(data.recipient, 100);
  const phone = field(data.phone, 32);
  const city = field(data.city, 120);
  const street = field(data.street, 180);
  const apartment = field(data.apartment ?? "", 50);
  const postalCode = field(data.postalCode ?? "", 16);
  if (!label || !recipient || !phone || !city || !street ||
      apartment === null || postalCode === null || !validPhone(phone) ||
      (postalCode && !/^[\dA-Za-z \-]{3,16}$/.test(postalCode))) return null;
  return {
    label, recipient, phone, city, street,
    apartment: apartment || null,
    postalCode: postalCode || null,
    isDefault: data.isDefault === true,
  };
}
