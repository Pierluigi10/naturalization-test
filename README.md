# Einbürgerungstest Quiz App

Quiz app to practice German naturalization test questions (Einbürgerungstest).

## 📁 Main Files

- **`index.html`** - Quiz app (open in a browser)
- **`questions.js`** - 310 questions in JavaScript format (auto-loading)
- **`questions.json`** - 310 questions extracted from official BAMF PDF (source file for editing)
- **`generate_js.py`** - Script to generate questions.js from questions.json
- `images/` - Folder with 7 question images
- `download_images.py` - Script to download/update question images

## 🚀 How to Use

**It's super simple! Questions load automatically:**

```bash
open index.html
```

Or drag `index.html` into a browser (Chrome, Firefox, Safari)

### 🎯 Two Practice Modes

**📚 All Questions Mode**
- Practice with all 310 questions
- Navigate with Previous/Next buttons
- Jump to any specific question number (e.g., question 258)
- Perfect for comprehensive study

**✅ Test Simulation Mode**
- Realistic test experience with 33 random questions:
  - 30 questions from the federal catalog (questions 1-300)
  - 3 questions from your Bundesland (questions 301-310 for Sachsen)
- Pass/fail result (need ≥17 correct answers to pass)
- Different questions each time you start a new simulation

### 📊 Features

- ✅ **Two practice modes**: Full practice or realistic test simulation
- ✅ **Auto-loading**: Questions load on startup
- ✅ **Saved progress**: Your answers are automatically saved in the browser
- ✅ **Detailed statistics**: View correct answers, percentage, pass/fail status
- ✅ **Jump to question**: Enter any question number to jump directly to it (full mode)
- ✅ **Image support**: Questions with images automatically display photos
- ✅ **Mobile-friendly**: Works perfectly on smartphones
- ✅ **Correct answers included**: All 310 questions have verified correct answers

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

Want to modify questions, answers, or add new content? Follow these steps:

### Step-by-Step Guide

**1. Edit questions.json**

Open `questions.json` in any text editor. Each question has this structure:

```json
{
  "id": 258,
  "question": "Was darf das Jugendamt in Deutschland?",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correct": 1
}
```

- `id`: Question number (1-310)
- `question`: Question text
- `options`: Array of 4 answer options
- `correct`: Index of correct answer (0=A, 1=B, 2=C, 3=D)
- `image` (optional): Path to image file (e.g., "images/q_258.png")

**2. Regenerate questions.js**

After editing, run this command to update the JavaScript file:

```bash
python3 generate_js.py
```

No need to activate venv - it works with the system Python!

**3. Refresh the browser**

Simply reload the page:
- Mac: `Cmd + R`
- Windows/Linux: `F5`

The app **automatically detects changes** and updates! No need for hard refresh or clearing cache.

### Quick Example

```bash
# Edit a question
nano questions.json  # or use any editor

# Regenerate
python3 generate_js.py

# Reload browser (F5)
```

**Note**: The app intelligently compares the file with localStorage and updates automatically when it detects changes in question content or answers.

## 🔧 Troubleshooting

### Questions showing old/incorrect answers

If you see outdated questions or answers, the browser cache needs to be cleared:

**Option 1: Hard Refresh**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + F5` or `Ctrl + F5`

**Option 2: Clear localStorage**
1. Open browser Console (F12)
2. Run: `localStorage.clear(); location.reload();`

**Option 3: Use app button**
1. Go to Statistics (📊)
2. Click "Reload Original Questions"

## 🛠️ Development

### Dependencies

For basic usage (editing questions), you only need:
- Python 3 (for running `generate_js.py`)

For downloading images (optional):
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python download_images.py
```

## 📊 Current Statistics

- **Questions extracted**: 310 / 310 ✅
  - 300 general federal questions (ID 1-300)
  - 10 Sachsen-specific questions (ID 301-310)
- **Format**: JSON with id, question, options (array of 4), correct (0-3), bundesland (optional)
- **Completeness**: 100% ✅

## 📝 TODO

- [x] ~~Integrate correct answers from reliable source~~ ✅ All 310 answers verified
- [x] ~~Download images for questions that require them~~ ✅ 7 images downloaded
- [x] ~~Add test simulation mode~~ ✅ 33 questions (30 federal + 3 regional)
- [x] ~~Add jump to question feature~~ ✅ Available in full practice mode
- [ ] Optional Italian translation (if desired)
- [ ] Search for missing images for questions 29, 31, 85, 214, 305 (if they exist)
- [ ] Add Bundesland selection for regional questions

## 🔗 Sources

- **Official PDF**: [BAMF - Gesamtfragenkatalog](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf)
- **Question Reference**: https://www.einbuergerungstest-online.eu/

## 📄 License

For personal and educational use only. Questions are property of BAMF (Bundesamt für Migration und Flüchtlinge).
