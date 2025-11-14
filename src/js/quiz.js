// Quiz application main class (refactored)

class QuizApp {
    constructor() {
        // Data
        this.allQuestions = [];
        this.questions = [];
        this.currentIndex = 0;
        this.answers = {};

        // UI State
        this.view = 'home';
        this.mode = null; // 'full', 'simulation', 'topic', or 'review'
        this.showResult = false;
        this.selectedAnswer = null;
        this.isNavigatingBack = false;

        // Quiz State
        this.reviewQuestions = [];
        this.selectedBundesland = 'Sachsen';

        // Accessibility
        this.highContrast = Storage.loadHighContrast();
        this.fontSize = Storage.loadFontSize();

        // Bundesländer list
        this.bundeslaender = [
            'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg',
            'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern',
            'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz',
            'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
        ];

        // Initialize modules
        this.timer = new Timer(this);
        this.navigation = new Navigation(this);
        this.statistics = new Statistics(this);
        this.share = new ShareResults(this);
        this.renderer = new UIRenderer(this);

        // Initialize app
        this.loadData();
        this.applyAccessibilitySettings();
        this.navigation.setupKeyboard();
        this.render();
    }

    // ==================== RENDERING ====================

    /**
     * Main render method - delegates to UIRenderer
     */
    render() {
        this.renderer.render();
    }

    // ==================== ACCESSIBILITY ====================

