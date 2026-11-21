import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth";

function unavailable() {
  return Response.json(
    { error: "Система входа настраивается. Попробуйте позднее." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  return toNextJsHandler(getAuth()).POST(request);
}
