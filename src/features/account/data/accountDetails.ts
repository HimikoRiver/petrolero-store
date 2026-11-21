export type DeliveryAddress = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  city: string;
  street: string;
  apartment: string | null;
  postalCode: string | null;
  isDefault: boolean;
};
