import React from "react";
import { Settings as SettingsIcon, Loader2, Image as ImageIcon } from "lucide-react";
import { updateProfile, getAvatarUrl } from "../../api/profile";

export default function SettingsTab({ profile, onUpdated }) {
  const base = React.useMemo(() => ({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    bio: profile?.profile?.bio || "",
    avatarUrl: profile?.profile?.avatarUrl || getAvatarUrl(profile?.profile?.avatar) || "",
  }), [profile]);
  const [form, setForm] = React.useState({
    first_name: base.first_name,
    last_name: base.last_name,
    bio: base.bio,
  });
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(base.avatarUrl);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    // sync when profile prop changes
    setForm({ first_name: base.first_name, last_name: base.last_name, bio: base.bio });
    setAvatarPreview(base.avatarUrl);
    setAvatarFile(null);
    setError("");
    setErrors({});
  }, [base]);

  const isDirty = React.useMemo(() => {
    return (
      form.first_name !== base.first_name ||
      form.last_name !== base.last_name ||
      form.bio !== base.bio ||
      !!avatarFile
    );
  }, [form, base, avatarFile]);

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setErrors({});
    try {
      const payload = { ...form };
      if (avatarFile) payload.avatar = avatarFile;
      const updated = await updateProfile(payload);
      onUpdated?.(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err?.detail || "Не удалось сохранить профиль");
      setErrors(err?.fields || {});
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel-card p-6">
      <div className="flex items-center gap-2 mb-4"><SettingsIcon size={18}/> <b>Настройки профиля</b></div>
      <form className="grid sm:grid-cols-2 gap-4" onSubmit={submit}>
        {/* Аватар */}
        <div className="sm:col-span-2 flex items-center gap-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Аватар" className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-2xl grid place-items-center text-white" style={{background:"linear-gradient(135deg,var(--primary),var(--accent))"}}>
              <ImageIcon size={18} />
            </div>
          )}
          <label className="btn-ghost rounded-2xl px-4 py-2 cursor-pointer">
            Заменить аватар
            <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          </label>
        </div>

        <Field label="Имя" error={errors.first_name}>
          <input
            className="w-full mt-1 field-surface rounded-xl px-3 py-2"
            value={form.first_name}
            onChange={e=>setForm(f=>({...f, first_name:e.target.value}))}
            disabled={saving}
          />
        </Field>

        <Field label="Фамилия" error={errors.last_name}>
          <input
            className="w-full mt-1 field-surface rounded-xl px-3 py-2"
            value={form.last_name}
            onChange={e=>setForm(f=>({...f, last_name:e.target.value}))}
            disabled={saving}
          />
        </Field>

        <Field label="О себе" error={errors.bio} full>
          <textarea
            className="w-full mt-1 field-surface rounded-xl px-3 py-2 h-24"
            placeholder="Коротко о себе…"
            value={form.bio}
            onChange={e=>setForm(f=>({...f, bio:e.target.value}))}
            disabled={saving}
          />
        </Field>

        {/* Роль убрана из формы по требованиям */}

        {/* Email только отображаем, не редактируем (если API не поддерживает) */}
        {profile?.email && (
          <Field label="E-mail">
            <input className="w-full mt-1 field-surface rounded-xl px-3 py-2" value={profile.email} disabled />
          </Field>
        )}

        {error && <div className="sm:col-span-2 text-sm" style={{color:"#ff8a8a"}}>{error}</div>}
        {saved && !error && (
          <div className="sm:col-span-2 text-sm" style={{color:"#6ee7b7"}}>Сохранено</div>
        )}

        <div className="sm:col-span-2 flex gap-2 items-center">
          <button className="btn-primary rounded-2xl px-4 py-2 relative" type="submit" disabled={saving || !isDirty}>
            <span style={{ visibility: saving ? 'hidden' : 'visible' }}>Сохранить</span>
            {saving && <span className="absolute inset-0 grid place-items-center"><Loader2 className="animate-spin" size={18}/></span>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children, full = false }){
  return (
    <label className={`text-sm opacity-80 ${full ? 'sm:col-span-2' : ''}`}>
      {label}
      <div>
        {children}
      </div>
      {error && <div className="text-xs mt-1" style={{ color: "#ff8a8a" }}>{error}</div>}
    </label>
  );
}
