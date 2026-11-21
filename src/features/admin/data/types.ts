export type ReviewStatus = "NEW" | "REVIEWED" | "CLOSED";
export const REVIEW_STATUSES: { value: ReviewStatus; label: string }[] = [
  { value: "NEW", label: "Новая" },
  { value: "REVIEWED", label: "Проверена" },
  { value: "CLOSED", label: "Закрыта" },
];

export type AdminOrderSummary = {
  id: string;
  reference: string;
  createdAt: string;
  recipient: string;
  phone: string;
  subtotalKopecks: number;
  reviewStatus: ReviewStatus;
  staffNote: string | null;
  reviewedAt: string | null;
  itemCount: number;
  buyer: { id: string; name: string; email: string };
};
export type AdminOrderDetails = AdminOrderSummary & {
  city: string;
  street: string;
  apartment: string | null;
  postalCode: string | null;
  note: string | null;
  reviewedById: string | null;
  items: {
    id: string; productId: string; sku: string; title: string; image: string | null;
    quantity: number; unitPriceKopecks: number; lineTotalKopecks: number;
  }[];
};

export type AdminCustomerSummary = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
  ordersCount: number;
  addressesCount: number;
  favoritesCount: number;
};
export type AdminCustomerDetails = AdminCustomerSummary & {
  adminNote: string | null;
  addresses: {
    id: string; label: string; recipient: string; phone: string;
    city: string; street: string; apartment: string | null;
    postalCode: string | null; isDefault: boolean;
  }[];
  orders: {
    id: string; reference: string; createdAt: string;
    subtotalKopecks: number; reviewStatus: ReviewStatus;
  }[];
};
export type Paginated<T> = {
  items: T[];
  page: number;
  pages: number;
  total: number;
};
