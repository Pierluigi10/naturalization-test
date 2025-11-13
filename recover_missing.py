#!/usr/bin/env python3
"""Recupera le domande mancanti dal PDF."""

import json
import re
from pathlib import Path
import pdfplumber

PDF_PATH = Path(__file__).parent / "gesamtfragenkatalog.pdf"
JSON_FILE = Path(__file__).parent / "questions.json"
MISSING_IDS = [23, 57, 66, 91, 118, 129, 300]

def extract_question_block(q_id):
    """Estrae il blocco di testo per una specifica domanda."""
    with pdfplumber.open(PDF_PATH) as pdf:
        full_text = ""
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"

        # Cerca il blocco per questa domanda
        pattern = rf'Aufgabe\s+{q_id}\s*\n(.+?)(?=Aufgabe\s+\d+|$)'
        match = re.search(pattern, full_text, re.DOTALL)

        if match:
            return match.group(0)
        return None

def main():
    print("🔍 Recupero domande mancanti...\n")

    for q_id in MISSING_IDS:
        print(f"{'='*60}")
        print(f"DOMANDA {q_id}")
        print(f"{'='*60}")

        block = extract_question_block(q_id)
        if block:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            print(f"Linee estratte: {len(lines)}")
            print()
            for i, line in enumerate(lines[:15], 1):  # Prime 15 linee
                print(f"{i:2d}. {line}")
        else:
            print("❌ Non trovata nel PDF")

        print()

if __name__ == "__main__":
    main()
