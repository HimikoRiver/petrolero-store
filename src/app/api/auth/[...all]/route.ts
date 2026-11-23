import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

const securityActions = new Set([
  "/api/auth/two-factor/verify-totp",
  "/api/auth/two-factor/disable",
  "/api/auth/two-factor/generate-backup-codes",
  "/api/auth/change-password",
]);

function unavailable() {
  return Response.json(
    { error: "Система входа настраивается. Попробуйте позднее." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Better Auth may rotate the session token while enrolling TOTP. Preserve
 * both the pre-action session and any new session delivered in Set-Cookie,
 * rather than accidentally signing out the current browser.
 */
async function activeSessionIdAfter(request: Request, response: Response): Promise<string | null> {
  const cookies = response.headers.getSetCookie();
  if (!cookies.length) return null;

  const cookieValues = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const pair = part.trim();
    const sep = pair.indexOf("=");
    if (sep > 0) cookieValues.set(pair.slice(0, sep), pair);
  }
  for (const header of cookies) {
    const pair = header.split(";")[0]?.trim() ?? "";
    const sep = pair.indexOf("=");
    if (sep < 1) continue;
    const key = pair.slice(0, sep);
    if (/(?:^|;)\s*max-age=0(?:;|$)/i.test(header)) {
      cookieValues.delete(key);
    } else {
      cookieValues.set(key, pair);
    }
  }
  const afterHeaders = new Headers(request.headers);
  afterHeaders.set("cookie", [...cookieValues.values()].join("; "));
  const refreshed = await getAuth().api.getSession({ headers: afterHeaders });
  return refreshed?.session?.id ?? null;
}

export async function GET(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  const handler = toNextJsHandler(getAuth()).POST;
  const path = new URL(request.url).pathname;
  if (!securityActions.has(path)) return handler(request);

  const previous = await getAuth().api.getSession({ headers: request.headers });
  if (!previous?.session || !previous.user) {
    // Second-factor login challenges do not have a full session yet. Never
    // revoke another user's sessions while completing a login challenge.
    return handler(request);
  }

  const db = getPrisma();
  const wasEnabled = path.startsWith("/api/auth/two-factor/")
    ? await db.user.findUnique({
        where: { id: previous.user.id },
        select: { twoFactorEnabled: true },
      }).then((user) => user?.twoFactorEnabled ?? false)
    : false;

  const response = await handler(request);
  if (!response.ok) return response;

  const isTotpConfirm = path === "/api/auth/two-factor/verify-totp";
  const isDisable = path === "/api/auth/two-factor/disable";
  const isBackupRenewal = path === "/api/auth/two-factor/generate-backup-codes";
  const isPasswordChange = path === "/api/auth/change-password";
  let revokeOthers = isBackupRenewal || isPasswordChange;

  if (isTotpConfirm || isDisable) {
    const user = await db.user.findUnique({
      where: { id: previous.user.id },
      select: { twoFactorEnabled: true },
    });
    if (isTotpConfirm && !wasEnabled && user?.twoFactorEnabled) revokeOthers = true;
    if (isDisable && wasEnabled && user?.twoFactorEnabled === false) revokeOthers = true;
  }
  if (!revokeOthers) return response;

  try {
    const rotated = await activeSessionIdAfter(request, response);
    await db.session.deleteMany({
      where: {
        userId: previous.user.id,
        id: { notIn: [...new Set([previous.session.id, rotated].filter((id): id is string => Boolean(id)))] },
      },
    });
  } catch (error) {
    console.error("Petrolero: failed to revoke other sessions after a security change", error);
    return Response.json(
      { error: "Настройки изменены, но другие сеансы не удалось завершить. Повторите действие в разделе «Безопасность»." },
      { status: 500, headers: response.headers },
    );
  }
  return response;
}
