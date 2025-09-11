import React from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import AuthShell from "../components/AuthShell";

export default function Forgot(){
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async (e)=>{
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      // TODO: заменить на реальный вызов API
      await new Promise(r=>setTimeout(r, 600));
      setSent(true);
    } catch {
      setError("Не удалось отправить письмо.");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Восстановление пароля">
      {!sent ? (
        <form onSubmit={submit}>
          <label className="block space-y-1 mb-4">
            <span className="text-sm opacity-80" style={{color:"var(--text)"}}>Email</span>
            <div className="field-surface flex items-center gap-2 rounded-2xl px-3">
              <Mail size={18} className="opacity-70" />
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none py-2"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </label>

          {error && <div className="text-sm mt-2" style={{color:"#ff8a8a"}}>{error}</div>}

          <div className="mt-5 flex items-center gap-4 flex-wrap">
            <button
              className="btn-primary rounded-2xl px-5 py-3 font-semibold relative"
              type="submit"
              disabled={loading}
              aria-busy={loading}
            >
              <span style={{visibility: loading ? 'hidden' : 'visible'}}>Отправить письмо</span>
              {loading && (
                <span className="absolute inset-0 grid place-items-center">
                  <Loader2 className="animate-spin" size={18}/>
                </span>
              )}
            </button>
            <Link to="/login" className="text-link">Вернуться ко входу</Link>
          </div>
        </form>
      ) : (
        <div style={{color:"var(--text)"}}>
          Если адрес есть в базе — отправили письмо со ссылкой для сброса пароля.
          <div className="mt-4">
            <Link to="/login" className="text-link">Войти</Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
