"use client";

type Props = { onClose: () => void };

export default function CatalogAccountDialog({ onClose }: Props) {
  return (
<div className="petrolero-catalog-overlay" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <section className="petrolero-catalog-account" role="dialog" aria-modal="true" aria-label="Личный кабинет">
            <button type="button" className="petrolero-catalog-close" aria-label="Закрыть" onClick={() => onClose()}>×</button>
            <p>ЛИЧНЫЙ КАБИНЕТ</p>
            <h2>Вход в аккаунт</h2>
            <span>Вход временно недоступен.</span>
          </section>
        </div>
  );
}
