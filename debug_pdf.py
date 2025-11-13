#!/usr/bin/env python3
"""Debug per capire la struttura esatta del PDF."""

import pdfplumber
from pathlib import Path

PDF_PATH = Path(__file__).parent / "gesamtfragenkatalog.pdf"


def debug_pdf():
    """Stampa linea per linea con dettagli."""
    with pdfplumber.open(PDF_PATH) as pdf:
        # Solo pagina 2 (dove iniziano le domande)
        page = pdf.pages[1]
        text = page.extract_text()

        lines = text.split('\n')

        print(f"Totale linee: {len(lines)}\n")
        print("="*70)

        for i, line in enumerate(lines[:40], 1):  # Prime 40 linee
            # Mostra rappresentazione con spazi visibili
            visible_line = line.replace(' ', '·')
            print(f"{i:3d} | starts_space:{str(line.startswith(' ')):5s} | len:{len(line):3d} | {visible_line}")

        print("\n" + "="*70)
        print("ANALISI:")
        print("- Cercare pattern 'Aufgabe N'")
        print("- Identificare come sono formattate le opzioni")


if __name__ == "__main__":
    debug_pdf()
