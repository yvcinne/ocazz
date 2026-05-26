from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

pipeline = joblib.load("production/final_pipeline.pkl")


class CarInput(BaseModel):
    etat: str
    boite_de_vitesses: str
    type_de_carburant: str
    marque: str
    modele: str
    origine: str
    kilometrage: int
    age: int
    puissance_fiscale: int
    annee_modele: str


@app.get("/")
def home():
    return {"status": "API running"}


@app.post("/predict")
def predict(data: CarInput):

    df = pd.DataFrame([{
        "etat": data.etat,
        "boite-de-vitesses": data.boite_de_vitesses,
        "type-de-carburant": data.type_de_carburant,
        "marque": data.marque,
        "modele": data.modele,
        "origine": data.origine,
        "kilometrage": data.kilometrage,
        "age": data.age,
        "puissance-fiscale": data.puissance_fiscale,
        "annee-modele": data.annee_modele
    }])

    prediction = pipeline.predict(df)[0]

    return {
        "price": float(prediction)
    }