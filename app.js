const starterApps = [
  { id: "velice", name: "Velice", category: "Developer tools", description: "A public software project maintained by samwise1776.", repo: "samwise1776/velice", color: "#f2a65a", glyph: "V" },
  { id: "fortran-omni", name: "FortranOmni", category: "Utilities", description: "Open-source Linux desktop utilities built with GTK 4 and GJS.", repo: "samwise1776/FortranOmni", color: "#8bd3dd", glyph: "F" },
  { id: "db", name: "DB", category: "Developer tools", description: "A Java project from the Appacent repository collection.", repo: "samwise1776/DB", color: "#70dbc0", glyph: "DB" },
  { id: "desktopcraft", name: "DesktopCraft", category: "Utilities", description: "A creative desktop project for crafting a more personal workspace.", repo: "samwise1776/desktopcraft", color: "#c3adff", glyph: "D" },
  { id: "desktop-pet", name: "DesktopPet", category: "Utilities", description: "A Java desktop companion project from the Appacent collection.", repo: "samwise1776/DesktopPet", color: "#ff9dba", glyph: "P" },
  { id: "todont", name: "Todon't", category: "Productivity", description: "Todon't by Zeptotech: a different way to think about tasks.", repo: "samwise1776/Todont", color: "#ff7b54", glyph: "T" },
  { id: "lumi", name: "Lumi", category: "Developer tools", description: "A small programming language written in Java with simple GUI support.", repo: "samwise1776/Lumi", color: "#ffe066", glyph: "L" },
  { id: "omni-desk", name: "OmniDesk", category: "Utilities", description: "A public desktop software project maintained by samwise1776.", repo: "samwise1776/OmniDesk", color: "#82a9ff", glyph: "O" },
  { id: "searchpot", name: "Searchpot", category: "Utilities", description: "A lightweight web project for finding what you need faster.", repo: "samwise1776/Searchpot", color: "#b8e986", glyph: "S" },
  { id: "app-creator", name: "App Creator", category: "Developer tools", description: "A JavaScript project for creating and exploring apps.", repo: "samwise1776/app-creator", color: "#d59bf6", glyph: "A" }
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
