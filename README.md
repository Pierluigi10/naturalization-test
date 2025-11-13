# Einbürgerungstest Quiz App

App quiz per esercitarsi con le domande del test di naturalizzazione tedesco (Einbürgerungstest).

## 📁 File Principali

- **`index.html`** - App quiz (apri in un browser)
- **`questions.js`** - 310 domande in formato JavaScript (auto-caricamento)
- `questions.json` - 310 domande estratte dal PDF ufficiale BAMF (backup/editing)
- `images/` - Cartella con le 7 immagini delle domande
- `extract_final.py` - Script per estrarre domande dal PDF
- `clean_questions.py` - Script per pulire e filtrare le domande
- `generate_js.py` - Script per generare questions.js da questions.json

## 🚀 Come Usare

**È semplicissimo! Le domande si caricano automaticamente:**

```bash
open index.html
```

Oppure trascina `index.html` in un browser (Chrome, Firefox, Safari)

**Fatto!** Le 310 domande si caricano automaticamente e puoi iniziare subito a esercitarti.

### 📊 Funzionalità

- ✅ **Auto-caricamento**: Le domande si caricano all'avvio
- ✅ **Progressi salvati**: Le tue risposte vengono salvate automaticamente nel browser
- ✅ **Statistiche dettagliate**: Visualizza risposte corrette, percentuale, ecc.
- ✅ **Supporto immagini**: Le domande con immagini mostrano automaticamente le foto
- ✅ **Mobile-friendly**: Funziona perfettamente su smartphone

## ⚠️ Nota Importante: Risposte Corrette

**Le risposte corrette sono attualmente impostate a 0 (opzione A) come placeholder.**

Il PDF ufficiale BAMF non contiene le risposte corrette nel formato estrabile. Per ottenere le risposte corrette hai 2 opzioni:

1. **Manuale**: Modifica `questions.json` e aggiorna il campo `correct` (0=A, 1=B, 2=C, 3=D) consultando fonti ufficiali

2. **Automatico** (TODO): Implementare web scraping da https://www.einbuergerungstest-online.eu/

## 🖼️ Immagini

**✅ Immagini scaricate: 7/12 identificate**

Le seguenti domande hanno immagini disponibili:
- **21** - Wappen der Bundesrepublik Deutschland
- **55** - Bundestagssitz in Berlin
- **187** - Flagge der DDR
- **209** - Wappen der DDR
- **216** - Symbol im Bundestag
- **226** - Flagge der Europäischen Union
- **301** - Wappen von Sachsen

Per scaricare/aggiornare le immagini:

```bash
source venv/bin/activate
python download_images.py
```

Per testare che le immagini siano visualizzate correttamente:
```bash
open test_images.html
```

Le immagini sono salvate in `images/` e l'app le mostra automaticamente.

## ✏️ Modificare le Domande

Se vuoi modificare le domande o le risposte corrette:

```bash
# 1. Modifica questions.json con un editor di testo

# 2. Rigenera questions.js
source venv/bin/activate
python generate_js.py

# 3. Ricarica l'app nel browser (Cmd+R / Ctrl+R)
```

**Nota**: Puoi anche usare il pulsante "Ricarica Domande Originali" nelle statistiche dell'app per ricaricare i dati senza rigenerare il file.

## 🛠️ Sviluppo

### Dipendenze

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Re-estrarre le domande dal PDF

```bash
source venv/bin/activate

# Scarica il PDF se non l'hai già
python extract_final.py  # Estrae domande grezze

# Pulisci e filtra
python clean_questions.py  # Genera questions_clean.json
mv questions_clean.json questions.json
```

## 📊 Statistiche Attuali

- **Domande estratte**: 310 / 310 ✅
  - 300 domande generali federali (ID 1-300)
  - 10 domande specifiche per Sachsen (ID 301-310)
- **Formato**: JSON con id, question, options (array di 4), correct (0-3), bundesland (opzionale)
- **Completezza**: 100% ✅

## 📝 TODO

- [ ] Integrare risposte corrette da fonte affidabile (attualmente tutte impostate a opzione A)
- [x] ~~Scaricare immagini per domande che le richiedono~~ ✅ 7 immagini scaricate
- [ ] Traduzione italiana opzionale (se desiderata)
- [ ] Cercare immagini mancanti per domande 29, 31, 85, 214, 305 (se esistono)

## 🔗 Fonti

- **PDF Ufficiale**: [BAMF - Gesamtfragenkatalog](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf)
- **Riferimento Domande**: https://www.einbuergerungstest-online.eu/

## 📄 Licenza

Solo per uso personale ed educativo. Le domande sono proprietà del BAMF (Bundesamt für Migration und Flüchtlinge).
