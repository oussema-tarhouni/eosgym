const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[0-9]{8}$/; // local Tunisian number, +216 prefixed at storage time
const PASSWORD_MIN_LENGTH = 8;

const isValidEmail = (e) => typeof e === "string" && EMAIL_REGEX.test(e.trim());
const isValidPassword = (p) => typeof p === "string" && p.length >= PASSWORD_MIN_LENGTH;
const isValidPhone = (p) => typeof p === "string" && PHONE_REGEX.test(p.trim());
const num = (v, min, max) => v === undefined || v === null || v === "" ? null : (Number(v) >= min && Number(v) <= max ? Number(v) : NaN);

// Validates the onboarding answers. Everything is optional (web signup / admin may omit them);
// anything that IS sent must be valid. Returns { error } or { data } (only the keys that were sent).
function parseProfile(b = {}) {
  const out = {};
  const sent = (v) => v !== undefined;
  if (sent(b.gender)) {
    const g = String(b.gender || "").toLowerCase();
    if (g && g !== "male" && g !== "female") return { error: "Genre invalide" };
    out.gender = g || null;
  }
  for (const [k, min, max, msg] of [["age", 10, 100, "Âge invalide"], ["height_cm", 100, 250, "Taille invalide (100-250 cm)"], ["weight_kg", 30, 300, "Poids invalide (30-300 kg)"], ["days_per_week", 1, 7, "Jours par semaine invalide"]]) {
    if (!sent(b[k])) continue;
    const v = num(b[k], min, max);
    if (Number.isNaN(v)) return { error: msg };
    out[k] = k === "weight_kg" ? (v === null ? null : Math.round(v * 10) / 10) : (v === null ? null : Math.round(v));
  }
  if (sent(b.goals)) {
    const list = (Array.isArray(b.goals) ? b.goals : String(b.goals || "").split(",")).map((x) => String(x).trim().slice(0, 40)).filter(Boolean).slice(0, 8);
    out.goals = list.length ? list.join(", ") : null;
  }
  if (sent(b.experience)) out.experience = String(b.experience || "").trim().slice(0, 40) || null;
  return { data: out };
}

module.exports = { isValidEmail, isValidPassword, isValidPhone, parseProfile, PASSWORD_MIN_LENGTH };
