/*
 * Indiana Bucket List — checklist persisted in localStorage.
 */
(function () {
  const STORAGE_KEY = "wi-bucket-list";
  let adventures = [];
  let categories = [];

  function loadChecked() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
    } catch {
      return new Set();
    }
  }

  function saveChecked(set) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  }

  function updateProgress(checked) {
    const pct = adventures.length ? Math.round((checked.size / adventures.length) * 100) : 0;
    document.getElementById("progress-bar").style.width = `${pct}%`;
    document.getElementById("progress-label").textContent = `${checked.size} of ${adventures.length} adventures (${pct}%)`;
  }

  function itemHTML(adv, cat, isChecked) {
    return `
      <li class="bucket-item${isChecked ? " checked" : ""}" data-id="${adv.id}">
        <input type="checkbox" id="chk-${adv.id}" ${isChecked ? "checked" : ""} aria-label="Mark ${WI.escapeHTML(adv.title)} as visited">
        <img class="bucket-thumb" src="${WI.img(adv.photo)}" alt="" loading="lazy">
        <label for="chk-${adv.id}" style="flex:1; cursor:pointer;">
          <span class="bucket-title">${cat.icon} ${WI.escapeHTML(adv.title)}</span><br>
          <span class="bucket-sub">${WI.escapeHTML(adv.location)}</span>
        </label>
        <a class="btn btn-ghost" href="${WI.BASE}pages/adventure.html?id=${adv.id}">Details</a>
      </li>
    `;
  }

  function render(checked) {
    const list = document.getElementById("bucket-list-grid");
    list.innerHTML = adventures.map((adv) => itemHTML(adv, WI.categoryById(categories, adv.category), checked.has(adv.id))).join("");

    list.querySelectorAll('input[type="checkbox"]').forEach((box) => {
      box.addEventListener("change", () => {
        const id = box.closest(".bucket-item").dataset.id;
        if (box.checked) checked.add(id);
        else checked.delete(id);
        box.closest(".bucket-item").classList.toggle("checked", box.checked);
        saveChecked(checked);
        updateProgress(checked);
      });
    });

    updateProgress(checked);
  }

  async function init() {
    const grid = document.getElementById("bucket-list-grid");
    if (!grid) return;

    [adventures, categories] = await Promise.all([WI.loadJSON("adventures"), WI.loadJSON("categories")]);
    const checked = loadChecked();
    render(checked);

    document.getElementById("btn-clear-checked").addEventListener("click", () => {
      if (!confirm("Clear your entire bucket list progress?")) return;
      checked.clear();
      saveChecked(checked);
      render(checked);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
