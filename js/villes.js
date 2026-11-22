/* AnnuairePro — autocomplétion des communes françaises (geo.api.gouv.fr) */

(() => {
  "use strict";

  const API_URL = "https://geo.api.gouv.fr/communes?fields=nom,codesPostaux&format=json";
  const MAX_SUGGESTIONS = 50;

  const VILLES_SECOURS = [
    ["Paris", "75001", "Paris"], ["Marseille", "13001", "Bouches-du-Rhône"],
    ["Lyon", "69003", "Rhône"], ["Toulouse", "31000", "Haute-Garonne"],
    ["Nice", "06000", "Alpes-Maritimes"], ["Nantes", "44000", "Loire-Atlantique"],
    ["Montpellier", "34000", "Hérault"], ["Strasbourg", "67000", "Bas-Rhin"],
    ["Bordeaux", "33000", "Gironde"], ["Lille", "59000", "Nord"],
    ["Rennes", "35000", "Ille-et-Vilaine"], ["Reims", "51100", "Marne"],
    ["Toulon", "83000", "Var"], ["Caen", "14000", "Calvados"],
    ["Clermont-Ferrand", "63000", "Puy-de-Dôme"], ["Dijon", "21000", "Côte-d'Or"],
    ["Grenoble", "38000", "Isère"], ["Le Havre", "76600", "Seine-Maritime"],
    ["Limoges", "87000", "Haute-Vienne"], ["Metz", "57000", "Moselle"],
    ["Nîmes", "30000", "Gard"], ["Orléans", "45000", "Loiret"],
    ["Pau", "64000", "Pyrénées-Atlantiques"], ["Perpignan", "66000", "Pyrénées-Orientales"],
    ["Quimper", "29000", "Finistère"], ["Rouen", "76000", "Seine-Maritime"],
    ["Tours", "37000", "Indre-et-Loire"], ["Villeurbanne", "69100", "Rhône"],
    ["Angers", "49000", "Maine-et-Loire"], ["Annecy", "74000", "Haute-Savoie"],
    ["Brest", "29200", "Finistère"], ["Chartres", "28000", "Eure-et-Loir"],
    ["Cherbourg-en-Cotentin", "50100", "Manche"], ["Colmar", "68000", "Haut-Rhin"],
    ["Dunkerque", "59140", "Nord"], ["Ajaccio", "20000", "Corse-du-Sud"],
    ["Amiens", "80000", "Somme"], ["Avignon", "84000", "Vaucluse"],
    ["Cannes", "06400", "Alpes-Maritimes"], ["Saint-Étienne", "42000", "Loire"]
  ].map(([nom, codePostal, dep]) => ({
    nom,
    codesPostaux: [codePostal],
    departement: { nom: dep }
  }));

  let communes = [];

  const sansAccent = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  async function chargerCommunes() {
    try {
      const reponse = await fetch(API_URL);
      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
      const donnees = await reponse.json();
      communes = donnees.filter(c => c.nom && c.codesPostaux && c.codesPostaux.length);
    } catch {
      communes = VILLES_SECOURS;
    }
  }

  function filtrer(requete) {
    const saisie = requete.trim();
    if (!saisie) return [];
    if (/^\d+$/.test(saisie)) {
      return communes
        .filter(c => c.codesPostaux.some(zip => zip.startsWith(saisie)))
        .slice(0, MAX_SUGGESTIONS);
    }
    const req = sansAccent(saisie);
    const commencent = [];
    const includent = [];
    for (const commune of communes) {
      const nomSans = sansAccent(commune.nom);
      if (nomSans.startsWith(req)) commencent.push(commune);
      else if (nomSans.includes(req)) includent.push(commune);
      if (commencent.length >= MAX_SUGGESTIONS) break;
    }
    return commencent.concat(includent).slice(0, MAX_SUGGESTIONS);
  }

  function metaVille(commune) {
    let meta = commune.codesPostaux.slice(0, 2).join(", ");
    if (commune.departement) meta += ` — ${commune.departement.nom}`;
    return meta;
  }

  function surligner(nom, requete) {
    const position = sansAccent(nom).indexOf(sansAccent(requete));
    if (position < 0) return escapeHtml(nom);
    return escapeHtml(nom.slice(0, position))
      + "<mark>" + escapeHtml(nom.slice(position, position + requete.length)) + "</mark>"
      + escapeHtml(nom.slice(position + requete.length));
  }

  function attacher(input) {
    const parent = input.parentElement;
    parent.classList.add("ville-wrapper");

    const liste = document.createElement("ul");
    liste.className = "ville-dropdown";
    liste.id = "ville-dropdown-" + Math.random().toString(36).slice(2, 8);
    liste.setAttribute("role", "listbox");
    liste.hidden = true;
    parent.appendChild(liste);

    let suggestions = [];
    let indexActif = -1;

    const fermer = () => {
      liste.hidden = true;
      indexActif = -1;
      input.setAttribute("aria-expanded", "false");
    };

    const choisir = commune => {
      input.value = commune.nom;
      fermer();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    };

    const afficher = requete => {
      suggestions = filtrer(requete);
      indexActif = -1;
      liste.innerHTML = "";
      if (!requete.trim()) {
        fermer();
        return;
      }
      if (!suggestions.length) {
        const vide = document.createElement("li");
        vide.className = "ville-vide";
        vide.textContent = communes.length ? "Aucune ville trouvée." : "Chargement des villes…";
        liste.appendChild(vide);
      } else {
        suggestions.forEach((commune, i) => {
          const li = document.createElement("li");
          li.setAttribute("role", "option");
          li.setAttribute("id", `${liste.id}-option-${i}`);
          li.innerHTML = `<span>${surligner(commune.nom, requete)}</span>`
            + `<span class="ville-meta">${escapeHtml(metaVille(commune))}</span>`;
          li.addEventListener("mousedown", e => {
            e.preventDefault();
            choisir(commune);
          });
          liste.appendChild(li);
        });
      }
      liste.hidden = false;
      input.setAttribute("aria-expanded", "true");
    };

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", liste.id);

    input.addEventListener("input", () => afficher(input.value));

    input.addEventListener("keydown", e => {
      if (liste.hidden) return;
      const lignes = Array.from(liste.children).filter(li => !li.classList.contains("ville-vide"));
      if (!lignes.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        indexActif = e.key === "ArrowDown"
          ? Math.min(indexActif + 1, lignes.length - 1)
          : Math.max(indexActif - 1, 0);
      } else if (e.key === "Enter") {
        if (indexActif >= 0 && suggestions[indexActif]) {
          e.preventDefault();
          choisir(suggestions[indexActif]);
        }
        return;
      } else if (e.key === "Escape") {
        fermer();
        return;
      } else {
        return;
      }
      lignes.forEach((li, i) => li.classList.toggle("actif", i === indexActif));
      lignes[indexActif].scrollIntoView({ block: "nearest" });
    });

    input.addEventListener("blur", () => setTimeout(fermer, 120));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("input[data-villes]").forEach(attacher);
    chargerCommunes();
  });
})();
