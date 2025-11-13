#!/usr/bin/env python3
"""
Extractor finale - basato sulla struttura reale del PDF.
Pattern: Aufgabe N -> Domanda (multiriga) -> 4 opzioni -> Aufgabe N+1
"""

import json
import re
from pathlib import Path
import pdfplumber

OUTPUT_DIR = Path(__file__).parent
PDF_PATH = OUTPUT_DIR / "gesamtfragenkatalog.pdf"
JSON_OUTPUT = OUTPUT_DIR / "questions.json"


def extract_questions():
    """Estrae domande usando pattern corretto."""
    print("📖 Estrazione domande dal PDF...\n")

    all_text = ""
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"   Pagine totali: {len(pdf.pages)}")
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                all_text += text + "\n"

    # Split per "Aufgabe" per ottenere blocchi
    # Ogni blocco contiene: numero, domanda, 4 opzioni
    aufgabe_pattern = r'Aufgabe\s+(\d+)'
    splits = re.split(aufgabe_pattern, all_text)

    questions = []

    # Processa coppie (numero, contenuto)
    for i in range(1, len(splits), 2):
        if i + 1 >= len(splits):
            break

        q_num = int(splits[i])
        content = splits[i + 1]

        # Pulisci il contenuto
        lines = [l.strip() for l in content.split('\n') if l.strip()]

        # Rimuovi linee "Seite X von Y"
        lines = [l for l in lines if not re.match(r'Seite \d+ von \d+', l)]

        # Se non ci sono abbastanza linee, skip
        if len(lines) < 5:
            continue

        # Le ultime 4 linee sono le opzioni
        # Tutto prima è la domanda
        options = lines[-4:]
        question_parts = lines[:-4]

        # Unisci la domanda
        question_text = ' '.join(question_parts)

        # Pulisci opzioni (rimuovi spazio iniziale se presente)
        options = [opt.lstrip('· ').strip() for opt in options]

        # Verifica che abbiamo 4 opzioni valide
        if len(options) != 4 or any(len(opt) == 0 for opt in options):
            continue

        # Filtra per ID <= 310 (300 generali + 10 Sachsen)
        if q_num <= 310:
            questions.append({
                'id': q_num,
                'question': question_text,
                'options': options,
                'correct': 0  # Placeholder
            })

        if len(questions) % 50 == 0 and len(questions) > 0:
            print(f"   Estratte {len(questions)} domande...")

    print(f"✅ Estratte {len(questions)} domande")
    return sorted(questions, key=lambda x: x['id'])


def save_json(questions):
    """Salva questions in JSON."""
    print(f"\n📝 Salvataggio JSON...")

    with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"✅ Salvato: {JSON_OUTPUT}")
    print(f"   Domande: {len(questions)}")


def main():
    print("=" * 60)
    print("🇩🇪 EXTRACTOR FINALE - EINBÜRGERUNGSTEST")
    print("=" * 60 + "\n")

    if not PDF_PATH.exists():
        print(f"❌ PDF non trovato: {PDF_PATH}")
        return

    questions = extract_questions()

    if len(questions) < 100:
        print(f"\n⚠️  Attenzione: solo {len(questions)} domande estratte")
        print("   Previste: 300-310")

    # Mostra sample
    print("\n" + "=" * 60)
    print("SAMPLE - Prime 2 domande:")
    print("=" * 60)
    for q in questions[:2]:
        print(f"\n{q['id']}. {q['question']}")
        for i, opt in enumerate(q['options']):
            print(f"   {chr(65+i)}) {opt}")

    save_json(questions)

    print("\n" + "=" * 60)
    print("✅ COMPLETATO!")
    print("=" * 60)
    print(f"\n⚠️  NOTA: Le risposte corrette sono impostate a 0 (A) come placeholder.")
    print(f"   Sarà necessario integrarle manualmente o da altra fonte.")
    print(f"\n💡 Prossimo passo: aprire index.html e importare questions.json")


if __name__ == "__main__":
    main()
