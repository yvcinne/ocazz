from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
from datetime import datetime
from sklearn.base import BaseEstimator, TransformerMixin


class DataTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, columns_to_drop):
        self.columns_to_drop = columns_to_drop

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X.drop(self.columns_to_drop, axis=1, errors='ignore', inplace=True)
        return X

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:8000'])

# ── Load the trained pipeline once at startup ──────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
PIPELINE_PATH = os.path.join(BASE_DIR, '..', 'production', 'final_pipeline.pkl')

pipeline = None
if os.path.isfile(PIPELINE_PATH):
    pipeline = joblib.load(PIPELINE_PATH)
    print(f"[OK] Pipeline loaded from {PIPELINE_PATH}")
else:
    print(
        f"[WARN] Pipeline not found at {PIPELINE_PATH}\n"
        "   Run  python prediction/api/generate_pipeline.py  (after placing data.csv)\n"
        "   to train and export the model. The /predict endpoint will return 503 until then."
    )


# ── Health check ───────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': pipeline is not None,
    })


# ── Heuristic fallback (used when ML pipeline is not loaded) ──────────────────
# Base = realistic "new equivalent" price on the Moroccan market in MAD
BRAND_BASE = {
    'dacia': 160000, 'renault': 190000, 'peugeot': 200000, 'citroën': 185000,
    'fiat': 160000, 'ford': 210000, 'volkswagen': 270000, 'opel': 175000,
    'seat': 200000, 'skoda': 220000, 'audi': 450000, 'bmw': 500000,
    'mercedes': 550000, 'toyota': 280000, 'hyundai': 200000, 'kia': 195000,
    'honda': 230000, 'nissan': 220000, 'land rover': 800000, 'volvo': 420000,
}

CONDITION_MULT = {
    'neuf': 1.00, 'excellent': 0.92, 'très bon': 0.82,
    'bon': 0.72, 'correct': 0.60, 'endommagé': 0.35, 'pour pièces': 0.12,
}

def heuristic_price(data: dict) -> float:
    brand  = str(data.get('marque', '')).lower().strip()
    base   = BRAND_BASE.get(brand, 200000)

    age    = max(0, datetime.now().year - int(data.get('annee', datetime.now().year - 5)))

    # Moroccan market depreciates ~8 % / year (gentler than Europe — import taxes keep values high)
    price  = base * (0.92 ** age)

    # Mileage vs expected (15 000 km/year average): ±0.25 MAD/km difference
    km          = int(data.get('kilometrage', 0))
    expected_km = age * 15000
    price      += (expected_km - km) * 0.25   # under-average km → bonus, over → penalty
    price       = max(price, base * 0.12)      # floor at 12 % of base

    # Condition multiplier
    cond   = str(data.get('etat', 'Bon')).lower().strip()
    price *= CONDITION_MULT.get(cond, 0.72)

    # Fuel type
    fuel = str(data.get('type-de-carburant', '')).lower()
    if fuel == 'diesel':      price *= 1.07
    elif fuel == 'hybride':   price *= 1.12
    elif fuel == 'electrique': price *= 1.25

    # Transmission
    if str(data.get('boite-de-vitesses', '')).lower() == 'automatique':
        price *= 1.10

    # Origine
    origine = str(data.get('origine', '')).lower()
    if 'import' in origine:  price *= 1.14
    elif 'douané' in origine: price *= 0.90

    # Fiscal power: +2 % per CV above 6
    cv     = int(data.get('puissance-fiscale', 6))
    price *= 1 + max(0, cv - 6) * 0.02

    return max(price, 8000.0)


# ── Prediction endpoint ────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)

    required_fields = ['marque', 'modele', 'annee', 'kilometrage', 'etat',
                       'boite-de-vitesses', 'type-de-carburant']
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({'error': f'Champs obligatoires manquants : {", ".join(missing)}'}), 400

    try:
        annee = int(data.get('annee'))
    except (ValueError, TypeError):
        return jsonify({'error': 'Valeur invalide pour annee'}), 400

    age = datetime.now().year - annee

    # Build the DataFrame with the exact column names the pipeline expects
    try:
        df = pd.DataFrame([{
            'etat':              str(data.get('etat', 'Bon')),
            'boite-de-vitesses': str(data.get('boite-de-vitesses', 'Manuelle')),
            'type-de-carburant': str(data.get('type-de-carburant', 'Essence')),
            'marque':            str(data.get('marque', '')),
            'modele':            str(data.get('modele', '')),
            'origine':           str(data.get('origine', 'WW au Maroc')),
            'kilometrage':       int(data.get('kilometrage', 0)),
            'age':               age,
            'puissance-fiscale': int(data.get('puissance-fiscale', 5)),
            # Columns the pipeline drops internally — must still be present
            'annee-modele':      str(annee),
            'titre':             '',
            'localisation':      '',
        }])
    except (ValueError, TypeError) as e:
        return jsonify({'error': f'Données invalides : {e}'}), 400

    try:
        if pipeline is not None:
            raw_price = float(pipeline.predict(df)[0])
        else:
            raw_price = heuristic_price(data)
    except Exception as e:
        return jsonify({'error': f'Erreur de prédiction : {e}'}), 500

    if raw_price <= 0:
        return jsonify({'error': 'Prédiction invalide : prix négatif ou nul'}), 500

    # Round to nearest 500 MAD for cleaner display
    mid  = round(raw_price / 500) * 500
    low  = round(raw_price * 0.90 / 500) * 500
    high = round(raw_price * 1.10 / 500) * 500

    return jsonify({
        'success': True,
        'price':   mid,
        'min':     low,
        'max':     high,
    })


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
