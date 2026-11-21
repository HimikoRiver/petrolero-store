export type DemoOrderLine = {
  id: string;
  productId: string;
  sku: string;
  title: string;
  image: string | null;
  quantity: number;
  unitPriceKopecks: number;
  lineTotalKopecks: number;
};

export type DemoOrder = {
  id: string;
  reference: string;
  recipient: string;
  phone: string;
  city: string;
  street: string;
  apartment: string | null;
  postalCode: string | null;
  note: string | null;
  subtotalKopecks: number;
  createdAt: string;
  items: DemoOrderLine[];
};
