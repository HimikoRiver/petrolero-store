"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";

type Props = {
  name: string | null;
  email: string | null;
  phone: string | null;
  preview: boolean;
};

export default function AccountProfile({ name, email, phone, preview }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(phone ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setError(true);
      setMessage("Укажите имя длиной не менее двух символов.");
      return;
    }

    if (preview) {
      setError(false);
      setMessage("");
      return;
    }

    setPending(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, phone: phoneNumber.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(true);
        setMessage(data.error || "Не удалось сохранить изменения.");
        return;
      }
      setFullName(data.profile.name);
      setPhoneNumber(data.profile.phone || "");
      setMessage("Контактные данные сохранены.");
      router.refresh();
    } catch {
      setError(true);
      setMessage("Не удалось связаться с сервером. Попробуйте снова.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="pa-form-editor">
      <p className="pa-form-editor__intro">
        Используем эти сведения для связи по вопросам заказов. E-mail для входа меняется отдельно после подтверждения.
      </p>
      <form className="pa-form" onSubmit={submit}>
        <div className="pa-form-grid">
          <label className="pa-edit-field">
            <span>Ваше имя <em>*</em></span>
            <input
              type="text" autoComplete="name" minLength={2} maxLength={100}
              placeholder="Как к вам обращаться" required
              value={fullName} onChange={event => setFullName(event.target.value)}
            />
          </label>
          <label className="pa-edit-field">
            <span>Телефон</span>
            <input
              type="tel" autoComplete="tel" maxLength={32}
              placeholder="+7 900 000-00-00"
              value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)}
            />
          </label>
          <label className="pa-edit-field pa-edit-field--wide">
            <span>Электронная почта</span>
            <input type="email" value={email ?? (preview ? "Доступна после регистрации" : "")} readOnly
              className="pa-edit-field__locked" aria-label="Почта аккаунта, только чтение" />
            <small>E-mail используется для входа и подтверждения покупок.</small>
          </label>
        </div>
        <div className="pa-form-actions">
          <GoldShimmerButton type="submit" disabled={pending}>
            {pending ? "Сохранение…" : "Сохранить изменения"}
          </GoldShimmerButton>
        </div>
        {message && <p className="pa-form-message" data-error={error} role={error ? "alert" : "status"}>{message}</p>}
      </form>
    </div>
  );
}
