/* ================= ============
   AnnuairePro — autocomplétion des villes de France
   Source en ligne : API officielle geo.api.gouv.fr (données INSEE, gratuites, sans clé)
   Secours hors-ligne : liste des grandes villes embarquée
================================ */

const CITY_FALLBACK = [
  ["Paris", "75001"], ["Marseille", "13001"], ["Lyon", "69001"], ["Toulouse", "31000"],
  ["Nice", "06000"], ["Nantes", "44000"], ["Montpellier", "34000"], ["Strasbourg", "67000"],
  ["Bordeaux", "33000"], ["Lille", "59000"], ["Rennes", "35000"], ["Reims", "51100"],
  ["Toulon", "83000"], ["Saint-Étienne", "42000"], ["Le Havre", "76600"], ["Grenoble", "38000"],
  ["Dijon", "21000"], ["Angers", "49000"], ["Nîmes", "30000"], ["Aix-en-Provence", "13100"],
  ["Villeurbanne", "69100"], ["Clermont-Ferrand", "63000"], ["Le Mans", "72000"], ["Brest", "29200"],
  ["Tours", "37000"], ["Amiens", "80000"], ["Limoges", "87000"], ["Annecy", "74000"],
  ["Perpignan", "66000"], ["Boulogne-Billancourt", "92100"], ["Metz", "57000"], ["Besançon", "25000"],
  ["Orléans", "45000"], ["Saint-Denis", "93200"], ["Rouen", "76000"], ["Argenteuil", "95100"],
  ["Mulhouse", "68100"], ["Montreuil", "93100"], ["Caen", "14000"], ["Nancy", "54000"],
  ["Saint-Paul", "97460"], ["Nanterre", "92000"], ["Vitry-sur-Seine", "94400"], ["Créteil", "94000"],
  ["Avignon", "84000"], ["Poitiers", "86000"], ["Dunkerque", "59140"], ["Asnières-sur-Seine", "92600"],
  ["Versailles", "78000"], ["Colombes", "92700"], ["Courbevoie", "92400"], ["Aubervilliers", "93300"],
  ["La Rochelle", "17000"], ["Cannes", "06400"], ["Béziers", "34500"], ["Colmar", "68000"],
  ["Rueil-Malmaison", "92500"], ["Champigny-sur-Marne", "94500"], ["Saint-Nazaire", "44600"],
  ["Drancy", "93700"], ["Issy-les-Moulineaux", "92130"], ["Bourges", "18000"], ["Valence", "26000"],
  ["Quimper", "29000"], ["Ajaccio", "20000"], ["Bayonne", "64100"], ["Béthune", "62400"],
  ["Chambéry", "73000"], ["Carnac", "56340"], ["Chartres", "28000"], ["Troyes", "10000"],
  ["Arras", "62000"], ["Alès", "30100"], ["Laon", "02000"], ["Laval", "53000"],
  ["Pau", "64000"], ["Calais", "62100"], ["Gap", "05000"], ["Annemasse", "74100"],
  ["Vannes", "56000"], ["Lorient", "56100"], ["Cahors", "46000"], ["Chalon-sur-Saône", "71100"],
  ["Commentry", "03600"], ["Compiègne", "60200"], ["Charleville-Mézières", "08000"],
  ["Castres", "81100"], ["Châteauroux", "36000"], ["Cergy", "95000"], ["Chelles", "77500"]
];

function normalizeCity(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* ---------- moteur de recherche de villes ---------- */

const cityApiCache = new Map();
let cityAbort = null;

async function searchCitiesOnline(query) {
  if (cityApiCache.has(query)) return cityApiCache.get(query);
  if (cityAbort) cityAbort.abort();
  cityAbort = new AbortController();
  const timer = setTimeout(() => cityAbort.abort(), 3000);
  try {
    const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}`
      + `&fields=nom,codesPostaux&format=json&limit=8`;
    const res = await fetch(url, { signal: cityAbort.signal });
    if (!res.ok) throw new Error("api " + res.status);
    const data = await res.json();
    const results = data
      .filter(c => c.nom)
      .map(c => ({
        name: c.nom,
        zip: (c.codesPostaux && c.codesPostaux[0]) || "",
        extra: (c.codesPostaux && c.codesPostaux.length > 1) ? c.codesPostaux.length : 0
      }));
    cityApiCache.set(query, results);
    return results;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function searchCitiesOffline(query) {
  const q = normalizeCity(query);
  const starts = [];
  const contains = [];
  for (const [name, zip] of CITY_FALLBACK) {
    const n = normalizeCity(name);
    if (n.startsWith(q)) starts.push({ name, zip, extra: 0 });
    else if (n.includes(q)) contains.push({ name, zip, extra: 0 });
  }
  return starts.concat(contains).slice(0, 8);
}

/* ---------- composant d'autocomplétion ---------- */

function attachCityAutocomplete(input) {
  if (!input) return;

  const wrap = document.createElement("div");
  wrap.className = "autocomplete";
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  const list = document.createElement("ul");
  list.className = "ac-list";
  list.hidden = true;
  wrap.appendChild(list);

  let items = [];
  let active = -1;
  let requestSeq = 0;

  function close() {
    list.hidden = true;
    list.innerHTML = "";
    items = [];
    active = -1;
    input.setAttribute("aria-expanded", "false");
  }

  function select(i) {
    if (!items[i]) return;
    input.value = items[i].name;
    close();
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function render(results, note) {
    items = results;
    active = -1;
    list.innerHTML = "";
    if (!results.length) {
      const li = document.createElement("li");
      li.className = "ac-empty";
      li.textContent = "Aucune ville trouvée";
      list.appendChild(li);
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      return;
    }
    results.forEach((c, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.innerHTML = `<strong>${escapeHtml(c.name)}</strong>`
        + `<span class="ac-zip">${escapeHtml(c.zip)}${c.extra ? ` +${c.extra} autres` : ""}</span>`;
      li.addEventListener("mousedown", e => {
        e.preventDefault();
        select(i);
      });
      list.appendChild(li);
    });
    if (note) {
      const li = document.createElement("li");
      li.className = "ac-note";
      li.textContent = note;
      list.appendChild(li);
    }
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  async function update() {
    const q = input.value.trim();
    if (q.length < 1) { close(); return; }
    const seq = ++requestSeq;

    const offline = searchCitiesOffline(q);
    if (offline.length) render(offline);

    const online = await searchCitiesOnline(q);
    if (seq !== requestSeq) return;
    if (online === null) {
      render(offline, "hors ligne · villes principales");
      return;
    }
    render(online);
  }

  input.addEventListener("input", update);
  input.addEventListener("focus", update);
  input.addEventListener("blur", () => setTimeout(close, 120));
  input.addEventListener("keydown", e => {
    if (list.hidden) return;
    const options = Array.from(list.querySelectorAll("li[role='option']"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!options.length) return;
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options.forEach((o, i) => o.classList.toggle("ac-active", i === active));
    } else if (e.key === "Enter") {
      if (active >= 0) { e.preventDefault(); select(active); }
      else if (options.length) { e.preventDefault(); select(0); }
      else close();
    } else if (e.key === "Escape") {
      close();
    }
  });

  input.setAttribute("autocomplete", "off");
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-expanded", "false");
}

document.addEventListener("DOMContentLoaded", () => {
  attachCityAutocomplete(document.getElementById("ville"));
});
