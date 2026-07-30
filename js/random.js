/*
 * Random Adventure — the signature "Take Me Somewhere" feature.
 */
(function () {
  let adventures = [];
  let categories = [];
  let lastId = null;

  function renderResult(adv) {
    const cat = WI.categoryById(categories, adv.category);
    const wrap = document.getElementById("random-result");
    if (!wrap) return;

    wrap.classList.remove("visible");
    wrap.innerHTML = `
      <img src="${WI.img(adv.photo)}" alt="${WI.escapeHTML(adv.title)}" loading="lazy">
      <div class="result-body">
        <span class="result-category">${cat.icon} ${cat.name}</span>
        <h3 class="result-title">${WI.escapeHTML(adv.title)}</h3>
        <p>${WI.escapeHTML(adv.description)}</p>
        <div class="result-meta">
          <span>🚗 ${WI.escapeHTML(adv.drivingTime)}</span>
          <span>⛰️ ${WI.escapeHTML(adv.difficulty)}</span>
          <span>🗓️ Best in ${WI.escapeHTML(adv.bestSeason)}</span>
        </div>
        <div class="result-actions">
          <a class="btn btn-primary" href="${WI.mapsLink(adv)}" target="_blank" rel="noopener">📍 Google Maps</a>
          <a class="btn btn-secondary" href="${WI.BASE}pages/adventure.html?id=${adv.id}">See details</a>
          <button class="btn btn-ghost" id="btn-randomize-again" type="button">🎲 Randomize Again</button>
        </div>
      </div>
    `;

    requestAnimationFrame(() => wrap.classList.add("visible"));

    document.getElementById("btn-randomize-again").addEventListener("click", pickRandom);
  }

  function pickRandom() {
    if (!adventures.length) return;
    let choice;
    if (adventures.length === 1) {
      choice = adventures[0];
    } else {
      do {
        choice = adventures[Math.floor(Math.random() * adventures.length)];
      } while (choice.id === lastId);
    }
    lastId = choice.id;
    renderResult(choice);

    const wrap = document.getElementById("random-result");
    if (wrap) {
      wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  async function init() {
    const btn = document.getElementById("btn-random");
    if (!btn) return;

    [adventures, categories] = await Promise.all([WI.loadJSON("adventures"), WI.loadJSON("categories")]);

    btn.addEventListener("click", () => {
      btn.classList.remove("rolling");
      void btn.offsetWidth;
      btn.classList.add("rolling");
      pickRandom();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
