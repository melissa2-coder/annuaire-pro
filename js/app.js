/* ================= ============
   AnnuairePro — logique du site
   Pages : index, services, ajouter
================================ */

const params = new URLSearchParams(window.location.search);

function getCategory(id) {
  return CATEGORIES.find(c => c.id === id) || null;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function starsHtml(rating) {
  const full = Math.round(rating);
  return [1, 2, 3, 4, 5]
    .map(i => `<span class="${i <= full ? "" : "muted"}">★</span>`)
    .join("");
}

function cardHtml(listing, layout) {
  const cat = getCategory(listing.category);
  const banner = cat ? cat.icon : "🏢";
  const color = cat ? cat.color : "#64748b";
  const openBadge = listing.openNow
    ? '<span class="badge badge-open">Ouvert</span>'
    : '<span class="badge badge-closed">Fermé</span>';
  const verified = listing.verified ? '<span class="badge badge-pro">✔ Vérifié</span>' : "";
  const phone = `<a href="tel:${listing.phone.replace(/\s/g, "")}">📞 ${listing.phone}</a>`;

  if (layout === "row") {
    return `
      <article class="listing-row">
        <div class="listing-banner" style="background:${color}">${banner}</div>
        <div class="listing-body">
          <div><span class="listing-cat">${cat ? cat.name : ""}</span></div>
          <h3 class="listing-title">${escapeHtml(listing.name)}</h3>
          <div class="rating-line">
            <span class="stars">${starsHtml(listing.rating)}</span>
            <span class="rating-num">${listing.rating.toFixed(1)}</span>
            <span class="rating-count">(${listing.reviews} avis)</span>
          </div>
          <p class="listing-loc">📍 ${escapeHtml(listing.city)} (${listing.zip})</p>
          <p>${escapeHtml(listing.description)}</p>
          <div class="listing-meta">
            ${openBadge} ${verified}
            <span class="listing-actions">${phone}</span>
            ${listing.site ? `<a href="${escapeHtml(listing.site)}" target="_blank" rel="noopener">🌐 Site web</a>` : ""}
          </div>
        </div>
      </article>`;
  }

  return `
    <article class="listing-card">
      <div class="listing-banner" style="background:${color}">${banner}</div>
      <div class="listing-body">
        <span class="listing-cat">${cat ? cat.name : ""}</span>
        <h3 class="listing-title"><a href="services.html?q=${encodeURIComponent(listing.name)}">${escapeHtml(listing.name)}</a></h3>
        <div class="rating-line">
          <span class="stars">${starsHtml(listing.rating)}</span>
          <span class="rating-num">${listing.rating.toFixed(1)}</span>
          <span class="rating-count">(${listing.reviews} avis)</span>
        </div>
        <p class="listing-loc">📍 ${escapeHtml(listing.city)} (${listing.zip})</p>
        <div class="listing-meta">${openBadge} ${verified}${
          layout === "minimal"
            ? `<a href="tel:${listing.phone.replace(/\s/g, "")}">📞 Appeler</a>`
            : ""
        }</div>
      </div>
    </article>`;
}

/* ---------- Accueil : catégories + sélection ---------- */
const categoriesGrid = document.getElementById("categories-grid");
if (categoriesGrid) {
  categoriesGrid.innerHTML = CATEGORIES.map(cat => {
    const count = LISTINGS.filter(l => l.category === cat.id).length;
    return `
      <a class="category-card" href="services.html?cat=${cat.id}">
        <span class="cat-icon">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
        <span class="cat-count">${count} entreprise${count > 1 ? "s" : ""}</span>
      </a>`;
  }).join("");

  const featured = [...LISTINGS]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 6);
  document.getElementById("featured-listings").innerHTML =
    featured.map(l => cardHtml(l, "grid")).join("");
}

