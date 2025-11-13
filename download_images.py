#!/usr/bin/env python3
"""Scarica le immagini per le domande visive."""

import json
import re
import requests
from pathlib import Path
import time

OUTPUT_DIR = Path(__file__).parent
IMAGES_DIR = OUTPUT_DIR / "images"
JSON_FILE = OUTPUT_DIR / "questions.json"
IMAGE_BASE_URL = "https://www.einbuergerungstest-online.eu/img/fragen/"

def identify_image_questions():
    """Identifica quali domande contengono immagini."""
    print("🔍 Identificazione domande con immagini...\n")

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    image_questions = []

    for q in questions:
        # Domande con immagini contengono:
        # - "Bild" (immagine)
        # - "Wappen" (stemma)
        # - Riferimenti a mappe/carte geografiche

        text = q['question'].lower()

        if any(keyword in text for keyword in ['bild', 'wappen', 'flagge', 'symbol']):
            image_questions.append(q['id'])
            print(f"  📸 Domanda {q['id']}: {q['question'][:60]}...")

    print(f"\n✅ Trovate {len(image_questions)} domande con immagini")
    return image_questions


def download_image(question_id):
    """Scarica un'immagine per una domanda specifica."""
    img_filename = f"q_{question_id:03d}.png"
    img_path = IMAGES_DIR / img_filename
    img_url = f"{IMAGE_BASE_URL}{question_id:03d}.png"

    try:
        response = requests.get(img_url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        response.raise_for_status()

        # Verifica che sia un'immagine
        content_type = response.headers.get('Content-Type', '')
        if 'image' in content_type:
            with open(img_path, 'wb') as f:
                f.write(response.content)

            file_size = len(response.content) / 1024  # KB
            return True, file_size
        else:
            return False, 0

    except Exception as e:
        return False, 0


def download_all_images():
    """Scarica tutte le immagini identificate."""
    print("\n📥 Download immagini...\n")

    # Crea directory immagini
    IMAGES_DIR.mkdir(exist_ok=True)

    # Identifica domande con immagini
    image_questions = identify_image_questions()

    if not image_questions:
        print("❌ Nessuna domanda con immagini trovata")
        return []

    print(f"\n{'='*60}")
    print("DOWNLOAD IN CORSO...")
    print(f"{'='*60}\n")

    downloaded = []
    failed = []

    for q_id in image_questions:
        success, file_size = download_image(q_id)

        if success:
            downloaded.append(q_id)
            print(f"  ✅ Domanda {q_id:3d}: {file_size:6.1f} KB")
        else:
            failed.append(q_id)
            print(f"  ❌ Domanda {q_id:3d}: non disponibile")

        # Rate limiting per non sovraccaricare il server
        time.sleep(0.2)

    print(f"\n{'='*60}")
    print(f"✅ Download completato: {len(downloaded)}/{len(image_questions)}")
    if failed:
        print(f"⚠️  Non disponibili: {failed}")
    print(f"{'='*60}")

    return downloaded


def update_json_with_images(downloaded_ids):
    """Aggiorna il JSON aggiungendo il campo 'image' alle domande."""
    print(f"\n📝 Aggiornamento JSON...\n")

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    updated_count = 0

    for q in questions:
        if q['id'] in downloaded_ids:
            img_filename = f"images/q_{q['id']:03d}.png"
            q['image'] = img_filename
            updated_count += 1

    # Salva JSON aggiornato
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"✅ Aggiornate {updated_count} domande con campo 'image'")
    print(f"✅ Salvato: {JSON_FILE}")


def main():
    """Funzione principale."""
    print("=" * 60)
    print("🖼️  DOWNLOAD IMMAGINI DOMANDE")
    print("=" * 60 + "\n")

    # Download immagini
    downloaded_ids = download_all_images()

    if downloaded_ids:
        # Aggiorna JSON
        update_json_with_images(downloaded_ids)

        print(f"\n{'='*60}")
        print("🎉 COMPLETATO!")
        print(f"{'='*60}")
        print(f"\n📁 Immagini salvate in: {IMAGES_DIR}/")
        print(f"📊 Totale immagini: {len(downloaded_ids)}")
        print(f"\n💡 Ora puoi aprire index.html e le immagini verranno mostrate!")
    else:
        print("\n❌ Nessuna immagine scaricata")


if __name__ == "__main__":
    main()
