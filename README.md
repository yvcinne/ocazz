# ocazz.ma — Plateforme marocaine de vente de véhicules d'occasion

Marketplace fullstack pour l'achat et la vente de voitures d'occasion au Maroc, avec estimation de prix par IA, messagerie temps réel, chatbot Gemini et authentification Google OAuth.

---

## Table des matières

1. [Stack technique](#1-stack-technique)
2. [Architecture](#2-architecture)
3. [Structure du projet](#3-structure-du-projet)
4. [Prérequis](#4-prérequis)
5. [Installation](#5-installation)
   - [Backend Laravel](#51-backend-laravel)
   - [Frontend React](#52-frontend-react)
   - [Service de prédiction Flask](#53-service-de-prédiction-flask)
6. [Variables d'environnement](#6-variables-denvironnement)
7. [Base de données](#7-base-de-données)
8. [Démarrage](#8-démarrage)
9. [Comptes par défaut](#9-comptes-par-défaut)
10. [Fonctionnalités](#10-fonctionnalités)
11. [API — référence des endpoints](#11-api--référence-des-endpoints)
12. [Authentification](#12-authentification)
    - [Email / mot de passe](#121-email--mot-de-passe)
    - [Google OAuth 2.0](#122-google-oauth-20)
13. [Service de prédiction IA](#13-service-de-prédiction-ia)
14. [Chatbot Gemini](#14-chatbot-gemini)
15. [Déploiement](#15-déploiement)

---

## 1. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Backend API | Laravel · PHP · Sanctum · Socialite | Laravel 10, PHP 8.1+ |
| Frontend | React · Vite · React Router · shadcn/ui | React 19, Vite 8 |
| Base de données | MySQL / MariaDB | MySQL 8+ / MariaDB 10.6+ |
| Prédiction IA | Python · Flask · scikit-learn | Python 3.10+ |
| Chatbot | Google Gemini 2.0 Flash Lite (streaming SSE) | — |
| Auth sociale | Google OAuth 2.0 via Laravel Socialite | — |
| Temps réel | Laravel Reverb (WebSocket) | — |
| Styles | Tailwind CSS · CSS custom properties | Tailwind 3 |

---

## 2. Architecture

```
Browser (React SPA)
        │  REST/JSON (axios, Bearer token)
        ▼
Laravel API  (:8000)
   ├── Sanctum  — émission et validation des tokens
   ├── Socialite — flux Google OAuth 2.0
   ├── Reverb   — WebSocket pour la messagerie temps réel
   └── HTTP     — proxy vers le service Flask
        │
        ▼
Flask Prediction Service  (:5000)
   └── scikit-learn Random Forest pipeline
```

Le frontend est une SPA découplée. L'authentification repose sur des **tokens Bearer Sanctum** stockés dans `localStorage`. Il n'y a pas de session côté serveur pour le frontend — chaque requête porte son token.

---

## 3. Structure du projet

```
PP/
├── backend/                    # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php          # register, login, logout
│   │   │   │   ├── SocialAuthController.php    # Google OAuth
│   │   │   │   ├── EmailVerificationController.php
│   │   │   │   └── PasswordResetController.php
│   │   │   ├── AnnonceController.php           # annonces CRUD
│   │   │   ├── ChatController.php              # proxy Gemini (SSE)
│   │   │   ├── ConversationController.php
│   │   │   ├── FavoriteController.php
│   │   │   ├── ImageController.php
│   │   │   ├── MessageController.php
│   │   │   ├── PredictionController.php        # proxy Flask
│   │   │   ├── ReviewController.php
│   │   │   ├── UserController.php
│   │   │   └── AdminController.php
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/                         # 17 migrations
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php              # crée le compte admin
│   │       └── AnnonceSeeder.php               # importe data.csv (100 annonces)
│   ├── routes/
│   │   └── api.php
│   └── tests/
│       ├── Feature/Auth/
│       │   ├── AuthenticationTest.php
│       │   ├── EmailVerificationTest.php
│       │   ├── PasswordResetTest.php
│       │   └── RegistrationTest.php
│       └── Unit/
│
├── frontend/                   # SPA React/Vite
│   └── src/
│       ├── api/axios.js        # axiosClient avec intercepteur Bearer
│       ├── router/index.jsx    # React Router — toutes les routes
│       ├── layouts/
│       │   ├── Layout.jsx      # navbar + footer (site public)
│       │   └── AdminLayout.jsx # panneau admin
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── GoogleAuthCallback.jsx  # réceptionne le token OAuth
│       │   ├── Marketplace.jsx
│       │   ├── CarDetails.jsx
│       │   ├── SellYourCar.jsx
│       │   ├── Messages.jsx
│       │   ├── Predict.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── ResetPassword.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminAnnonces.jsx
│       │       └── AdminUsers.jsx
│       └── components/
│           ├── Formlogin.jsx
│           └── ChatWidget.jsx
│
└── prediction/                 # Service Flask
    ├── api/
    │   ├── app.py              # serveur Flask
    │   ├── generate_pipeline.py # entraînement du modèle
    │   └── requirements.txt
    ├── data/                   # données brutes (non versionné)
    └── production/             # final_pipeline.pkl (non versionné)
```

---

## 4. Prérequis

Installez les runtimes suivants avant de continuer.

| Outil | Version minimale | Vérification |
|---|---|---|
| PHP | 8.1 | `php --version` |
| Composer | 2.x | `composer --version` |
| Node.js | 18 | `node --version` |
| npm | 9 | `npm --version` |
| MySQL / MariaDB | MySQL 8 / MariaDB 10.6 | `mysql --version` |
| Python | 3.10 | `python3 --version` |

> **Windows** : utilisez [Laragon](https://laragon.org/) ou WSL2 pour disposer de PHP et MySQL facilement.  
> **macOS** : `brew install php composer node mysql python@3.11`  
> **Linux (Debian/Ubuntu)** : `apt install php8.2 php8.2-{mbstring,xml,curl,mysql,zip} composer nodejs npm mysql-server python3 python3-venv`

---

## 5. Installation

Clonez le dépôt puis suivez les étapes ci-dessous dans l'ordre.

```bash
git clone <repo-url> PP
cd PP
```

### 5.1 Backend Laravel

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configurez `backend/.env` (voir [section 6](#6-variables-denvironnement)), puis :

```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE ocazz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Lancer les migrations + seeder admin
php artisan migrate --seed

# Créer le lien symbolique pour le stockage des images
php artisan storage:link
```

### 5.2 Frontend React

```bash
cd frontend
npm install
```

Créez `frontend/.env` :

```env
VITE_BACKEND_URL=http://localhost:8000
```

### 5.3 Service de prédiction Flask

```bash
cd prediction/api
python3 -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate
pip install -r requirements.txt
```

**Entraîner le modèle ML (optionnel mais recommandé) :**

1. Placez votre fichier de données dans `prediction/data/data.csv`  
   (colonnes attendues : `marque`, `modele`, `annee`, `kilometrage`, `boite-de-vitesses`, `type-de-carburant`, `etat`, `origine`, `prix`)
2. Depuis la racine du projet :
   ```bash
   python prediction/api/generate_pipeline.py
   ```
3. Le modèle entraîné est sauvegardé dans `prediction/production/final_pipeline.pkl`

> Sans `final_pipeline.pkl`, le service retourne une erreur 503 sur `/api/predict-price`. Le reste de l'application fonctionne normalement.

---

## 6. Variables d'environnement

### backend/.env

```env
APP_NAME=ocazz
APP_ENV=local
APP_KEY=                        # généré par php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ocazz
DB_USERNAME=root
DB_PASSWORD=your_password

# Email
# En développement, les emails sont écrits dans storage/logs/laravel.log
# En production, remplacez par "smtp" + vos identifiants Resend / Mailgun
MAIL_MAILER=log
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USERNAME=resend
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@ocazz.ma
MAIL_FROM_NAME="ocazz.ma"
MAIL_PASSWORD=

# Google Gemini (chatbot)
# https://aistudio.google.com/apikey
GEMINI_API_KEY=

# Service de prédiction Flask
PREDICTION_SERVICE_URL=http://127.0.0.1:5000

# Google OAuth 2.0
# https://console.cloud.google.com/ → Credentials → OAuth 2.0 Client IDs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

### frontend/.env

```env
VITE_BACKEND_URL=http://localhost:8000
```

---

## 7. Base de données

### Schéma — tables principales

| Table | Description |
|---|---|
| `users` | Comptes utilisateurs — email/password + Google OAuth (`google_id`) |
| `annonces` | Annonces de vente (marque, modèle, prix, état, images…) |
| `images` | Photos associées aux annonces |
| `favorites` | Pivot user ↔ annonce |
| `conversations` | Fils de discussion entre deux utilisateurs |
| `messages` | Messages dans une conversation |
| `reviews` | Avis laissés sur un vendeur |
| `personal_access_tokens` | Tokens Sanctum |
| `password_reset_tokens` | Tokens de réinitialisation de mot de passe |

### Migrations dans l'ordre

```
create_users_table
create_password_reset_tokens_table
create_failed_jobs_table
create_personal_access_tokens_table
create_annonces_table
create_images_table
create_favorites_table
create_messages_table
create_reviews_table
create_conversations_table
recreate_messages_table
add_phone_to_users_table
add_last_name_to_users_table
add_role_to_users_table
fix_annonces_table_columns
add_extra_fields_to_annonces_table
add_google_id_to_users_table        ← Google OAuth
```

Toutes les migrations sont idempotentes. Pour repartir de zéro :

```bash
php artisan migrate:fresh --seed
```

### Seeders

| Seeder | Ce qu'il crée |
|---|---|
| `DatabaseSeeder` | Un compte admin (`admin@ocazz.ma` / `Admin@1234`) |
| `AnnonceSeeder` | 100 annonces depuis `database/seeders/data.csv` |

Pour peupler les annonces :

```bash
php artisan db:seed --class=AnnonceSeeder
```

---

## 8. Démarrage

Ouvrez **trois terminaux** :

```bash
# Terminal 1 — API Laravel (port 8000)
cd backend
php artisan serve

# Terminal 2 — Frontend React (port 3000)
cd frontend
npm run dev

# Terminal 3 — Service de prédiction Flask (port 5000)
cd prediction/api
source .venv/bin/activate
python app.py
```

L'application est accessible sur **http://localhost:3000**

> **Reverb (WebSocket)** — pour la messagerie temps réel, démarrez aussi :
> ```bash
> cd backend && php artisan reverb:start
> ```

---

## 9. Comptes par défaut

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@ocazz.ma | Admin@1234 |

Le compte admin donne accès au panneau `/admin` (modération des annonces et des utilisateurs).

---

## 10. Fonctionnalités

### Marketplace
- Parcourir toutes les annonces avec pagination
- Filtrer par marque, modèle, prix, carburant, kilométrage, état
- Fiche véhicule détaillée avec galerie photos (lightbox)

### Dépôt d'annonce
- Formulaire multi-étapes : informations véhicule → photos → confirmation
- Upload multiple d'images (stockage Laravel)
- Marquer une annonce comme "vendu"

### Estimation de prix IA
- Formulaire de saisie des caractéristiques du véhicule
- Prédiction via Random Forest entraîné sur le marché marocain
- Fallback heuristique si le modèle ML n'est pas disponible

### Messagerie
- Conversations privées entre acheteur et vendeur
- Badge de messages non lus en temps réel (Reverb/WebSocket)
- Marquage automatique comme lu à l'ouverture

### Chatbot
- Assistant IA propulsé par Gemini 2.0 Flash Lite
- Répond en français ou en darija selon l'utilisateur
- Réponses en streaming SSE
- Historique de conversation (20 derniers tours)

### Authentification
- Inscription / connexion par email et mot de passe
- Vérification d'email (lien signé)
- Réinitialisation de mot de passe par email
- **Connexion Google OAuth 2.0** (liaison automatique si l'email existe déjà)

### Administration
- Tableau de bord : statistiques globales
- Modération des annonces (approuver / rejeter)
- Gestion des utilisateurs (liste, suppression)

---

## 11. API — référence des endpoints

Base URL : `http://localhost:8000/api`

### Authentification (publique)

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Inscription (name, email, password, password_confirmation) |
| `POST` | `/login` | Connexion — retourne `{ token, user }` |
| `GET` | `/auth/google` | Redirection vers Google OAuth |
| `GET` | `/auth/google/callback` | Callback OAuth — redirige vers le frontend avec le token |
| `POST` | `/forgot-password` | Envoie un email de réinitialisation |
| `POST` | `/reset-password` | Réinitialise le mot de passe |
| `GET` | `/email/verify/{id}/{hash}` | Vérifie l'adresse email |

### Utilisateur (authentifié)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/user` | Profil de l'utilisateur connecté |
| `PUT` | `/user` | Mise à jour du profil |
| `DELETE` | `/user` | Suppression du compte |
| `POST` | `/logout` | Révoque le token courant |
| `POST` | `/email/verification-notification` | Renvoie l'email de vérification |

### Annonces

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/annonces` | Non | Liste paginée avec filtres |
| `GET` | `/annonces/{id}` | Non | Détail d'une annonce |
| `POST` | `/annonces` | Oui | Créer une annonce |
| `PUT` | `/annonces/{id}` | Oui | Modifier une annonce |
| `DELETE` | `/annonces/{id}` | Oui | Supprimer une annonce |
| `GET` | `/my-annonces` | Oui | Annonces de l'utilisateur connecté |
| `POST` | `/annonces/{id}/mark-sold` | Oui | Marquer comme vendu |

### Favoris, Reviews, Images

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/favorites` | Mes favoris |
| `POST` | `/favorites/toggle/{annonceId}` | Ajouter / retirer des favoris |
| `DELETE` | `/favorites/{annonceId}` | Retirer des favoris |
| `GET` | `/annonces/{id}/reviews` | Avis sur une annonce |
| `POST` | `/reviews` | Laisser un avis |
| `GET/POST/DELETE` | `/images` | Gestion des photos |

### Messagerie

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/conversations` | Liste des conversations |
| `POST` | `/conversations` | Démarrer une conversation |
| `GET` | `/conversations/{id}` | Messages d'une conversation (marque comme lu) |
| `DELETE` | `/conversations/{id}` | Supprimer une conversation |
| `GET` | `/unread-count` | Nombre total de messages non lus |
| `POST` | `/conversations/{id}/messages` | Envoyer un message |
| `POST` | `/conversations/{id}/messages/read` | Marquer tout comme lu |

### Prédiction & Chatbot

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/predict-price` | Non | Estimation de prix IA |
| `POST` | `/chat` | Non | Réponse chatbot (JSON) |
| `POST` | `/chat/stream` | Non | Réponse chatbot (SSE streaming) |

### Administration (rôle admin requis)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Statistiques globales |
| `GET` | `/admin/users` | Liste des utilisateurs |
| `DELETE` | `/admin/users/{id}` | Supprimer un utilisateur |
| `GET` | `/admin/annonces` | Toutes les annonces |
| `POST` | `/admin/annonces/{id}/approve` | Approuver une annonce |
| `POST` | `/admin/annonces/{id}/reject` | Rejeter une annonce |
| `DELETE` | `/admin/annonces/{id}` | Supprimer une annonce |

---

## 12. Authentification

### 12.1 Email / mot de passe

**Inscription :**

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"Secret1234","password_confirmation":"Secret1234"}'
```

**Connexion :**

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"Secret1234"}'
# → { "token": "...", "user": { ... } }
```

**Utiliser le token :**

```bash
curl http://localhost:8000/api/user \
  -H "Authorization: Bearer <token>"
```

Le frontend stocke le token dans `localStorage` et l'attache automatiquement à chaque requête via l'intercepteur Axios dans `src/api/axios.js`.

### 12.2 Google OAuth 2.0

#### Configuration Google Cloud

1. Ouvrez [console.cloud.google.com](https://console.cloud.google.com/)
2. Créez un projet (ou sélectionnez-en un existant)
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Type d'application : **Web application**
5. Ajoutez dans "Authorized redirect URIs" :
   ```
   http://localhost:8000/api/auth/google/callback
   ```
6. Copiez **Client ID** et **Client Secret** dans `backend/.env` :
   ```env
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
   ```

#### Flux complet

```
Utilisateur clique "Continuer avec Google"
        │
        ▼
GET /api/auth/google
        │  302 → accounts.google.com/o/oauth2/auth
        ▼
Google — l'utilisateur s'authentifie et consent
        │  302 → /api/auth/google/callback?code=...
        ▼
SocialAuthController::handleGoogleCallback()
  1. Échange le code contre un token Google (stateless)
  2. Récupère l'email et le nom Google
  3. Cherche un user par google_id OU par email
     - Trouvé + pas de google_id → met à jour google_id (liaison de compte)
     - Trouvé → connexion directe
     - Pas trouvé → crée le compte (password nullable, email_verified_at = now)
  4. Crée un token Sanctum
  5. 302 → http://localhost:3000/auth/callback?token=<sanctum_token>
        │
        ▼
GoogleAuthCallback.jsx
  1. Lit ?token= dans l'URL
  2. GET /api/user avec le token → récupère le profil
  3. Stocke token + user dans localStorage
  4. Redirige vers / (ou /admin si rôle admin)
```

---

## 13. Service de prédiction IA

Le service Flask expose deux endpoints :

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Vérification de disponibilité |
| `POST` | `/predict` | Estimation de prix |

**Paramètres de `/predict` :**

```json
{
  "marque": "Dacia",
  "modele": "Logan",
  "annee": 2019,
  "kilometrage": 85000,
  "boite-de-vitesses": "Manuelle",
  "type-de-carburant": "Diesel",
  "etat": "Bon état",
  "origine": "Importée neuve"
}
```

**Réponse :**

```json
{
  "predicted_price": 72500,
  "currency": "MAD"
}
```

Le backend Laravel contacte le service via `PredictionController` en utilisant `PREDICTION_SERVICE_URL`. Si le service est indisponible, l'API retourne une erreur 503 explicite.

**Entraîner un nouveau modèle :**

```bash
# Placer les données dans prediction/data/data.csv, puis :
python prediction/api/generate_pipeline.py
# Le modèle est sauvegardé dans prediction/production/final_pipeline.pkl
# Redémarrez Flask pour le recharger
```

---

## 14. Chatbot Gemini

Le chatbot utilise **Gemini 2.0 Flash Lite** via l'API Google AI Studio. Il répond en français ou en darija et est spécialisé dans le domaine automobile marocain.

**Endpoint streaming (SSE) depuis le frontend :**

```
POST /api/chat/stream
Content-Type: application/json

{
  "message": "Quelle est la meilleure voiture pour 80 000 DH ?",
  "history": [
    { "role": "user", "text": "Bonjour" },
    { "role": "model", "text": "Bonjour ! Comment puis-je vous aider ?" }
  ]
}
```

Le frontend consomme le stream SSE avec `EventSource` ou `fetch` en mode stream. L'historique est limité à 20 tours pour rester dans les limites de contexte.

> Obtenez une clé API sur [aistudio.google.com](https://aistudio.google.com/apikey) et renseignez `GEMINI_API_KEY` dans `backend/.env`.

---

## 15. Déploiement

### Variables à changer en production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.ocazz.ma
FRONTEND_URL=https://ocazz.ma

MAIL_MAILER=smtp          # configurer Resend ou Mailgun
SESSION_DRIVER=database   # ou redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

GOOGLE_REDIRECT_URI=https://api.ocazz.ma/api/auth/google/callback
```

N'oubliez pas de mettre à jour l'**Authorized redirect URI** dans Google Cloud Console.

### Commandes de déploiement backend

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link
```

### Build frontend

```bash
cd frontend
npm run build
# Les fichiers statiques sont dans frontend/dist/
```
