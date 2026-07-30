/*
 * Adventure detail page — renders a single adventure from ?id= in the URL.
 */
(function () {
  function relatedCardHTML(adv, cat) {
    return `
      <li class="adventure-card fade-in visible">
        <a class="card-link-overlay" href="adventure.html?id=${adv.id}" aria-label="View ${WI.escapeHTML(adv.title)}"></a>
        <img src="${WI.img(adv.photo)}" alt="" loading="lazy">
        <div class="adventure-card-body">
          <span class="cat-tag" style="background:${cat.color}">${cat.icon} ${cat.name}</span>
          <h3>${WI.escapeHTML(adv.title)}</h3>
          <p>${WI.escapeHTML(adv.description)}</p>
        </div>
      </li>
    `;
  }

  function render(adv, adventures, categories) {
    const cat = WI.categoryById(categories, adv.category);
    document.title = `${adv.title} — WildIndy`;

    document.getElementById("detail-root").innerHTML = `
      <p class="breadcrumb"><a href="explore.html">&larr; Back to Explore</a></p>
      <img class="detail-hero fade-in visible" src="${WI.img(adv.photo)}" alt="${WI.escapeHTML(adv.title)}">
      <div class="detail-header">
        <span class="result-category">${cat.icon} ${cat.name}</span>
        <h1>${WI.escapeHTML(adv.title)}</h1>
        <p>${WI.escapeHTML(adv.description)}</p>
      </div>

      <div class="tag-row">
        ${adv.free ? '<span class="pill">💵 Free</span>' : ""}
        ${adv.kidFriendly ? '<span class="pill">🧒 Kid friendly</span>' : ""}
        ${adv.dogFriendly ? '<span class="pill">🐾 Dog friendly</span>' : ""}
      </div>

      <div class="detail-meta-grid">
        <div class="meta-item"><div class="label">Location</div><div class="value">${WI.escapeHTML(adv.location)}</div></div>
        <div class="meta-item"><div class="label">Driving Time</div><div class="value">${WI.escapeHTML(adv.drivingTime)}</div></div>
        <div class="meta-item"><div class="label">Difficulty</div><div class="value">${WI.escapeHTML(adv.difficulty)}</div></div>
        <div class="meta-item"><div class="label">Best Season</div><div class="value">${WI.escapeHTML(adv.bestSeason)}</div></div>
        <div class="meta-item"><div class="label">Hours</div><div class="value">${WI.escapeHTML(adv.hours)}</div></div>
        <div class="meta-item"><div class="label">Admission</div><div class="value">${WI.escapeHTML(adv.admission)}</div></div>
      </div>

      <div class="detail-actions">
        <a class="btn btn-primary" href="${WI.mapsLink(adv)}" target="_blank" rel="noopener">📍 Google Maps</a>
        ${adv.website ? `<a class="btn btn-secondary" href="${adv.website}" target="_blank" rel="noopener">🔗 Website</a>` : ""}
      </div>

      ${
        adv.gallery && adv.gallery.length
          ? `<h2>Photo Gallery</h2><div class="gallery-row">${adv.gallery
              .map((g) => `<img src="${WI.img(g)}" alt="${WI.escapeHTML(adv.title)}" loading="lazy">`)
              .join("")}</div>`
          : ""
      }

      ${
        adv.relatedIds && adv.relatedIds.length
          ? `<h2>Related Adventures</h2><ul class="card-grid" id="related-grid"></ul>`
          : ""
      }
    `;

    if (adv.relatedIds && adv.relatedIds.length) {
      const related = adv.relatedIds.map((id) => adventures.find((a) => a.id === id)).filter(Boolean);
      document.getElementById("related-grid").innerHTML = related
        .map((r) => relatedCardHTML(r, WI.categoryById(categories, r.category)))
        .join("");
    }
  }

  function renderNotFound() {
    document.getElementById("detail-root").innerHTML = `
      <div class="empty-state">
        <h1>Adventure not found</h1>
        <p>That one wandered off. Try exploring the full list instead.</p>
        <a class="btn btn-primary" href="explore.html">Back to Explore</a>
      </div>
    `;
  }

  async function init() {
    const root = document.getElementById("detail-root");
    if (!root) return;

    const id = new URLSearchParams(location.search).get("id");
    const [adventures, categories] = await Promise.all([WI.loadJSON("adventures"), WI.loadJSON("categories")]);
    const adv = adventures.find((a) => a.id === id);

    if (!adv) {
      renderNotFound();
      return;
    }
    render(adv, adventures, categories);
    WI.initFadeIn();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
