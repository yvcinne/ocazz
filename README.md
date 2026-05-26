# ocazz.ma — Plateforme marocaine de vente de véhicules d'occasion

Marketplace fullstack pour l'achat et la vente de voitures d'occasion au Maroc, avec estimation de prix par IA, messagerie temps réel, chatbot Gemini et authentification Google OAuth.

## Stack technique

| Couche | Technologie |
|---|---|
| Backend API | Laravel 10 · PHP 8.1+ · Sanctum · Socialite |
| Frontend | React 19 · Vite · shadcn/ui |
| Base de données | MySQL 8+ / MariaDB 10.6+ |
| Prédiction IA | Python 3.10+ · Flask · scikit-learn |
| Chatbot | Google Gemini 2.0 Flash Lite (SSE) |
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
# Créer frontend/.env avec : VITE_BACKEND_URL=http://localhost:8000
```

**Service de prédiction Flask**

```bash
cd prediction/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Entraîner le modèle (optionnel) :
python generate_pipeline.py   # requiert prediction/data/data.csv
```

## Variables d'environnement

`backend/.env` — clés essentielles :

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_DATABASE=ocazz
DB_USERNAME=root
DB_PASSWORD=your_password

MAIL_MAILER=log                 # remplacer par smtp en production
MAIL_FROM_ADDRESS=noreply@ocazz.ma

GEMINI_API_KEY=                 # aistudio.google.com/apikey
PREDICTION_SERVICE_URL=http://127.0.0.1:5000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

`frontend/.env` :

```env
VITE_BACKEND_URL=http://localhost:8000
```

## Démarrage

```bash
# Terminal 1 — API Laravel
cd backend && php artisan serve

# Terminal 2 — Frontend React
cd frontend && npm run dev

# Terminal 3 — Flask (optionnel, pour la prédiction de prix)
cd prediction/api && source .venv/bin/activate && python app.py

# Terminal 4 — Reverb (optionnel, pour la messagerie temps réel)
cd backend && php artisan reverb:start
```

Application disponible sur **http://localhost:3000**

## Comptes par défaut

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@ocazz.ma | Admin@1234 |

## Fonctionnalités

- Marketplace avec filtres (marque, prix, carburant, kilométrage…)
- Dépôt d'annonce multi-étapes avec upload de photos
- Estimation de prix par IA (Random Forest, marché marocain)
- Messagerie privée temps réel entre acheteur et vendeur
- Chatbot Gemini (français / darija, streaming SSE)
- Auth email/password + Google OAuth 2.0
- Panneau admin : modération des annonces et des utilisateurs

## Google OAuth — configuration

1. [console.cloud.google.com](https://console.cloud.google.com/) → Credentials → OAuth 2.0 Client ID
2. Authorized redirect URI : `http://localhost:8000/api/auth/google/callback`
3. Copiez Client ID et Client Secret dans `backend/.env`
