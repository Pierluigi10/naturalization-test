#!/usr/bin/env python3
"""Aggiunge manualmente le 7 domande mancanti."""

import json
from pathlib import Path

JSON_FILE = Path(__file__).parent / "questions.json"

# Domande mancanti estratte manualmente dal PDF
MISSING_QUESTIONS = [
    {
        "id": 23,
        "question": "In Deutschland sind die meisten Erwerbstätigen …",
        "options": [
            "in kleinen Familienunternehmen beschäftigt.",
            "ehrenamtlich für ein Bundesland tätig.",
            "selbstständig mit einer eigenen Firma tätig.",
            "bei einer Firma oder Behörde beschäftigt."
        ],
        "correct": 0
    },
    {
        "id": 57,
        "question": "Wer wird meistens zur Präsidentin/zum Präsidenten des Deutschen Bundestages gewählt?",
        "options": [
            "die/der älteste Abgeordnete im Parlament",
            "die Ministerpräsidentin/der Ministerpräsident des größten Bundeslandes",
            "eine ehemalige Bundeskanzlerin/ein ehemaliger Bundeskanzler",
            "eine Abgeordnete/ein Abgeordneter der stärksten Fraktion"
        ],
        "correct": 0
    },
    {
        "id": 66,
        "question": "Welche Städte haben die größten jüdischen Gemeinden in Deutschland?",
        "options": [
            "Berlin und München",
            "Hamburg und Essen",
            "Nürnberg und Stuttgart",
            "Worms und Speyer"
        ],
        "correct": 0
    },
    {
        "id": 91,
        "question": "In Deutschland kann ein Regierungswechsel in einem Bundesland Auswirkungen auf die Bundespolitik haben. Das Regieren wird …",
        "options": [
            "schwieriger, wenn sich dadurch die Mehrheit im Bundestag ändert.",
            "leichter, wenn dadurch neue Parteien in den Bundesrat kommen.",
            "schwieriger, wenn dadurch die Mehrheit im Bundesrat verändert wird.",
            "leichter, wenn es sich um ein reiches Bundesland handelt."
        ],
        "correct": 0
    },
    {
        "id": 118,
        "question": "Wer darf bei den rund 40 jüdischen Makkabi-Sportvereinen Mitglied werden?",
        "options": [
            "nur Deutsche",
            "nur Israelis",
            "nur religiöse Menschen",
            "alle Menschen"
        ],
        "correct": 0
    },
    {
        "id": 129,
        "question": "Vom Volk gewählt wird in Deutschland …",
        "options": [
            "die Bundeskanzlerin/der Bundeskanzler.",
            "die Ministerpräsidentin/der Ministerpräsident eines Bundeslandes.",
            "der Bundestag.",
            "die Bundespräsidentin/der Bundespräsident."
        ],
        "correct": 0
    },
    {
        "id": 300,
        "question": "Aus welchem Land kamen die ersten Gastarbeiterinnen und Gastarbeiter in die Bundesrepublik Deutschland?",
        "options": [
            "Italien",
            "Spanien",
            "Portugal",
            "Türkei"
        ],
        "correct": 0
    }
]

def add_missing():
    """Aggiunge le domande mancanti al JSON."""
    print("➕ Aggiunta domande mancanti...\n")

    # Carica JSON esistente
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Domande iniziali: {len(questions)}")

    # Aggiungi domande mancanti
    for missing_q in MISSING_QUESTIONS:
        # Verifica che non esista già
        if not any(q['id'] == missing_q['id'] for q in questions):
            questions.append(missing_q)
            print(f"  ✅ Aggiunta domanda {missing_q['id']}")

    # Ordina per ID
    questions.sort(key=lambda x: x['id'])

    # Salva
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Domande finali: {len(questions)}")
    print(f"✅ Salvato: {JSON_FILE}")

    # Verifica che ora ci siano tutte
    present_ids = set(q['id'] for q in questions)
    expected_ids = set(range(1, 301))
    still_missing = sorted(expected_ids - present_ids)

    if still_missing:
        print(f"\n⚠️  Ancora mancanti: {still_missing}")
    else:
        print(f"\n🎉 Tutte le 300 domande presenti!")

if __name__ == "__main__":
    add_missing()
