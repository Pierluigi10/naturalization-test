// Timer management module for simulation mode

class Timer {
    constructor(app) {
        this.app = app;
        this.timerInterval = null;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timeoutWarningShown = false;
        this.tenMinWarningShown = false;
        this.timerVisible = true;
    }

    /**
     * Start timer for simulation mode
     */
    start() {
        // If timer is already running, don't restart it
        if (this.timerInterval) {
            return;
        }

        // Only start timer for simulation mode
        if (this.app.mode !== 'simulation' || !this.startTime) {
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
            this.updateDisplay();
        }, 1000);
    }

    /**
     * Stop timer
     */
    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Reset timer
     */
    reset() {
        this.stop();
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.timeoutWarningShown = false;
        this.tenMinWarningShown = false;
    }

    /**
     * Format time in milliseconds to HH:MM:SS
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Formatted time string
     */
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Update timer display in the DOM
     */
    updateDisplay() {
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

    /**
     * Toggle timer visibility
     */
    toggleVisibility() {
        this.timerVisible = !this.timerVisible;
        // Update the timer container opacity directly without full render
        const timerContainer = document.getElementById('timer-display')?.parentElement?.parentElement;
        if (timerContainer) {
            timerContainer.style.opacity = this.timerVisible ? '1' : '0.3';
        }
        // Update the button icon
        const toggleButton = document.querySelector('[title*="timer"]');
        if (toggleButton) {
            toggleButton.textContent = this.timerVisible ? '👁️' : '👁️‍🗨️';
        }
    }

    /**
     * Get total elapsed time
     * @returns {number} Elapsed time in milliseconds
     */
    getTotalTime() {
        return this.startTime ? Date.now() - this.startTime : 0;
    }
}
