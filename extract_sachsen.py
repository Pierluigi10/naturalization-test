#!/usr/bin/env python3
"""Estrae le 10 domande per Sachsen dal PDF."""

import json
import re
from pathlib import Path
import pdfplumber

PDF_PATH = Path(__file__).parent / "gesamtfragenkatalog.pdf"
JSON_FILE = Path(__file__).parent / "questions.json"

def extract_sachsen_questions():
    """Estrae le domande per Sachsen."""
    print("📖 Estrazione domande Sachsen...\n")

    with pdfplumber.open(PDF_PATH) as pdf:
        full_text = ""
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"

        # Trova la sezione Sachsen
        sachsen_start = full_text.find("Fragen für das Bundesland Sachsen\nAufgabe 1")
        sachsen_end = full_text.find("Fragen für das Bundesland Sachsen-Anhalt")

        if sachsen_start == -1 or sachsen_end == -1:
            print("❌ Sezione Sachsen non trovata")
            return []

        sachsen_text = full_text[sachsen_start:sachsen_end]

        # Split per Aufgabe
        aufgabe_pattern = r'Aufgabe\s+(\d+)'
        splits = re.split(aufgabe_pattern, sachsen_text)

        sachsen_questions = []

        # Processa coppie (numero, contenuto)
        for i in range(1, len(splits), 2):
            if i + 1 >= len(splits):
                break

            q_num = int(splits[i])
            content = splits[i + 1]

            # Pulisci
            lines = [l.strip() for l in content.split('\n') if l.strip()]
            lines = [l for l in lines if not re.match(r'Seite \d+ von \d+', l)]

            # Ultime 4 linee sono le opzioni
            if len(lines) < 5:
                continue

            options = lines[-4:]
            question_parts = lines[:-4]
            question_text = ' '.join(question_parts)

            # Pulisci opzioni
            options = [opt.lstrip(' \t\n\r\u00a0\u200b·□\uf0a3').strip() for opt in options]

            if len(options) == 4 and all(len(opt) > 0 for opt in options):
                # ID per domande Sachsen: 301-310
                sachsen_questions.append({
                    'id': 300 + q_num,
                    'question': question_text,
                    'options': options,
                    'correct': 0,  # placeholder
                    'bundesland': 'Sachsen'
                })

                print(f"  ✅ Domanda {300 + q_num}: {question_text[:60]}...")

        print(f"\n✅ Estratte {len(sachsen_questions)} domande per Sachsen")
        return sachsen_questions


def add_sachsen_to_json():
    """Aggiunge le domande Sachsen al JSON."""
    print("\n➕ Aggiunta al JSON...\n")

    # Carica JSON
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Domande iniziali: {len(questions)}")

    # Estrai domande Sachsen
    sachsen_questions = extract_sachsen_questions()

    if not sachsen_questions:
        print("❌ Nessuna domanda estratta")
        return

    # Rimuovi eventuali domande Sachsen esistenti (301-310)
    questions = [q for q in questions if q['id'] < 301]

    # Aggiungi nuove domande Sachsen
    questions.extend(sachsen_questions)

    # Ordina
    questions.sort(key=lambda x: x['id'])

    # Salva
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"✅ Domande finali: {len(questions)}")
    print(f"✅ Salvato: {JSON_FILE}")

    # Riepilogo
    print(f"\n📊 RIEPILOGO:")
    print(f"   Domande generali (1-300): {len([q for q in questions if q['id'] <= 300])}")
    print(f"   Domande Sachsen (301-310): {len([q for q in questions if q['id'] > 300])}")


if __name__ == "__main__":
    add_sachsen_to_json()
