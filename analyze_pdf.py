#!/usr/bin/env python3
"""Script per analizzare la struttura del PDF BAMF."""

import pdfplumber
from pathlib import Path

PDF_PATH = Path(__file__).parent / "gesamtfragenkatalog.pdf"


def analyze_pdf():
    """Analizza le prime pagine del PDF per capire la struttura."""
    print("📖 Analisi struttura PDF...\n")

    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Numero totale pagine: {len(pdf.pages)}\n")

        # Analizza le prime 5 pagine
        for i in range(min(5, len(pdf.pages))):
            page = pdf.pages[i]
            text = page.extract_text()

            print(f"{'=' * 60}")
            print(f"PAGINA {i + 1}")
            print(f"{'=' * 60}")
            print(text[:1000])  # Primi 1000 caratteri
            print("\n")

        # Analizza una pagina del mezzo (probabilmente contiene domande)
        if len(pdf.pages) > 10:
            middle_page = len(pdf.pages) // 2
            page = pdf.pages[middle_page]
            text = page.extract_text()

            print(f"{'=' * 60}")
            print(f"PAGINA {middle_page + 1} (middle)")
            print(f"{'=' * 60}")
            print(text[:1500])
            print("\n")


if __name__ == "__main__":
    analyze_pdf()
