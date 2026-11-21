import { authAccount, jsonError } from "@/lib/account-api";
import { findDemoOrder } from "@/lib/demo-orders";

type Context = { params: Promise<{ orderId: string }> };

export async function GET(request: Request, { params }: Context) {
  const auth = await authAccount(request);
  if (!auth.userId) return jsonError("Требуется авторизация.", auth.status);
  const { orderId } = await params;
  if (!orderId || orderId.length > 128) return jsonError("Заказ не найден.", 404);

  const order = await findDemoOrder(auth.userId, orderId);
  if (!order) return jsonError("Заказ не найден.", 404);
  return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
}
