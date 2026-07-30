/*
 * Homepage-only sections: Hidden Gems, Weekend Adventures, Bucket List teaser,
 * Photo of the Week, and a single Random Trivia question.
 */
(function () {
  function cardHTML(adv, cat) {
    return `
      <li class="adventure-card fade-in visible">
        <a class="card-link-overlay" href="${WI.BASE}pages/adventure.html?id=${adv.id}" aria-label="View ${WI.escapeHTML(adv.title)}"></a>
        <img src="${WI.img(adv.photo)}" alt="" loading="lazy">
        <div class="adventure-card-body">
          <span class="cat-tag" style="background:${cat.color}">${cat.icon} ${cat.name}</span>
          <h3>${WI.escapeHTML(adv.title)}</h3>
          <p>${WI.escapeHTML(adv.description)}</p>
          <div class="card-foot">
            <span>🚗 ${WI.escapeHTML(adv.drivingTime)}</span>
            <span>⛰️ ${WI.escapeHTML(adv.difficulty)}</span>
          </div>
        </div>
      </li>
    `;
  }

  function renderHiddenGems(adventures, categories) {
    const el = document.getElementById("hidden-gems-grid");
    if (!el) return;
    const gems = adventures.filter((a) => a.category === "hidden-gems").slice(0, 3);
    el.innerHTML = gems.map((a) => cardHTML(a, WI.categoryById(categories, a.category))).join("");
  }

  function renderWeekend(adventures, categories) {
    const el = document.getElementById("weekend-grid");
    if (!el) return;
    const eligible = adventures.filter((a) => a.distanceMiles <= 70 && a.difficulty !== "Hard");
    const seed = Math.floor(WI.dayOfYear() / 7);
    const rotated = eligible.slice(seed % eligible.length).concat(eligible.slice(0, seed % eligible.length));
    el.innerHTML = rotated.slice(0, 3).map((a) => cardHTML(a, WI.categoryById(categories, a.category))).join("");
  }

  function renderPhotoOfWeek(adventures) {
    const el = document.getElementById("photo-of-week");
    if (!el) return;
    const seed = Math.floor(WI.dayOfYear() / 7);
    const adv = adventures[seed % adventures.length];
    el.innerHTML = `
      <img src="${WI.img(adv.photo)}" alt="${WI.escapeHTML(adv.title)}" loading="lazy">
      <p class="text-center" style="margin-top:0.75rem;">
        <strong>${WI.escapeHTML(adv.title)}</strong> &mdash; ${WI.escapeHTML(adv.location)}
      </p>
    `;
  }

  function renderBucketTeaser(adventures) {
    const el = document.getElementById("bucket-teaser");
    if (!el) return;
    let checkedCount = 0;
    try {
      checkedCount = (JSON.parse(localStorage.getItem("wi-bucket-list")) || []).length;
    } catch {
      checkedCount = 0;
    }
    el.querySelector(".teaser-count").textContent = `${checkedCount} of ${adventures.length} checked off so far`;
  }

  function renderTriviaTeaser(questions) {
    const el = document.getElementById("home-trivia");
    if (!el) return;
    const q = questions[Math.floor(Math.random() * questions.length)];
    document.getElementById("home-trivia-question").textContent = q.question;
    const choicesEl = document.getElementById("home-trivia-choices");
    choicesEl.innerHTML = q.choices
      .map((c, i) => `<button class="trivia-choice" data-correct="${i === q.answer}" type="button">${WI.escapeHTML(c)}</button>`)
      .join("");
    choicesEl.querySelectorAll(".trivia-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        choicesEl.querySelectorAll(".trivia-choice").forEach((b) => {
          b.disabled = true;
          if (b.dataset.correct === "true") b.classList.add("correct");
        });
        if (btn.dataset.correct !== "true") btn.classList.add("incorrect");
      });
    });
  }

  async function init() {
    if (!document.getElementById("btn-random")) return;

    const [adventures, categories, trivia] = await Promise.all([
      WI.loadJSON("adventures"),
      WI.loadJSON("categories"),
      WI.loadJSON("trivia"),
    ]);

    renderHiddenGems(adventures, categories);
    renderWeekend(adventures, categories);
    renderPhotoOfWeek(adventures);
    renderBucketTeaser(adventures);
    renderTriviaTeaser(trivia);
    WI.initFadeIn();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
