export const state = {
  sanity: 70, order: 70, safety: 70, trust: 70,
  night: 1, turns: 0, inThin: false,
  flags: new Set(["NeverAnsweredOldMan"])
};

export function resetRun(s) {
  s.sanity = 70; s.order = 70; s.safety = 70; s.trust = 70;
  s.night = 1; s.turns = 0; s.inThin = false;
  s.flags = new Set(["NeverAnsweredOldMan"]);
}

export function applyChoice(s, card, side) {
  const ds  = toInt(side === "L" ? card.L_sanity : card.R_sanity);
  const dor = toInt(side === "L" ? card.L_order  : card.R_order);
  const dsa = toInt(side === "L" ? card.L_safety : card.R_safety);
  const dt  = toInt(side === "L" ? card.L_trust  : card.R_trust);

  s.sanity = clamp(s.sanity + ds);
  s.order  = clamp(s.order  + dor);
  s.safety = clamp(s.safety + dsa);
  s.trust  = clamp(s.trust  + dt);

  const setFlags = (side === "L" ? card.set_flags_left : card.set_flags_right) || "";
  setFlags.split(";").map(x => x.trim()).filter(Boolean).forEach(f => s.flags.add(f));

  s.turns += 1;
  const turnInNight = ((s.turns - 1) % 6) + 1;
  s.inThin = turnInNight >= 5;
  if (s.turns % 6 === 0) s.night += 1;

  if (s.flags.has("AnsweredOldMan")) s.flags.delete("NeverAnsweredOldMan");
}

export function isGameOver(s) {
  return hitLimit(s.sanity) || hitLimit(s.order) || hitLimit(s.safety) || hitLimit(s.trust);
}

export function checkEnding(s) {
  if (s.flags.has("ENDING_KEEP_JOB_SOLVE")) return "KEEP_JOB_SOLVE";
  if (s.flags.has("ENDING_PUBLIC_HUMILIATION")) return "PUBLIC_HUMILIATION";
  if (s.flags.has("ENDING_HELL")) return "WORSE_THAN_HELL";

  const evidence = [...s.flags].filter(f => f.startsWith("Evidence_")).length;
  if (evidence >= 8 && s.order >= 40 && s.trust >= 40) { s.flags.add("ENDING_KEEP_JOB_SOLVE"); return "KEEP_JOB_SOLVE"; }

  if (s.flags.has("AnsweredOldMan") && s.flags.has("SystemInterference") && s.flags.has("DisasterIncident")) {
    s.flags.add("ENDING_HELL"); return "WORSE_THAN_HELL";
  }

  if (s.sanity <= 10 && s.flags.has("PublicIncident")) {
    s.flags.add("ENDING_PUBLIC_HUMILIATION"); return "PUBLIC_HUMILIATION";
  }

  return "";
}

function clamp(v){ return Math.max(0, Math.min(100, v)); }
function hitLimit(v){ return v <= 0 || v >= 100; }
function toInt(x){ const n = parseInt(x, 10); return Number.isFinite(n) ? n : 0; }