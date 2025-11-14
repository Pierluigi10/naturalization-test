// UI Rendering module

class UIRenderer {
    constructor(app) {
        this.app = app;
    }

    /**
     * Main render method - determines which view to render
     */
    render() {
        const appElement = document.getElementById('app');

        if (this.app.allQuestions.length === 0) {
            appElement.innerHTML = this.renderImport();
        } else if (this.app.view === 'home') {
            appElement.innerHTML = this.renderHome();
        } else if (this.app.view === 'topicSelection') {
            appElement.innerHTML = this.renderTopicSelection();
        } else if (this.app.view === 'stats') {
            appElement.innerHTML = this.renderStats();
        } else {
            appElement.innerHTML = this.renderQuiz();
        }

        this.attachEventListeners();
    }

    /**
     * Render accessibility settings panel
     * @returns {string} HTML for accessibility panel
     */
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
                                    Font Size: ${this.app.fontSize}%
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
                                    aria-pressed="${this.app.highContrast}"
                                    style="width: 100%;"
                                >
                                    ${this.app.highContrast ? '✓ Enabled' : 'Disabled'}
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

    /**
     * Render home view
     * @returns {string} HTML for home view
     */
    renderHome() {
        const availableBundeslaender = this.app.getAvailableBundeslaender();
        const hasOngoingSimulation = this.app.mode === 'simulation' && this.app.timer.startTime && this.app.questions.length > 0;

        // Count regional questions for selected Bundesland
        const regionalQuestionsCount = this.app.allQuestions.filter(q =>
            q.id > 300 && q.bundesland === this.app.selectedBundesland
        ).length;

        // Check if there's any saved quiz data to show Stats button
        const savedMode = Storage.loadMode();
        const savedAnswers = Storage.loadAnswers();
        const hasStatsToShow = savedMode && savedAnswers && Object.keys(savedAnswers).length > 0;

        return `
            ${this.renderAccessibilityPanel()}
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h1 style="margin: 0;">🇩🇪 Einbürgerungstest</h1>
                    ${hasStatsToShow ? `
                    <button class="btn-stats" onclick="app.viewStats();" aria-label="View statistics">
                        📊 Stats
                    </button>
                    ` : ''}
                </div>
                <p style="text-align: center; color: #6b7280; margin-bottom: 24px;">
                    Choose your practice mode
                </p>

                ${hasOngoingSimulation ? `
                <div style="padding: 16px; margin-bottom: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; color: white; text-align: center;">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        ⚠️ Ongoing Simulation
                    </div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
                        ⏱️ ${this.app.timer.formatTime(Date.now() - this.app.timer.startTime)}
                    </div>
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">
                        ${Object.keys(this.app.answers).length} / ${this.app.questions.length} questions answered
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
                        ${this.app.bundeslaender.map(bl => {
                            const available = availableBundeslaender.includes(bl);
                            const selected = bl === this.app.selectedBundesland ? 'selected' : '';
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
                                300 federal + ${regionalQuestionsCount} ${this.app.selectedBundesland} questions (${300 + regionalQuestionsCount} total)
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

    /**
     * Render topic selection view
     * @returns {string} HTML for topic selection
     */
    renderTopicSelection() {
        // Group federal questions (1-300) into ranges of 30
        const federalRanges = [];
        for (let i = 1; i <= 300; i += 30) {
            const end = Math.min(i + 29, 300);
            const rangeQuestions = this.app.allQuestions.filter(q => q.id >= i && q.id <= end);
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
        this.app.allQuestions.filter(q => q.id > 300 && q.bundesland).forEach(q => {
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

    /**
     * Render import view
     * @returns {string} HTML for import view
     */
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

    /**
     * Render quiz view
     * @returns {string} HTML for quiz view
     */
    renderQuiz() {
        const question = this.app.questions[this.app.currentIndex];
        const progress = ((this.app.currentIndex + 1) / this.app.questions.length) * 100;
        const modeLabel = this.app.mode === 'simulation' ? '🎯 Simulation Mode' :
                         this.app.mode === 'review' ? '🔄 Review Wrong Answers' :
                         this.app.mode === 'topic' ? '🎯 Topic Practice' : '📚 Full Practice';

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
                ${this.app.mode === 'simulation' && this.app.timer.startTime ? `
                <div style="margin-bottom: 12px; ${this.app.timer.timerVisible ? '' : 'opacity: 0.3;'}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div id="timer-display" style="font-size: 16px; font-weight: 600; color: #374151;">
                            ⏱️ 0:00:00 / 1:00:00
                        </div>
                        <button
                            onclick="app.timer.toggleVisibility(); app.render();"
                            style="background: transparent; border: none; cursor: pointer; font-size: 14px; color: #6b7280; padding: 4px 8px;"
                            title="${this.app.timer.timerVisible ? 'Hide timer' : 'Show timer'}"
                        >
                            ${this.app.timer.timerVisible ? '👁️' : '👁️‍🗨️'}
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
                        Question ${this.app.currentIndex + 1} of ${this.app.questions.length}
                    </div>
                </div>
                <div
                    class="progress-bar"
                    role="progressbar"
                    aria-valuenow="${this.app.currentIndex + 1}"
                    aria-valuemin="1"
                    aria-valuemax="${this.app.questions.length}"
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
                        const isSelected = this.app.selectedAnswer === idx;
                        const isCorrect = idx === question.correct;
                        const showCorrect = this.app.showResult && isCorrect;
                        const showWrong = this.app.showResult && isSelected && !isCorrect;

                        let className = 'option';
                        if (showCorrect) className += ' correct';
                        else if (showWrong) className += ' wrong';
                        else if (isSelected) className += ' selected';
                        if (this.app.showResult) className += ' disabled';

                        const ariaLabel = `Option ${String.fromCharCode(65 + idx)}: ${option}${showCorrect ? ' - Correct answer' : ''}${showWrong ? ' - Incorrect' : ''}`;

                        return `
                            <div
                                class="${className}"
                                onclick="${this.app.showResult ? '' : `app.navigation.handleAnswer(${idx})`}"
                                role="radio"
                                aria-checked="${isSelected ? 'true' : 'false'}"
                                aria-label="${ariaLabel}"
                                tabindex="${this.app.showResult ? '-1' : '0'}"
                                onkeypress="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ${this.app.showResult ? '' : `app.navigation.handleAnswer(${idx})`} }"
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
                        onclick="app.navigation.previous()"
                        ${this.app.currentIndex === 0 ? 'disabled' : ''}
                        aria-label="Previous question"
                    >
                        ← Previous
                    </button>
                    ${this.app.mode === 'simulation' && !this.app.isNavigatingBack ? '' : `
                    <button
                        class="btn btn-primary"
                        onclick="app.navigation.next()"
                        ${this.app.currentIndex === this.app.questions.length - 1 ? 'disabled' : ''}
                        aria-label="Next question"
                    >
                        Next →
                    </button>
                    `}
                </div>
                ${this.app.mode === 'full' ? `
                <div style="margin-top: 16px; display: flex; align-items: center; gap: 12px;">
                    <label style="font-size: 14px; font-weight: 600; color: #6b7280;">Go to question:</label>
                    <input
                        type="number"
                        id="questionNumberInput"
                        min="1"
                        max="310"
                        placeholder="e.g. 258"
                        style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                        onkeypress="if(event.key === 'Enter') app.navigation.goToQuestion(this.value)"
                    >
                    <button class="btn btn-secondary" onclick="app.navigation.goToQuestion(document.getElementById('questionNumberInput').value)" style="white-space: nowrap;">
                        Jump
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render statistics view
     * @returns {string} HTML for statistics view
     */
    renderStats() {
        const stats = this.app.statistics.getStats();
        const modeLabel = this.app.mode === 'simulation' ? '🎯 Simulation Mode' :
                         this.app.mode === 'review' ? '🔄 Review Mode' :
                         this.app.mode === 'topic' ? '🎯 Topic Practice' : '📚 Full Practice';

        const { hasPassed, passThreshold } = this.app.statistics.checkPassed();
        const totalTime = this.app.timer.getTotalTime();
        const wrongAnswersCount = this.app.statistics.getWrongAnswersCount();
        const breakdown = this.app.statistics.getQuestionBreakdown();

        // Trigger confetti if test is passed (simulation mode only, all questions answered)
        if (this.app.mode === 'simulation' && stats.answered === stats.total && hasPassed) {
            // Use setTimeout to ensure DOM is rendered before confetti
            setTimeout(() => this.app.statistics.triggerConfetti(), 100);
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
                    ${this.app.mode === 'simulation' ? `
                    <span style="font-size: 12px; font-weight: 600; color: #059669; padding: 4px 12px; background: #d1fae5; border-radius: 8px;">
                        🗺️ ${this.app.selectedBundesland}
                    </span>
                    ` : ''}
                </div>

                ${this.app.mode === 'simulation' && this.app.timer.startTime && stats.answered === stats.total ? `
                <div style="text-align: center; padding: 16px; margin-bottom: 16px; border-radius: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">
                        ⏱️ Total Time
                    </div>
                    <div style="font-size: 32px; font-weight: bold;">
                        ${this.app.timer.formatTime(totalTime)}
                    </div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">
                        ${totalTime > 60 * 60 * 1000 ? '(Exceeded 60 minutes)' : '(Within time limit)'}
                    </div>
                </div>
                ` : ''}

                ${this.app.mode === 'simulation' && stats.answered === stats.total ? `
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

                ${this.app.mode === 'simulation' && this.app.timer.startTime && stats.answered > 0 ? `
                <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <h3 style="margin-bottom: 12px; color: #374151;">⏱️ Time Statistics</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <div style="color: #6b7280; margin-bottom: 4px;">Average per question</div>
                            <div style="font-size: 18px; font-weight: 600; color: #374151;">
                                ${this.app.timer.formatTime(this.app.statistics.getAverageTimePerQuestion())}
                            </div>
                        </div>
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <div style="color: #6b7280; margin-bottom: 4px;">Elapsed time</div>
                            <div style="font-size: 18px; font-weight: 600; color: #374151;">
                                ${this.app.timer.formatTime(totalTime)}
                            </div>
                        </div>
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <div style="color: #6b7280; margin-bottom: 4px;">Federal questions</div>
                            <div style="font-size: 18px; font-weight: 600; color: #374151;">
                                ${breakdown.federal.answered} / ${breakdown.federal.total}
                            </div>
                        </div>
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <div style="color: #6b7280; margin-bottom: 4px;">Regional questions</div>
                            <div style="font-size: 18px; font-weight: 600; color: #374151;">
                                ${breakdown.regional.answered} / ${breakdown.regional.total}
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <h3 style="margin-bottom: 12px; margin-top: 16px; color: #374151;">Answer Details</h3>
                <div class="answer-list">
                    ${this.app.questions.map((q, idx) => {
                        const answer = this.app.answers[idx];
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

                ${wrongAnswersCount > 0 && this.app.mode !== 'review' ? `
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
                    ${this.app.mode === 'simulation' ? `
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

    /**
     * Attach event listeners after rendering
     */
    attachEventListeners() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.app.importFile(e));
        }

        // Attach touch event listeners for swipe support
        const questionCard = document.getElementById('question-card');
        if (questionCard && this.app.view === 'quiz') {
            questionCard.addEventListener('touchstart', (e) => this.app.navigation.handleTouchStart(e), { passive: true });
            questionCard.addEventListener('touchend', (e) => this.app.navigation.handleTouchEnd(e), { passive: true });
        }
    }
}
