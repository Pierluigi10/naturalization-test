#!/usr/bin/env python3
"""Genera un file questions.js dal JSON."""

import json
from pathlib import Path

JSON_FILE = Path(__file__).parent / "questions.json"
JS_FILE = Path(__file__).parent / "questions.js"

def generate_js():
    """Genera file JavaScript con le domande."""
    print("📝 Generazione questions.js...\n")

    # Leggi JSON
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Genera contenuto JavaScript
    js_content = f"""// Domande Einbürgerungstest
// Generato automaticamente da questions.json
// Totale: {len(questions)} domande

const QUESTIONS_DATA = {json.dumps(questions, ensure_ascii=False, indent=2)};

// Esporta per uso nell'app
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = QUESTIONS_DATA;
}}
"""

    # Salva
    with open(JS_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"✅ File generato: {JS_FILE}")
    print(f"✅ Domande incluse: {len(questions)}")

if __name__ == "__main__":
    generate_js()
