#!/usr/bin/env python3
"""
Script V3 - Approccio combinato:
1. Estrae domande e opzioni dal PDF BAMF
2. Scarica risposte corrette da einbuergerungstest-online.eu
3. Scarica immagini per le domande che ne hanno
"""

import json
import re
import requests
from pathlib import Path
import pdfplumber
from bs4 import BeautifulSoup
import time

# Directory per output
OUTPUT_DIR = Path(__file__).parent
IMAGES_DIR = OUTPUT_DIR / "images"
PDF_PATH = OUTPUT_DIR / "gesamtfragenkatalog.pdf"
JSON_OUTPUT = OUTPUT_DIR / "questions.json"

# URL per scaricare risposte corrette
QUESTIONS_BASE_URL = "https://www.einbuergerungstest-online.eu/fragen/"
IMAGE_BASE_URL = "https://www.einbuergerungstest-online.eu/img/fragen/"


def extract_questions_from_pdf():
    """Estrae domande dal PDF usando approccio line-by-line."""
    print(f"\n📖 Parsing PDF...")

    questions = {}
    current_question_num = None
    current_question_text = []
    current_options = []

    with pdfplumber.open(PDF_PATH) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            lines = text.split('\n')

            for line in lines:
                # Rileva inizio nuova domanda: "Aufgabe NUM"
                aufgabe_match = re.match(r'^Aufgabe\s+(\d+)\s*$', line.strip())

                if aufgabe_match:
                    # Salva domanda precedente se esiste
                    if current_question_num and current_question_text and len(current_options) == 4:
                        questions[current_question_num] = {
                            'id': current_question_num,
                            'question': ' '.join(current_question_text).strip(),
                            'options': current_options[:],
                            'correct': 0  # placeholder
                        }

                    # Inizia nuova domanda
                    current_question_num = int(aufgabe_match.group(1))
                    current_question_text = []
                    current_options = []
                    continue

                # Skip linee vuote o pagina
                if not line.strip() or line.strip().startswith('Seite '):
                    continue

                # Se abbiamo una domanda attiva
                if current_question_num:
                    # Opzioni iniziano con uno spazio seguito dal testo
                    # (non c'è un carattere speciale visibile)
                    if line.startswith(' ') and len(current_options) < 4:
                        option_text = line.strip()
                        # Salta se sembra essere continuazione della domanda
                        if len(option_text) > 0 and not option_text.startswith('©'):
                            current_options.append(option_text)
                    else:
                        # È parte della domanda
                        if len(current_options) == 0:  # Solo se non abbiamo ancora opzioni
                            current_question_text.append(line.strip())

        # Salva ultima domanda
        if current_question_num and current_question_text and len(current_options) == 4:
            questions[current_question_num] = {
                'id': current_question_num,
                'question': ' '.join(current_question_text).strip(),
                'options': current_options[:],
                'correct': 0
            }

    print(f"✅ Estratte {len(questions)} domande dal PDF")

    # Converti dict in lista ordinata
    questions_list = [questions[k] for k in sorted(questions.keys()) if k <= 310]
    return questions_list


