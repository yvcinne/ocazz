# ocazz.ma — Plateforme marocaine de vente de véhicules d'occasion

Marketplace fullstack pour l'achat et la vente de voitures d'occasion au Maroc, avec estimation de prix par IA, messagerie temps réel, chatbot assistant et authentification Google OAuth.

## Stack technique

| Couche | Technologie |
|---|---|
| Backend API | Laravel 10 · PHP 8.1+ · Sanctum · Socialite |
| Frontend | React 19 · Vite · shadcn/ui |
| Base de données | MySQL 8+ / MariaDB 10.6+ |
| Prédiction IA | Python 3.10+ · Flask · scikit-learn (Random Forest) |
| Chatbot | Groq — Llama 3.3 70B (streaming SSE) |
| Temps réel | Laravel Reverb (WebSocket) |

## Prérequis

PHP 8.1, Composer 2, Node.js 18, npm 9, MySQL 8, Python 3.10

## Installation

```bash
git clone <repo-url> PP && cd PP
```

**Backend Laravel**

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
mysql -u root -p -e "CREATE DATABASE ocazz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
php artisan storage:link
```

**Frontend React**

```bash
cd frontend
npm install
cp .env.example .env   # puis renseigner VITE_BACKEND_URL
```

**Service de prédiction Flask**

```bash
cd prediction/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python generate_pipeline.py   # requiert prediction/data/data.csv
```

## Variables d'environnement

`backend/.env` — clés essentielles :

```env
APP_URL=http://127.0.0.1:8000

DB_DATABASE=ocazz
DB_USERNAME=root
DB_PASSWORD=your_password

MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@ocazz.ma

GROQ_API_KEY=                   # console.groq.com
PREDICTION_SERVICE_URL=http://127.0.0.1:5000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
```

`frontend/.env` :

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

> **Note :** utiliser `127.0.0.1` plutôt que `localhost` évite les conflits IPv4/IPv6 lorsque d'autres serveurs tournent sur le même port.

## Démarrage

```bash
# Terminal 1 — API Laravel
cd backend && php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — Frontend React
cd frontend && npm run dev

# Terminal 3 — Flask (optionnel, pour la prédiction de prix)
cd prediction/api && source .venv/bin/activate && python app.py

# Terminal 4 — Reverb (optionnel, pour la messagerie temps réel)
cd backend && php artisan reverb:start
```

## Comptes par défaut

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@ocazz.ma | Admin@1234 |

## Fonctionnalités

- Marketplace avec filtres (marque, carburant, boîte, prix, kilométrage, année…)
- Dépôt d'annonce multi-étapes avec upload de photos (max 8)
- Chatbot assistant (français / darija, streaming SSE) avec flux de vente guidé
- Estimation de prix par IA (Random Forest, marché marocain)
- Messagerie privée temps réel entre acheteur et vendeur
- Auth email/password + Google OAuth 2.0
- Panneau admin : modération des annonces et des utilisateurs

## Structure du projet

```
PP/
├── backend/                        # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AnnonceController.php     # CRUD annonces + upload images
│   │   │   │   ├── ChatController.php        # Chatbot SSE (Groq / Llama)
│   │   │   │   ├── AdminController.php       # Modération admin
│   │   │   │   ├── ConversationController.php
│   │   │   │   ├── MessageController.php     # Messagerie temps réel
│   │   │   │   ├── FavoriteController.php
│   │   │   │   ├── ReviewController.php
│   │   │   │   ├── PredictionController.php  # Proxy vers Flask
│   │   │   │   ├── UserController.php
│   │   │   │   └── Api/
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── SocialAuthController.php   # Google OAuth
│   │   │   │       └── PasswordResetController.php
│   │   │   └── Middleware/
│   │   │       └── AdminMiddleware.php
│   │   ├── Models/
│   │   │   ├── Annonce.php
│   │   │   ├── ChatbotSession.php   # Historique conversations chatbot
│   │   │   ├── Conversation.php
│   │   │   ├── Image.php
│   │   │   ├── Message.php
│   │   │   ├── Favorite.php
│   │   │   ├── Review.php
│   │   │   └── User.php
│   │   └── Events/
│   │       └── MessageSent.php      # Broadcast WebSocket
│   ├── config/
│   │   └── cors.php                 # CORS : autorise tous les ports localhost
│   ├── database/
│   │   └── migrations/              # 15 migrations
│   └── routes/
│       ├── api.php
│       └── channels.php             # WebSocket channels
│
├── frontend/                        # SPA React + Vite
│   └── src/
│       ├── api/
│       │   └── axios.js             # Instance Axios avec token Bearer
│       ├── components/
│       │   ├── ChatWidget.jsx       # Chatbot flottant (SSE, flux vente)
│       │   └── Formlogin.jsx
│       ├── layouts/
│       │   ├── Layout.jsx           # Navbar, footer, routes publiques
│       │   └── AdminLayout.jsx
│       ├── pages/
│       │   ├── Acceuil.jsx          # Homepage + recherche + marques
│       │   ├── Marketplace.jsx      # Listings avec filtres + pagination
│       │   ├── CarDetails.jsx       # Fiche véhicule + messagerie
│       │   ├── SellYourCar.jsx      # Formulaire dépôt annonce (2 étapes)
│       │   ├── Predict.jsx          # Estimation de prix IA
│       │   ├── Messages.jsx         # Messagerie temps réel
│       │   ├── UserDashboard.jsx    # Profil + annonces utilisateur
│       │   ├── Login.jsx / Register.jsx
│       │   ├── GoogleAuthCallback.jsx / GoogleAuthComplete.jsx
│       │   ├── ForgotPassword.jsx / ResetPassword.jsx
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AdminAnnonces.jsx
│       │   │   └── AdminUsers.jsx
│       │   └── static/              # Pages CGU, FAQ, Contact…
│       └── router/
│           └── index.jsx            # React Router v6
│
└── prediction/                      # Service IA Python
    ├── api/
    │   ├── app.py                   # API Flask (endpoint /predict)
    │   ├── generate_pipeline.py     # Entraînement et export du modèle
    │   └── requirements.txt
    ├── data/                        # Dataset marché marocain (gitignored)
    ├── models/                      # Notebooks comparaison modèles
    ├── preparing/                   # Notebooks nettoyage / exploration
    └── multiple_scrapers/           # Scrapers Avito / Kifal
```

## Google OAuth — configuration

1. [console.cloud.google.com](https://console.cloud.google.com/) → Credentials → OAuth 2.0 Client ID
2. Authorized redirect URI : `http://127.0.0.1:8000/api/auth/google/callback`
3. Copiez Client ID et Client Secret dans `backend/.env`
