const starterApps = [
  { id: "orbital", name: "Orbital", category: "Productivity", description: "A calm command center for your tasks, notes, and everyday orbit.", repo: "samwise1776/orbital", color: "#ff7b54", glyph: "◎" },
  { id: "pixel-kit", name: "Pixel Kit", category: "Design", description: "Tiny image utilities for quick edits, crops, and beautiful exports.", repo: "samwise1776/pixel-kit", color: "#82a9ff", glyph: "▦" },
  { id: "branchline", name: "Branchline", category: "Developer tools", description: "See your Git branches clearly and keep your next commit in sight.", repo: "samwise1776/branchline", color: "#b8e986", glyph: "⑂" },
  { id: "daymark", name: "Daymark", category: "Productivity", description: "A focused daily planner that makes room for the work that matters.", repo: "samwise1776/daymark", color: "#d59bf6", glyph: "◷" },
  { id: "weatherly", name: "Weatherly", category: "Utilities", description: "A friendly, glanceable forecast for wherever the day takes you.", repo: "samwise1776/weatherly", color: "#f6cf65", glyph: "☼" },
  { id: "readwise-lite", name: "Readwise Lite", category: "Learning", description: "Keep the best ideas from what you read close at hand.", repo: "samwise1776/readwise-lite", color: "#ff9dba", glyph: "▤" },
  { id: "focus-flow", name: "Focus Flow", category: "Productivity", description: "Turn a noisy to-do list into one small, satisfying next step.", repo: "samwise1776/focus-flow", color: "#70dbc0", glyph: "→" },
  { id: "json-garden", name: "JSON Garden", category: "Developer tools", description: "Explore, format, and understand JSON without leaving your browser.", repo: "samwise1776/json-garden", color: "#c3adff", glyph: "{}" },
  { id: "palette-party", name: "Palette Party", category: "Design", description: "Make color palettes that feel right and export them anywhere.", repo: "samwise1776/palette-party", color: "#f08b70", glyph: "◈" },
  { id: "tiny-timer", name: "Tiny Timer", category: "Utilities", description: "A minimal timer for cooking, studying, pairing, and everything between.", repo: "samwise1776/tiny-timer", color: "#9be37a", glyph: "◴" },
  { id: "velice", name: "Velice", category: "Developer tools", description: "A public software project maintained by samwise1776.", repo: "samwise1776/velice", color: "#f2a65a", glyph: "V" },
  { id: "fortran-omni", name: "FortranOmni", category: "Utilities", description: "Open-source Linux desktop utilities built with GTK 4 and GJS.", repo: "samwise1776/FortranOmni", color: "#8bd3dd", glyph: "F" },
  { id: "desktopcraft", name: "DesktopCraft", category: "Utilities", description: "A creative desktop project for crafting a more personal workspace.", repo: "samwise1776/desktopcraft", color: "#c3adff", glyph: "D" },
  { id: "lumi", name: "Lumi", category: "Developer tools", description: "A small programming language written in Java with simple GUI support.", repo: "samwise1776/Lumi", color: "#ffe066", glyph: "L" },
  { id: "db", name: "DB", category: "Developer tools", description: "A Java project from the Appacent repository collection.", repo: "samwise1776/DB", color: "#70dbc0", glyph: "DB" }
];

const storageKey = "appacent-state-v1";
const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
let apps = [...starterApps, ...(saved.customApps || [])];
let downloads = saved.downloads || {};
const $ = (selector) => document.querySelector(selector);
const formatNumber = (number) => new Intl.NumberFormat("en-US").format(number);
const totalDownloads = () => Object.values(downloads).reduce((sum, count) => sum + count, 0);
const persist = () => localStorage.setItem(storageKey, JSON.stringify({ downloads, customApps: apps.filter((app) => app.custom) }));

function renderCategories() {
  const categories = [...new Set(apps.map((app) => app.category))].sort();
  $("#category-filter").innerHTML = '<option value="all">All categories</option>' +
    categories.map((category) => `<option value="${category}">${category}</option>`).join("");
}

function appCard(app) {
  const count = downloads[app.id] || 0;
  return `<article class="app-card">
    <div class="app-top"><span class="app-icon" style="background:${app.color}">${app.glyph || "✦"}</span><span class="app-category">${app.category}</span></div>
    <h3>${app.name}</h3><p>${app.description}</p>
    <div class="app-footer"><a class="repo-link" href="https://github.com/${app.repo}" target="_blank" rel="noreferrer">github.com/${app.repo}</a>
      <span class="download-count">${formatNumber(count)} ↓</span>
      <button class="download-button ${count ? "downloaded" : ""}" data-download="${app.id}">${count ? "Downloaded" : "Download"}</button>
    </div>
  </article>`;
}

function renderCatalog() {
  const query = $("#search-input").value.trim().toLowerCase();
  const category = $("#category-filter").value;
  const visible = apps.filter((app) => (category === "all" || app.category === category) &&
    `${app.name} ${app.description} ${app.repo}`.toLowerCase().includes(query));
  $("#app-grid").innerHTML = visible.map(appCard).join("");
  $("#empty-state").hidden = visible.length > 0;
  updateHeader();
}

function renderTracked() {
  const tracked = apps.filter((app) => (downloads[app.id] || 0) > 0).sort((a, b) => downloads[b.id] - downloads[a.id]);
  $("#tracked-count").textContent = tracked.length;
  $("#tracked-empty").hidden = tracked.length > 0;
  const max = tracked[0] ? downloads[tracked[0].id] : 1;
  $("#tracked-list").innerHTML = tracked.map((app) => `<div class="tracked-row">
    <span class="app-icon" style="background:${app.color}">${app.glyph || "✦"}</span>
    <div><div class="tracked-name">${app.name}</div><div class="tracked-repo">${app.repo}</div></div>
    <div class="tracked-bar"><span style="width:${Math.max(7, downloads[app.id] / max * 100)}%"></span></div>
    <div class="tracked-downloads">${formatNumber(downloads[app.id])} downloads</div>
  </div>`).join("");
}

function updateHeader() {
  $("#header-downloads").textContent = formatNumber(totalDownloads());
  $("#next-id").textContent = String(apps.length + 1).padStart(3, "0");
}

function render() { renderCategories(); renderCatalog(); renderTracked(); updateHeader(); }

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-download]");
  if (!button) return;
  const id = button.dataset.download;
  downloads[id] = (downloads[id] || 0) + 1;
  persist();
  renderCatalog();
  renderTracked();
  button.animate([{ transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 180 });
  const app = apps.find((item) => item.id === id);
  if (app) window.open(`https://github.com/${app.repo}`, "_blank", "noopener,noreferrer");
});

$("#search-input").addEventListener("input", renderCatalog);
$("#category-filter").addEventListener("change", renderCatalog);
$("#create-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const repo = data.get("repo").toString().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  const name = data.get("name").toString().trim();
  const newApp = { id: `custom-${Date.now()}`, name, description: data.get("description").toString().trim(), category: data.get("category"), color: data.get("color"), repo, glyph: "✦", custom: true };
  apps.push(newApp);
  persist();
  event.currentTarget.reset();
  $("#form-message").textContent = `${name} is now on the shelf.`;
  render();
  setTimeout(() => { $("#form-message").textContent = ""; }, 4000);
});

function syncView() {
  const view = location.hash.replace("#", "") || "catalog";
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === view));
}
window.addEventListener("hashchange", syncView);
render();
syncView();
