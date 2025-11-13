#!/usr/bin/env python3
"""Verifica quali domande mancano e perché."""

import json
from pathlib import Path

JSON_FILE = Path(__file__).parent / "questions.json"

def check_missing():
    """Verifica le domande mancanti."""
    print("🔍 Analisi domande mancanti...\n")

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Ottieni tutti gli ID presenti
    present_ids = set(q['id'] for q in questions)

    # ID previsti (1-300 per domande generali)
    expected_ids = set(range(1, 301))

    # Trova ID mancanti
    missing_ids = sorted(expected_ids - present_ids)

    print(f"Domande presenti: {len(present_ids)}")
    print(f"Domande previste: 300")
    print(f"Domande mancanti: {len(missing_ids)}")

    if missing_ids:
        print(f"\nID mancanti: {missing_ids}")

    # Verifica duplicati
    id_list = [q['id'] for q in questions]
    duplicates = [id for id in set(id_list) if id_list.count(id) > 1]
    if duplicates:
        print(f"\n⚠️  ID duplicati trovati: {duplicates}")

    print("\n" + "="*60)
    print("DETTAGLI DOMANDE PRESENTI:")
    print("="*60)
    print(f"ID minimo: {min(present_ids)}")
    print(f"ID massimo: {max(present_ids)}")
    print(f"Range continuo: {max(present_ids) - min(present_ids) + 1}")

    return missing_ids

if __name__ == "__main__":
    check_missing()
