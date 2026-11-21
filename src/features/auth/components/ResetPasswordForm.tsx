"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 10) {
      setStatus("Пароль должен содержать не менее десяти символов.");
      return;
    }
    if (password !== confirmation) {
      setStatus("Пароли не совпадают.");
      return;
    }
    setPending(true);
    setStatus("");
    try {
      const result = await authClient.resetPassword({ token, newPassword: password });
      if (result.error) {
        setStatus("Ссылка недействительна или срок её действия истёк.");
      } else {
        setSuccess(true);
        setStatus("Пароль изменён. Теперь можно войти в аккаунт.");
      }
    } catch {
      setStatus("Не удалось изменить пароль. Повторите попытку.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="petrolero-account-private" style={{minHeight:"100svh",display:"grid",placeItems:"center",padding:24,background:"#090909",color:"#ead8be"}}>
      <section style={{width:"min(100%,440px)",border:"1px solid #665039",padding:32,background:"#17130f"}}>
        <h1 style={{fontSize:30,fontWeight:500}}>Новый пароль</h1>
        {token && !success ? (
          <form onSubmit={submit} style={{display:"grid",gap:15}}>
            <label>Пароль
              <input type="password" autoComplete="new-password" minLength={10} required value={password} onChange={e=>setPassword(e.target.value)}
                style={{display:"block",width:"100%",height:44,marginTop:8,padding:10,color:"#151515",background:"#eee"}} />
            </label>
            <label>Повторите пароль
              <input type="password" autoComplete="new-password" minLength={10} required value={confirmation} onChange={e=>setConfirmation(e.target.value)}
                style={{display:"block",width:"100%",height:44,marginTop:8,padding:10,color:"#151515",background:"#eee"}} />
            </label>
            <button type="submit" disabled={pending} style={{height:46,border:"1px solid #d6ad72",background:"#ac8049",color:"#111",cursor:"pointer"}}>
              {pending ? "Сохранение…" : "Изменить пароль"}
            </button>
          </form>
        ) : !success ? <p>Ссылка для восстановления не найдена или устарела.</p> : null}
        {status && <p role="status">{status}</p>}
        <Link href="/account/login" style={{color:"#d6ad72",display:"inline-block",marginTop:20}}>Вернуться ко входу</Link>
      </section>
    </main>
  );
}
