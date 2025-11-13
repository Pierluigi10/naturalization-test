#!/usr/bin/env python3
"""
Script per estrarre domande dal PDF ufficiale BAMF per il test di naturalizzazione tedesco.
Estrae le 300 domande generali + 10 domande specifiche per Sachsen.
"""

import json
import os
import re
import requests
from pathlib import Path
import pdfplumber

# URL del PDF ufficiale BAMF
PDF_URL = "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile&v=9"

# Directory per output
OUTPUT_DIR = Path(__file__).parent
IMAGES_DIR = OUTPUT_DIR / "images"
PDF_PATH = OUTPUT_DIR / "gesamtfragenkatalog.pdf"
JSON_OUTPUT = OUTPUT_DIR / "questions.json"

# URL base per le immagini (source alternativa)
IMAGE_BASE_URL = "https://www.einbuergerungstest-online.eu/img/fragen/"


def download_pdf():
    """Scarica il PDF ufficiale BAMF."""
    print(f"📥 Download PDF da BAMF...")

    try:
        response = requests.get(PDF_URL, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        response.raise_for_status()

        with open(PDF_PATH, 'wb') as f:
            f.write(response.content)

        print(f"✅ PDF scaricato: {PDF_PATH}")
        return True
    except Exception as e:
        print(f"❌ Errore download PDF: {e}")
        print("💡 Prova a scaricare manualmente il PDF da:")
        print("   https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf")
        return False


def extract_questions_from_pdf():
    """Estrae domande dal PDF usando pdfplumber."""
    print(f"\n📖 Parsing PDF...")

    if not PDF_PATH.exists():
        print(f"❌ PDF non trovato: {PDF_PATH}")
        return []

    questions = []

    try:
        with pdfplumber.open(PDF_PATH) as pdf:
            full_text = ""

            # Estrai tutto il testo dal PDF
            for page in pdf.pages:
                full_text += page.extract_text() + "\n"

            # Pattern per identificare le domande
            # Esempio: "1) Testo domanda\nA) Risposta A\nB) Risposta B\nC) Risposta C\nD) Risposta D"
            # Il pattern varia in base al formato effettivo del PDF

            # Questa è una implementazione base che andrà adattata al formato reale del PDF
            # Dopo aver visto il PDF reale, possiamo raffinare questo pattern

            question_pattern = r'(\d+)\)\s*([^\n]+(?:\n(?![ABCD]\))[^\n]+)*)\s*A\)\s*([^\n]+)\s*B\)\s*([^\n]+)\s*C\)\s*([^\n]+)\s*D\)\s*([^\n]+)'

            matches = re.finditer(question_pattern, full_text, re.MULTILINE)

            for match in matches:
                q_num = int(match.group(1))
                q_text = match.group(2).strip()
                option_a = match.group(3).strip()
                option_b = match.group(4).strip()
                option_c = match.group(5).strip()
                option_d = match.group(6).strip()

                # Filtra per domande generali (1-300) e Sachsen (301-310 se presenti)
                # Nota: il numero esatto delle domande Sachsen va verificato
                if q_num <= 300 or (q_num >= 301 and q_num <= 310):
                    question = {
                        'id': q_num,
                        'question': q_text,
                        'options': [option_a, option_b, option_c, option_d],
                        'correct': -1,  # Da determinare
                        'has_image': False
                    }
                    questions.append(question)

        print(f"✅ Estratte {len(questions)} domande")
        return questions

    except Exception as e:
        print(f"❌ Errore parsing PDF: {e}")
        print("💡 Il formato del PDF potrebbe essere diverso dal previsto.")
        print("   Sarà necessario analizzare manualmente il PDF per adattare il parser.")
        return []


def identify_correct_answers(questions):
    """
    Identifica le risposte corrette dalle domande.
    Nota: questo richiede che il PDF contenga indicazioni della risposta corretta.
    Potrebbe essere necessario integrare con una fonte esterna.
    """
    print(f"\n🔍 Identificazione risposte corrette...")

    # Questa funzione va implementata in base al formato del PDF
    # Se il PDF non contiene le risposte corrette, possiamo:
    # 1. Scaricarle da einbuergerungstest-online.eu
    # 2. Usare un file di risposte esterno
    # 3. Richiederle manualmente

    # Per ora, segna come placeholder
    for q in questions:
        # Placeholder - da implementare con logica reale
        q['correct'] = 0  # Default A

    print(f"⚠️  Risposte corrette impostate a placeholder (default: A)")
    print(f"💡 Sarà necessario integrare le risposte corrette da una fonte affidabile")

    return questions


def download_images(questions):
    """Scarica le immagini per le domande che ne hanno."""
    print(f"\n🖼️  Download immagini...")

    IMAGES_DIR.mkdir(exist_ok=True)
    downloaded = 0

    # Lista domande che tipicamente hanno immagini (da documentazione BAMF)
    # Questo va verificato e aggiornato con l'elenco reale
    image_question_ids = [21, 22, 23]  # Esempio - da completare

    for q in questions:
        if q['id'] in image_question_ids:
            img_filename = f"q_{q['id']:03d}.png"
            img_path = IMAGES_DIR / img_filename
            img_url = f"{IMAGE_BASE_URL}{q['id']:03d}.png"

            try:
                response = requests.get(img_url, timeout=10)
                response.raise_for_status()

                with open(img_path, 'wb') as f:
                    f.write(response.content)

                q['image'] = f"images/{img_filename}"
                q['has_image'] = True
                downloaded += 1
                print(f"  ✅ Domanda {q['id']}: {img_filename}")

            except Exception as e:
                print(f"  ⚠️  Domanda {q['id']}: impossibile scaricare - {e}")

    print(f"✅ Scaricate {downloaded} immagini")
    return questions


def generate_json(questions):
    """Genera il file JSON finale nel formato richiesto dall'app."""
    print(f"\n📝 Generazione JSON...")

    # Formatta nel formato richiesto dall'app
    output = []
    for q in questions:
        item = {
            'id': q['id'],
            'question': q['question'],
            'options': q['options'],
            'correct': q['correct']
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
    print("🇩🇪 EXTRACTOR DOMANDE EINBÜRGERUNGSTEST")
    print("=" * 60)

    # Step 1: Download PDF
    if not PDF_PATH.exists():
        if not download_pdf():
            print("\n❌ Impossibile procedere senza il PDF")
            print("💡 Scarica manualmente il PDF e salvalo come 'gesamtfragenkatalog.pdf'")
            return
    else:
        print(f"✅ PDF già presente: {PDF_PATH}")

    # Step 2: Estrai domande
    questions = extract_questions_from_pdf()

    if not questions:
        print("\n❌ Nessuna domanda estratta")
        print("💡 Potrebbe essere necessario un parser personalizzato per questo PDF")
        print("   Analizza manualmente il PDF per capire la struttura esatta")
        return

    # Step 3: Identifica risposte corrette
    questions = identify_correct_answers(questions)

    # Step 4: Scarica immagini
    questions = download_images(questions)

    # Step 5: Genera JSON
    output = generate_json(questions)

    print("\n" + "=" * 60)
    print("✅ COMPLETATO!")
    print("=" * 60)
    print(f"📄 File generato: {JSON_OUTPUT}")
    print(f"📊 Totale domande: {len(output)}")
    print(f"🖼️  Immagini in: {IMAGES_DIR}/")
    print("\n💡 Prossimi passi:")
    print("   1. Verifica il file questions.json")
    print("   2. Apri index.html nel browser")
    print("   3. Clicca 'Importa Domande' e seleziona questions.json")


if __name__ == "__main__":
    main()
