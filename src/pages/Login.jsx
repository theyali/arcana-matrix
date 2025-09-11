import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, Mail, Lock } from "lucide-react";
import AuthShell from "../components/AuthShell";

export default function Login(){
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ identifier:"", password:"" });
  const [error, setError] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const location = useLocation();

  const submit = async (e)=>{
    e.preventDefault();
    setError(""); setErrors({}); setLoading(true);
    try {
      await login(form.identifier.trim(), form.password);
      const from = location.state?.from?.pathname || "/cabinet";
      navigate(from, { replace: true });
    } catch (err) {
      setError((err?.detail) || "Ошибка входа");
      setErrors(err?.fields || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Вход">
      <form onSubmit={submit}>
        <Field label="Email или имя пользователя" icon={Mail} error={errors.identifier || errors.username || errors.email}>
          <input
            value={form.identifier}
            onChange={e=>setForm(f=>({...f,identifier:e.target.value}))}
            className="flex-1 bg-transparent outline-none py-2"
            placeholder="name@example.com или username"
            autoComplete="username"
            disabled={loading}                // ⬅ блокируем во время запроса
          />
        </Field>

        <Field label="Пароль" icon={Lock} error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={e=>setForm(f=>({...f,password:e.target.value}))}
            className="flex-1 bg-transparent outline-none py-2"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}                // ⬅ блокируем во время запроса
          />
        </Field>

        {error && <div className="text-sm mt-2" style={{color:"#ff8a8a"}}>{error}</div>}

        <div className="mt-5 flex items-center gap-4 flex-wrap">
          {/* Кнопка со спиннером поверх, текст скрываем */}
          <button
            className="btn-primary rounded-2xl px-5 py-3 font-semibold relative"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            <span style={{visibility: loading ? 'hidden' : 'visible'}}>Войти</span>
            {loading && (
              <span className="absolute inset-0 grid place-items-center">
                <Loader2 size={18} className="animate-spin" />
              </span>
            )}
          </button>

          <Link to="/register" className="text-link">Регистрация</Link>
          <span className="opacity-40">·</span>
          <Link to="/forgot" className="text-link">Забыли пароль?</Link>
        </div>
      </form>
    </AuthShell>
  );
}

function Field({ label, icon:Icon, error, children }){
  return (
    <label className="block space-y-1 mb-4">
      <span className="text-sm opacity-80" style={{color:"var(--text)"}}>{label}</span>
      <div className="field-surface flex items-center gap-2 rounded-2xl px-3">
        {Icon && <Icon size={18} className="opacity-70" />}
        {children}
      </div>
      {error && <div className="text-xs mt-1" style={{ color: "#ff8a8a" }}>{error}</div>}
    </label>
  );
}
