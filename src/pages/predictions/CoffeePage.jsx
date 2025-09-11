// src/pages/predictions/CoffeePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import AuthGate from "../../components/auth/AuthGate";

export default function CoffeePage() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const isGuest = !isAuthed;

  const [files, setFiles] = React.useState([]);         // File[]
  const [previews, setPreviews] = React.useState([]);   // {name, url, size}
  const [error, setError] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef(null);

  const MAX_FILES = 3;
  const MIN_FILES = 2;
  const MAX_SIZE_MB = 12;
  const LOGIN_PATH = "/login";

  const buildNext = () => encodeURIComponent(window.location.pathname + window.location.search);
  const goLoginNext = () => navigate(`${LOGIN_PATH}?next=${buildNext()}`);

  const openPicker = () => {
    if (isGuest) return goLoginNext();
    inputRef.current?.click();
  };

  const revokePreviews = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
  };
  React.useEffect(() => () => revokePreviews(), []); // tidy up on unmount

  const validateAndSet = (fileList) => {
    setError("");
    const arr = Array.from(fileList || []);
    if (!arr.length) return;

    const images = arr.filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      setError("Пожалуйста, выберите изображения (JPG/PNG).");
      return;
    }

    // merge with existing, dedup by name+size, limit to MAX_FILES
    const merged = [...files, ...images];
    const byKey = new Map();
    merged.forEach((f) => {
      const key = `${f.name}_${f.size}`;
      if (!byKey.has(key)) byKey.set(key, f);
    });
    const unique = Array.from(byKey.values()).slice(0, MAX_FILES);

    // size check
    const big = unique.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (big) {
      setError(`Файл «${big.name}» больше ${MAX_SIZE_MB} МБ.`);
      return;
    }

    setFiles(unique);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews(unique.map((f) => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) })));
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isGuest) return goLoginNext();
    validateAndSet(e.dataTransfer.files);
  };

  const onChange = (e) => {
    if (isGuest) return goLoginNext();
    validateAndSet(e.target.files);
  };

  const removeAt = (name, size) => {
    const filtered = files.filter((f) => !(f.name === name && f.size === size));
    setFiles(filtered);
    const removed = previews.find((p) => p.name === name && p.size === size);
    if (removed) URL.revokeObjectURL(removed.url);
    setPreviews(previews.filter((p) => !(p.name === name && p.size === size)));
  };

  const resetAll = () => {
    setFiles([]);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    setError("");
  };

  const canUpload = files.length >= MIN_FILES && files.length <= MAX_FILES && !uploading;

  const handleUpload = async () => {
    if (isGuest) return goLoginNext();
    if (!canUpload) return;
    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      files.forEach((f) => form.append("images", f, f.name)); // backend ожидает 'images'
      form.append("source", "coffee");

      // TODO: поставь свой эндпоинт
      const res = await fetch("/api/predictions/coffee/analyze", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Ошибка загрузки (${res.status})`);
      await res.json().catch(() => ({}));

      alert("Фото отправлены. Анализ начался на сервере.");
      // при наличии job_id:
      // navigate(`/predictions/coffee/result/${data.job_id}`)
      // resetAll();
    } catch (e) {
      setError(e.message || "Не удалось загрузить изображения.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="page relative">
      {/* Лоадер-оверлей */}
      {uploading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl p-6 border border-white/10 bg-white/10 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <div className="font-semibold">Идёт загрузка и запуск анализа…</div>
            <div className="opacity-80 text-sm mt-1">Обычно это занимает несколько секунд.</div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl py-10">
        <h1 className="h1 mb-2">Предсказания по кофе (ИИ)</h1>
        <p className="text-base opacity-80 mb-8">
          Загрузите <b>2–3 фото</b> чашки с кофейной гущей с разных ракурсов — мы проанализируем узоры и предложим трактовки.
        </p>

        {/* DnD область — защищённый блок */}
        <section
          onDragOver={(e)=>{ e.preventDefault(); setIsDragging(true); }}
          onDragLeave={()=>setIsDragging(false)}
          onDrop={onDrop}
          className={`relative rounded-3xl border-2 border-dashed transition p-8 sm:p-12 text-center ${
            isDragging ? 'border-[var(--primary)] bg-white/10' : 'border-white/15 bg-white/5 hover:bg-white/10'
          }`}
        >
          {/* Оверлей/замок + блюр через универсальный AuthGate */}
          <AuthGate
            loginPath={LOGIN_PATH}
            title="Войдите, чтобы загрузить фото"
            description="Функция доступна только авторизованным пользователям."
          >
            {/* Контент секции — блюр и блокировка кликов для гостей */}
            <div className={isGuest ? "filter blur-[2px] pointer-events-none select-none" : ""}>
              <div className="mx-auto max-w-xl">
                <div className="mx-auto h-16 w-16 rounded-2xl grid place-items-center shadow-lg mb-4"
                    style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
                  <span className="text-2xl" aria-hidden>☕</span>
                </div>

                <h2 className="text-xl font-semibold mb-2" style={{color:'var(--text)'}}>Перетащите фото сюда</h2>
                <p className="opacity-80 mb-5">или</p>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={onChange}
                />
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button onClick={openPicker} className="btn-primary rounded-2xl px-5 py-3 font-semibold">
                    Выбрать файлы
                  </button>
                  <span className="text-sm opacity-80">JPG/PNG · до {MAX_SIZE_MB} МБ каждый · {MIN_FILES}–{MAX_FILES} фото</span>
                </div>

                {/* Счётчик/ошибка */}
                <div className="mt-4 text-sm">
                  <span className="opacity-80">Выбрано: </span>
                  <b>{files.length}</b> / {MAX_FILES}
                  {files.length > 0 && (
                    <>
                      <span className="mx-2 opacity-30">•</span>
                      <button onClick={resetAll} className="btn-ghost rounded-xl px-3 py-1 text-sm">Очистить</button>
                    </>
                  )}
                </div>
                {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
              </div>

              {/* Превью */}
              {previews.length > 0 && (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previews.map(p => (
                    <figure key={p.url} className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/10">
                      <img src={p.url} alt={p.name} className="w-full h-40 object-cover" />
                      <figcaption className="absolute bottom-0 left-0 right-0 bg-black/40 text-xs px-2 py-1 truncate">
                        {p.name}
                      </figcaption>
                      <button
                        type="button"
                        onClick={()=>removeAt(p.name, p.size)}
                        className="absolute top-2 right-2 rounded-lg px-2 py-1 text-xs bg-black/50 hover:bg-black/70"
                        aria-label="Удалить фото"
                      >
                        ✕
                      </button>
                    </figure>
                  ))}
                </div>
              )}

              {/* Кнопка отправки */}
              <div className="mt-8">
                <button
                  disabled={!canUpload || isGuest}
                  onClick={handleUpload}
                  className={`rounded-2xl px-6 py-3 font-semibold ${
                    !isGuest && canUpload ? 'btn-primary' : 'btn-ghost opacity-60 cursor-not-allowed'
                  }`}
                >
                  Отправить на анализ
                </button>
                <div className="text-xs opacity-70 mt-2">
                  Требуется минимум {MIN_FILES} фото. Рекомендуем 3 ракурса: сверху, под углом ~45°, сбоку.
                </div>
              </div>
            </div>
          </AuthGate>
        </section>

        {/* Инструкция и примеры */}
        <section className="mt-10 grid lg:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h3 className="font-semibold mb-3">Как сделать правильные фото</h3>
            <ol className="list-decimal list-inside space-y-2 opacity-90 text-sm">
              <li>Освещение — естественное рассеянное, без вспышки и бликов.</li>
              <li>Заполните кадр чашкой: узор должен быть крупным и резким.</li>
              <li>Сделайте 2–3 снимка: <b>вид сверху</b>, <b>под углом ~45°</b>, <b>сбоку</b>.</li>
              <li>Держите камеру неподвижно; избегайте размытия.</li>
              <li>Формат JPG/PNG, ширина ≥ 1000 px, размер до {MAX_SIZE_MB} МБ.</li>
            </ol>
          </div>

          <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h3 className="font-semibold mb-3">Хорошие примеры</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Сверху', hint: 'узор виден целиком' },
                { label: '45°', hint: 'объём и рельеф' },
                { label: 'Сбоку', hint: 'силуэты на стенках' },
              ].map((x,i)=>(
                <div key={i} className="rounded-xl p-3 text-center border border-white/10 bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/15">
                  <div className="text-2xl mb-2">☕</div>
                  <div className="text-xs font-semibold">{x.label}</div>
                  <div className="text-[11px] opacity-70">{x.hint}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h3 className="font-semibold mb-3">Чего избегать</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon:'⚡', title:'Вспышка', hint:'жёсткие блики' },
                { icon:'🌀', title:'Размыто', hint:'нет резкости' },
                { icon:'↔️', title:'Слишком далеко', hint:'мало деталей' },
              ].map((x,i)=>(
                <div key={i} className="rounded-xl p-3 text-center border border-white/10 bg-white/5">
                  <div className="text-2xl mb-2">{x.icon}</div>
                  <div className="text-xs font-semibold">{x.title}</div>
                  <div className="text-[11px] opacity-70">{x.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
