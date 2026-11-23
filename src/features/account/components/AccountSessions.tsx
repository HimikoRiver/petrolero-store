"use client";

import { useCallback, useEffect, useState } from "react";
import "../styles/accountSessions.css";

type SessionItem = {
  id: string;
  current: boolean;
  device: string;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
};

type SessionResponse = { sessions: SessionItem[]; error?: string };
type Notice = { message: string; error: boolean } | null;

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit", month: "long", year: "numeric",
  hour: "2-digit", minute: "2-digit",
});

function dateLabel(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Неизвестно" : dateFormat.format(parsed);
}

export default function AccountSessions() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/account/sessions", {
        cache: "no-store",
        credentials: "same-origin",
        signal,
      });
      const result = await response.json() as SessionResponse;
      if (!response.ok) throw new Error(result.error || "Не удалось получить сеансы.");
      if (!signal?.aborted) setSessions(result.sessions);
    } catch (error) {
      if (signal?.aborted) return;
      setNotice({
        error: true,
        message: error instanceof Error ? error.message : "Не удалось загрузить сеансы.",
      });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const revoke = async (target: { id: string } | { scope: "others" }) => {
    if (pending) return;
    const allOthers = "scope" in target;
    const confirmed = window.confirm(allOthers
      ? "Завершить все сеансы на других устройствах? Здесь вы останетесь в аккаунте."
      : "Завершить выбранный сеанс? На том устройстве потребуется войти заново.");
    if (!confirmed) return;

    setPending(allOthers ? "others" : target.id);
    setNotice(null);
    try {
      const response = await fetch("/api/account/sessions", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
      const result = await response.json() as { revoked?: number; error?: string };
      if (!response.ok) throw new Error(result.error || "Не удалось завершить сеанс.");
      await load();
      setNotice({
        error: false,
        message: result.revoked
          ? (allOthers ? "Все другие сеансы завершены." : "Сеанс завершён.")
          : "Других активных сеансов нет.",
      });
    } catch (error) {
      setNotice({
        error: true,
        message: error instanceof Error ? error.message : "Не удалось завершить сеанс.",
      });
    } finally {
      setPending(null);
    }
  };

  const others = sessions.filter((item) => !item.current);

  return (
    <section className="pa-surface pa-sessions" aria-labelledby="pa-sessions-title">
      <div className="pa-surface__heading">
        <div>
          <span className="pa-kicker">УПРАВЛЕНИЕ ДОСТУПОМ</span>
          <h3 id="pa-sessions-title">Активные устройства</h3>
        </div>
        <span className="pa-sessions__count">
          {loading ? "Загрузка" : sessions.length + " активн."}
        </span>
      </div>
      <p className="pa-sessions__intro">
        Здесь показаны устройства, на которых выполнен вход в аккаунт.
        Если какое-то устройство вам незнакомо, завершите его сеанс.
      </p>

      {loading && <p className="pa-sessions__muted" role="status">Проверяем активные устройства…</p>}

      {!loading && sessions.length === 0 && (
        <p className="pa-sessions__muted">Не удалось найти активные сеансы. Обновите список.</p>
      )}

      {!loading && sessions.length > 0 && (
        <div className="pa-sessions__list">
          {sessions.map((session) => (
            <div className="pa-sessions__item" key={session.id} data-current={session.current}>
              <span className="pa-sessions__symbol" aria-hidden="true">
                {session.current ? "●" : "◈"}
              </span>
              <div className="pa-sessions__details">
                <div className="pa-sessions__name">
                  <strong>{session.device}</strong>
                  {session.current && <span className="pa-sessions__current">Это устройство</span>}
                </div>
                <p>
                  Вход: {dateLabel(session.createdAt)}
                  <span aria-hidden="true"> · </span>
                  Активность: {dateLabel(session.lastActiveAt)}
                </p>
                <p>
                  IP: {session.ipAddress ?? "Не определён"}
                  <span aria-hidden="true"> · </span>
                  До: {dateLabel(session.expiresAt)}
                </p>
              </div>
              {!session.current && (
                <button
                  className="pa-sessions__revoke"
                  type="button"
                  disabled={pending !== null}
                  onClick={() => void revoke({ id: session.id })}
                  aria-label={"Завершить сеанс: " + session.device}
                >
                  {pending === session.id ? "Завершаем…" : "Завершить"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pa-sessions__footer">
        <button className="pa-sessions__refresh" type="button"
          disabled={pending !== null || loading} onClick={() => {
            setLoading(true);
            setNotice(null);
            void load();
          }}>Обновить список</button>
        {others.length > 0 && (
          <button className="pa-sessions__revoke-all" type="button"
            disabled={pending !== null || loading}
            onClick={() => void revoke({ scope: "others" })}>
            {pending === "others" ? "Завершаем…" : "Завершить все другие сеансы"}
          </button>
        )}
      </div>
      {notice && <p className="pa-form-message pa-sessions__notice"
        data-error={notice.error} role={notice.error ? "alert" : "status"}>{notice.message}</p>}
    </section>
  );
}
