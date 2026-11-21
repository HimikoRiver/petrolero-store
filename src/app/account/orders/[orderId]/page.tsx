import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProtectedAccountWorkspace from "@/features/account/components/ProtectedAccountWorkspace";

export const metadata: Metadata = {
  title: "Информация о заказе — Petrolero",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ orderId: string }> };

async function OrderContent({ params }: Props) {
  const { orderId } = await params;
  if (!orderId || orderId.length > 128) notFound();
  return <ProtectedAccountWorkspace section="order-detail" orderId={orderId} />;
}

export default function OrderDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="pa-loading" role="status">Загрузка заказа…</main>}>
      <OrderContent params={params} />
    </Suspense>
  );
}
