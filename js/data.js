/* Données d'exemple de l'annuaire.
   En production, ces données seraient servies par une API ou une base de données. */

const CATEGORIES = [
  { id: "maison",        name: "Maison & artisans", icon: "🔧", color: "#0ea5e9" },
  { id: "sante",         name: "Santé",             icon: "🩺", color: "#ef4444" },
  { id: "restauration",  name: "Restauration",      icon: "🍽️", color: "#f59e0b" },
  { id: "bienetre",      name: "Beauté & bien-être",icon: "💅", color: "#ec4899" },
  { id: "commerce",      name: "Commerces",         icon: "🛒", color: "#16a34a" },
  { id: "automobile", name: "Automobile",          icon: "🚗", color: "#64748b" },
  { id: "education", name: "Éducation & cours",   icon: "📚", color: "#8b5cf6" },
  { id: "animaux",       name: "Animaux",           icon: "🐾", color: "#a16207" }
];

const LISTINGS = [
  {
    id: 1, name: "Plomberie Dupont & Fils", category: "maison",
    description: "Dépannage et installation sanitaire, chauffe-eau, robinetterie. Devis gratuit, intervention rapide 7 j/7.",
    city: "Lyon", zip: "69003", phone: "04 72 12 34 56", rating: 4.8, reviews: 132,
    openNow: true, site: "https://plomberie-dupont.example.fr", verified: true
  },
  {
    id: 2, name: "Élec Martin", category: "maison",
    description: "Électricien certifié : mise aux normes, tableaux électriques, dépannage d'urgence.",
    city: "Lyon", zip: "69007", phone: "04 78 45 67 89", rating: 4.6, reviews: 87,
    openNow: false, verified: true
  },
  {
    id: 3, name: "Cabinet Dr. Lefèvre — Médecin généraliste", category: "sante",
    description: "Consultations sur rendez-vous et sans rendez-vous, vaccinations, suivis chroniques.",
    city: "Paris", zip: "75011", phone: "01 43 22 11 00", rating: 4.9, reviews: 214,
    openNow: true, verified: true
  },
  {
    id: 4, name: "Cabinet dentaire des Lilas", category: "sante",
    description: "Soins dentaires, orthodontie, imagerie 3D. Urgences dentaires acceptées.",
    city: "Paris", zip: "75020", phone: "01 40 55 66 77", rating: 4.4, reviews: 96,
    openNow: true, verified: true
  },
  {
    id: 5, name: "Chez Marco — Pizzeria Napoletaina", category: "restauration",
    description: "Pizzas cuites au feu de bois, produits italiens AOP, livraison à domicile.",
    city: "Marseille", zip: "13001", phone: "04 91 33 22 11", rating: 4.7, reviews: 305,
    openNow: true, verified: true
  },
  {
    id: 6, name: "Le Bistrot du Port", category: "restauration",
    description: "Cuisine de marché, poisson frais du Vieux-Port, menu ouvrier à midi.",
    city: "Marseille", zip: "13002", phone: "04 91 90 80 70", rating: 4.3, reviews: 158,
    openNow: false, verified: false
  },
  {
    id: 7, name: "Studio Coiffure Élégance", category: "bienetre",
    description: "Coupes, couleurs, balayages et soins capillaires. Sans rendez-vous le samedi.",
    city: "Bordeaux", zip: "33000", phone: "05 56 44 33 22", rating: 4.5, reviews: 74,
    openNow: true, verified: true
  },
  {
    id: 8, name: "Institut Sérénité", category: "bienetre",
    description: "Massages relaxants, soins du visage, épilation. Cartes fidélité disponibles.",
    city: "Bordeaux", zip: "33200", phone: "05 56 77 88 99", rating: 4.9, reviews: 121,
    openNow: false, verified: true
  },
  {
    id: 9, name: "Boulangerie du Marché", category: "commerce",
    description: "Pains au levain, viennoiseries maison, sandwichs préparés le midi.",
    city: "Toulouse", zip: "31000", phone: "05 34 12 13 14", rating: 4.6, reviews: 189,
    openNow: true, verified: true
  },
  {
    id: 10, name: "Primeur du Capitole", category: "commerce",
    description: "Fruits et légumes de saison, producteurs locaux, circuits courts.",
    city: "Toulouse", zip: "31000", phone: "05 61 55 44 33", rating: 4.2, reviews: 53,
    openNow: true, verified: false
  },
  {
    id: 11, name: "Garage Auto+", category: "automobile",
    description: "Révision, freinage, pneumatiques toutes marques. Véhicule de prêt sur demande.",
    city: "Lille", zip: "59000", phone: "03 20 11 22 33", rating: 4.1, reviews: 67,
    openNow: true, verified: true
  },
  {
    id: 12, name: "Carrosserie Lilloise", category: "automobile",
    description: "Réparation carrosserie, débosselage, traitement des rayures. Assurance prise en charge.",
    city: "Lille", zip: "59000", phone: "03 20 44 55 66", rating: 3.9, reviews: 28,
    openNow: false, verified: false
  },
  {
    id: 13, name: "Cours Particuliers & Co", category: "education",
    description: "Maths, français, anglais du collège au lycée. Premier cours d'essai offert.",
    city: "Lyon", zip: "69001", phone: "04 72 99 88 77", rating: 4.8, reviews: 42,
    openNow: true, verified: true
  },
  {
    id: 14, name: "Au Panier des Toutous", category: "animaux",
    description: "Toilettage chiens et chats, pension canine, aliments et accessoires.",
    city: "Bordeaux", zip: "33800", phone: "05 56 21 43 65", rating: 4.4, reviews: 39,
    openNow: true, verified: false
  }
];
