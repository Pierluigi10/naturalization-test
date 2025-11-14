// Navigation module for quiz question navigation

class Navigation {
    constructor(app) {
        this.app = app;
        this.touchStartX = 0;
        this.touchEndX = 0;
    }

    /**
     * Setup keyboard navigation listeners
     */
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard in quiz view
            if (this.app.view !== 'quiz') return;

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previous();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.next();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    if (!this.app.showResult) {
                        e.preventDefault();
                        const index = parseInt(e.key) - 1;
                        this.handleAnswer(index);
                    }
                    break;
                case 'a':
                case 'A':
                    if (!this.app.showResult) {
                        e.preventDefault();
                        this.handleAnswer(0);
                    }
                    break;
                case 'b':
                case 'B':
                    if (!this.app.showResult) {
                        e.preventDefault();
                        this.handleAnswer(1);
                    }
                    break;
                case 'c':
                case 'C':
                    if (!this.app.showResult) {
                        e.preventDefault();
                        this.handleAnswer(2);
                    }
                    break;
                case 'd':
                case 'D':
                    if (!this.app.showResult) {
                        e.preventDefault();
                        this.handleAnswer(3);
                    }
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.app.view = 'stats';
                    this.app.render();
                    break;
                case 'h':
                case 'H':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.app.returnToHome();
                    }
                    break;
            }
        });
    }

    /**
     * Handle touch start event for swipe gesture
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    /**
     * Handle touch end event for swipe gesture
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe() {
        const swipeThreshold = 50; // minimum distance for swipe
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff > 0) {
            // Swipe left - next question
            this.next();
        } else {
            // Swipe right - previous question
            this.previous();
        }
    }

    /**
     * Handle answer selection
     * @param {number} index - Index of selected answer (0-3)
     */
    handleAnswer(index) {
        if (this.app.showResult) return;

        this.app.selectedAnswer = index;
        this.app.showResult = true;
        this.app.isNavigatingBack = false; // Reset navigation flag when answering

        const correct = index === this.app.questions[this.app.currentIndex].correct;
        this.app.answers[this.app.currentIndex] = {
            selected: index,
            correct: correct,
            timestamp: Date.now()
        };

        Storage.saveAnswers(this.app.answers);

        // Render to update UI (event listeners will be reattached automatically)
        this.app.render();

        // Auto-advance to next question after answering (only in simulation mode)
        if (this.app.mode === 'simulation') {
            setTimeout(() => {
                this.next();
            }, 1000);
        }
    }

    /**
     * Navigate to next question
     */
    next() {
        this.app.isNavigatingBack = false; // Reset navigation flag when moving forward
        if (this.app.currentIndex < this.app.questions.length - 1) {
            this.app.currentIndex++;
            this.app.selectedAnswer = null;
            this.app.showResult = false;

            // Force FULL HTML re-render by resetting view cache
            this.app.renderer.lastView = null;
            this.app.renderer.lastQuestionIndex = null;
            this.app.render();
        } else {
            // Auto-transition to stats view when all questions answered
            this.app.view = 'stats';
            this.app.render();
        }
    }

    /**
     * Navigate to previous question
     */
    previous() {
        if (this.app.currentIndex > 0) {
            this.app.currentIndex--;
            this.app.isNavigatingBack = true; // Set flag when navigating back
            // Check if this question was already answered
            if (this.app.answers[this.app.currentIndex]) {
                this.app.selectedAnswer = this.app.answers[this.app.currentIndex].selected;
                this.app.showResult = true;
            } else {
                this.app.selectedAnswer = null;
                this.app.showResult = false;
            }

            // Force FULL HTML re-render
            this.app.renderer.lastView = null;
            this.app.renderer.lastQuestionIndex = null;
            this.app.render();
        }
    }

    /**
     * Jump to a specific question by ID
     * @param {string|number} questionId - The question ID to jump to
     */
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

        const index = this.app.questions.findIndex(q => q.id === id);
        if (index !== -1) {
            // Add slide-out animation
            const questionCard = document.getElementById('question-card');
            if (questionCard) {
                questionCard.classList.add('slide-out');
                setTimeout(() => {
                    this.app.currentIndex = index;
                    // Check if this question was already answered
                    if (this.app.answers[this.app.currentIndex]) {
                        this.app.selectedAnswer = this.app.answers[this.app.currentIndex].selected;
                        this.app.showResult = true;
                    } else {
                        this.app.selectedAnswer = null;
                        this.app.showResult = false;
                    }
                    this.app.render();
                }, 300); // Match animation duration
            } else {
                // Fallback if card not found
                this.app.currentIndex = index;
                if (this.app.answers[this.app.currentIndex]) {
                    this.app.selectedAnswer = this.app.answers[this.app.currentIndex].selected;
                    this.app.showResult = true;
                } else {
                    this.app.selectedAnswer = null;
                    this.app.showResult = false;
                }
                this.app.render();
            }
        } else {
            alert(`Question ${id} not found in this mode.`);
        }
    }
}
