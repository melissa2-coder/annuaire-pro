# AnnuairePro — Annuaire local & services de proximité

Site statique d'annuaire local écrit en HTML/CSS/JavaScript vanilla, sans dépendance ni build.

## Pages

| Page | Rôle |
|------|------|
| `index.html` | Accueil : barre de recherche (quoi / où), catégories, entreprises les mieux notées, « comment ça marche », encart professionnels |
| `services.html` | Résultats : filtres (catégorie, note minimum, ouvert maintenant), tri (note, avis, nom), recherche par texte et ville |
| `ajouter.html` | Formulaire de référencement d'une entreprise avec validation |
| `aide.html` | FAQ (accordéons) et contact |

## Données

Les entreprises d'exemple sont dans `js/data.js` (`LISTINGS`, `CATEGORIES`). En production, remplacer ce fichier par un appel API (`fetch`) sans changer `js/app.js`.

## Lancer le site en local

```bash
cd annuaire-local
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

Ou ouvrir simplement `index.html` dans un navigateur.

## Structure

```
annuaire-local/
├── index.html        Accueil
├── services.html     Résultats et filtres
├── ajouter.html      Référencement pro
├── aide.html         FAQ + contact
├── css/styles.css    Styles (palette bleu / jaune, responsive)
└── js/
    ├── data.js       Catégories et entreprises d'exemple
    ├── app.js        Rendu, recherche, filtres, tri, formulaire
    └── villes.js     Autocomplétion des communes françaises (geo.api.gouv.fr, repli hors-ligne intégré)
```
