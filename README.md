# Einbürgerungstest Quiz App

Quiz app to practice German naturalization test questions (Einbürgerungstest).

## 📁 Project Structure

```
einbuergerungstest/
├── index.html                    # Main entry point
├── questions.js                  # 310 questions in JS format (auto-generated)
├── questions.json                # 310 questions from BAMF PDF (source file)
├── src/
│   ├── js/
│   │   ├── app.js               # Application initialization
│   │   ├── quiz.js              # Main quiz logic and UI rendering
│   │   └── storage.js           # localStorage management
│   └── css/
│       ├── styles.css           # Main styles
│       └── accessibility.css    # Accessibility features (high contrast, etc.)
├── images/                       # Question images (7 images)
├── generate_js.py               # Generate questions.js from questions.json
├── download_images.py           # Download/update question images
└── requirements.txt             # Python dependencies (for images)
```

## 🚀 How to Use

**It's super simple! Questions load automatically:**

```bash
open index.html
```

Or drag `index.html` into a browser (Chrome, Firefox, Safari)

### 🎯 Three Practice Modes

**📚 Full Practice Mode**
- Practice with all 310 questions (300 federal + 10 regional)
- Navigate with Previous/Next buttons
- Jump to any specific question number (e.g., question 258)
- Perfect for comprehensive study

**🎯 Test Simulation Mode**
- Realistic test experience with 33 random questions:
  - 30 questions from the federal catalog (questions 1-300)
  - 3 questions specific to your selected Bundesland
- **Select your Bundesland** from the dropdown on the home page
- **60-minute timer** (same as real test)
- Pass/fail result (need ≥17 correct answers out of 33 to pass)
- Different questions each time you start a new simulation
- Confetti animation when you pass! 🎉
- Auto-advances to next question after answering

**🔄 Review Mode**
- Review only the questions you answered incorrectly
- Perfect for focused study on weak areas
- Continues until you answer all previously incorrect questions correctly

### 🗺️ Bundesland Selection

Choose your Bundesland before starting a test simulation:
- Currently available: **Sachsen** (10 questions)
- Coming soon: 15 other Bundesländer
- Your selection is saved automatically
- If questions for your Bundesland aren't available yet, the app will use Sachsen questions as fallback

### 📊 Features

- ✅ **Three practice modes**: Full practice, test simulation, or review mode
- ✅ **Bundesland selection**: Choose your Bundesland for region-specific questions
- ✅ **60-minute timer**: Realistic timer in simulation mode (alerts at 60 minutes)
- ✅ **Auto-advance**: Automatically moves to next question in simulation mode
- ✅ **Confetti animation**: Celebration when you pass the test! 🎉
- ✅ **Gamification**: Track your progress with visual feedback
- ✅ **Review mode**: Focus on questions you answered incorrectly
- ✅ **Auto-loading**: Questions load on startup
- ✅ **Saved progress**: Your answers are automatically saved in the browser
- ✅ **Detailed statistics**: View correct answers, percentage, pass/fail status, time taken
- ✅ **Jump to question**: Enter any question number to jump directly to it (full mode)
- ✅ **Image support**: Questions with images automatically display photos
- ✅ **Accessibility**: High contrast mode, keyboard navigation, screen reader support
- ✅ **Mobile-friendly**: Works perfectly on smartphones with touch gestures
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
pip install requests pillow
python download_images.py
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

### Code Structure

The application is organized into modular JavaScript files:

**`src/js/storage.js`**
- Manages localStorage operations
- Handles saving/loading of questions, answers, progress, and settings
- Provides data persistence across sessions

**`src/js/quiz.js`**
- Core quiz logic and state management
- All UI rendering methods (home, quiz, stats, review modes)
- Question navigation and answer validation
- Timer management for simulation mode
- Statistics calculation and confetti animations

**`src/js/app.js`**
- Application initialization
- Creates Quiz instance and mounts to DOM
- Entry point for the application

**`src/css/styles.css`**
- Main visual styles
- Responsive design for mobile and desktop
- Card layouts, buttons, navigation

**`src/css/accessibility.css`**
- Accessibility features (can be enabled from settings)
- High contrast mode
- Enhanced focus indicators for keyboard navigation
- Screen reader optimizations

### Dependencies

For basic usage (editing questions), you only need:
- Python 3 (for running `generate_js.py`)

For downloading images (optional):
```bash
pip install -r requirements.txt
python download_images.py
```

External libraries (loaded from CDN):
- **canvas-confetti**: Confetti animation for passing the test

## 📊 Current Statistics

- **Questions extracted**: 310 ✅
  - 300 general federal questions (ID 1-300)
  - 10 Sachsen-specific questions (ID 301-310)
- **Bundesländer available**: 1 / 16 (Sachsen)
- **Format**: JSON with id, question, options (array of 4), correct (0-3), bundesland (optional)
- **Correct answers**: 100% verified ✅

## 📝 TODO

- [x] ~~Integrate correct answers from reliable source~~ ✅ All 310 answers verified
- [x] ~~Download images for questions that require them~~ ✅ 7 images downloaded
- [x] ~~Add test simulation mode~~ ✅ 33 questions (30 federal + 3 regional)
- [x] ~~Add jump to question feature~~ ✅ Available in full practice mode
- [x] ~~Add Bundesland selection~~ ✅ Dropdown selector on home page
- [x] ~~Add timer for test simulation mode~~ ✅ 60-minute timer with alert
- [x] ~~Add review mode~~ ✅ Review incorrect answers
- [x] ~~Add confetti animation~~ ✅ Celebration when passing
- [x] ~~Add accessibility features~~ ✅ High contrast, keyboard nav, screen reader support
- [ ] Extract questions for remaining 15 Bundesländer from BAMF PDF
- [ ] Optional Italian translation (if desired)
- [ ] Search for missing images for questions 29, 31, 85, 214, 305 (if they exist)

## 🔗 Sources

- **Official PDF**: [BAMF - Gesamtfragenkatalog](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf)
- **Question Reference**: https://www.einbuergerungstest-online.eu/

## 📄 License

For personal and educational use only. Questions are property of BAMF (Bundesamt für Migration und Flüchtlinge).
