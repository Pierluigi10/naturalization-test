#!/usr/bin/env python3
"""
Script interattivo per aggiornare le risposte corrette.
"""

import json
from pathlib import Path

JSON_FILE = Path(__file__).parent / "questions.json"
BACKUP_FILE = Path(__file__).parent / "questions_backup.json"


def mostra_domanda(q):
    """Mostra una domanda formattata."""
    print(f"\n{'='*70}")
    print(f"DOMANDA {q['id']}")
    print(f"{'='*70}")
    print(f"\n{q['question']}\n")
    for i, opt in enumerate(q['options']):
        marker = "✓" if i == q['correct'] else " "
        print(f"  {marker} {chr(65+i)}) {opt}")
    print(f"\nRisposta corrente: {chr(65 + q['correct'])} (indice {q['correct']})")


def aggiorna_risposte_interattivo():
    """Aggiorna le risposte in modo interattivo."""
    print("="*70)
    print("📝 AGGIORNAMENTO RISPOSTE CORRETTE")
    print("="*70)
    print("\nCaricamento domande...\n")

    # Carica JSON
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"✅ Caricate {len(questions)} domande\n")
    print("Comandi disponibili:")
    print("  - Inserisci numero domanda (es: 1, 42, 150)")
    print("  - 'lista' = mostra domande non verificate")
    print("  - 'salva' = salva e rigenera questions.js")
    print("  - 'esci' = esci senza salvare")
    print("  - 'help' = mostra di nuovo i comandi\n")

    modificate = 0

    while True:
        comando = input("\n> ").strip().lower()

        if comando == 'esci':
            if modificate > 0:
                conferma = input(f"\n⚠️  Hai {modificate} modifiche non salvate. Uscire? (s/n): ")
                if conferma.lower() != 's':
                    continue
            print("👋 Chiusura senza salvare")
            break

        elif comando == 'salva':
            # Backup
            with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            print(f"✅ Backup creato: {BACKUP_FILE}")

            # Salva
            with open(JSON_FILE, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            print(f"✅ Salvato: {JSON_FILE}")

            # Rigenera questions.js
            print("\n📝 Rigenerazione questions.js...")
            import subprocess
            try:
                subprocess.run(['python3', 'generate_js.py'], check=True)
                print("✅ questions.js rigenerato")
                print("\n🎉 Tutto salvato! Ricarica il browser per vedere le modifiche.")
            except:
                print("⚠️  Rigenera manualmente con: python generate_js.py")

            modificate = 0

        elif comando == 'lista':
            # Mostra domande con risposta = 0 (probabilmente non verificate)
            non_verificate = [q for q in questions if q['correct'] == 0]
            print(f"\n📋 Domande con risposta A (potrebbero essere placeholder): {len(non_verificate)}")
            if len(non_verificate) > 20:
                print(f"Prime 20: {[q['id'] for q in non_verificate[:20]]}")
                print(f"... e altre {len(non_verificate) - 20}")
            else:
                print(f"ID: {[q['id'] for q in non_verificate]}")

        elif comando == 'help':
            print("\nComandi:")
            print("  - Numero (1-310) = modifica quella domanda")
            print("  - 'lista' = mostra domande da verificare")
            print("  - 'salva' = salva tutto e rigenera JS")
            print("  - 'esci' = chiudi senza salvare")

        elif comando.isdigit():
            q_id = int(comando)
            # Trova domanda
            domanda = next((q for q in questions if q['id'] == q_id), None)

            if not domanda:
                print(f"❌ Domanda {q_id} non trovata")
                continue

            mostra_domanda(domanda)

            while True:
                risposta = input("\nRisposta corretta (A/B/C/D o 0/1/2/3, invio=salta): ").strip().upper()

                if risposta == '':
                    print("⏭️  Saltata")
                    break

                # Converti lettera in numero
                if risposta in ['A', 'B', 'C', 'D']:
                    risposta = str(ord(risposta) - ord('A'))

                if risposta in ['0', '1', '2', '3']:
                    idx = int(risposta)
                    domanda['correct'] = idx
                    modificate += 1
                    print(f"✅ Impostata risposta {chr(65 + idx)} per domanda {q_id}")
                    print(f"   ({modificate} modifiche in totale)")
                    break
                else:
                    print("❌ Inserisci A, B, C, D oppure 0, 1, 2, 3")

        else:
            print("❌ Comando non riconosciuto. Digita 'help' per i comandi")


def aggiorna_da_lista():
    """Aggiorna da una lista di risposte (formato: id,risposta)."""
    print("="*70)
    print("📋 AGGIORNAMENTO DA LISTA")
    print("="*70)
    print("\nInserisci le risposte in formato: id,risposta")
    print("Esempio: 1,3  oppure  1,D")
    print("Una per riga. Linea vuota per terminare.\n")

    updates = []
    while True:
        line = input("> ").strip()
        if not line:
            break

        try:
            parts = line.split(',')
            q_id = int(parts[0].strip())
            risposta = parts[1].strip().upper()

            # Converti lettera in numero
            if risposta in ['A', 'B', 'C', 'D']:
                risposta = ord(risposta) - ord('A')
            else:
                risposta = int(risposta)

            if 0 <= risposta <= 3:
                updates.append((q_id, risposta))
            else:
                print(f"  ⚠️  Risposta {risposta} non valida per domanda {q_id}")
        except:
            print(f"  ❌ Formato non valido: {line}")

    if updates:
        print(f"\n📝 Applico {len(updates)} aggiornamenti...")

        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            questions = json.load(f)

        for q_id, risposta in updates:
            domanda = next((q for q in questions if q['id'] == q_id), None)
            if domanda:
                domanda['correct'] = risposta
                print(f"  ✅ Domanda {q_id}: {chr(65 + risposta)}")

        # Backup
        with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)

        # Salva
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)

        print(f"\n✅ Salvato: {JSON_FILE}")
        print("📝 Rigenera questions.js con: python generate_js.py")


def main():
    print("\n🇩🇪 Aggiornamento Risposte Einbürgerungstest\n")
    print("Scegli modalità:")
    print("  1) Interattivo - aggiorna domanda per domanda")
    print("  2) Lista - inserisci una lista di risposte")
    print("  3) Esci")

    scelta = input("\nScelta (1/2/3): ").strip()

    if scelta == '1':
        aggiorna_risposte_interattivo()
    elif scelta == '2':
        aggiorna_da_lista()
    else:
        print("👋 Ciao!")


if __name__ == "__main__":
    main()
