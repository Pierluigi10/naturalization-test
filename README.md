# Einbürgerungstest Quiz App

Quiz app to practice German naturalization test questions (Einbürgerungstest).

## 📁 Main Files

- **`index.html`** - Quiz app (open in a browser)
- **`questions.js`** - 310 questions in JavaScript format (auto-loading)
- `questions.json` - 310 questions extracted from official BAMF PDF (backup/editing)
- `images/` - Folder with 7 question images
- `extract_final.py` - Script to extract questions from PDF
- `clean_questions.py` - Script to clean and filter questions
- `generate_js.py` - Script to generate questions.js from questions.json

## 🚀 How to Use

**It's super simple! Questions load automatically:**

```bash
open index.html
```

Or drag `index.html` into a browser (Chrome, Firefox, Safari)

**Done!** All 310 questions load automatically and you can start practicing right away.

### 📊 Features

- ✅ **Auto-loading**: Questions load on startup
- ✅ **Saved progress**: Your answers are automatically saved in the browser
- ✅ **Detailed statistics**: View correct answers, percentage, etc.
- ✅ **Image support**: Questions with images automatically display photos
- ✅ **Mobile-friendly**: Works perfectly on smartphones

## ⚠️ Important Note: Correct Answers

**Correct answers are currently set to 0 (option A) as a placeholder.**

The official BAMF PDF doesn't contain correct answers in extractable format. To get the correct answers you have 2 options:

1. **Manual**: Edit `questions.json` and update the `correct` field (0=A, 1=B, 2=C, 3=D) by consulting official sources

2. **Automatic** (TODO): Implement web scraping from https://www.einbuergerungstest-online.eu/

## 🖼️ Images

**✅ Images downloaded: 7/12 identified**

The following questions have available images:
- **21** - Wappen der Bundesrepublik Deutschland
- **55** - Bundestagssitz in Berlin
- **187** - Flagge der DDR
- **209** - Wappen der DDR
- **216** - Symbol im Bundestag
- **226** - Flagge der Europäischen Union
- **301** - Wappen von Sachsen

To download/update images:

```bash
source venv/bin/activate
python download_images.py
```

To test that images are displayed correctly:
```bash
open test_images.html
```

Images are saved in `images/` and the app displays them automatically.

## ✏️ Editing Questions

If you want to edit questions or correct answers:

```bash
# 1. Edit questions.json with a text editor

# 2. Regenerate questions.js
source venv/bin/activate
python generate_js.py

# 3. Reload the app in browser (Cmd+R / Ctrl+R)
```

**Note**: You can also use the "Reload Original Questions" button in the app statistics to reload data without regenerating the file.

## 🛠️ Development

### Dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Re-extract questions from PDF

```bash
source venv/bin/activate

# Download the PDF if you don't have it already
python extract_final.py  # Extracts raw questions

# Clean and filter
python clean_questions.py  # Generates questions_clean.json
mv questions_clean.json questions.json
```

## 📊 Current Statistics

- **Questions extracted**: 310 / 310 ✅
  - 300 general federal questions (ID 1-300)
  - 10 Sachsen-specific questions (ID 301-310)
- **Format**: JSON with id, question, options (array of 4), correct (0-3), bundesland (optional)
- **Completeness**: 100% ✅

## 📝 TODO

- [ ] Integrate correct answers from reliable source (currently all set to option A)
- [x] ~~Download images for questions that require them~~ ✅ 7 images downloaded
- [ ] Optional Italian translation (if desired)
- [ ] Search for missing images for questions 29, 31, 85, 214, 305 (if they exist)

## 🔗 Sources

- **Official PDF**: [BAMF - Gesamtfragenkatalog](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf)
- **Question Reference**: https://www.einbuergerungstest-online.eu/

## 📄 License

For personal and educational use only. Questions are property of BAMF (Bundesamt für Migration und Flüchtlinge).
