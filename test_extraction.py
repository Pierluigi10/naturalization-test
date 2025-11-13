#!/usr/bin/env python3
"""Script di test per verificare l'estrazione di alcune domande."""

import json
import re
from pathlib import Path
import pdfplumber

PDF_PATH = Path(__file__).parent / "gesamtfragenkatalog.pdf"


def test_extract():
    """Test estrazione prime domande."""
    print("📖 Test estrazione PDF...\n")

    questions = {}
    current_question_num = None
    current_question_text = []
    current_options = []

    with pdfplumber.open(PDF_PATH) as pdf:
        # Solo prime 5 pagine per test
        for page_num in range(min(5, len(pdf.pages))):
            page = pdf.pages[page_num]
            text = page.extract_text()
            if not text:
                continue

            lines = text.split('\n')

            for line in lines:
                # Rileva inizio nuova domanda
                aufgabe_match = re.match(r'^Aufgabe\s+(\d+)\s*$', line.strip())

                if aufgabe_match:
                    # Salva domanda precedente se completa
                    if current_question_num and current_question_text and len(current_options) == 4:
                        q_text = ' '.join(current_question_text).strip()
                        questions[current_question_num] = {
                            'id': current_question_num,
                            'question': q_text,
                            'options': current_options[:],
                        }
                        print(f"✓ Domanda {current_question_num}: {q_text[:60]}...")
                        print(f"  Opzioni: {len(current_options)}")

                    # Nuova domanda
                    current_question_num = int(aufgabe_match.group(1))
                    current_question_text = []
                    current_options = []
                    continue

                # Skip linee vuote/pagina
                if not line.strip() or line.strip().startswith('Seite '):
                    continue

                # Se c'è domanda attiva
                if current_question_num:
                    # Le opzioni sono indentate (iniziano con spazi)
                    if line.startswith(' ') and len(current_options) < 4:
                        option_text = line.strip()
                        if len(option_text) > 0 and not option_text.startswith('©'):
                            current_options.append(option_text)
                            if len(current_options) <= 4:
                                print(f"    [{chr(64+len(current_options))}] {option_text[:50]}")
                    else:
                        # Parte della domanda
                        if len(current_options) == 0:
                            current_question_text.append(line.strip())

    print(f"\n✅ Totale estratte: {len(questions)} domande")

    # Mostra dettaglio prime 3
    print("\n" + "="*60)
    print("DETTAGLIO PRIME 3 DOMANDE:")
    print("="*60)
    for q_id in sorted(questions.keys())[:3]:
        q = questions[q_id]
        print(f"\nDomanda {q['id']}:")
        print(f"  Testo: {q['question']}")
        print(f"  Opzioni:")
        for i, opt in enumerate(q['options']):
            print(f"    {chr(65+i)}) {opt}")


if __name__ == "__main__":
    test_extract()
