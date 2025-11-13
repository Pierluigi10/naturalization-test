// Quiz application main class

class QuizApp {
    constructor() {
        this.allQuestions = [];
        this.questions = [];
        this.currentIndex = 0;
        this.answers = {};
        this.view = 'home';
        this.mode = null; // 'full', 'simulation', or 'review'
        this.showResult = false;
        this.reviewQuestions = []; // Store original questions for review mode
        this.selectedAnswer = null;
        this.selectedBundesland = 'Sachsen'; // Default Bundesland
        this.startTime = null; // Timer for simulation mode
        this.timerInterval = null;
        this.elapsedTime = 0;
        this.timeoutWarningShown = false;
        this.tenMinWarningShown = false;
        this.timerVisible = true; // Toggle for showing/hiding timer

        // Accessibility settings
        this.highContrast = Storage.loadHighContrast();
        this.fontSize = Storage.loadFontSize();

        // Touch swipe support
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.bundeslaender = [
            'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg',
            'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern',
            'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz',
            'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
        ];

        this.loadData();
        this.startTimer();
        this.applyAccessibilitySettings();
        this.setupKeyboardNavigation();
        this.render();
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

    // ==================== KEYBOARD & TOUCH ====================

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard in quiz view
            if (this.view !== 'quiz') return;

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevQuestion();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    if (!this.showResult) {
                        e.preventDefault();
                        const index = parseInt(e.key) - 1;
                        this.handleAnswer(index);
                    }
                    break;
                case 'a':
                case 'A':
                    if (!this.showResult) {
                        e.preventDefault();
                        this.handleAnswer(0);
                    }
                    break;
                case 'b':
                case 'B':
                    if (!this.showResult) {
                        e.preventDefault();
                        this.handleAnswer(1);
                    }
                    break;
                case 'c':
                case 'C':
                    if (!this.showResult) {
                        e.preventDefault();
                        this.handleAnswer(2);
                    }
                    break;
                case 'd':
                case 'D':
                    if (!this.showResult) {
                        e.preventDefault();
                        this.handleAnswer(3);
                    }
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.view = 'stats';
                    this.render();
                    break;
                case 'h':
                case 'H':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.returnToHome();
                    }
                    break;
            }
        });
    }

    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeThreshold = 50; // minimum distance for swipe
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff > 0) {
            // Swipe left - next question
            this.nextQuestion();
        } else {
            // Swipe right - previous question
            this.prevQuestion();
        }
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
            this.startTime = storedStartTime;
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
        }
    }

    // ==================== TIMER ====================

    startTimer() {
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Only start timer for simulation mode
        if (this.mode !== 'simulation' || !this.startTime) {
            return;
        }

        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;

            // Check if 60 minutes have passed
            if (this.elapsedTime >= 60 * 60 * 1000 && !this.timeoutWarningShown) {
                this.timeoutWarningShown = true;
                alert('⏰ 60 minutes have passed!\n\nYou can continue answering, but your total time will be recorded.');
            }

            // Update timer display
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer-display');
        const progressBar = document.getElementById('time-progress-bar');

        if (timerElement && this.startTime) {
            const elapsed = this.elapsedTime;
            const remaining = 60 * 60 * 1000 - elapsed;
            const remainingMinutes = remaining / (60 * 1000);

            // Update progress bar
            if (progressBar) {
                const progressPercent = Math.min((elapsed / (60 * 60 * 1000)) * 100, 100);
                progressBar.style.width = `${progressPercent}%`;

                // Change progress bar color based on time
                if (remaining <= 0) {
                    progressBar.style.background = '#ef4444'; // Red
                } else if (remainingMinutes <= 5) {
                    progressBar.style.background = '#f97316'; // Orange
                } else if (remainingMinutes <= 10) {
                    progressBar.style.background = '#f59e0b'; // Yellow-orange
                } else {
                    progressBar.style.background = 'linear-gradient(90deg, #667eea, #764ba2)';
                }
            }

            // Show warning at 10 minutes remaining
            if (remainingMinutes <= 10 && remainingMinutes > 0 && !this.tenMinWarningShown) {
                this.tenMinWarningShown = true;
                alert('⚠️ 10 minutes remaining!\n\nYou still have time to complete the test.');
            }

            // Update timer text and color
            if (remaining > 0) {
                timerElement.textContent = `⏱️ ${this.formatTime(elapsed)} / 1:00:00`;

                // Progressive color warning
                if (remainingMinutes <= 5) {
                    timerElement.style.color = '#f97316';
                    timerElement.style.fontWeight = 'bold';
                } else if (remainingMinutes <= 10) {
                    timerElement.style.color = '#f59e0b';
                    timerElement.style.fontWeight = 'bold';
                } else {
                    timerElement.style.color = '#374151';
                    timerElement.style.fontWeight = '600';
                }
            } else {
                timerElement.textContent = `⏱️ ${this.formatTime(elapsed)} (overtime)`;
                timerElement.style.color = '#ef4444';
                timerElement.style.fontWeight = 'bold';
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
            this.startTime = null;
            this.stopTimer();
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
            this.startTime = Date.now();
            this.elapsedTime = 0;
            this.timeoutWarningShown = false;
            this.tenMinWarningShown = false;
            Storage.saveStartTime(this.startTime);
            Storage.saveActiveQuestions(this.questions);
            this.startTimer();
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
        this.startTime = null;
        this.stopTimer();

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
        this.startTime = null;
        this.stopTimer();

        Storage.saveMode(this.mode);
        Storage.saveActiveQuestions(this.questions);
        Storage.saveAnswers(this.answers);
        Storage.clearSession();

        this.view = 'quiz';
        this.render();
    }

    startReview() {
        // Get wrong answers from current session
        const wrongQuestions = [];
        this.questions.forEach((q, idx) => {
            const answer = this.answers[idx];
            if (answer && !answer.correct) {
                wrongQuestions.push(q);
            }
        });

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
        this.startTime = null;
        this.stopTimer();

        Storage.saveMode(this.mode);
        Storage.saveActiveQuestions(this.questions);
        Storage.saveReviewQuestions(this.reviewQuestions);
        Storage.saveAnswers(this.answers);

        this.view = 'quiz';
        this.render();
    }

    triggerConfetti() {
        // Check if confetti library is loaded
        if (typeof confetti === 'undefined') return;

        // Launch confetti animation
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Launch confetti from two different origins
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }

    returnToHome() {
        if (confirm('Do you want to return to home? Current progress will be lost.')) {
            this.mode = null;
            this.questions = [];
            this.answers = {};
            this.currentIndex = 0;
            this.startTime = null;
            this.stopTimer();
            Storage.clearSession();
            this.view = 'home';
            this.render();
        }
    }

    handleAnswer(index) {
        if (this.showResult) return;

        this.selectedAnswer = index;
        this.showResult = true;

        const correct = index === this.questions[this.currentIndex].correct;
        this.answers[this.currentIndex] = {
            selected: index,
            correct: correct,
            timestamp: Date.now()
        };

        Storage.saveAnswers(this.answers);
        this.render();

        // Auto-advance to next question after answering
        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    }

    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.selectedAnswer = null;
            this.showResult = false;
            this.render();
        } else {
            // Auto-transition to stats view when all questions answered
            this.view = 'stats';
            this.render();
        }
    }

    prevQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            // Check if this question was already answered
            if (this.answers[this.currentIndex]) {
                this.selectedAnswer = this.answers[this.currentIndex].selected;
                this.showResult = true;
            } else {
                this.selectedAnswer = null;
                this.showResult = false;
            }
            this.render();
        }
    }

    goToQuestion(questionId) {
        const id = parseInt(questionId);

        if (!questionId || isNaN(id)) {
            alert('Please enter a valid question number.');
            return;
        }

        if (id < 1 || id > 310) {
            alert('Question number must be between 1 and 310.');
            return;
        }

        const index = this.questions.findIndex(q => q.id === id);
        if (index !== -1) {
            this.currentIndex = index;
            // Check if this question was already answered
            if (this.answers[this.currentIndex]) {
                this.selectedAnswer = this.answers[this.currentIndex].selected;
                this.showResult = true;
            } else {
                this.selectedAnswer = null;
                this.showResult = false;
            }
            this.render();
        } else {
            alert(`Question ${id} not found in this mode.`);
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
                this.startTime = Date.now();
                this.elapsedTime = 0;
                this.timeoutWarningShown = false;
                this.tenMinWarningShown = false;
                Storage.saveStartTime(this.startTime);
                this.stopTimer();
                this.startTimer();
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

    getStats() {
        const answered = Object.keys(this.answers).length;
        const correct = Object.values(this.answers).filter(a => a.correct).length;
        const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;
        return { answered, correct, percentage, total: this.questions.length };
    }

    // ==================== RENDERING ====================

    render() {
        const app = document.getElementById('app');

        if (this.allQuestions.length === 0) {
            app.innerHTML = this.renderImport();
        } else if (this.view === 'home') {
            app.innerHTML = this.renderHome();
        } else if (this.view === 'topicSelection') {
            app.innerHTML = this.renderTopicSelection();
        } else if (this.view === 'stats') {
            app.innerHTML = this.renderStats();
        } else {
            app.innerHTML = this.renderQuiz();
        }

        this.attachEventListeners();
    }

    renderAccessibilityPanel() {
        return `
            <div class="card" style="margin-bottom: 16px;">
                <details>
                    <summary style="cursor: pointer; font-weight: 600; color: #374151; padding: 8px; user-select: none;">
                        ♿ Accessibility Settings
                    </summary>
                    <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <!-- Font Size -->
                            <div>
                                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                                    Font Size: ${this.fontSize}%
                                </label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <button
                                        class="btn btn-secondary"
                                        onclick="app.adjustFontSize(-10)"
                                        aria-label="Decrease font size"
                                        style="flex: 1;"
                                    >
                                        A-
                                    </button>
                                    <button
                                        class="btn btn-secondary"
                                        onclick="app.adjustFontSize(10)"
                                        aria-label="Increase font size"
                                        style="flex: 1;"
                                    >
                                        A+
                                    </button>
                                </div>
                            </div>

                            <!-- High Contrast -->
                            <div>
                                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                                    High Contrast Mode
                                </label>
                                <button
                                    class="btn btn-secondary"
                                    onclick="app.toggleHighContrast()"
                                    aria-label="Toggle high contrast mode"
                                    aria-pressed="${this.highContrast}"
                                    style="width: 100%;"
                                >
                                    ${this.highContrast ? '✓ Enabled' : 'Disabled'}
                                </button>
                            </div>

                            <!-- Keyboard Shortcuts -->
                            <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
                                <strong style="color: #374151;">⌨️ Keyboard Shortcuts:</strong><br>
                                • Arrow Left/Right: Previous/Next question<br>
                                • 1, 2, 3, 4 or A, B, C, D: Select answer<br>
                                • S: View statistics<br>
                                • Ctrl/Cmd + H: Return to home
                            </div>

                            <!-- Mobile Gestures -->
                            <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
                                <strong style="color: #374151;">📱 Mobile Gestures:</strong><br>
                                • Swipe left: Next question<br>
                                • Swipe right: Previous question
                            </div>
                        </div>
                    </div>
                </details>
            </div>
        `;
    }

    renderHome() {
        const availableBundeslaender = this.getAvailableBundeslaender();
        const hasOngoingSimulation = this.mode === 'simulation' && this.startTime && this.questions.length > 0;

        // Count regional questions for selected Bundesland
        const regionalQuestionsCount = this.allQuestions.filter(q =>
            q.id > 300 && q.bundesland === this.selectedBundesland
        ).length;

        return `
            ${this.renderAccessibilityPanel()}
            <div class="card">
                <h1>🇩🇪 Einbürgerungstest</h1>
                <p style="text-align: center; color: #6b7280; margin-bottom: 24px;">
                    Choose your practice mode
                </p>

                ${hasOngoingSimulation ? `
                <div style="padding: 16px; margin-bottom: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; color: white; text-align: center;">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        ⚠️ Ongoing Simulation
                    </div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
                        ⏱️ ${this.formatTime(Date.now() - this.startTime)}
                    </div>
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">
                        ${Object.keys(this.answers).length} / ${this.questions.length} questions answered
                    </div>
                    <button class="btn" onclick="app.view = 'quiz'; app.render();" style="background: white; color: #667eea; font-weight: 600;">
                        Continue Test →
                    </button>
                </div>
                ` : ''}

                <div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        🗺️ Your Bundesland:
                    </label>
                    <select
                        id="bundeslandSelect"
                        onchange="app.selectBundesland(this.value)"
                        style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white; cursor: pointer;"
                    >
                        ${this.bundeslaender.map(bl => {
                            const available = availableBundeslaender.includes(bl);
                            const selected = bl === this.selectedBundesland ? 'selected' : '';
                            const label = available ? bl : `${bl} (not yet available)`;
                            return `<option value="${bl}" ${selected}>${label}</option>`;
                        }).join('')}
                    </select>
                    <p style="font-size: 12px; color: #6b7280; margin-top: 8px; margin-bottom: 0;">
                        The test includes 3 random questions specific to your Bundesland
                    </p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 16px;" role="navigation" aria-label="Quiz mode selection">
                    <button
                        class="btn btn-primary"
                        onclick="app.startQuiz('full')"
                        style="padding: 24px;"
                        aria-label="Start practice with all questions"
                    >
                        <div style="text-align: left; width: 100%;">
                            <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">
                                📚 All Questions
                            </div>
                            <div style="font-size: 14px; opacity: 0.9;">
                                300 federal + ${regionalQuestionsCount} ${this.selectedBundesland} questions (${300 + regionalQuestionsCount} total)
                            </div>
                        </div>
                    </button>

                    <button
                        class="btn"
                        onclick="app.startQuiz('simulation')"
                        style="padding: 24px; background: linear-gradient(135deg, #10b981, #059669); color: white;"
                        aria-label="Start test simulation with 33 random questions"
                    >
                        <div style="text-align: left; width: 100%;">
                            <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">
                                ✅ Test Simulation
                            </div>
                            <div style="font-size: 14px; opacity: 0.9;">
                                33 random questions (30 federal + 3 regional)
                            </div>
                        </div>
                    </button>

                    <button
                        class="btn"
                        onclick="app.view = 'topicSelection'; app.render();"
                        style="padding: 24px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white;"
                        aria-label="Practice by topic or question range"
                    >
                        <div style="text-align: left; width: 100%;">
                            <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">
                                🎯 Practice by Topic
                            </div>
                            <div style="font-size: 14px; opacity: 0.9;">
                                Select specific question ranges or Bundesland
                            </div>
                        </div>
                    </button>
                </div>

                <div style="margin-top: 32px; padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <div style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                        <strong style="color: #374151;">ℹ️ About the test:</strong><br>
                        The real naturalization test consists of 33 questions:<br>
                        • 30 random questions from the federal catalog (questions 1-300)<br>
                        • 3 random questions from your Bundesland<br><br>
                        To pass, you need to answer at least 17 out of 33 questions correctly (≥51.5%).
                    </div>
                </div>
            </div>
        `;
    }

    renderTopicSelection() {
        // Group federal questions (1-300) into ranges of 30
        const federalRanges = [];
        for (let i = 1; i <= 300; i += 30) {
            const end = Math.min(i + 29, 300);
            const rangeQuestions = this.allQuestions.filter(q => q.id >= i && q.id <= end);
            if (rangeQuestions.length > 0) {
                federalRanges.push({
                    start: i,
                    end: end,
                    count: rangeQuestions.length,
                    label: `Questions ${i}-${end}`
                });
            }
        }

        // Group regional questions by Bundesland
        const regionalGroups = {};
        this.allQuestions.filter(q => q.id > 300 && q.bundesland).forEach(q => {
            if (!regionalGroups[q.bundesland]) {
                regionalGroups[q.bundesland] = [];
            }
            regionalGroups[q.bundesland].push(q);
        });

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h1>🎯 Practice by Topic</h1>
                    <button class="btn" onclick="app.returnToHome()" style="padding: 8px 16px;">
                        ← Back
                    </button>
                </div>

                <p style="text-align: center; color: #6b7280; margin-bottom: 32px;">
                    Select a specific range of questions to practice
                </p>

                <!-- Federal Questions Section -->
                <div style="margin-bottom: 32px;">
                    <h2 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        🇩🇪 Federal Questions (1-300)
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
                        ${federalRanges.map(range => `
                            <button
                                class="btn"
                                onclick="app.startTopicQuiz(${range.start}, ${range.end})"
                                style="padding: 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; font-size: 14px; text-align: center;"
                            >
                                <div style="font-weight: bold; margin-bottom: 4px;">${range.start}-${range.end}</div>
                                <div style="font-size: 12px; opacity: 0.9;">${range.count} questions</div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Regional Questions Section -->
                ${Object.keys(regionalGroups).length > 0 ? `
                <div>
                    <h2 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        🗺️ Bundesland Questions (301-310)
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                        ${Object.entries(regionalGroups).map(([bundesland, questions]) => `
                            <button
                                class="btn"
                                onclick="app.startTopicQuizByBundesland('${bundesland}')"
                                style="padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 14px; text-align: center;"
                            >
                                <div style="font-weight: bold; margin-bottom: 4px;">${bundesland}</div>
                                <div style="font-size: 12px; opacity: 0.9;">${questions.length} questions</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderImport() {
        if (typeof QUESTIONS_DATA !== 'undefined') {
            return `
                <div class="card">
                    <div class="import-section">
                        <div class="import-icon">⚠️</div>
                        <h1>Loading Error</h1>
                        <p style="color: #6b7280; margin-bottom: 24px;">
                            Questions should load automatically.<br>
                            If you see this message, try reloading the page.
                        </p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            🔄 Reload Page
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="import-section">
                    <div class="import-icon">📚</div>
                    <h1>Einbürgerungstest Quiz</h1>
                    <p style="color: #6b7280; margin-bottom: 24px;">
                        Import test questions to start practicing
                    </p>
                    <div class="code-example">
[
  {
    "id": 1,
    "question": "Question text?",
    "options": ["Answer A", "Answer B", "Answer C", "Answer D"],
    "correct": 0
  }
]
                    </div>
                    <label class="btn btn-primary" style="display: inline-flex; cursor: pointer;">
                        📤 Import Questions (JSON)
                        <input type="file" accept=".json" class="file-input" id="fileInput">
                    </label>
                </div>
            </div>
        `;
    }

    renderQuiz() {
        const question = this.questions[this.currentIndex];
        const progress = ((this.currentIndex + 1) / this.questions.length) * 100;
        const modeLabel = this.mode === 'simulation' ? '🎯 Simulation Mode' :
                         this.mode === 'review' ? '🔄 Review Wrong Answers' :
                         this.mode === 'topic' ? '🎯 Topic Practice' : '📚 Full Practice';

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <button
                        class="btn-stats"
                        onclick="app.returnToHome();"
                        style="border-color: #6b7280; color: #6b7280;"
                        aria-label="Return to home page"
                    >
                        ← Home
                    </button>
                    <div
                        style="font-size: 12px; font-weight: 600; color: #667eea; padding: 4px 12px; background: #f3f4ff; border-radius: 8px;"
                        role="status"
                        aria-label="${modeLabel}"
                    >
                        ${modeLabel}
                    </div>
                    <button
                        class="btn-stats"
                        onclick="app.view = 'stats'; app.render();"
                        aria-label="View statistics"
                    >
                        📊 Stats
                    </button>
                </div>
                ${this.mode === 'simulation' && this.startTime ? `
                <div style="margin-bottom: 12px; ${this.timerVisible ? '' : 'opacity: 0.3;'}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div id="timer-display" style="font-size: 16px; font-weight: 600; color: #374151;">
                            ⏱️ 0:00:00 / 1:00:00
                        </div>
                        <button
                            onclick="app.timerVisible = !app.timerVisible; app.render();"
                            style="background: transparent; border: none; cursor: pointer; font-size: 14px; color: #6b7280; padding: 4px 8px;"
                            title="${this.timerVisible ? 'Hide timer' : 'Show timer'}"
                        >
                            ${this.timerVisible ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                        <div id="time-progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s, background 0.3s;"></div>
                    </div>
                </div>
                ` : ''}
                <div class="header">
                    <div
                        style="font-size: 14px; font-weight: 600; color: #6b7280;"
                        role="status"
                        aria-live="polite"
                    >
                        Question ${this.currentIndex + 1} of ${this.questions.length}
                    </div>
                </div>
                <div
                    class="progress-bar"
                    role="progressbar"
                    aria-valuenow="${this.currentIndex + 1}"
                    aria-valuemin="1"
                    aria-valuemax="${this.questions.length}"
                    aria-label="Quiz progress"
                >
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>

            <div
                class="card"
                id="question-card"
                role="main"
                aria-labelledby="current-question"
            >
                ${question.image ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${question.image}" alt="Question ${question.id} illustration" style="max-width: 100%; height: auto; border-radius: 8px;"></div>` : ''}
                <div
                    class="question"
                    id="current-question"
                    role="heading"
                    aria-level="2"
                >
                    ${question.question}
                </div>
                <div role="radiogroup" aria-labelledby="current-question">
                    ${question.options.map((option, idx) => {
                        const isSelected = this.selectedAnswer === idx;
                        const isCorrect = idx === question.correct;
                        const showCorrect = this.showResult && isCorrect;
                        const showWrong = this.showResult && isSelected && !isCorrect;

                        let className = 'option';
                        if (showCorrect) className += ' correct';
                        else if (showWrong) className += ' wrong';
                        else if (isSelected) className += ' selected';
                        if (this.showResult) className += ' disabled';

                        const ariaLabel = `Option ${String.fromCharCode(65 + idx)}: ${option}${showCorrect ? ' - Correct answer' : ''}${showWrong ? ' - Incorrect' : ''}`;

                        return `
                            <div
                                class="${className}"
                                onclick="${this.showResult ? '' : `app.handleAnswer(${idx})`}"
                                role="radio"
                                aria-checked="${isSelected ? 'true' : 'false'}"
                                aria-label="${ariaLabel}"
                                tabindex="${this.showResult ? '-1' : '0'}"
                                onkeypress="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ${this.showResult ? '' : `app.handleAnswer(${idx})`} }"
                            >
                                <div class="option-letter" aria-hidden="true">${String.fromCharCode(65 + idx)}</div>
                                <div class="option-text">${option}</div>
                                ${showCorrect ? '<span style="color: #10b981; font-weight: bold;" aria-hidden="true">✓</span>' : ''}
                                ${showWrong ? '<span style="color: #ef4444; font-weight: bold;" aria-hidden="true">✗</span>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="card">
                <div class="navigation" role="navigation" aria-label="Question navigation">
                    <button
                        class="btn btn-secondary"
                        onclick="app.prevQuestion()"
                        ${this.currentIndex === 0 ? 'disabled' : ''}
                        aria-label="Previous question"
                    >
                        ← Previous
                    </button>
                    <button
                        class="btn btn-primary"
                        onclick="app.nextQuestion()"
                        ${this.currentIndex === this.questions.length - 1 ? 'disabled' : ''}
                        aria-label="Next question"
                    >
                        Next →
                    </button>
                </div>
                ${this.mode === 'full' ? `
                <div style="margin-top: 16px; display: flex; align-items: center; gap: 12px;">
                    <label style="font-size: 14px; font-weight: 600; color: #6b7280;">Go to question:</label>
                    <input
                        type="number"
                        id="questionNumberInput"
                        min="1"
                        max="310"
                        placeholder="e.g. 258"
                        style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                        onkeypress="if(event.key === 'Enter') app.goToQuestion(this.value)"
                    >
                    <button class="btn btn-secondary" onclick="app.goToQuestion(document.getElementById('questionNumberInput').value)" style="white-space: nowrap;">
                        Jump
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderStats() {
        const stats = this.getStats();
        const modeLabel = this.mode === 'simulation' ? '🎯 Simulation Mode' :
                         this.mode === 'review' ? '🔄 Review Mode' :
                         this.mode === 'topic' ? '🎯 Topic Practice' : '📚 Full Practice';

        // For simulation mode, need 17 correct answers out of all 33 questions (federal + regional)
        let passThreshold, hasPassed;
        if (this.mode === 'simulation') {
            passThreshold = 17; // Need 17 out of 33 total questions (30 federal + 3 regional)
            hasPassed = stats.correct >= passThreshold;
        } else {
            passThreshold = Math.ceil(this.questions.length * 0.515);
            hasPassed = stats.correct >= passThreshold;
        }
        const totalTime = this.startTime ? Date.now() - this.startTime : 0;

        // Count wrong answers
        const wrongAnswersCount = Object.values(this.answers).filter(a => !a.correct).length;

        // Trigger confetti if test is passed (simulation mode only, all questions answered)
        if (this.mode === 'simulation' && stats.answered === stats.total && hasPassed) {
            // Use setTimeout to ensure DOM is rendered before confetti
            setTimeout(() => this.triggerConfetti(), 100);
        }

        return `
            <div class="card">
                <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                    <button class="btn-stats" onclick="app.view = 'quiz'; app.render();">
                        ← Back to Quiz
                    </button>
                    <button class="btn-stats" onclick="app.returnToHome();" style="border-color: #6b7280; color: #6b7280;">
                        🏠 Home
                    </button>
                </div>

                <h1>📊 Statistics</h1>
                <div style="text-align: center; margin-bottom: 16px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                    <span style="font-size: 12px; font-weight: 600; color: #667eea; padding: 4px 12px; background: #f3f4ff; border-radius: 8px;">
                        ${modeLabel}
                    </span>
                    ${this.mode === 'simulation' ? `
                    <span style="font-size: 12px; font-weight: 600; color: #059669; padding: 4px 12px; background: #d1fae5; border-radius: 8px;">
                        🗺️ ${this.selectedBundesland}
                    </span>
                    ` : ''}
                </div>

                ${this.mode === 'simulation' && this.startTime && stats.answered === stats.total ? `
                <div style="text-align: center; padding: 16px; margin-bottom: 16px; border-radius: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">
                        ⏱️ Total Time
                    </div>
                    <div style="font-size: 32px; font-weight: bold;">
                        ${this.formatTime(totalTime)}
                    </div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">
                        ${totalTime > 60 * 60 * 1000 ? '(Exceeded 60 minutes)' : '(Within time limit)'}
                    </div>
                </div>
                ` : ''}

                ${this.mode === 'simulation' && stats.answered === stats.total ? `
                <div style="text-align: center; padding: 20px; margin-bottom: 16px; border-radius: 12px; background: ${hasPassed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'}; color: white;">
                    <div style="font-size: 48px; margin-bottom: 8px;">${hasPassed ? '✅' : '❌'}</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">
                        ${hasPassed ? 'PASSED!' : 'NOT PASSED'}
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        You need ${passThreshold} correct answers to pass (${stats.correct}/${stats.total})
                    </div>
                </div>
                ` : ''}

                <div class="stats-grid">
                    <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <div class="stat-value">${stats.answered}</div>
                        <div class="stat-label">Answered</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <div class="stat-value">${stats.correct}</div>
                        <div class="stat-label">Correct</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                        <div class="stat-value">${stats.percentage}%</div>
                        <div class="stat-label">Percentage</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #6b7280, #4b5563);">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total Questions</div>
                    </div>
                </div>

                ${this.mode === 'simulation' && this.startTime && stats.answered > 0 ? `
                <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <h3 style="margin-bottom: 12px; color: #374151;">⏱️ Time Statistics</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <div style="color: #6b7280; margin-bottom: 4px;">Average per question</div>
                            <div style="font-size: 18px; font-weight: 600; color: #374151;">
                                ${this.formatTime(Math.floor(totalTime / stats.answered))}
                            </div>
                        </div>
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <div style="color: #6b7280; margin-bottom: 4px;">Elapsed time</div>
                            <div style="font-size: 18px; font-weight: 600; color: #374151;">
                                ${this.formatTime(totalTime)}
                            </div>
                        </div>
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <div style="color: #6b7280; margin-bottom: 4px;">Federal questions</div>
                            <div style="font-size: 18px; font-weight: 600; color: #374151;">
                                ${this.questions.filter((q, idx) => q.id <= 300 && this.answers[idx]).length} / 30
                            </div>
                        </div>
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <div style="color: #6b7280; margin-bottom: 4px;">Regional questions</div>
                            <div style="font-size: 18px; font-weight: 600; color: #374151;">
                                ${this.questions.filter((q, idx) => q.id > 300 && this.answers[idx]).length} / 3
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <h3 style="margin-bottom: 12px; margin-top: 16px; color: #374151;">Answer Details</h3>
                <div class="answer-list">
                    ${this.questions.map((q, idx) => {
                        const answer = this.answers[idx];
                        let className = 'answer-item ';
                        let badge = '';

                        if (!answer) {
                            className += 'unanswered';
                            badge = '<span class="badge" style="background: #e5e7eb; color: #374151;">Not answered</span>';
                        } else if (answer.correct) {
                            className += 'correct';
                            badge = '<span class="badge" style="background: #10b981; color: white;">✓ Correct</span>';
                        } else {
                            className += 'incorrect';
                            badge = '<span class="badge" style="background: #ef4444; color: white;">✗ Wrong</span>';
                        }

                        return `
                            <div class="${className}">
                                <span style="font-weight: 600;">Question ${q.id}</span>
                                ${badge}
                            </div>
                        `;
                    }).join('')}
                </div>

                ${wrongAnswersCount > 0 && this.mode !== 'review' ? `
                <div style="margin-top: 24px; padding: 16px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; text-align: center;">
                    <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        🔄 ${wrongAnswersCount} question${wrongAnswersCount > 1 ? 's' : ''} answered incorrectly
                    </div>
                    <button class="btn" onclick="app.startReview()" style="width: 100%; background: white; color: #d97706; font-weight: 600;">
                        📝 Review Wrong Answers
                    </button>
                </div>
                ` : ''}

                <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
                    <button class="btn" onclick="app.resetProgress()" style="flex: 1; background: #f59e0b; color: white;">
                        🔄 Reset Progress
                    </button>
                    ${this.mode === 'simulation' ? `
                    <button class="btn" onclick="app.startQuiz('simulation')" style="flex: 1; background: #10b981; color: white;">
                        🎲 New Test
                    </button>
                    ` : ''}
                </div>

                ${typeof QUESTIONS_DATA !== 'undefined' ? `
                <button class="btn" onclick="app.reloadQuestions()" style="width: 100%; background: #667eea; color: white; margin-top: 12px;">
                    🔄 Reload Original Questions
                </button>
                ` : ''}
            </div>
        `;
    }

    attachEventListeners() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.importFile(e));
        }

        // Attach touch event listeners for swipe support
        const questionCard = document.getElementById('question-card');
        if (questionCard && this.view === 'quiz') {
            questionCard.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
            questionCard.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        }
    }
}