def scrape_correct_answers_from_web(max_questions=310):
    """Scarica le risposte corrette da einbuergerungstest-online.eu."""
    print(f"\n🌐 Scaricamento risposte corrette dal web...")

    correct_answers = {}
    failed = 0

    for q_num in range(1, max_questions + 1):
        try:
            url = f"{QUESTIONS_BASE_URL}{q_num}"
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Cerca la risposta corretta
            # Il sito marca la risposta corretta in qualche modo (da analizzare)
            # Proviamo a cercare elementi con classe "correct" o simili

            # Approach 1: cerca input checkbox/radio checked
            correct_input = soup.find('input', {'checked': True})
            if correct_input:
                value = correct_input.get('value', '')
                # Value potrebbe essere A, B, C, D o 0, 1, 2, 3
                if value in ['A', '0']:
                    correct_answers[q_num] = 0
                elif value in ['B', '1']:
                    correct_answers[q_num] = 1
                elif value in ['C', '2']:
                    correct_answers[q_num] = 2
                elif value in ['D', '3']:
                    correct_answers[q_num] = 3

            # Approach 2: cerca elemento con classe "richtig" o "correct"
            if q_num not in correct_answers:
                correct_elem = soup.find(class_=re.compile(r'(richtig|correct|right)', re.I))
                if correct_elem:
                    # Prova a dedurre l'indice dalla posizione
                    parent = correct_elem.find_parent(['li', 'div', 'label'])
                    if parent:
                        siblings = parent.find_previous_siblings()
                        correct_answers[q_num] = len(siblings)

            if q_num % 50 == 0:
                print(f"   Processate {q_num}/{max_questions} domande...")

            # Rate limiting
            time.sleep(0.1)

        except Exception as e:
            failed += 1
            if failed < 5:  # Mostra solo i primi errori
                print(f"  ⚠️  Domanda {q_num}: {e}")

    print(f"✅ Scaricate {len(correct_answers)} risposte corrette ({failed} fallite)")
    return correct_answers


def download_images(questions):
    """Scarica le immagini per le domande."""
    print(f"\n🖼️  Download immagini...")

    IMAGES_DIR.mkdir(exist_ok=True)
    downloaded = 0

    for q in questions:
        img_filename = f"q_{q['id']:03d}.png"
        img_path = IMAGES_DIR / img_filename
        img_url = f"{IMAGE_BASE_URL}{q['id']:03d}.png"

        try:
            response = requests.get(img_url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0'
            })
            response.raise_for_status()

            # Verifica che sia davvero un'immagine
            if 'image' in response.headers.get('Content-Type', ''):
                with open(img_path, 'wb') as f:
                    f.write(response.content)

                q['image'] = f"images/{img_filename}"
                downloaded += 1

        except:
            pass  # Immagine non disponibile

    print(f"✅ Scaricate {downloaded} immagini")
    return questions


def generate_json(questions, correct_answers):
    """Genera il file JSON finale."""
    print(f"\n📝 Generazione JSON...")

    output = []
    for q in questions:
        # Usa risposta corretta se disponibile
        correct = correct_answers.get(q['id'], 0)

        item = {
            'id': q['id'],
            'question': q['question'],
            'options': q['options'],
            'correct': correct
        }

        if 'image' in q:
            item['image'] = q['image']

        output.append(item)

    with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ JSON salvato: {JSON_OUTPUT}")
    return output


def main():
    """Funzione principale."""
    print("=" * 60)
    print("🇩🇪 EXTRACTOR V3 - EINBÜRGERUNGSTEST")
    print("=" * 60)

    if not PDF_PATH.exists():
        print(f"❌ PDF non trovato: {PDF_PATH}")
        return

    # Step 1: Estrai domande e opzioni dal PDF
    questions = extract_questions_from_pdf()

    if len(questions) < 100:
        print(f"\n⚠️  Attenzione: estratte solo {len(questions)} domande")
        print("   Il parser potrebbe avere problemi. Continuando comunque...")

    # Step 2: Scarica risposte corrette dal web
    print("\n⚠️  Nota: il download delle risposte corrette può richiedere qualche minuto...")
    correct_answers = scrape_correct_answers_from_web(max(q['id'] for q in questions))

    # Step 3: Scarica immagini
    questions = download_images(questions)

    # Step 4: Genera JSON
    output = generate_json(questions, correct_answers)

    print("\n" + "=" * 60)
    print("✅ COMPLETATO!")
    print("=" * 60)
    print(f"📄 File: {JSON_OUTPUT}")
    print(f"📊 Domande: {len(output)}")
    print(f"✓ Risposte corrette: {len([q for q in output if correct_answers.get(q['id']) is not None])}")
    print(f"🖼️  Immagini: {len([q for q in output if 'image' in q])}")


if __name__ == "__main__":
    main()
