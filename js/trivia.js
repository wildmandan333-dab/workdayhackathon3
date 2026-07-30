/*
 * Trivia game — random multiple choice questions with session score tracking.
 */
(function () {
  let questions = [];
  let usedIds = [];
  let score = 0;
  let total = 0;

  function loadScore() {
    const saved = sessionStorage.getItem("wi-trivia-score");
    if (saved) {
      const parsed = JSON.parse(saved);
      score = parsed.score || 0;
      total = parsed.total || 0;
    }
  }

  function saveScore() {
    sessionStorage.setItem("wi-trivia-score", JSON.stringify({ score, total }));
  }

  function updateScoreDisplay() {
    document.getElementById("trivia-score").textContent = `Score: ${score} / ${total}`;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function nextQuestion() {
    if (usedIds.length >= questions.length) usedIds = [];
    const remaining = questions.filter((q) => !usedIds.includes(q.id));
    const q = remaining[Math.floor(Math.random() * remaining.length)];
    usedIds.push(q.id);
    renderQuestion(q);
  }

  function renderQuestion(q) {
    const order = shuffle(q.choices.map((text, i) => ({ text, correct: i === q.answer })));

    document.getElementById("trivia-question").textContent = q.question;

    const choicesEl = document.getElementById("trivia-choices");
    choicesEl.innerHTML = order
      .map(
        (c, i) => `<button class="trivia-choice" data-correct="${c.correct}" type="button">${WI.escapeHTML(c.text)}</button>`
      )
      .join("");

    const factEl = document.getElementById("trivia-fact");
    factEl.classList.remove("visible");
    factEl.textContent = q.fact;
    document.getElementById("trivia-next").hidden = true;

    choicesEl.querySelectorAll(".trivia-choice").forEach((btn) => {
      btn.addEventListener("click", () => onAnswer(btn, choicesEl));
    });
  }

  function onAnswer(selected, choicesEl) {
    const buttons = [...choicesEl.querySelectorAll(".trivia-choice")];
    const wasCorrect = selected.dataset.correct === "true";

    buttons.forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.correct === "true") btn.classList.add("correct");
    });
    if (!wasCorrect) selected.classList.add("incorrect");

    total += 1;
    if (wasCorrect) score += 1;
    saveScore();
    updateScoreDisplay();

    document.getElementById("trivia-fact").classList.add("visible");
    document.getElementById("trivia-next").hidden = false;
  }

  async function init() {
    const root = document.getElementById("trivia-question");
    if (!root) return;

    questions = await WI.loadJSON("trivia");
    loadScore();
    updateScoreDisplay();
    nextQuestion();

    document.getElementById("trivia-next").addEventListener("click", nextQuestion);
    document.getElementById("trivia-reset").addEventListener("click", () => {
      score = 0;
      total = 0;
      usedIds = [];
      saveScore();
      updateScoreDisplay();
      nextQuestion();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
