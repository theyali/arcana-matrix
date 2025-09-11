import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getZodiac } from "../../features/horoscope/zodiac";
import { getLatest, PERIOD_UI2API } from "../../api/horoscope";
import { api } from "../../api/client";
import ForecastStatsSidebar from "../../features/horoscope/ForecastStats.jsx";

const CATEGORIES = [
  { key: "general", label: "Общий" },
  { key: "love",    label: "Любовь" },
  { key: "career",  label: "Карьера" },
  { key: "finance", label: "Финансы" },
  { key: "health",  label: "Здоровье" },
];

function LockCard({ loginPath = "/login" }) {
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  return (
    <div className="relative rounded-2xl p-5 border border-white/10 bg-white/5 overflow-hidden">
      <div className="opacity-40 select-none" aria-hidden>
        <p className="leading-relaxed">
          Текст скрыт. Войдите в аккаунт, чтобы открыть эту категорию.
        </p>
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="backdrop-blur-sm bg-black/20 rounded-xl border border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span aria-hidden>🔒</span>
            <span>Доступно после входа</span>
            <Link className="btn-primary rounded-xl px-3 py-1 text-xs" to={`${loginPath}?next=${next}`}>
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HoroscopeDetailPage() {
  const { sign } = useParams();
  const [sp] = useSearchParams();
  const z = getZodiac(sign);

  const periodUi = sp.get("period") || "daily";
  const date     = sp.get("date")   || new Date().toISOString().slice(0, 10);
  const periodApi = PERIOD_UI2API[periodUi] || "day";

  const [user, setUser] = React.useState(null);
  const isGuest = !user;

  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState("");
  const [dataByCat, setDataByCat] = React.useState({}); // {category: forecast}

  // тихая проверка авторизации (как на списковой странице)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const me = await api.me(); // null для гостя
      if (mounted) setUser(me);
    })();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    if (!z) return;
    let isMounted = true;
    setLoading(true); setError(""); setDataByCat({});

    // тянем 5 категорий параллельно
    Promise.allSettled(
      CATEGORIES.map(c =>
        getLatest({ sign: z.slug, period: periodApi, date, category: c.key, lang: "ru", source: "gpt5-mini" })
          .then(res => ({ cat: c.key, res }))
      )
    ).then(results => {
      if (!isMounted) return;
      const dict = {};
      let anyOk = false;
      results.forEach(r => {
        if (r.status === "fulfilled") {
          dict[r.value.cat] = r.value.res; anyOk = true;
        }
      });
      if (!anyOk) setError("Прогнозы не найдены.");
      setDataByCat(dict);
      setLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setError("Ошибка загрузки.");
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [z, periodApi, date]);

  if (!z) {
    return (
      <main className="page">
        <div className="container mx-auto px-4 max-w-3xl py-10">
          <h1 className="h1 mb-4">Не найдено</h1>
          <p className="opacity-80 mb-6">Такого знака нет. Проверьте адрес.</p>
          <Link to="/predictions/horoscope" className="btn-primary rounded-2xl px-5 py-3 font-semibold">
            ← Все гороскопы
          </Link>
        </div>
      </main>
    );
  }

  // выбираем прогноз, из которого возьмём метрики в сайдбар:
  const statsForecast = dataByCat["general"] || Object.values(dataByCat).find(Boolean) || null;

  return (
    <main className="page">
      <div className="container mx-auto px-4 max-w-6xl py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="h1 flex items-center gap-3 mb-0">
            <span
              className="h-10 w-10 rounded-2xl grid place-items-center text-2xl shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--primary))", color: "#fff" }}
            >
              {z.emoji}
            </span>
            {z.name}
          </h1>
          <Link to="/predictions/horoscope" className="btn-ghost rounded-2xl px-4 py-2 text-sm">Все знаки</Link>
        </div>

        <div className="opacity-80 text-sm mb-6">
          Период: <b>{periodUi === "daily" ? "День" : periodUi === "weekly" ? "Неделя" : "Месяц"}</b> · Дата: <b>{date}</b>
          <span className="mx-2">•</span>
          Стихия: {z.element}
        </div>

        {loading && (
          <div className="rounded-2xl p-5 border border-white/10 bg-white/5">Загрузка прогнозов…</div>
        )}

        {!!error && !loading && (
          <div className="rounded-2xl p-5 border border-red-500/30 bg-red-500/10 text-red-300">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* левая колонка — контент по категориям */}
            <section className="grid gap-4">
              {CATEGORIES.map(c => {
                const f = dataByCat[c.key];
                const isLockedCategory = isGuest && c.key !== "general";
                return (
                  <article key={c.key} className="rounded-2xl p-5 border border-white/10 bg-white/5">
                    <h2 className="font-semibold mb-2">{c.label}</h2>

                    {/* если гость и не general — показываем красивый lock-блок */}
                    {isLockedCategory ? (
                      <LockCard />
                    ) : f ? (
                      <>
                        {f.title ? <h3 className="font-medium opacity-90 mb-2">{f.title}</h3> : null}
                        <p className="opacity-85 leading-relaxed whitespace-pre-line">{f.text}</p>
                      </>
                    ) : (
                      <p className="opacity-60">Нет данных для этой категории.</p>
                    )}
                  </article>
                );
              })}
            </section>

            {/* правая колонка — сайдбар с метриками */}
            <ForecastStatsSidebar forecast={statsForecast} isGuest={isGuest} />
          </div>
        )}
      </div>
    </main>
  );
}
