import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { isTrustedWrite, jsonError, readJsonLimited } from "@/lib/account-api";

const noStore = { "Cache-Control": "private, no-store, max-age=0" };

function sessionDevice(userAgent: string | null): string {
  if (!userAgent) return "Неизвестное устройство";
  const agent = userAgent.slice(0, 512);
  const browser = /Edg\//i.test(agent) ? "Microsoft Edge"
    : /OPR\/|Opera/i.test(agent) ? "Opera"
    : /Firefox\/|FxiOS\//i.test(agent) ? "Firefox"
    : /Chrome\/|CriOS\//i.test(agent) ? "Chrome"
    : /Safari\//i.test(agent) ? "Safari"
    : "Браузер";
  const os = /Windows/i.test(agent) ? "Windows"
    : /iPad/i.test(agent) ? "iPad"
    : /iPhone|iPod/i.test(agent) ? "iPhone"
    : /Android/i.test(agent) ? "Android"
    : /Macintosh|Mac OS X/i.test(agent) ? "macOS"
    : /Linux/i.test(agent) ? "Linux"
    : "неизвестная ОС";
  return browser + " · " + os;
}

export async function GET(request: Request) {
  if (!isAuthConfigured()) return jsonError("Авторизация не настроена.", 503);
  const current = await getAuth().api.getSession({ headers: request.headers });
  if (!current?.user || !current.session) return jsonError("Требуется авторизация.", 401);

  // Restrict by the authenticated user. Never return the bearer token or a
  // raw user-agent string; only a non-secret session row id and display fields.
  const rows = await getPrisma().session.findMany({
    where: { userId: current.user.id, expiresAt: { gt: new Date() } },
    select: {
      id: true, createdAt: true, updatedAt: true, expiresAt: true,
      userAgent: true, ipAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const sessions = rows.map((row) => ({
    id: row.id,
    current: row.id === current.session.id,
    device: sessionDevice(row.userAgent),
    ipAddress: row.ipAddress?.slice(0, 64) || null,
    createdAt: row.createdAt.toISOString(),
    lastActiveAt: row.updatedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
  })).sort((a, b) => Number(b.current) - Number(a.current));

  return Response.json({ sessions }, { headers: noStore });
}

export async function DELETE(request: Request) {
  if (!isAuthConfigured()) return jsonError("Авторизация не настроена.", 503);
  const current = await getAuth().api.getSession({ headers: request.headers });
  if (!current?.user || !current.session) return jsonError("Требуется авторизация.", 401);
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);

  let raw: unknown;
  try { raw = await readJsonLimited(request); }
  catch { return jsonError("Некорректный запрос.", 400); }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return jsonError("Некорректные данные.", 400);
  }
  const body = raw as Record<string, unknown>;
  const keys = Object.keys(body);
  const db = getPrisma();

  if (keys.length === 1 && body.scope === "others") {
    // Atomic delete by user id, preserving this browser's live session.
    const result = await db.session.deleteMany({
      where: { userId: current.user.id, id: { not: current.session.id } },
    });
    return Response.json({ revoked: result.count }, { headers: noStore });
  }

  if (keys.length !== 1 || typeof body.id !== "string" ||
      body.id.length < 1 || body.id.length > 128) {
    return jsonError("Укажите действительный сеанс.", 400);
  }
  if (body.id === current.session.id) {
    return jsonError("Текущий сеанс завершается через кнопку выхода из аккаунта.", 400);
  }

  // Prevent IDOR: an id for another user's session cannot be revoked or
  // distinguished from an unknown id. Current session is never revoked here.
  const result = await db.session.deleteMany({
    where: { userId: current.user.id, id: body.id },
  });
  if (!result.count) return jsonError("Сеанс не найден.", 404);
  return Response.json({ revoked: result.count }, { headers: noStore });
}
