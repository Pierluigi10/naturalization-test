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

    /**
     * Check available localStorage quota
     * @returns {Promise<{usage: number, quota: number, percentUsed: number}>}
     */
    async checkQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const percentUsed = (estimate.usage / estimate.quota) * 100;

                return {
                    usage: estimate.usage,
                    quota: estimate.quota,
                    percentUsed: percentUsed,
                    usageMB: (estimate.usage / 1024 / 1024).toFixed(2),
                    quotaMB: (estimate.quota / 1024 / 1024).toFixed(2)
                };
            } catch (error) {
                console.error('[Storage] Failed to check quota:', error);
                return null;
            }
        }

        // Fallback: estimate based on localStorage size
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }

        return {
            usage: total * 2, // UTF-16 encoding
            quota: 5 * 1024 * 1024, // Assume 5MB default
            percentUsed: (total * 2) / (5 * 1024 * 1024) * 100,
            usageMB: ((total * 2) / 1024 / 1024).toFixed(2),
            quotaMB: '5.00'
        };
    },

    /**
     * Safe localStorage setter with quota error handling
     * @param {string} key - localStorage key
     * @param {string} value - value to store
     * @returns {boolean} - true if successful, false otherwise
     */
    safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError' ||
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.error('[Storage] Quota exceeded! Attempting cleanup...');

                // Try to free up space by removing old review questions
                if (key !== this.KEYS.REVIEW_QUESTIONS) {
                    try {
                        localStorage.removeItem(this.KEYS.REVIEW_QUESTIONS);
                        // Retry
                        localStorage.setItem(key, value);
                        console.log('[Storage] Successfully saved after cleanup');
                        return true;
                    } catch (retryError) {
                        console.error('[Storage] Failed even after cleanup:', retryError);
                        this.notifyQuotaError();
                        return false;
                    }
                } else {
                    this.notifyQuotaError();
                    return false;
                }
            } else {
                console.error('[Storage] Failed to save:', error);
                return false;
            }
        }
    },

    /**
     * Notify user about quota exceeded error
     */
    notifyQuotaError() {
        const message = 'Storage quota exceeded! Your progress may not be saved. Consider exporting your data or clearing old sessions.';

        // Show browser alert as fallback
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, 'error');
        } else {
            console.error('[Storage]', message);
            alert(message);
        }
    },

    // Save all questions to localStorage
    saveQuestions(questions) {
        return this.safeSetItem(this.KEYS.QUESTIONS, JSON.stringify(questions));
    },

    // Load questions from localStorage
    loadQuestions() {
        try {
            const stored = localStorage.getItem(this.KEYS.QUESTIONS);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('[Storage] Failed to load questions:', error);
            return null;
        }
    },

    // Save active questions (current quiz session)
    saveActiveQuestions(questions) {
        return this.safeSetItem(this.KEYS.ACTIVE_QUESTIONS, JSON.stringify(questions));
    },

    // Load active questions
    loadActiveQuestions() {
        try {
            const stored = localStorage.getItem(this.KEYS.ACTIVE_QUESTIONS);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('[Storage] Failed to load active questions:', error);
            return null;
        }
    },

    // Save quiz mode ('full' or 'simulation')
    saveMode(mode) {
        return this.safeSetItem(this.KEYS.MODE, mode);
    },

    // Load quiz mode
    loadMode() {
        return localStorage.getItem(this.KEYS.MODE);
    },

    // Save answers
    saveAnswers(answers) {
        return this.safeSetItem(this.KEYS.ANSWERS, JSON.stringify(answers));
    },

    // Load answers
    loadAnswers() {
        try {
            const stored = localStorage.getItem(this.KEYS.ANSWERS);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('[Storage] Failed to load answers:', error);
            return {};
        }
    },

    // Save selected Bundesland
    saveBundesland(bundesland) {
        return this.safeSetItem(this.KEYS.BUNDESLAND, bundesland);
    },

    // Load selected Bundesland
    loadBundesland() {
        return localStorage.getItem(this.KEYS.BUNDESLAND);
    },

    // Save start time for simulation mode
    saveStartTime(timestamp) {
        return this.safeSetItem(this.KEYS.START_TIME, timestamp.toString());
    },

    // Load start time
    loadStartTime() {
        const stored = localStorage.getItem(this.KEYS.START_TIME);
        return stored ? parseInt(stored) : null;
    },

    // Save accessibility settings
    saveHighContrast(enabled) {
        return this.safeSetItem(this.KEYS.HIGH_CONTRAST, enabled.toString());
    },

    loadHighContrast() {
        return localStorage.getItem(this.KEYS.HIGH_CONTRAST) === 'true';
    },

    saveFontSize(size) {
        return this.safeSetItem(this.KEYS.FONT_SIZE, size.toString());
    },

    loadFontSize() {
        const stored = localStorage.getItem(this.KEYS.FONT_SIZE);
        return stored ? parseInt(stored) : 100;
    },

    // Save review questions (original questions before review mode)
    saveReviewQuestions(questions) {
        return this.safeSetItem(this.KEYS.REVIEW_QUESTIONS, JSON.stringify(questions));
    },

    // Load review questions
    loadReviewQuestions() {
        try {
            const stored = localStorage.getItem(this.KEYS.REVIEW_QUESTIONS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[Storage] Failed to load review questions:', error);
            return [];
        }
    },

    /**
     * Export all user data as JSON
     * @returns {string} JSON string of all stored data
     */
    exportData() {
        const data = {};

        for (const key in this.KEYS) {
            const storageKey = this.KEYS[key];
            const value = localStorage.getItem(storageKey);
            if (value !== null) {
                data[storageKey] = value;
            }
        }

        return JSON.stringify(data, null, 2);
    },

    /**
     * Import user data from JSON string
     * @param {string} jsonString - JSON string of stored data
     * @returns {boolean} true if successful
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            let successCount = 0;

            for (const key in data) {
                if (this.safeSetItem(key, data[key])) {
                    successCount++;
                }
            }

            console.log(`[Storage] Imported ${successCount} items`);
            return successCount > 0;
        } catch (error) {
            console.error('[Storage] Failed to import data:', error);
            return false;
        }
    },

    /**
     * Download backup file
     */
    downloadBackup() {
        try {
            const data = this.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            link.href = url;
            link.download = `einbuergerungstest-backup-${timestamp}.json`;
            link.click();

            URL.revokeObjectURL(url);
            console.log('[Storage] Backup downloaded successfully');
            return true;
        } catch (error) {
            console.error('[Storage] Failed to download backup:', error);
            return false;
        }
    },

    /**
     * Get storage statistics
     * @returns {Promise<Object>} Storage statistics
     */
    async getStorageStats() {
        const quota = await this.checkQuota();
        const itemCount = Object.keys(this.KEYS).filter(
            key => localStorage.getItem(this.KEYS[key]) !== null
        ).length;

        return {
            quota,
            itemCount,
            totalKeys: Object.keys(this.KEYS).length
        };
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
