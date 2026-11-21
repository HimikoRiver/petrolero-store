export async function adminApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  });

  let data: unknown;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data
      ? (data as { error?: unknown }).error : null;
    throw new Error(typeof message === "string" ? message : "Не удалось выполнить запрос.");
  }
  return data as T;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(value));
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency", currency: "RUB", maximumFractionDigits: 2,
  }).format(value / 100);
}
