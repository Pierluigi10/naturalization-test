// Navigation module for quiz question navigation

class Navigation {
    constructor(app) {
        this.app = app;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
    }

    /**
     * Setup keyboard navigation listeners
     */
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard in quiz view
            if (this.app.view !== 'quiz') return;

            // Ignore keyboard shortcuts if user is typing in an input field
            const target = e.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }

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
        this.touchStartY = e.changedTouches[0].screenY;
    }

    /**
     * Handle touch end event for swipe gesture
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleSwipe();
    }

    /**
     * Handle swipe gesture
     * Distinguishes between horizontal swipes (navigation) and vertical swipes (scroll)
     */
    handleSwipe() {
        const swipeThreshold = 50; // minimum distance for swipe
        const horizontalDiff = this.touchStartX - this.touchEndX;
        const verticalDiff = this.touchStartY - this.touchEndY;

        // Only trigger swipe if horizontal movement is greater than vertical
        // This prevents triggering navigation during vertical scroll
        if (Math.abs(horizontalDiff) < swipeThreshold) return;
        if (Math.abs(verticalDiff) > Math.abs(horizontalDiff)) return; // vertical scroll detected

        if (horizontalDiff > 0) {
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

        // Check if all questions are answered
        const allAnswered = Object.keys(this.app.answers).length === this.app.questions.length;

        // Auto-advance to next question after answering (only in simulation mode)
        if (this.app.mode === 'simulation') {
            // Use requestAnimationFrame for more reliable timing in browsers like Brave
            const startTime = performance.now();
            const autoAdvance = (currentTime) => {
                if (currentTime - startTime >= 1000) {
                    // Double-check we're still in the right state before advancing
                    if (this.app.mode === 'simulation' && this.app.showResult) {
                        this.next();
                    }
                } else {
                    requestAnimationFrame(autoAdvance);
                }
            };
            requestAnimationFrame(autoAdvance);
        } else if (allAnswered) {
            // Auto-transition to stats view when all questions are answered (for non-simulation modes)
            setTimeout(() => {
                this.app.view = 'stats';
                this.app.render();
            }, 1500);
        }
    }

    /**
     * Navigate to next question
     */
    next() {
        this.app.isNavigatingBack = false; // Reset navigation flag when moving forward
        if (this.app.currentIndex < this.app.questions.length - 1) {
            this.app.currentIndex++;

            // Check if this question was already answered
            if (this.app.answers[this.app.currentIndex]) {
                this.app.selectedAnswer = this.app.answers[this.app.currentIndex].selected;
                this.app.showResult = true;
            } else {
                this.app.selectedAnswer = null;
                this.app.showResult = false;
            }

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

        console.log(`[Navigation] Jump to question ${id} requested`);
        console.log(`[Navigation] Current questions count: ${this.app.questions.length}`);
        console.log(`[Navigation] Question IDs: ${this.app.questions.map(q => q.id).slice(0, 5).join(', ')}...${this.app.questions.map(q => q.id).slice(-5).join(', ')}`);

        if (!questionId || isNaN(id)) {
            alert('Please enter a valid question number.');
            return;
        }

        // Get the min and max question IDs from current questions
        const questionIds = this.app.questions.map(q => q.id);
        const minId = Math.min(...questionIds);
        const maxId = Math.max(...questionIds);

        console.log(`[Navigation] Valid range: ${minId} - ${maxId}`);

        if (id < minId || id > maxId) {
            alert(`Question number must be between ${minId} and ${maxId}.`);
            return;
        }

        const index = this.app.questions.findIndex(q => q.id === id);
        console.log(`[Navigation] Found question at index: ${index}`);

        if (index !== -1) {
            // Update to the new question index
            this.app.currentIndex = index;

            // Check if this question was already answered
            if (this.app.answers[this.app.currentIndex]) {
                this.app.selectedAnswer = this.app.answers[this.app.currentIndex].selected;
                this.app.showResult = true;
            } else {
                this.app.selectedAnswer = null;
                this.app.showResult = false;
            }

            // Force FULL HTML re-render by resetting view cache
            this.app.renderer.lastView = null;
            this.app.renderer.lastQuestionIndex = null;
            this.app.render();
        } else {
            alert(`Question ${id} not found in this mode.`);
        }
    }
}
