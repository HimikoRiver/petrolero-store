"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import { qrcodegen } from "@/lib/vendor/qrcodegen";
import { checkTotpSetupCode } from "../lib/checkTotpSetup";
import "../styles/twoFactor.css";

type Props = { enabled: boolean };
type Status = { error: boolean; text: string } | null;

function TotpQr({ uri }: { uri: string }) {
  // Generate the QR entirely in the browser; the authenticator secret must
  // never be sent to a public QR-code rendering endpoint.
  const qr = useMemo(() => qrcodegen.QrCode.encodeText(uri, qrcodegen.QrCode.Ecc.MEDIUM), [uri]);
  const modules = useMemo(() => {
    const cells: string[] = [];
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.getModule(x, y)) cells.push("M" + x + " " + y + "h1v1h-1z");
      }
    }
    return cells.join("");
  }, [qr]);

  return (
    <svg className="pa-2fa__qr" viewBox={"0 0 " + (qr.size + 8) + " " + (qr.size + 8)}
      xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="QR-код для подключения приложения-аутентификатора">
      <rect width={qr.size + 8} height={qr.size + 8} fill="#fff"/>
      <path transform="translate(4 4)" d={modules} fill="#111"/>
    </svg>
  );
}

export default function TwoFactorSettings({ enabled }: Props) {
  const router = useRouter();
  const [active, setActive] = useState(enabled);
  const [mode, setMode] = useState<"idle" | "enroll" | "disable" | "regenerate">("idle");
  const [uri, setUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const secret = useMemo(() => {
    if (!uri) return "";
    try { return new URL(uri).searchParams.get("secret") ?? ""; } catch { return ""; }
  }, [uri]);

  const clear = () => {
    setUri("");
    setBackupCodes([]);
    setPassword("");
    setCode("");
    setMode("idle");
    setStatus(null);
  };

  const setup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true); setStatus(null);
    try {
      const result = await authClient.twoFactor.enable({ password, method: "totp", issuer: "Petrolero" });
      if (result.error || !result.data || !("totpURI" in result.data) || !result.data.totpURI) {
        setStatus({ error: true, text: "Не удалось подключить защиту. Проверьте пароль и повторите попытку." });
        return;
      }
      setUri(result.data.totpURI);
      setBackupCodes(result.data.backupCodes ?? []);
      setPassword("");
      setMode("enroll");
    } catch {
      setStatus({ error: true, text: "Не удалось связаться с сервером." });
    } finally { setPending(false); }
  };

  const confirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || !/^\d{6}$/.test(code)) return;
    setPending(true);
    setStatus(null);
    try {
      // The server is authoritative. A local TOTP check MUST NOT reject a
      // code before Better Auth sees it: client and server clocks may differ.
      const result = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: false,
      });

      if (result.error) {
        // This is a diagnostic only, performed *after* a server rejection.
        // Some versions of Better Auth return 401 even for incorrect TOTP;
        // never assume a 401 always means the user has lost their session.
        const localMatch = await checkTotpSetupCode(uri, code);
        const errorCode = String(result.error.code ?? "").toUpperCase();
        const statusCode = result.error.status;
        const message =
          statusCode === 429
            ? "Слишком много попыток. Повторите позже."
            : statusCode >= 500
              ? "Ошибка сервера при проверке кода. Откройте CMD с Next.js, чтобы увидеть причину."
              : localMatch === true
                ? "Код соответствует текущему QR-коду по времени этого компьютера, но сервер его отклонил. Проверьте часы Windows и работу сессии; если ошибка повторится, покажите текст ошибки из CMD."
                : localMatch === false
                  ? "Сервер отклонил код. Проверка по часам компьютера также не совпала: проверьте синхронизацию времени Windows и телефона. Затем используйте свежий код."
                  : errorCode.includes("TWO_FACTOR_COOKIE")
                    ? "Не удалось подтвердить код в текущей сессии. Перезайдите в аккаунт и начните подключение заново."
                    : "Сервер отклонил код подтверждения. Проверьте часы Windows и введите новый код после его смены.";
        setStatus({ error: true, text: message });
        return;
      }

      setActive(true);
      setUri("");
      setCode("");
      setStatus({
        error: false,
        text: "Двухфакторная защита включена. Сохраните резервные коды в надёжном месте — позже они не будут показаны автоматически.",
      });
      setMode("idle");
      router.refresh();
    } catch {
      setStatus({
        error: true,
        text: "Не удалось обратиться к серверу подтверждения. Проверьте CMD, затем повторите попытку.",
      });
    } finally {
      setPending(false);
    }
  };

  const disable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true); setStatus(null);
    try {
      const result = await authClient.twoFactor.disable({ password });
      if (result.error) {
        setStatus({ error: true, text: "Не удалось отключить защиту. Проверьте пароль." });
        return;
      }
      setActive(false);
      clear();
      setStatus({ error: false, text: "Двухфакторная защита отключена." });
      router.refresh();
    } catch { setStatus({ error: true, text: "Не удалось связаться с сервером." }); }
    finally { setPending(false); }
  };

  const regenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true); setStatus(null);
    try {
      const result = await authClient.twoFactor.generateBackupCodes({ password });
      if (result.error || !result.data) {
        setStatus({ error: true, text: "Не удалось обновить резервные коды. Проверьте пароль." });
        return;
      }
      setBackupCodes(result.data.backupCodes ?? []);
      setPassword("");
      setMode("idle");
      setStatus({ error: false, text: "Новые резервные коды созданы. Старые больше недействительны." });
    } catch { setStatus({ error: true, text: "Не удалось связаться с сервером." }); }
    finally { setPending(false); }
  };

  return (
    <section className="pa-surface pa-2fa" aria-labelledby="pa-2fa-title">
      <div className="pa-surface__heading">
        <div><span className="pa-kicker">ДВУХФАКТОРНАЯ АВТОРИЗАЦИЯ</span>
          <h3 id="pa-2fa-title">Дополнительная защита</h3></div>
        <span className="pa-2fa__state" data-active={active}>
          {active ? "Включена" : "Не подключена"}
        </span>
      </div>
      <p className="pa-2fa__intro">
        {active
          ? "Для входа с нового устройства потребуется пароль и одноразовый код из приложения-аутентификатора."
          : "Подключите приложение-аутентификатор. После ввода пароля для входа потребуется одноразовый код с телефона."}
      </p>

      {!active && mode === "idle" && (
        <form className="pa-2fa__form" onSubmit={setup}>
          <label className="pa-edit-field">
            <span>Текущий пароль</span>
            <input type="password" autoComplete="current-password" value={password}
              onChange={e => setPassword(e.target.value)} minLength={10} required />
          </label>
          <GoldShimmerButton type="submit" disabled={pending}>
            {pending ? "Подключение…" : "Подключить двухфакторную защиту"}
          </GoldShimmerButton>
        </form>
      )}

      {!active && mode === "enroll" && uri && (
        <div className="pa-2fa__enroll">
          <p className="pa-2fa__description">Откройте Google Authenticator, Microsoft Authenticator или другое приложение TOTP и отсканируйте этот QR-код. Если вы запускали подключение повторно, выберите новую запись Petrolero в приложении: прежние коды могут больше не подходить.</p>
          <TotpQr uri={uri} />
          {secret && (
            <div className="pa-2fa__manual">
              <span>Или введите ключ вручную:</span>
              <code>{secret}</code>
            </div>
          )}
          <form className="pa-2fa__form" onSubmit={confirm}>
            <label className="pa-edit-field">
              <span>Шестизначный код из приложения</span>
              <input type="text" inputMode="numeric" autoComplete="one-time-code"
                pattern="[0-9]{6}" maxLength={6} value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" required />
            </label>
            <GoldShimmerButton type="submit" disabled={pending || code.length !== 6}>
              {pending ? "Проверка…" : "Подтвердить подключение"}
            </GoldShimmerButton>
          </form>
          <button className="pa-small-action" type="button" onClick={clear} disabled={pending}>Закрыть настройку</button>
        </div>
      )}

      {active && mode === "idle" && (
        <div className="pa-2fa__actions">
          <button type="button" className="pa-small-action" onClick={() => {
            setMode("regenerate"); setBackupCodes([]); setStatus(null);
          }}>Создать новые резервные коды</button>
          <button type="button" className="pa-small-action pa-small-action--muted" onClick={() => {
            setMode("disable"); setBackupCodes([]); setStatus(null);
          }}>Отключить защиту</button>
        </div>
      )}

      {active && (mode === "disable" || mode === "regenerate") && (
        <form className="pa-2fa__form" onSubmit={mode === "disable" ? disable : regenerate}>
          <label className="pa-edit-field">
            <span>Подтвердите действие текущим паролем</span>
            <input type="password" autoComplete="current-password" minLength={10} required
              value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <div className="pa-2fa__actions">
            <GoldShimmerButton type="submit" disabled={pending}>
              {pending ? "Обработка…" : mode === "disable" ? "Отключить 2FA" : "Обновить коды"}
            </GoldShimmerButton>
            <button type="button" className="pa-small-action" onClick={clear} disabled={pending}>Отмена</button>
          </div>
        </form>
      )}

      {status && <p className="pa-form-message" data-error={status.error}
        role={status.error ? "alert" : "status"}>{status.text}</p>}

      {active && backupCodes.length > 0 && (
        <div className="pa-2fa__backup" aria-labelledby="pa-2fa-backup-title">
          <h4 id="pa-2fa-backup-title">Резервные коды</h4>
          <p>Сохраните эти одноразовые коды вне телефона. Они помогут войти, если приложение-аутентификатор недоступно.</p>
          <div className="pa-2fa__backup-grid">
            {backupCodes.map((item, index) => <code key={index}>{item}</code>)}
          </div>
          <button type="button" className="pa-small-action" onClick={() => setBackupCodes([])}>
            Я сохранил(а) коды — скрыть
          </button>
        </div>
      )}
    </section>
  );
}
