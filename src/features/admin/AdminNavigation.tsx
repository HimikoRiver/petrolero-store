"use client";

import Link from "next/link";

type Section = "products" | "orders" | "customers";

const items: { section: Section; title: string; href: string }[] = [
  { section: "products", title: "Товары", href: "/admin" },
  { section: "orders", title: "Заказы", href: "/admin/orders" },
  { section: "customers", title: "Покупатели", href: "/admin/customers" },
];

export default function AdminNavigation({
  active, preview = false,
}: { active: Section; preview?: boolean }) {
  return (
    <nav className="pt-admin__section-nav" aria-label="Разделы управления магазином">
      {items.map(item => (
        <Link
          key={item.section}
          href={preview
            ? item.section === "products" ? "/admin/preview" : "/admin/preview/" + item.section
            : item.href}
          aria-current={active === item.section ? "page" : undefined}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
