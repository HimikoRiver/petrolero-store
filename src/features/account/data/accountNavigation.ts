export type AccountSection =
  | "overview"
  | "orders"
  | "order-detail"
  | "favorites"
  | "addresses"
  | "profile"
  | "settings"
  | "security"
  | "support"
  | "returns";

export type NavigationItem = {
  id: Exclude<AccountSection, "order-detail">;
  title: string;
  icon: "overview" | "orders" | "heart" | "pin" | "user" | "settings" | "lock" | "help" | "return";
  description: string;
};

export const ACCOUNT_NAVIGATION: readonly NavigationItem[] = [
  { id: "overview", title: "Обзор", icon: "overview", description: "Всё самое важное" },
  { id: "orders", title: "Мои заказы", icon: "orders", description: "История и статусы" },
  { id: "favorites", title: "Избранное", icon: "heart", description: "Сохранённые товары" },
  { id: "addresses", title: "Адреса и получатели", icon: "pin", description: "Для доставки" },
  { id: "profile", title: "Личные данные", icon: "user", description: "Контакты и профиль" },
  { id: "settings", title: "Уведомления", icon: "settings", description: "Рассылки и новости" },
  { id: "security", title: "Безопасность", icon: "lock", description: "Доступ к аккаунту" },
  { id: "support", title: "Помощь", icon: "help", description: "Вопросы и обращения" },
  { id: "returns", title: "Возвраты", icon: "return", description: "Заявки по заказам" },
] as const;

export function isAccountSection(section: string): section is AccountSection {
  return section === "order-detail" || ACCOUNT_NAVIGATION.some((item) => item.id === section);
}

export function accountSectionPath(section: AccountSection, preview: boolean) {
  if (preview) return section === "overview" ? "/account/preview" : "/account/preview?section=" + section;
  return section === "overview" ? "/account" : "/account/" + (section === "order-detail" ? "orders" : section);
}
