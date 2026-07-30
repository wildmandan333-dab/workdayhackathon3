/*
 * Interactive map — Leaflet markers colored by category, with toggle filters.
 */
(function () {
  async function init() {
    const mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") return;

    const [adventures, categories] = await Promise.all([WI.loadJSON("adventures"), WI.loadJSON("categories")]);

    const map = L.map("map", { scrollWheelZoom: false }).setView([39.79, -86.15], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());

    const groups = {};
    categories.forEach((c) => {
      groups[c.id] = L.layerGroup().addTo(map);
    });

    adventures.forEach((adv) => {
      const cat = WI.categoryById(categories, adv.category);
      const marker = L.circleMarker([adv.lat, adv.lng], {
        radius: 9,
        fillColor: cat.color,
        color: "#ffffff",
        weight: 2,
        fillOpacity: 0.9,
      });

      marker.bindPopup(`
        <h3>${WI.escapeHTML(adv.title)}</h3>
        <p>${cat.icon} ${cat.name} &middot; ${WI.escapeHTML(adv.drivingTime)}</p>
        <a href="${WI.BASE}pages/adventure.html?id=${adv.id}">See details &rarr;</a>
      `);

      if (groups[adv.category]) {
        marker.addTo(groups[adv.category]);
      }
    });

    const legend = document.getElementById("map-legend");
    legend.innerHTML = categories
      .map(
        (c) => `
        <button class="legend-chip" data-cat="${c.id}" type="button" aria-pressed="true">
          <span class="dot" style="background:${c.color}"></span> ${c.icon} ${c.name}
        </button>
      `
      )
      .join("");

    legend.querySelectorAll(".legend-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const catId = chip.dataset.cat;
        const group = groups[catId];
        const isOn = map.hasLayer(group);
        if (isOn) {
          map.removeLayer(group);
          chip.classList.add("off");
          chip.setAttribute("aria-pressed", "false");
        } else {
          map.addLayer(group);
          chip.classList.remove("off");
          chip.setAttribute("aria-pressed", "true");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