    applyAccessibilitySettings() {
        const root = document.documentElement;
        root.style.fontSize = `${this.fontSize}%`;

        if (this.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    toggleHighContrast() {
        this.highContrast = !this.highContrast;
        Storage.saveHighContrast(this.highContrast);
        this.applyAccessibilitySettings();
        this.render();
    }

    adjustFontSize(delta) {
        this.fontSize = Math.max(80, Math.min(150, this.fontSize + delta));
        Storage.saveFontSize(this.fontSize);
        this.applyAccessibilitySettings();
        this.render();
    }

    // ==================== DATA LOADING ====================

    loadData() {
        // First try to load from localStorage
        const stored = Storage.loadQuestions();

        if (typeof QUESTIONS_DATA !== 'undefined') {
            // If we have QUESTIONS_DATA, check if it's different from localStorage
            let needsUpdate = false;

            if (stored) {
                // Check if number of questions is different
                if (stored.length !== QUESTIONS_DATA.length) {
                    needsUpdate = true;
                    console.log(`Update: ${stored.length} → ${QUESTIONS_DATA.length} questions`);
                } else {
                    // Check if content has changed by comparing a sample of questions
                    const indices = [0, Math.floor(QUESTIONS_DATA.length / 2), QUESTIONS_DATA.length - 1];
                    for (const idx of indices) {
                        if (stored[idx].correct !== QUESTIONS_DATA[idx].correct ||
                            stored[idx].question !== QUESTIONS_DATA[idx].question) {
                            needsUpdate = true;
                            console.log('Update: Questions content has changed');
                            break;
                        }
                    }
                }

                if (needsUpdate) {
                    this.allQuestions = QUESTIONS_DATA;
                    Storage.saveQuestions(this.allQuestions);
                } else {
                    this.allQuestions = stored;
                }
            } else {
                // If nothing in localStorage, load from questions.js
                this.allQuestions = QUESTIONS_DATA;
                Storage.saveQuestions(this.allQuestions);
                console.log('Loaded questions from file');
            }
        } else if (stored) {
            // Fallback: use only localStorage if QUESTIONS_DATA is not available
            this.allQuestions = stored;
        }

        // Load mode and active questions
        const storedMode = Storage.loadMode();
        if (storedMode) {
            this.mode = storedMode;
            const storedActiveQuestions = Storage.loadActiveQuestions();
            if (storedActiveQuestions) {
                this.questions = storedActiveQuestions;
                this.view = 'quiz';
            }
        }

        // Load answers
        this.answers = Storage.loadAnswers();

        // Load selected Bundesland
        const storedBundesland = Storage.loadBundesland();
        if (storedBundesland) {
            this.selectedBundesland = storedBundesland;
        }

        // Load start time for simulation
        const storedStartTime = Storage.loadStartTime();
        if (storedStartTime && this.mode === 'simulation') {
            this.timer.startTime = storedStartTime;
            this.timer.start();
        }

        // Load review questions if in review mode
        if (this.mode === 'review') {
            const storedReviewQuestions = Storage.loadReviewQuestions();
            if (storedReviewQuestions && storedReviewQuestions.length > 0) {
                this.reviewQuestions = storedReviewQuestions;
            }
        }

        // If resuming a session, check if current question was already answered
        if (this.view === 'quiz' && this.answers[this.currentIndex]) {
            this.selectedAnswer = this.answers[this.currentIndex].selected;
            this.showResult = true;
            // In simulation mode, if resuming on an answered question, enable navigation
            if (this.mode === 'simulation') {
                this.isNavigatingBack = true;
            }
        }
    }

    // ==================== QUIZ MANAGEMENT ====================

    selectBundesland(bundesland) {
        this.selectedBundesland = bundesland;
        Storage.saveBundesland(bundesland);
        this.render();
    }

    getAvailableBundeslaender() {
        // Return list of Bundesländer that have at least 3 questions
        const bundeslaenderCount = {};
        this.allQuestions
            .filter(q => q.id > 300 && q.bundesland)
            .forEach(q => {
                bundeslaenderCount[q.bundesland] = (bundeslaenderCount[q.bundesland] || 0) + 1;
            });

        return Object.keys(bundeslaenderCount).filter(bl => bundeslaenderCount[bl] >= 3);
    }

    startQuiz(mode) {
        this.mode = mode;
        Storage.saveMode(mode);

        if (mode === 'full') {
            // Use federal questions (1-300) + selected Bundesland questions
            const federalQuestions = this.allQuestions.filter(q => q.id <= 300);
            const regionalQuestions = this.allQuestions.filter(q =>
                q.id > 300 && q.bundesland === this.selectedBundesland
            );

            this.questions = [...federalQuestions, ...regionalQuestions];

            // No timer for full mode
            this.timer.startTime = null;
            this.timer.stop();
            Storage.clearSession();
            Storage.saveMode(mode);
            Storage.saveActiveQuestions(this.questions);
        } else if (mode === 'simulation') {
            // Select 30 random questions from the first 300 (federal questions)
            const generalQuestions = this.allQuestions.filter(q => q.id <= 300);
            const selectedGeneral = this.getRandomQuestions(generalQuestions, 30);

            // Select 3 random questions from selected Bundesland
            const regionalQuestions = this.allQuestions.filter(q =>
                q.id > 300 && q.bundesland === this.selectedBundesland
            );

            if (regionalQuestions.length >= 3) {
                const selectedRegional = this.getRandomQuestions(regionalQuestions, 3);
                this.questions = [...selectedGeneral, ...selectedRegional];
            } else {
                alert(`Sorry, regional questions for ${this.selectedBundesland} are not yet available. Using Sachsen questions instead.`);
                const fallbackRegional = this.allQuestions.filter(q =>
                    q.id > 300 && q.bundesland === 'Sachsen'
                );
                const selectedRegional = this.getRandomQuestions(fallbackRegional, 3);
                this.questions = [...selectedGeneral, ...selectedRegional];
            }

            // Start timer for simulation mode
            this.timer.startTime = Date.now();
            this.timer.elapsedTime = 0;
            this.timer.timeoutWarningShown = false;
            this.timer.tenMinWarningShown = false;
            Storage.saveStartTime(this.timer.startTime);
            Storage.saveActiveQuestions(this.questions);
            this.timer.start();
        }

        this.currentIndex = 0;
        this.answers = {};
        Storage.saveAnswers(this.answers);
        this.view = 'quiz';
        this.render();
    }

    getRandomQuestions(questions, count) {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    startTopicQuiz(start, end) {
        // Filter questions by range
        this.questions = this.allQuestions.filter(q => q.id >= start && q.id <= end);

        if (this.questions.length === 0) {
            alert('No questions found in this range!');
            return;
        }

        // Set mode to 'topic' for practice mode (no timer)
        this.mode = 'topic';
        this.currentIndex = 0;
        this.answers = {};
        this.timer.startTime = null;
        this.timer.stop();

        Storage.saveMode(this.mode);
        Storage.saveActiveQuestions(this.questions);
        Storage.saveAnswers(this.answers);
        Storage.clearSession();

        this.view = 'quiz';
        this.render();
    }

    startTopicQuizByBundesland(bundesland) {
        // Filter questions by Bundesland
        this.questions = this.allQuestions.filter(q =>
            q.id > 300 && q.bundesland === bundesland
        );

        if (this.questions.length === 0) {
            alert(`No questions found for ${bundesland}!`);
            return;
        }

        // Set mode to 'topic' for practice mode (no timer)
        this.mode = 'topic';
        this.currentIndex = 0;
        this.answers = {};
        this.timer.startTime = null;
        this.timer.stop();

        Storage.saveMode(this.mode);
        Storage.saveActiveQuestions(this.questions);
        Storage.saveAnswers(this.answers);
        Storage.clearSession();

        this.view = 'quiz';
        this.render();
    }

    startReview() {
        // Get wrong answers from current session
        const wrongQuestions = this.statistics.getWrongQuestions();

        if (wrongQuestions.length === 0) {
            alert('No wrong answers to review!');
            return;
        }

        // Save current state for reference
        this.reviewQuestions = [...this.questions];

        // Start review mode with wrong questions only
        this.mode = 'review';
        this.questions = wrongQuestions;
        this.currentIndex = 0;
        this.answers = {};

        // No timer for review mode
        this.timer.startTime = null;
        this.timer.stop();

        Storage.saveMode(this.mode);
        Storage.saveActiveQuestions(this.questions);
        Storage.saveReviewQuestions(this.reviewQuestions);
        Storage.saveAnswers(this.answers);

        this.view = 'quiz';
        this.render();
    }

    returnToHome() {
        if (confirm('Do you want to return to home? Current progress will be lost.')) {
            this.mode = null;
            this.questions = [];
            this.answers = {};
            this.currentIndex = 0;
            this.timer.startTime = null;
            this.timer.stop();
            Storage.clearSession();
            this.view = 'home';
            this.render();
        }
    }

    resetProgress() {
        if (confirm('Do you really want to reset all progress for this session?')) {
            this.answers = {};
            this.currentIndex = 0;
            Storage.saveAnswers(this.answers);
            this.selectedAnswer = null;
            this.showResult = false;

            // Reset timer for simulation mode
            if (this.mode === 'simulation') {
                this.timer.reset();
                Storage.saveStartTime(this.timer.startTime);
                this.timer.start();
            }

            this.render();
        }
    }

    reloadQuestions() {
        if (confirm('Do you want to reload the original questions? This will keep your progress.')) {
            if (typeof QUESTIONS_DATA !== 'undefined') {
                this.allQuestions = QUESTIONS_DATA;
                Storage.saveQuestions(this.allQuestions);
                alert('Questions reloaded successfully!');
                this.render();
            }
        }
    }

    importFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                this.allQuestions = imported;
                Storage.saveQuestions(this.allQuestions);
                alert(`${imported.length} questions imported successfully!`);
                this.view = 'home';
                this.render();
            } catch (error) {
                alert('Error in JSON file. Please check the format.');
            }
        };
        reader.readAsText(file);
    }

