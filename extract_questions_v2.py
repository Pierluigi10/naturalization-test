#!/usr/bin/env python3
"""
Script aggiornato per estrarre domande dal PDF BAMF.
Versione 2 - basata sulla struttura reale del PDF.
"""

import json
import os
import re
import requests
from pathlib import Path
import pdfplumber

# Directory per output
OUTPUT_DIR = Path(__file__).parent
IMAGES_DIR = OUTPUT_DIR / "images"
PDF_PATH = OUTPUT_DIR / "gesamtfragenkatalog.pdf"
JSON_OUTPUT = OUTPUT_DIR / "questions.json"

# URL base per le immagini
IMAGE_BASE_URL = "https://www.einbuergerungstest-online.eu/img/fragen/"

# Domande note che contengono immagini (da documentazione)
# Questo elenco va completato con tutte le domande che hanno immagini
IMAGE_QUESTIONS = list(range(21, 61))  # Esempio: domande 21-60 potrebbero avere immagini


def extract_questions_from_pdf():
    """Estrae domande dal PDF usando il formato reale."""
    print(f"\n📖 Parsing PDF...")

    if not PDF_PATH.exists():
        print(f"❌ PDF non trovato: {PDF_PATH}")
        return []

    questions = []

    try:
        with pdfplumber.open(PDF_PATH) as pdf:
            full_text = ""

            # Estrai tutto il testo
            print(f"   Estrazione testo da {len(pdf.pages)} pagine...")
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
                if page_num % 20 == 0:
                    print(f"   Processate {page_num}/{len(pdf.pages)} pagine...")

            # Pattern aggiornato per il formato reale:
            # Aufgabe NUM
            # Testo domanda (può essere multiriga)
            # □ Opzione 1
            # □ Opzione 2
            # □ Opzione 3
            # □ Opzione 4

            # Regex per catturare le domande
            # Il pattern cerca "Aufgabe" seguito da numero, poi il testo fino alle opzioni
            pattern = r'Aufgabe\s+(\d+)\s*\n(.+?)(?=\n\s*[□])'
            matches = re.finditer(pattern, full_text, re.DOTALL)

            questions_dict = {}

            for match in matches:
                q_num = int(match.group(1))
                q_text = match.group(2).strip()

                # Rimuovi newline extra nel testo della domanda
                q_text = ' '.join(q_text.split())

                questions_dict[q_num] = {
                    'id': q_num,
                    'question': q_text,
                    'options': [],
                    'has_image': q_num in IMAGE_QUESTIONS
                }

            print(f"✅ Identificate {len(questions_dict)} domande")

            # Ora estrai le opzioni per ogni domanda
            print(f"   Estrazione opzioni...")

            # Pattern per le opzioni (linee che iniziano con □ o )
            for q_num in sorted(questions_dict.keys()):
                # Cerca il blocco di testo per questa domanda
                pattern_options = rf'Aufgabe\s+{q_num}\s*\n.+?\n((?:\s*[□].+?\n?){{4}})'

                match = re.search(pattern_options, full_text, re.DOTALL)

                if match:
                    options_text = match.group(1)

                    # Estrai le 4 opzioni
                    options = re.findall(r'[□]\s*(.+)', options_text)

                    if len(options) >= 4:
                        questions_dict[q_num]['options'] = [opt.strip() for opt in options[:4]]

            # Filtra domande complete e per target: 300 generali + 10 Sachsen
            # Sachsen è probabilmente identificato in una sezione specifica
            # Per ora prendiamo le prime 310 domande
            questions = []
            for q_num in sorted(questions_dict.keys()):
                q = questions_dict[q_num]

                if len(q['options']) == 4:
                    questions.append(q)

                # Limita alle prime 310 domande (300 generali + ~10 per land)
                if len(questions) >= 310:
                    break

        print(f"✅ Estratte {len(questions)} domande complete")
        return questions

    except Exception as e:
        print(f"❌ Errore parsing PDF: {e}")
        import traceback
        traceback.print_exc()
        return []