/* ---------- Page services : recherche, filtres, tri ---------- */
const listingsContainer = document.getElementById("listings");
if (listingsContainer) {
  const state = {
    q: params.get("q") || "",
    ville: params.get("ville") || "",
    cat: params.get("cat") || "",
    minRating: 0,
    openOnly: false,
    sort: "rating"
  };

  const qInput = document.getElementById("q");
  const villeInput = document.getElementById("ville");
  qInput.value = state.q;
  villeInput.value = state.ville;

  const sortBy = document.getElementById("sort");

  const catsBox = document.getElementById("filter-cats");
  catsBox.innerHTML = CATEGORIES.map(cat => `
    <label class="filter-option">
      <input type="radio" name="f-cat" value="${cat.id}" ${state.cat === cat.id ? "checked" : ""}>
      ${cat.icon} ${cat.name}
    </label>`).join("") + `
    <label class="filter-option">
      <input type="radio" name="f-cat" value="" ${state.cat === "" ? "checked" : ""}>
      Toutes les catégories
    </label>`;

  const ratingsBox = document.getElementById("filter-ratings");
  ratingsBox.innerHTML = [4.5, 4, 3, 0].map(r => `
    <label class="filter-option">
      <input type="radio" name="f-rating" value="${r}" ${r === 0 ? "checked" : ""}>
      ${r === 0 ? "Toutes les notes" : `${r} ★ et plus`}
    </label>`).join("");

  function apply() {
    let results = LISTINGS.filter(l => {
      if (state.cat && l.category !== state.cat) return false;
      if (l.rating < state.minRating) return false;
      if (state.openOnly && !l.openNow) return false;

      if (state.q) {
        const q = state.q.toLowerCase();
        const cat = getCategory(l.category);
        const haystack = `${l.name} ${l.description} ${cat ? cat.name : ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (state.ville) {
        const v = state.ville.toLowerCase().trim();
        if (!`${l.city} ${l.zip}`.toLowerCase().includes(v)) return false;
      }
      return true;
    });

    results.sort((a, b) => {
      if (state.sort === "name") return a.name.localeCompare(b.name, "fr");
      if (state.sort === "reviews") return b.reviews - a.reviews;
      return b.rating - a.rating || b.reviews - a.reviews;
    });

    const cat = state.cat ? getCategory(state.cat) : null;
    document.getElementById("results-title").textContent =
      cat ? cat.name : (state.q ? `Résultats : « ${state.q} »` : "Tous les services");
    document.getElementById("results-meta").textContent =
      `${results.length} entreprise${results.length > 1 ? "s" : ""}${state.ville ? ` à ${state.ville}` : ""}`;
    document.getElementById("no-results").hidden = results.length > 0;
    listingsContainer.innerHTML = results.map(l => cardHtml(l, "row")).join("");
  }

  catsBox.addEventListener("change", e => {
    if (e.target.name === "f-cat") { state.cat = e.target.value; apply(); }
  });
  ratingsBox.addEventListener("change", e => {
    if (e.target.name === "f-rating") { state.minRating = parseFloat(e.target.value); apply(); }
  });
  document.getElementById("filter-open").addEventListener("change", e => {
    state.openOnly = e.target.checked; apply();
  });
  sortBy.addEventListener("change", e => { state.sort = e.target.value; apply(); });
  document.getElementById("reset-filters").addEventListener("click", () => {
    state.cat = ""; state.minRating = 0; state.openOnly = false;
    catsBox.querySelectorAll('input[value=""]').forEach(i => { i.checked = true; });
    ratingsBox.querySelectorAll('input[value="0"]').forEach(i => { i.checked = true; });
    document.getElementById("filter-open").checked = false;
    qInput.value = ""; villeInput.value = ""; state.q = ""; state.ville = "";
    apply();
  });

  document.getElementById("results-search").addEventListener("submit", e => {
    e.preventDefault();
    state.q = qInput.value.trim(); state.ville = villeInput.value.trim();
    apply();
  });

  apply();
}

/* ---------- Page ajouter : formulaire ---------- */
const addForm = document.getElementById("add-form");
if (addForm) {
  const catSelect = document.getElementById("f-cat");
  catSelect.innerHTML += CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

  addForm.addEventListener("submit", e => {
    e.preventDefault();
    const nom = document.getElementById("f-nom").value.trim();
    const cat = catSelect.value;
    const ville = document.getElementById("f-ville").value.trim();
    const tel = document.getElementById("f-tel").value.trim();
    const cgu = document.getElementById("f-cgu").checked;

    const ok = nom && cat && ville && tel && cgu;
    document.getElementById("form-error").hidden = ok;
    document.getElementById("form-success").hidden = !ok;
    if (ok) {
      Array.from(addForm.elements).forEach(el => {
        if (el.type !== "checkbox" && el.type !== "submit") el.value = "";
      });
      document.getElementById("f-cgu").checked = false;
    }
  });
}

/* ---------- Menu mobile ---------- */
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
}