    viewStats() {
        // Load saved quiz data before viewing stats
        const savedMode = Storage.loadMode();
        const savedAnswers = Storage.loadAnswers();
        const savedActiveQuestions = Storage.loadActiveQuestions();
        const savedStartTime = Storage.loadStartTime();

        if (savedMode && savedAnswers && savedActiveQuestions) {
            this.mode = savedMode;
            this.answers = savedAnswers;
            this.questions = savedActiveQuestions;
            this.timer.startTime = savedStartTime;
            this.view = 'stats';
            this.render();
        }
    }

    /**
     * Share results as image
     */
    async shareResults() {
        const feedbackEl = document.getElementById('share-feedback');
        if (feedbackEl) {
            feedbackEl.textContent = 'Generating image...';
            feedbackEl.style.color = '#6b7280';
        }

        const result = await this.share.shareResults();

        if (feedbackEl) {
            if (result.success) {
                if (result.method === 'share') {
                    feedbackEl.textContent = '✅ Shared successfully!';
                    feedbackEl.style.color = '#10b981';
                } else if (result.method === 'download') {
                    feedbackEl.textContent = result.clipboardText
                        ? '✅ Image downloaded! Text copied to clipboard.'
                        : '✅ Image downloaded!';
                    feedbackEl.style.color = '#10b981';
                }
                setTimeout(() => {
                    if (feedbackEl) feedbackEl.textContent = '';
                }, 3000);
            } else {
                feedbackEl.textContent = '❌ Error: ' + result.error;
                feedbackEl.style.color = '#ef4444';
            }
        }
    }

    /**
     * Copy results as text to clipboard
     */
    async copyResultsText() {
        const feedbackEl = document.getElementById('share-feedback');
        if (feedbackEl) {
            feedbackEl.textContent = 'Copying...';
            feedbackEl.style.color = '#6b7280';
        }

        const result = await this.share.copyResultsText();

        if (feedbackEl) {
            if (result.success) {
                feedbackEl.textContent = '✅ Text copied to clipboard!';
                feedbackEl.style.color = '#10b981';
                setTimeout(() => {
                    if (feedbackEl) feedbackEl.textContent = '';
                }, 3000);
            } else {
                feedbackEl.textContent = '❌ Error: ' + result.error;
                feedbackEl.style.color = '#ef4444';
            }
        }
    }
}
