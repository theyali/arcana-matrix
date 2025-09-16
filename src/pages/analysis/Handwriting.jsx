// src/pages/analysis/Handwriting.jsx
import React from "react";
import AuthGate from "../../components/auth/AuthGate";
import { predictionsApi } from "../../api/palmai"; // TODO: заменить на handwritingApi, когда будет готов

export default function HandwritingPage() {
  const [files, setFiles] = React.useState([]);         // File[]
  const [previews, setPreviews] = React.useState([]);   // {name, url, size}
  const [error, setError] = React.useState("");
  const [errStatus, setErrStatus] = React.useState(null); // HTTP код ошибки
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // результат
  const [result, setResult] = React.useState(null);     // API payload
  const [stage, setStage] = React.useState("idle");     // idle | submitting | done | error

  const inputRef = React.useRef(null);
  const resultRef = React.useRef(null);

  // для почерка достаточно 1–3 фото
  const MAX_FILES = 3;
  const MIN_FILES = 1;
  const MAX_SIZE_MB = 12;

  const revokePreviews = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
  };
  React.useEffect(() => () => revokePreviews(), []); // cleanup on unmount

  React.useEffect(() => {
    if (stage === "done" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stage]);

  const validateAndSet = (fileList) => {
    setError("");
    setErrStatus(null);
    const arr = Array.from(fileList || []);
    if (!arr.length) return;

    const images = arr.filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      setError("Пожалуйста, выберите изображения (JPG/PNG).");
      setErrStatus(400);
      return;
    }

    const merged = [...files, ...images];
    const byKey = new Map();
    merged.forEach((f) => {
      const key = `${f.name}_${f.size}`;
      if (!byKey.has(key)) byKey.set(key, f);
    });
    const unique = Array.from(byKey.values()).slice(0, MAX_FILES);

    const big = unique.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (big) {
      setError(`Файл «${big.name}» больше ${MAX_SIZE_MB} МБ.`);
      setErrStatus(400);
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
    validateAndSet(e.dataTransfer.files);
  };

  const onChange = (e) => validateAndSet(e.target.files);
  const openPicker = () => inputRef.current?.click();

  const removeAt = (name, size) => {
    const filtered = files.filter((f) => !(f.name === name && f.size === size));
    setFiles(filtered);
    const removed = previews.find((p) => p.name === name && p.size === size);
    if (removed) URL.revokeObjectURL(removed.url);
    setPreviews(previews.filter((p) => !(p.name === name && p.size === size)));
  };

  const hardReset = () => {
    setFiles([]);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    setError("");
    setErrStatus(null);
    setIsDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const resetForNew = () => {
    setResult(null);
    setStage("idle");
    setUploading(false);
    hardReset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canUpload = files.length >= MIN_FILES && files.length <= MAX_FILES && !uploading;

  const handleUpload = async () => {
    if (!canUpload) return;
    setUploading(true);
    setError("");
    setErrStatus(null);
    setStage("submitting");

    try {
      const data = await (
        predictionsApi.analyzeHandwriting
          ? predictionsApi.analyzeHandwriting(files, { locale: "ru" })
          : predictionsApi.analyzePalm(files, { locale: "ru", task: "handwriting" })
      );
      setResult(data);
      setStage("done");
    } catch (e) {
      setError(e?.message || "Не удалось выполнить анализ.");
      setErrStatus(e?.status ?? null);
      setStage("error");
    } finally {
      setUploading(false);
    }
  };

  const ErrorBanner = () => {
    if (!error) return null;

    const isLimit = errStatus === 402;
    const isBadContent = errStatus === 422;
    const netIssue = errStatus === 0;

    return (
      <div role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
        <div className="font-semibold mb-1">Не удалось выполнить запрос</div>
        <div className="opacity-90">{error}</div>

        <div className="mt-3 flex flex-wrap gap-2">
          {isBadContent && (
            <>
              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20"
              >
                Понял
              </button>
              <button
                type="button"
                onClick={openPicker}
                className="rounded-lg px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20"
              >
                Выбрать другие фото
              </button>
            </>
          )}
          {isLimit && (
            <a href="/pricing" className="rounded-lg px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20">
              Открыть тарифы
            </a>
          )}
          {netIssue && (
            <button
              type="button"
              onClick={handleUpload}
              className="rounded-lg px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20"
            >
              Повторить
            </button>
          )}
        </div>
      </div>
    );
  };

  const UploadBlock = (
    <section
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`relative rounded-3xl border-2 border-dashed transition p-8 sm:p-12 text-center ${
        isDragging ? "border-[var(--primary)] bg-white/10"
                   : errStatus ? "border-red-400/60 bg-red-500/5"
                               : "border-white/15 bg-white/5 hover:bg-white/10"
      } ${stage === "done"
          ? "opacity-0 -translate-y-2 scale-[0.98] pointer-events-none h-0 p-0 sm:p-0 border-0 overflow-hidden duration-500"
          : "opacity-100 duration-300"}`}
      style={{ backdropFilter: uploading ? "blur(2px)" : "none" }}
      aria-hidden={stage === "done"}
    >
      {/* оверлей загрузки */}
      {uploading && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/40 backdrop-blur-sm rounded-3xl">
          <div className="rounded-2xl p-6 border border-white/10 bg-white/10 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <div className="font-semibold">Идёт анализ…</div>
            <div className="opacity-80 text-sm mt-1">Обычно это занимает несколько секунд.</div>
          </div>
        </div>
      )}

      {/* содержимое */}
      <div className={`${uploading ? "blur-sm" : ""}`}>
        <div className="mx-auto max-w-xl">
          <div
            className="mx-auto h-16 w-16 rounded-2xl grid place-items-center shadow-lg mb-4"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--primary))" }}
          >
            <span className="text-2xl" aria-hidden>✍️</span>
          </div>

          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>
            Перетащите фото рукописного текста
          </h2>
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
            <span className="text-sm opacity-80">
              JPG/PNG · ширина ≥ 1000 px · до {MAX_SIZE_MB} МБ · {MIN_FILES}–{MAX_FILES} фото
            </span>
          </div>

          <div className="mt-4 text-sm">
            <span className="opacity-80">Выбрано: </span>
            <b>{files.length}</b> / {MAX_FILES}
            {files.length > 0 && (
              <>
                <span className="mx-2 opacity-30">•</span>
                <button onClick={hardReset} className="btn-ghost rounded-xl px-3 py-1 text-sm">
                  Очистить
                </button>
              </>
            )}
          </div>
          {error && <ErrorBanner />}
        </div>

        {/* Превью */}
        {previews.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((p) => (
              <figure key={p.url} className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/10">
                <img src={p.url} alt={p.name} className="w-full h-40 object-cover" />
                <figcaption className="absolute bottom-0 left-0 right-0 bg-black/40 text-xs px-2 py-1 truncate">
                  {p.name}
                </figcaption>
                <button
                  type="button"
                  onClick={() => removeAt(p.name, p.size)}
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
            disabled={!canUpload}
            onClick={handleUpload}
            className={`rounded-2xl px-6 py-3 font-semibold ${
              canUpload ? "btn-primary" : "btn-ghost opacity-60 cursor-not-allowed"
            }`}
          >
            Отправить на анализ
          </button>
          <div className="text-xs opacity-70 mt-2">
            Минимум — {MIN_FILES} фото (страница листа или подпись). Снимайте фронтально и без бликов.
          </div>
        </div>
      </div>
    </section>
  );

  // Подсказки и примеры — ИМЕННО ДЛЯ ПОЧЕРКА
  const HandwritingTips = () => (
    <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold mb-3">Как сделать правильные фото</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
        <li>Снимайте при <b>рассеянном дневном свете</b>, без вспышки и сильных бликов.</li>
        <li><b>Белая чистая бумага</b>, тёмная паста/чернила (чёрная или тёмно-синяя).</li>
        <li>Камеру держите <b>перпендикулярно листу</b>; снимайте сверху, без перспективных искажений.</li>
        <li>Не обрезайте края: оставьте поля, чтобы были видны <b>строка и интервалы</b>.</li>
        <li>Формат <b>JPG/PNG</b>, ширина ≥ 1000 px, размер до <b>{MAX_SIZE_MB} МБ</b>.</li>
        <li>Лучший набор: <b>1–2 фото текста</b> + отдельное фото <b>подписи</b>.</li>
      </ul>

      <h4 className="text-base font-semibold mt-6 mb-3">Хорошие примеры</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-2xl mb-2">📝</div>
          <div className="font-medium">Текст</div>
          <div className="text-sm opacity-80">3–5 строк, ровный свет</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-2xl mb-2">✒️</div>
          <div className="font-medium">Подпись</div>
          <div className="text-sm opacity-80">отдельным кадром</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-medium">Крупный план</div>
          <div className="text-sm opacity-80">1–2 строки крупно</div>
        </div>
      </div>
    </section>
  );

  return (
    <main className="page relative">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <h1 className="h1 mb-2">Почерк (ИИ-анализ письма)</h1>
        <p className="text-base opacity-80 mb-8">
            Загрузите <b>1–3 фото</b> вашего почерка или подписи, и система выполнит глубокий ИИ-анализ.  
            Вы получите подробное описание того, как штрихи, наклон и давление пера/карандаша/маркера/ручки отражают ваши личные качества: 
            уровень уверенности, эмоциональность, особенности мышления и внутренние мотивы.  
            Такой разбор поможет лучше понять сильные стороны и скрытые ресурсы характера, 
            а также обратить внимание на зоны для личностного роста.  
            Анализ почерка может быть полезен для самопознания, развития навыков общения, 
            понимания себя в работе и отношениях. 
        </p>

        <AuthGate
          className=""
          overlayClassName=""
          title="Войдите, чтобы загрузить фото"
          description="Функция анализа почерка доступна только авторизованным пользователям.">
          {UploadBlock}

          {/* Результат */}
          {stage === "done" && result && (
            <>
              <section
                ref={resultRef}
                className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 transition-opacity duration-500"
              >
                <h3 className="text-xl font-semibold mb-3">Результат анализа</h3>

                {result.images?.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {result.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.file}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl overflow-hidden border border-white/10"
                      >
                        <img src={img.file} alt={`Фото ${img.id}`} className="w-full h-40 object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {result.summary && (
                  <p className="mb-3 text-base">
                    <b>Кратко:</b> {result.summary}
                  </p>
                )}

                {result.result_text && (
                  <article className="prose prose-invert max-w-none text-sm opacity-90 whitespace-pre-wrap">
                    {result.result_text}
                  </article>
                )}

                <div className="mt-6 flex gap-3">
                  <button onClick={resetForNew} className="btn-ghost rounded-2xl px-5 py-3 font-semibold">
                    Новый анализ
                  </button>
                </div>
              </section>
            </>
          )}
        </AuthGate>

        {/* Специальные подсказки для почерка */}
        <HandwritingTips />
      </div>
    </main>
  );
}
