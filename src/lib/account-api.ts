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
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
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
