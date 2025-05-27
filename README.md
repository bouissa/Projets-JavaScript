# 💰 Gestion Budgétaire

Une application web simple de **gestion de budget personnel**, permettant à un utilisateur de :
- S'inscrire / se connecter,
- Ajouter ses transactions (revenus / dépenses),
- Visualiser son solde,
- Gérer son profil,
- Voir l'évolution de ses finances sous forme de graphique.

---

# 📁 Structure du projet

gestion-budgetaire/
│
├── client/
│   ├── assets/             # Images (icônes, photos de profil, etc.)
│   │   ├── icon.png
│   │   └── profil.png
│   ├── css/                # Feuilles de styles
│   │   ├── style.css
│   │   ├── stylelog.css
│   │   └── styleprofile.css
│   └── page/               # Pages HTML utilisateur
│       ├── dashboard.html
│       └── profile.html
│
├── js/                     # Scripts JavaScript
│   ├── app.js              # Gestion des transactions
│   ├── login.js            # Connexion utilisateur
│   ├── profile.js          # Profil utilisateur + graphique
│   └── signup.js           # Inscription
│
├── public/                 # Pages publiques
│   ├── login.html
│   └── signup.html
│
└── README.md               # Ce fichier

---

## 🚀 Fonctionnalités principales

### 🔐 Authentification
- Inscription avec nom, email et mot de passe.
- Connexion sécurisée (vérification côté client via `localStorage`).
- Redirection automatique vers le tableau de bord ou la page de connexion selon l'état de session.

### 💼 Gestion de budget
- Ajout de transactions (catégorie, montant, date).
- Calcul du solde en temps réel.
- Graphique mensuel de l’évolution financière avec **Chart.js**.

### 👤 Profil utilisateur
- Affichage/modification du nom, email et bio.
- Changement du mot de passe avec validation.
- Option de suppression du compte (à implémenter).

---

## 📊 Visualisation des données
Utilisation de [Chart.js](https://www.chartjs.org/) pour représenter :
- L'évolution mensuelle du solde avec un graphique en barres dynamique.

---

## 🛠️ Technologies utilisées

- **HTML5 / CSS3** : structure et design
- **JavaScript Vanilla** : logique métier, DOM
- **Chart.js** : visualisation des données
- **LocalStorage** : gestion simple des données côté client

---

## 📌 Remarques

- Ce projet est **100% côté client**. Aucune base de données externe n’est utilisée.
- Les utilisateurs, transactions et sessions sont stockés localement dans le navigateur via `localStorage`.
- Ce projet peut être étendu vers une version back-end (Node.js / Express / MongoDB ou PHP / MySQL).

---
## 👨‍💻 Auteur

**Yassine Bouissa**  
Développeur full-stack
---

## 📄 Licence

Projet personnel réalisé dans un cadre pédagogique . 
