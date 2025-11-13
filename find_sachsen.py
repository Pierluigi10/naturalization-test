#!/usr/bin/env python3
"""Trova e estrae le domande per Sachsen dal PDF."""

import re
from pathlib import Path
import pdfplumber

PDF_PATH = Path(__file__).parent / "gesamtfragenkatalog.pdf"

def find_sachsen_section():
    """Trova la sezione Sachsen nel PDF."""
    print("🔍 Ricerca sezione Sachsen nel PDF...\n")

    with pdfplumber.open(PDF_PATH) as pdf:
        full_text = ""
        page_map = {}  # Mappa posizione -> numero pagina

        current_pos = 0
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text()
            if text:
                page_map[current_pos] = page_num
                full_text += text + "\n"
                current_pos += len(text) + 1

        # Cerca "Sachsen" nella sezione Teil II
        sachsen_pattern = r'(Fragen für das (?:Bundes)?land Sachsen)'

        matches = list(re.finditer(sachsen_pattern, full_text, re.IGNORECASE))

        if matches:
            print(f"✅ Trovate {len(matches)} occorrenze di 'Sachsen'\n")

            for i, match in enumerate(matches, 1):
                start = match.start()
                # Trova il numero di pagina
                page_num = max(p for p in page_map.keys() if p <= start)

                # Estrai un po' di contesto
                context_start = max(0, start - 200)
                context_end = min(len(full_text), start + 1500)
                context = full_text[context_start:context_end]

                print(f"{'='*60}")
                print(f"OCCORRENZA {i} - Pagina circa {page_map[page_num]}")
                print(f"{'='*60}")
                print(context)
                print("\n")
        else:
            print("❌ Nessuna sezione Sachsen trovata")

            # Prova una ricerca più generica
            print("\n🔍 Ricerca 'Sachsen' senza filtri...\n")
            if 'Sachsen' in full_text:
                idx = full_text.index('Sachsen')
                print(f"Trovato 'Sachsen' alla posizione {idx}")
                print(full_text[idx-100:idx+500])

if __name__ == "__main__":
    find_sachsen_section()
