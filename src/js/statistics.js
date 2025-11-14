// Statistics calculation module

class Statistics {
    constructor(app) {
        this.app = app;
    }

    /**
     * Calculate current quiz statistics
     * @returns {Object} Statistics object with answered, correct, percentage, and total
     */
    getStats() {
        const answered = Object.keys(this.app.answers).length;
        const correct = Object.values(this.app.answers).filter(a => a.correct).length;
        const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;
        return {
            answered,
            correct,
            percentage,
            total: this.app.questions.length
        };
    }

    /**
     * Get count of wrong answers
     * @returns {number} Number of wrong answers
     */
    getWrongAnswersCount() {
        return Object.values(this.app.answers).filter(a => !a.correct).length;
    }

    /**
     * Get questions that were answered incorrectly
     * @returns {Array} Array of wrong question objects
     */
    getWrongQuestions() {
        const wrongQuestions = [];
        this.app.questions.forEach((q, idx) => {
            const answer = this.app.answers[idx];
            if (answer && !answer.correct) {
                wrongQuestions.push(q);
            }
        });
        return wrongQuestions;
    }

    /**
     * Check if user has passed the test
     * @returns {Object} Object with hasPassed boolean and passThreshold number
     */
    checkPassed() {
        const stats = this.getStats();
        let passThreshold, hasPassed;

        if (this.app.mode === 'simulation') {
            passThreshold = 17; // Need 17 out of 33 total questions
            hasPassed = stats.correct >= passThreshold;
        } else {
            passThreshold = Math.ceil(this.app.questions.length * 0.515);
            hasPassed = stats.correct >= passThreshold;
        }

        return { hasPassed, passThreshold };
    }

    /**
     * Get breakdown of federal vs regional questions answered
     * @returns {Object} Object with federal and regional counts
     */
    getQuestionBreakdown() {
        const federalAnswered = this.app.questions.filter(
            (q, idx) => q.id <= 300 && this.app.answers[idx]
        ).length;

        const regionalAnswered = this.app.questions.filter(
            (q, idx) => q.id > 300 && this.app.answers[idx]
        ).length;

        return {
            federal: {
                answered: federalAnswered,
                total: this.app.questions.filter(q => q.id <= 300).length
            },
            regional: {
                answered: regionalAnswered,
                total: this.app.questions.filter(q => q.id > 300).length
            }
        };
    }

    /**
     * Calculate average time per question
     * @returns {number} Average time in milliseconds
     */
    getAverageTimePerQuestion() {
        const stats = this.getStats();
        if (!this.app.timer.startTime || stats.answered === 0) {
            return 0;
        }
        const totalTime = this.app.timer.getTotalTime();
        return Math.floor(totalTime / stats.answered);
    }

    /**
     * Trigger confetti animation for passing the test
     */
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
}
