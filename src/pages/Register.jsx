import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, Mail, Lock, User } from "lucide-react";
import AuthShell from "../components/AuthShell";

export default function Register(){
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ email:"", username:"", password:"" });
  const [error, setError] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    setError(""); setErrors({}); setLoading(true);
    try {
      await register(form.email.trim(), form.password, form.username.trim() || undefined);
      navigate("/");
    } catch (err) {
      const msg = (err?.detail) || "Ошибка регистрации";
      setError(msg);
      setErrors(err?.fields || {});
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Регистрация">
      <form onSubmit={submit}>
        <Field label="Email" icon={Mail} error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={e=>setForm(f=>({...f,email:e.target.value}))}
            className="flex-1 bg-transparent outline-none py-2"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={loading}
          />
        </Field>

        <Field label="Имя пользователя (опционально)" icon={User} error={errors.username}>
          <input
            value={form.username}
            onChange={e=>setForm(f=>({...f,username:e.target.value}))}
            className="flex-1 bg-transparent outline-none py-2"
            placeholder="как вас называть"
            autoComplete="username"
            disabled={loading}
          />
        </Field>

        <Field label="Пароль" icon={Lock} error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={e=>setForm(f=>({...f,password:e.target.value}))}
            className="flex-1 bg-transparent outline-none py-2"
            placeholder="минимум 8 символов"
            autoComplete="new-password"
            disabled={loading}
          />
        </Field>

        {error && <div className="text-sm mt-2" style={{color:"#ff8a8a"}}>{error}</div>}

        <div className="mt-5 flex items-center gap-4 flex-wrap">
          <button
            className="btn-primary rounded-2xl px-5 py-3 font-semibold relative"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            <span style={{visibility: loading ? 'hidden' : 'visible'}}>Зарегистрироваться</span>
            {loading && (
              <span className="absolute inset-0 grid place-items-center">
                <Loader2 className="animate-spin" size={18}/>
              </span>
            )}
          </button>
          <Link to="/login" className="text-link">У меня есть аккаунт</Link>
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
