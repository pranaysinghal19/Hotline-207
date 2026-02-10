import { loadCards, pickNextCard } from "./runtime/cards.js";
import { state, applyChoice, isGameOver, checkEnding, resetRun } from "./runtime/state.js";

let cards = [];
let current = null;

async function boot() {
  const csv = await fetch("./data/cards.csv").then(r => r.text());
  cards = loadCards(csv);

  const promptEl = document.getElementById("prompt");
  const statsEl = document.getElementById("stats");
  const metaEl = document.getElementById("meta");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  function render() {
    current = pickNextCard(cards, state);
    metaEl.textContent = `Night ${state.night} • ${state.inThin ? "THIN-TIME" : "NORMAL"}`;
    promptEl.textContent = current.prompt || "(missing prompt)";
    leftBtn.textContent = current.left_text || "Left";
    rightBtn.textContent = current.right_text || "Right";
    statsEl.textContent =
      `Sanity ${state.sanity} | Order ${state.order}\n` +
      `Safety ${state.safety} | Trust ${state.trust}\n` +
      `Flags: ${Array.from(state.flags).slice(0,8).join(", ")}${state.flags.size>8?"…":""}`;
  }

  function choose(side) {
    applyChoice(state, current, side);

    if (isGameOver(state)) {
      alert("GAME OVER — you snapped. Restarting run.");
      resetRun(state);
    }

    const ending = checkEnding(state);
    if (ending) {
      alert(`ENDING: ${ending}\nRestarting run.`);
      resetRun(state);
    }

    render();
  }

  leftBtn.onclick = () => choose("L");
  rightBtn.onclick = () => choose("R");

  render();
}

boot();