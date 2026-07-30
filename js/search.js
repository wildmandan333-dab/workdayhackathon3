/*
 * Explore page — category chips, search box, and filters over adventures.json.
 */
(function () {
  let adventures = [];
  let categories = [];

  const state = {
    category: "all",
    q: "",
    maxDistance: "any",
    season: "any",
    difficulty: "any",
    kid: false,
    dog: false,
    free: false,
  };

  function cardHTML(adv) {
    const cat = WI.categoryById(categories, adv.category);
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

  function matches(adv) {
    if (state.category !== "all" && adv.category !== state.category) return false;
    if (state.maxDistance !== "any" && adv.distanceMiles > Number(state.maxDistance)) return false;
    if (state.season !== "any" && adv.bestSeason !== state.season && adv.bestSeason !== "Year-round") return false;
    if (state.difficulty !== "any" && adv.difficulty !== state.difficulty) return false;
    if (state.kid && !adv.kidFriendly) return false;
    if (state.dog && !adv.dogFriendly) return false;
    if (state.free && !adv.free) return false;
    if (state.q) {
      const hay = `${adv.title} ${adv.description} ${adv.location}`.toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    return true;
  }

  function render() {
    const grid = document.getElementById("explore-grid");
    const countEl = document.getElementById("results-count");
    const results = adventures.filter(matches);

    countEl.textContent = `${results.length} adventure${results.length === 1 ? "" : "s"} found`;

    if (!results.length) {
      grid.innerHTML = "";
      document.getElementById("empty-state").hidden = false;
      return;
    }
    document.getElementById("empty-state").hidden = true;
    grid.innerHTML = results.map(cardHTML).join("");
  }

  function renderChips() {
    const row = document.getElementById("category-chips");
    const allChip = `<button class="category-chip active" data-cat="all" type="button">✨ All</button>`;
    const chips = categories
      .map((c) => `<button class="category-chip" data-cat="${c.id}" type="button">${c.icon} ${c.name}</button>`)
      .join("");
    row.innerHTML = allChip + chips;

    row.querySelectorAll(".category-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        row.querySelectorAll(".category-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.category = chip.dataset.cat;
        render();
      });
    });
  }

  function bindFilters() {
    document.getElementById("search-input").addEventListener("input", (e) => {
      state.q = e.target.value.trim().toLowerCase();
      render();
    });
    document.getElementById("filter-distance").addEventListener("change", (e) => {
      state.maxDistance = e.target.value;
      render();
    });
    document.getElementById("filter-season").addEventListener("change", (e) => {
      state.season = e.target.value;
      render();
    });
    document.getElementById("filter-difficulty").addEventListener("change", (e) => {
      state.difficulty = e.target.value;
      render();
    });
    document.getElementById("filter-kid").addEventListener("change", (e) => {
      state.kid = e.target.checked;
      render();
    });
    document.getElementById("filter-dog").addEventListener("change", (e) => {
      state.dog = e.target.checked;
      render();
    });
    document.getElementById("filter-free").addEventListener("change", (e) => {
      state.free = e.target.checked;
      render();
    });
  }

  function applyURLParams() {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat && categories.some((c) => c.id === cat)) {
      state.category = cat;
      const chip = document.querySelector(`.category-chip[data-cat="${cat}"]`);
      if (chip) {
        document.querySelectorAll(".category-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
      }
    }
  }

  async function init() {
    const grid = document.getElementById("explore-grid");
    if (!grid) return;

    [adventures, categories] = await Promise.all([WI.loadJSON("adventures"), WI.loadJSON("categories")]);

    renderChips();
    applyURLParams();
    bindFilters();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
