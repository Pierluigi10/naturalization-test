# Changelog

## [Versione Corrente] - Auto-caricamento Domande

### ✨ Nuove Funzionalità

- **Auto-caricamento**: Le domande ora si caricano automaticamente all'apertura dell'app
- **File questions.js**: Nuovo file JavaScript con tutte le 310 domande embedded
- **Niente più import manuale**: Non è più necessario importare il JSON ogni volta
- **Pulsante ricarica**: Nelle statistiche, nuovo pulsante per ricaricare le domande originali

### 🔧 Modifiche Tecniche

1. **Nuovo file `questions.js`**:
   - Contiene tutte le 310 domande come variabile JavaScript
   - Generato automaticamente da `questions.json`
   - Dimensione: ~94KB

2. **Modifiche a `index.html`**:
   - Carica `questions.js` automaticamente
   - Le domande si caricano da `QUESTIONS_DATA` al primo avvio
   - Mantiene comunque la possibilità di importare JSON personalizzato
   - Nuovo metodo `reloadQuestions()` per ricaricare le domande originali

3. **Script `generate_js.py`**:
   - Genera `questions.js` da `questions.json`
   - Esegui per aggiornare dopo modifiche al JSON

### 📖 Come Usare

**Versione Semplice (Consigliata)**:
```bash
# Apri semplicemente l'app - le domande si caricano automaticamente!
open index.html
```

**Se modifichi le domande**:
```bash
# 1. Modifica questions.json
# 2. Rigenera questions.js
source venv/bin/activate
python generate_js.py

# 3. Ricarica l'app nel browser
```

### 🔄 Compatibilità

- ✅ Mantiene tutti i progressi salvati in localStorage
- ✅ Compatibile con la versione precedente
- ✅ Supporto immagini funzionante
- ✅ Import JSON manuale ancora disponibile (fallback)

### 📝 Note

- Il file `questions.json` viene mantenuto per:
  - Backup delle domande
  - Modifiche manuali
  - Rigenerazione di `questions.js`

- Se vedi la schermata di import, prova a:
  1. Ricaricare la pagina
  2. Verificare che `questions.js` esista nella stessa directory di `index.html`
  3. Controllare la console del browser per errori

---

## [Versione Precedente] - Import Manuale

### Funzionalità

- Import manuale tramite file JSON
- Salvataggio in localStorage
- Funziona senza file esterni (eccetto il JSON da importare)
