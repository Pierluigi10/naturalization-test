#!/usr/bin/env python3
"""Pulisce e filtra il JSON estratto."""

import json
from pathlib import Path

INPUT_FILE = Path(__file__).parent / "questions.json"
OUTPUT_FILE = Path(__file__).parent / "questions_clean.json"


def clean_questions():
    """Pulisce e filtra le domande."""
    print("🧹 Pulizia domande...\n")

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"   Domande totali: {len(questions)}")

    # Rimuovi duplicati mantenendo solo la prima occorrenza di ogni ID
    seen_ids = set()
    unique_questions = []
    for q in questions:
        if q['id'] not in seen_ids:
            seen_ids.add(q['id'])
            unique_questions.append(q)

    print(f"   Dopo rimozione duplicati: {len(unique_questions)}")

    # Pulisci opzioni (rimuovi TUTTI i caratteri bianchi iniziali including special chars)
    for q in unique_questions:
        cleaned_options = []
        for opt in q['options']:
            # Rimuovi tutti i caratteri bianchi e speciali iniziali (incluso bullet point \uf0a3)
            cleaned = opt.lstrip(' \t\n\r\u00a0\u200b·□\uf0a3')
            cleaned_options.append(cleaned)
        q['options'] = cleaned_options

    # Filtra domande con opzioni invalide
    valid_questions = []
    for q in unique_questions:
        # Skip se meno di 4 opzioni o opzioni vuote
        if len(q['options']) != 4:
            continue

        # Skip se ci sono opzioni che sembrano essere headers/footer
        invalid_opt = False
        for opt in q['options']:
            if any(x in opt for x in ['Teil II', 'Teil III', 'Bundesland', 'Fragen für']):
                invalid_opt = True
                break

        if not invalid_opt and all(len(opt) > 0 for opt in q['options']):
            valid_questions.append(q)

    print(f"   Dopo validazione: {len(valid_questions)}")

    # Prendi solo le prime 300 domande (generali)
    general_questions = [q for q in valid_questions if q['id'] <= 300]

    print(f"   Domande generali (1-300): {len(general_questions)}")

    # TODO: Trovare le 10 domande per Sachsen
    # Per ora usiamo solo le 300 generali

    # Salva
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(general_questions, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Salvato: {OUTPUT_FILE}")
    print(f"   Totale domande: {len(general_questions)}")

    # Sample
    print("\n" + "=" * 60)
    print("SAMPLE - Prima domanda pulita:")
    print("=" * 60)
    q = general_questions[0]
    print(f"\n{q['id']}. {q['question']}")
    for i, opt in enumerate(q['options']):
        print(f"   {chr(65+i)}) {opt}")


if __name__ == "__main__":
    clean_questions()
