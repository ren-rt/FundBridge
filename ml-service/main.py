from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import joblib
import numpy as np
from numpy.linalg import norm
from sentence_transformers import SentenceTransformer

app = FastAPI()

model = joblib.load("model/fundbridge_model.pkl")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

FEATURES = ['stage_match', 'industry_match', 'geo_match', 'ticket_compat', 'nlp_sim']

class Founder(BaseModel):
    id: str
    stage: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    funding_amount: Optional[float] = None
    description: Optional[str] = ""

class Investor(BaseModel):
    id: str
    name: Optional[str] = ""
    firm_name: Optional[str] = ""
    primary_domain: Optional[str] = None
    secondary_domains: List[str] = []
    stage_pref: List[str] = []
    region: Optional[str] = None
    ticket_min: Optional[float] = 0
    ticket_max: Optional[float] = 0
    investment_thesis: Optional[str] = ""

class MatchRequest(BaseModel):
    founder: Founder
    investors: List[Investor]

def cosine_sim(a, b):
    return float(np.dot(a, b) / (norm(a) * norm(b) + 1e-8))

def compute_features(founder: Founder, investor: Investor):
    stage_match = 1 if founder.stage in investor.stage_pref else 0

    investor_domains = [investor.primary_domain] + investor.secondary_domains
    industry_match = 1 if founder.industry in investor_domains else 0

    geo_match = 1 if founder.region == investor.region else 0

    amount = founder.funding_amount
    lo, hi = investor.ticket_min or 0, investor.ticket_max or 0
    if amount is None or hi == 0:
        ticket_compat = 0.5
    elif lo <= amount <= hi:
        ticket_compat = 1.0
    else:
        dist = min(abs(amount - lo), abs(amount - hi))
        ticket_compat = max(0.0, 1.0 - dist / max(hi, 1))

    return {
        'stage_match': stage_match,
        'industry_match': industry_match,
        'geo_match': geo_match,
        'ticket_compat': round(float(ticket_compat), 3),
    }

def explain_tags(features, nlp_score):
    tags = []
    if features['stage_match'] == 1: tags.append('stage_alignment')
    if features['industry_match'] == 1: tags.append('industry_alignment')
    if features['geo_match'] == 1: tags.append('geography_match')
    if features['ticket_compat'] >= 0.7: tags.append('funding_range_fit')
    if nlp_score >= 0.5: tags.append('thesis_similarity')
    return tags

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/match")
def match(req: MatchRequest):
    founder_embedding = embedder.encode([req.founder.description or ""])[0]

    results = []
    for investor in req.investors:
        investor_embedding = embedder.encode([investor.investment_thesis or ""])[0]
        nlp_sim = cosine_sim(founder_embedding, investor_embedding)

        feats = compute_features(req.founder, investor)
        feat_vector = [[feats['stage_match'], feats['industry_match'], feats['geo_match'], feats['ticket_compat'], nlp_sim]]
        score = model.predict_proba(feat_vector)[0][1]
        tags = explain_tags(feats, nlp_sim)

        results.append({
            "investor_id": investor.id,
            "firm_name": investor.firm_name,
            "match_score": round(float(score), 3),
            "nlp_sim": round(nlp_sim, 3),
            "explanation_tags": tags,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return {"matches": results}