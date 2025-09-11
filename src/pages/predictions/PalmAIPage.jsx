// src/pages/predictions/PalmAIPage.jsx
import React from "react";
import AuthGate from "../../components/auth/AuthGate";
import { predictionsApi } from "../../api/palmai";
import PhotoTips from "../../components/predictions/PhotoTips";
import PalmAspectsLegend from "../../features/palm/PalmAspectsLegend";

export default function PalmAIPage() {
  const [files, setFiles] = React.useState([]);         // File[]
  const [previews, setPreviews] = React.useState([]);   // {name, url, size}
  const [error, setError] = React.useState("");
  const [errStatus, setErrStatus] = React.useState(null); // HTTP код ошибки
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // новый стейт показа результата
  const [result, setResult] = React.useState(null);     // API payload
  const [stage, setStage] = React.useState("idle");     // idle | submitting | done | error

  const inputRef = React.useRef(null);
  const resultRef = React.useRef(null);

  const MAX_FILES = 3;
  const MIN_FILES = 2;
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
    // ВАЖНО: сбросить значение input, иначе выбор тех же файлов не триггерит onChange
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
      const data = await predictionsApi.analyzePalm(files, { locale: "ru" });
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
      <div
        role="alert"
        className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm"
      >
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
            <a
              href="/pricing"
              className="rounded-lg px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20"
            >
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
      {/* локальный оверлей + блюр контента, пока ждём ответ */}
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
            <span className="text-2xl" aria-hidden>✋</span>
          </div>

          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>
            Перетащите фото сюда
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
              JPG/PNG · до {MAX_SIZE_MB} МБ каждый · {MIN_FILES}–{MAX_FILES} фото
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
          {/* показываем ошибку аккуратно ниже контролов */}
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
            Минимум — {MIN_FILES} фото (левая и правая ладонь). Рекомендуем добавить крупный план основных линий.
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <main className="page relative">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <h1 className="h1 mb-2">Предсказания по ладони (ИИ)</h1>
        <p className="text-base opacity-80 mb-8">
          Загрузите <b>2–3 фото</b>: <b>левую</b> и <b>правую</b> ладонь, при желании — <b>крупный план линий</b>.
          Мы выделим основные линии и подготовим трактовки.
        </p>

        <AuthGate
          className=""
          overlayClassName=""
          title="Войдите, чтобы загрузить фото"
          description="Функция анализа ладоней доступна только авторизованным пользователям.">
          {UploadBlock}

          {/* Результат — показываем после успешного ответа */}
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

              <PalmAspectsLegend
                imageSrc="/img/palm-numbered.png"
                focus={result?.result_json?.focus || []}
                items={result?.result_json?.items || []}
              />
            </>
          )}
        </AuthGate>

        {/* Инструкции и примеры */}
        <PhotoTips maxSizeMb={MAX_SIZE_MB} />
      </div>
    </main>
  );
}
