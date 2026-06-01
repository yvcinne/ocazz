# ocazz.ma — Plateforme marocaine de vente de véhicules d'occasion

Marketplace fullstack pour l'achat et la vente de voitures d'occasion au Maroc, avec estimation de prix par IA, messagerie temps réel, chatbot assistant et authentification Google OAuth.

---

## Architecture

```
Browser (React SPA — :3000)
        │  REST/JSON  Bearer token (Sanctum)
        ▼
Laravel API  (:8000)
   ├── Sanctum      — authentification par token
   ├── Socialite    — Google OAuth 2.0
   ├── Reverb       — WebSocket (messagerie temps réel)
   └── HTTP proxy   — vers le service Flask
        │
        ▼
Flask Prediction Service  (:5000)
   └── scikit-learn Random Forest — estimation de prix
```

### Stack

| Couche | Technologie |
|---|---|
| Backend API | Laravel 10 · PHP 8.1+ · Sanctum · Socialite |
| Frontend | React 19 · Vite · React Router v6 |
| Base de données | MySQL 8+ / MariaDB 10.6+ |
| Prédiction IA | Python 3.10+ · Flask · scikit-learn (Random Forest) |
| Chatbot | Groq — Llama 3.3 70B (streaming SSE) |
| Temps réel | Laravel Reverb (WebSocket) |

### Structure du projet

```
PP/
├── backend/                   # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/  # AuthController, AnnonceController, ChatController…
│   │   ├── Models/            # User, Annonce, Conversation, Message…
│   │   └── Events/            # MessageSent (WebSocket broadcast)
│   ├── database/migrations/   # 15 migrations
│   └── routes/
│       ├── api.php            # Routes publiques + protégées Sanctum
│       └── channels.php       # Canaux WebSocket
│
├── frontend/                  # SPA React + Vite
│   └── src/
│       ├── api/axios.js       # Instance Axios avec token Bearer
│       ├── components/        # ChatWidget (SSE), Formlogin…
│       ├── layouts/           # Layout public, AdminLayout
│       ├── pages/             # Acceuil, Marketplace, CarDetails, SellYourCar,
│       │                      # Predict, Messages, UserDashboard, admin/…
│       └── router/index.jsx   # React Router v6
│
└── prediction/                # Service IA Python
    ├── api/
    │   ├── app.py             # API Flask — endpoint POST /predict
    │   ├── generate_pipeline.py  # Entraînement + export du modèle
    │   └── requirements.txt
    ├── data/                  # Dataset marché marocain (gitignored)
    ├── models/                # Notebooks comparaison modèles
    ├── preparing/             # Notebooks nettoyage / feature engineering
    └── multiple_scrapers/     # Scrapers Avito / Kifal
```

---

## Prérequis

- PHP 8.1+ et Composer 2
- Node.js 20.19+ ou 22+ et npm
- MySQL 8+ / MariaDB 10.6+
- Python 3.10+

---

## Installation

```bash
git clone <repo-url> ocazz && cd ocazz
```

### Backend Laravel

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
mysql -u root -p -e "CREATE DATABASE ocazz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
php artisan storage:link
```

### Frontend React

```bash
cd frontend
npm install
cp .env.example .env   # renseigner VITE_BACKEND_URL
```

### Service de prédiction Flask

**Première utilisation :**

```bash
cd prediction/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python generate_pipeline.py   # génère production/final_pipeline.pkl (requiert prediction/data/data.csv)
python app.py
```

**Utilisations suivantes :**

```bash
cd prediction/api
source .venv/bin/activate
python app.py
```

---

## Variables d'environnement

### `backend/.env`

```env
APP_URL=http://127.0.0.1:8000

DB_DATABASE=ocazz
DB_USERNAME=root
DB_PASSWORD=your_password

GROQ_API_KEY=                   # console.groq.com
PREDICTION_SERVICE_URL=http://127.0.0.1:5000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback

FRONTEND_URL=http://localhost:3000
```

### `frontend/.env`

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

> Utiliser `127.0.0.1` plutôt que `localhost` évite les conflits IPv4/IPv6.

---

## Démarrage

```bash
# Terminal 1 — API Laravel
cd backend && php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — Frontend React
cd frontend && npm run dev

# Terminal 3 — Flask (estimation de prix)
cd prediction/api && source .venv/bin/activate && python app.py

# Terminal 4 — Reverb (messagerie temps réel, optionnel)
cd backend && php artisan reverb:start
```

---

## Fonctionnalités

- Marketplace avec filtres (marque, carburant, boîte, prix, kilométrage, année…)
- Dépôt d'annonce multi-étapes avec upload de photos (max 8)
- Chatbot assistant (français / darija, streaming SSE) avec flux de vente guidé
- Estimation de prix par IA (Random Forest, marché marocain)
- Messagerie privée temps réel entre acheteur et vendeur
- Authentification email/password + Google OAuth 2.0
- Panneau admin : modération des annonces et des utilisateurs

---

## Google OAuth — configuration

1. [console.cloud.google.com](https://console.cloud.google.com/) → Credentials → OAuth 2.0 Client ID
2. Authorized redirect URI : `http://127.0.0.1:8000/api/auth/google/callback`
3. Copiez Client ID et Client Secret dans `backend/.env`

---

## API — référence rapide

Base URL : `http://127.0.0.1:8000/api`

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Non | Créer un compte |
| `POST` | `/login` | Non | Connexion → `{ token, user }` |
| `POST` | `/logout` | Oui | Révoquer le token |
| `POST` | `/forgot-password` | Non | Email de reset |
| `POST` | `/reset-password` | Non | Nouveau mot de passe |
| `GET` | `/auth/google` | Non | Redirection Google OAuth |
| `GET` | `/user` | Oui | Profil connecté |
| `PUT` | `/user` | Oui | Modifier profil / mot de passe |
| `GET` | `/annonces` | Non | Liste paginée + filtres |
| `POST` | `/annonces` | Oui | Créer une annonce |
| `POST` | `/predict-price` | Non | Estimation de prix IA |
| `POST` | `/chat/stream` | Non | Chatbot (SSE) |
| `GET` | `/conversations` | Oui | Inbox messagerie |
| `GET` | `/admin/dashboard` | Admin | Statistiques admin |
