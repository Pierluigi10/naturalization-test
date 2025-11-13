// Storage utilities for managing localStorage

const Storage = {
    // Keys for localStorage
    KEYS: {
        QUESTIONS: 'quiz-questions',
        MODE: 'quiz-mode',
        ACTIVE_QUESTIONS: 'quiz-active-questions',
        ANSWERS: 'quiz-answers',
        BUNDESLAND: 'quiz-bundesland',
        START_TIME: 'quiz-start-time',
        HIGH_CONTRAST: 'high-contrast',
        FONT_SIZE: 'font-size',
        REVIEW_QUESTIONS: 'quiz-review-questions'
    },

    // Save all questions to localStorage
    saveQuestions(questions) {
        localStorage.setItem(this.KEYS.QUESTIONS, JSON.stringify(questions));
    },

    // Load questions from localStorage
    loadQuestions() {
        const stored = localStorage.getItem(this.KEYS.QUESTIONS);
        return stored ? JSON.parse(stored) : null;
    },

    // Save active questions (current quiz session)
    saveActiveQuestions(questions) {
        localStorage.setItem(this.KEYS.ACTIVE_QUESTIONS, JSON.stringify(questions));
    },

    // Load active questions
    loadActiveQuestions() {
        const stored = localStorage.getItem(this.KEYS.ACTIVE_QUESTIONS);
        return stored ? JSON.parse(stored) : null;
    },

    // Save quiz mode ('full' or 'simulation')
    saveMode(mode) {
        localStorage.setItem(this.KEYS.MODE, mode);
    },

    // Load quiz mode
    loadMode() {
        return localStorage.getItem(this.KEYS.MODE);
    },

    // Save answers
    saveAnswers(answers) {
        localStorage.setItem(this.KEYS.ANSWERS, JSON.stringify(answers));
    },

    // Load answers
    loadAnswers() {
        const stored = localStorage.getItem(this.KEYS.ANSWERS);
        return stored ? JSON.parse(stored) : {};
    },

    // Save selected Bundesland
    saveBundesland(bundesland) {
        localStorage.setItem(this.KEYS.BUNDESLAND, bundesland);
    },

    // Load selected Bundesland
    loadBundesland() {
        return localStorage.getItem(this.KEYS.BUNDESLAND);
    },

    // Save start time for simulation mode
    saveStartTime(timestamp) {
        localStorage.setItem(this.KEYS.START_TIME, timestamp.toString());
    },

    // Load start time
    loadStartTime() {
        const stored = localStorage.getItem(this.KEYS.START_TIME);
        return stored ? parseInt(stored) : null;
    },

    // Save accessibility settings
    saveHighContrast(enabled) {
        localStorage.setItem(this.KEYS.HIGH_CONTRAST, enabled.toString());
    },

    loadHighContrast() {
        return localStorage.getItem(this.KEYS.HIGH_CONTRAST) === 'true';
    },

    saveFontSize(size) {
        localStorage.setItem(this.KEYS.FONT_SIZE, size.toString());
    },

    loadFontSize() {
        const stored = localStorage.getItem(this.KEYS.FONT_SIZE);
        return stored ? parseInt(stored) : 100;
    },

    // Save review questions (original questions before review mode)
    saveReviewQuestions(questions) {
        localStorage.setItem(this.KEYS.REVIEW_QUESTIONS, JSON.stringify(questions));
    },

    // Load review questions
    loadReviewQuestions() {
        const stored = localStorage.getItem(this.KEYS.REVIEW_QUESTIONS);
        return stored ? JSON.parse(stored) : [];
    },

    // Clear quiz session data
    clearSession() {
        localStorage.removeItem(this.KEYS.MODE);
        localStorage.removeItem(this.KEYS.ACTIVE_QUESTIONS);
        localStorage.removeItem(this.KEYS.ANSWERS);
        localStorage.removeItem(this.KEYS.START_TIME);
        localStorage.removeItem(this.KEYS.REVIEW_QUESTIONS);
    }
};
