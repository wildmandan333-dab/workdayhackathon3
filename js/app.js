/*
 * WildIndy shared utilities: navigation, data loading, fade-in animation.
 * Loaded on every page before the page-specific script.
 */
window.WI = (function () {
  const BASE = location.pathname.includes("/pages/") ? "../" : "./";

  const cache = {};

  async function loadJSON(name) {
    if (cache[name]) return cache[name];
    const res = await fetch(`${BASE}data/${name}.json`);
    if (!res.ok) throw new Error(`Failed to load ${name}.json`);
    const data = await res.json();
    cache[name] = data;
    return data;
  }

  function img(path) {
    return `${BASE}images/adventures/${path}`;
  }

  function asset(path) {
    return `${BASE}${path}`;
  }

  function categoryById(categories, id) {
    return categories.find((c) => c.id === id) || { name: id, color: "#2F6F4E", icon: "✨" };
  }

  const NAV_ITEMS = [
    { label: "Home", href: "index.html", root: true },
    { label: "Explore", href: "pages/explore.html" },
    { label: "Map", href: "pages/map.html" },
    { label: "Bucket List", href: "pages/bucket-list.html" },
    { label: "Trivia", href: "pages/trivia.html" },
    { label: "About", href: "pages/about.html" },
  ];

  function buildNav(activeHref) {
    const mount = document.getElementById("site-nav");
    if (!mount) return;

    const links = NAV_ITEMS.map((item) => {
      const href = BASE + item.href;
      const isActive = item.href === activeHref;
      return `<a href="${href}"${isActive ? ' aria-current="page"' : ""}>${item.label}</a>`;
    }).join("");

    mount.innerHTML = `
      <div class="container nav-inner">
        <a class="nav-brand" href="${BASE}index.html">
          <span class="dice">🎲</span> WildIndy
        </a>
        <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <nav class="nav-links" id="nav-links" aria-label="Main navigation">
          ${links}
        </nav>
      </div>
    `;

    const toggle = document.getElementById("nav-toggle");
    const navLinks = document.getElementById("nav-links");
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  function buildFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    mount.innerHTML = `
      <div class="container footer-inner">
        <span>🎲 WildIndy &mdash; Discover Indiana Differently</span>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="${BASE}pages/about.html">About</a>
          <a href="${BASE}pages/explore.html">Explore</a>
          <a href="${BASE}pages/map.html">Map</a>
        </nav>
      </div>
    `;
  }

  function initFadeIn() {
    const targets = document.querySelectorAll(".fade-in");
    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach((t) => t.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => observer.observe(t));
  }

  function dayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / 86400000);
  }

  function pickForToday(list) {
    if (!list.length) return null;
    return list[dayOfYear() % list.length];
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function mapsLink(adventure) {
    return `https://www.google.com/maps/search/?api=1&query=${adventure.lat},${adventure.lng}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const active = document.body.getAttribute("data-nav") || "index.html";
    buildNav(active === "index.html" ? "index.html" : `pages/${active}`);
    buildFooter();
    initFadeIn();
  });

  return { BASE, loadJSON, img, asset, categoryById, initFadeIn, dayOfYear, pickForToday, escapeHTML, mapsLink };
})();