def get_correct_answers_from_web():
    """
    Scarica le risposte corrette dal sito einbuergerungstest-online.eu
    Questo è necessario perché il PDF non marca visivamente la risposta corretta
    nel testo estratto.
    """
    print(f"\n🌐 Download risposte corrette da web...")

    # Questo richiederebbe scraping del sito web
    # Per ora usiamo un placeholder
    # TODO: Implementare scraping o trovare fonte con risposte

    print(f"⚠️  Funzione non implementata completamente")
    print(f"💡 Le risposte corrette verranno impostate a 0 (opzione A)")

    return {}


def download_images(questions):
    """Scarica le immagini per le domande che ne hanno."""
    print(f"\n🖼️  Download immagini...")

    IMAGES_DIR.mkdir(exist_ok=True)
    downloaded = 0
    failed = 0

    for q in questions:
        if q['has_image']:
            img_filename = f"q_{q['id']:03d}.png"
            img_path = IMAGES_DIR / img_filename
            img_url = f"{IMAGE_BASE_URL}{q['id']:03d}.png"

            try:
                response = requests.get(img_url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0'
                })
                response.raise_for_status()

                with open(img_path, 'wb') as f:
                    f.write(response.content)

                q['image'] = f"images/{img_filename}"
                downloaded += 1
                print(f"  ✅ Domanda {q['id']}")

            except Exception as e:
                print(f"  ⚠️  Domanda {q['id']}: non disponibile")
                q['has_image'] = False
                failed += 1

    print(f"✅ Scaricate {downloaded} immagini ({failed} non disponibili)")
    return questions


def generate_json(questions, correct_answers):
    """Genera il file JSON finale."""
    print(f"\n📝 Generazione JSON...")

    output = []
    for q in questions:
        # Usa risposta corretta se disponibile, altrimenti default 0
        correct = correct_answers.get(q['id'], 0)

        item = {
            'id': q['id'],
            'question': q['question'],
            'options': q['options'],
            'correct': correct
        }

        # Aggiungi campo image solo se presente
        if q.get('has_image') and 'image' in q:
            item['image'] = q['image']

        output.append(item)

    # Salva JSON
    with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ JSON salvato: {JSON_OUTPUT}")
    print(f"   Totale domande: {len(output)}")

    return output


def main():
    """Funzione principale."""
    print("=" * 60)
    print("🇩🇪 EXTRACTOR DOMANDE EINBÜRGERUNGSTEST v2")
    print("=" * 60)

    if not PDF_PATH.exists():
        print(f"❌ PDF non trovato: {PDF_PATH}")
        print("💡 Esegui prima lo script originale per scaricare il PDF")
        return

    # Step 1: Estrai domande
    questions = extract_questions_from_pdf()

    if not questions:
        print("\n❌ Nessuna domanda estratta")
        return

    # Step 2: Ottieni risposte corrette
    correct_answers = get_correct_answers_from_web()

    # Step 3: Scarica immagini
    questions = download_images(questions)

    # Step 4: Genera JSON
    output = generate_json(questions, correct_answers)

    print("\n" + "=" * 60)
    print("✅ COMPLETATO!")
    print("=" * 60)
    print(f"📄 File generato: {JSON_OUTPUT}")
    print(f"📊 Totale domande: {len(output)}")
    print(f"🖼️  Immagini in: {IMAGES_DIR}/")
    print("\n⚠️  NOTA IMPORTANTE:")
    print("   Le risposte corrette sono impostate a 0 (opzione A) come placeholder.")
    print("   Sarà necessario integrarle da una fonte affidabile.")
    print("\n💡 Prossimi passi:")
    print("   1. Verifica questions.json e correggi le risposte")
    print("   2. Apri index.html nel browser")
    print("   3. Importa questions.json")


if __name__ == "__main__":
    main()
