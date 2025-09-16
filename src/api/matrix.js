// src/api/matrix.js
import { api } from "./client";

function normalizeError(data, status, fallback = "Ошибка запроса") {
  if (!data) return new Error(fallback + (status ? ` (HTTP ${status})` : ""));
  if (typeof data === "string") return new Error(data);
  const msg = data.detail || data.error || fallback;
  const err = new Error(String(msg));
  err.status = status;
  err.payload = data;
  return err;
}

/**
 * calcMatrix
 *
 * Поддерживает два варианта вызова:
 * 1) Старый: calcMatrix("YYYY-MM-DD", { signal, first_name?, last_name?, gender? })
 * 2) Новый:  calcMatrix({ first_name, last_name, gender, birth_date }, { signal })
 *            также допускает { dob: "YYYY-MM-DD" } вместо birth_date
 *
 * Всегда шлёт на POST /api/predictions/matrix/analyze
 * и корректно обрабатывает как JSON, так и text/html ответы.
 */
export async function calcMatrix(dobOrForm, { signal, first_name, last_name, gender } = {}) {
  // Разбор аргументов (обратная совместимость)
  const isObj = dobOrForm && typeof dobOrForm === "object" && !Array.isArray(dobOrForm);

  const birth_date = isObj
    ? (dobOrForm.birth_date || dobOrForm.dob || "")
    : (dobOrForm || ""); // строка-дата из старого вызова

  const body = {
    first_name: (isObj ? dobOrForm.first_name : first_name) || "-",
    last_name:  (isObj ? dobOrForm.last_name  : last_name)  || "-",
    gender:     (isObj ? dobOrForm.gender     : gender)     || "other",
    birth_date, // обязательно
  };

  if (!body.birth_date) {
    throw new Error("Укажите дату рождения");
  }

  let res;
  try {
    res = await api.authFetch(`/api/predictions/matrix/analyze`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(e?.message || "Сеть недоступна");
  }

  // Поддержка как JSON, так и HTML-ответов
  const ct = (res.headers.get("content-type") || "").toLowerCase();

  if (ct.includes("application/json")) {
    let payload = null;
    try { payload = await res.json(); } catch {}
    if (!res.ok) throw normalizeError(payload, res.status, "Не удалось рассчитать матрицу");
    return payload; // ожидается { ok, prediction_id, kind, status, html? ... }
  }

  // HTML / plaintext → вернуть как { html }
  let text = "";
  try { text = await res.text(); } catch {}
  if (!res.ok) throw normalizeError(text || null, res.status, "Не удалось рассчитать матрицу");
  return { html: text };
}

/**
 * Совместимость (оставлено как есть — зависит от вашего бэка).
 * Если на бэке путь без слеша — поменяйте на `/api/predictions/matrix/compat`.
 */
export async function compatMatrix({ dob1, dob2, signal }) {
  let res;
  try {
    res = await api.authFetch(`/api/predictions/matrix/compat/`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dob1, dob2 }),
    });
  } catch (e) {
    throw new Error(e?.message || "Сеть недоступна");
  }
  let payload = null;
  try { payload = await res.json(); } catch {}
  if (!res.ok) throw normalizeError(payload, res.status, "Не удалось рассчитать совместимость");
  return payload;
}
