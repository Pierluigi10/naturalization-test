// Share Results module - Generate shareable images

class ShareResults {
    constructor(app) {
        this.app = app;
    }

    /**
     * Generate a shareable image with results
     * @returns {Promise<Blob>} Image blob
     */
    async generateResultImage() {
        const stats = this.app.statistics.getStats();
        const { hasPassed, passThreshold } = this.app.statistics.checkPassed();
        const totalTime = this.app.timer.getTotalTime();

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630; // Standard social media share size
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some decorative elements
        this.drawDecorativeCircles(ctx, canvas.width, canvas.height);

        // White card background
        const cardMargin = 60;
        const cardRadius = 24;
        ctx.fillStyle = 'white';
        this.roundRect(ctx, cardMargin, cardMargin, canvas.width - cardMargin * 2, canvas.height - cardMargin * 2, cardRadius);

        // Title
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🇩🇪 Einbürgerungstest', canvas.width / 2, 140);

        // Pass/Fail status
        const statusY = 240;
        if (this.app.mode === 'simulation' && stats.answered === stats.total) {
            ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = hasPassed ? '#10b981' : '#ef4444';
            ctx.fillText(hasPassed ? '✅ PASSED!' : '❌ NOT PASSED', canvas.width / 2, statusY);
        }

        // Stats boxes
        const boxY = 320;
        const boxWidth = 240;
        const boxHeight = 160;
        const boxSpacing = 40;
        const totalBoxesWidth = boxWidth * 4 + boxSpacing * 3;
        const startX = (canvas.width - totalBoxesWidth) / 2;

        const statBoxes = [
            { value: stats.answered, label: 'Answered', color: '#3b82f6' },
            { value: stats.correct, label: 'Correct', color: '#10b981' },
            { value: `${stats.percentage}%`, label: 'Score', color: '#8b5cf6' },
            { value: stats.total, label: 'Total', color: '#6b7280' }
        ];

        statBoxes.forEach((box, i) => {
            const x = startX + i * (boxWidth + boxSpacing);

            // Box background
            ctx.fillStyle = box.color;
            this.roundRect(ctx, x, boxY, boxWidth, boxHeight, 16);

            // Value
            ctx.fillStyle = 'white';
            ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(box.value.toString(), x + boxWidth / 2, boxY + 72);

            // Label
            ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
            ctx.fillText(box.label, x + boxWidth / 2, boxY + 116);
        });

        // Time (if applicable)
        if (this.app.mode === 'simulation' && this.app.timer.startTime && stats.answered === stats.total) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`⏱️ Time: ${this.app.timer.formatTime(totalTime)}`, canvas.width / 2, boxY + boxHeight + 60);
        }

        // Footer
        ctx.fillStyle = '#9ca3af';
        ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Practice at: einbuergerungstest-online.eu', canvas.width / 2, canvas.height - 80);

        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }

    /**
     * Draw decorative circles on background
     */
    drawDecorativeCircles(ctx, width, height) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = 'white';

        // Top right circle
        ctx.beginPath();
        ctx.arc(width - 100, 100, 200, 0, Math.PI * 2);
        ctx.fill();

        // Bottom left circle
        ctx.beginPath();
        ctx.arc(100, height - 100, 150, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Helper function to draw rounded rectangles
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Share results using Web Share API or download
     */
    async shareResults() {
        try {
            const imageBlob = await this.generateResultImage();
            const stats = this.app.statistics.getStats();
            const { hasPassed } = this.app.statistics.checkPassed();

            // Prepare share data
            const shareText = this.app.mode === 'simulation'
                ? `I ${hasPassed ? 'passed' : 'completed'} the German Citizenship Test with ${stats.correct}/${stats.total} correct answers (${stats.percentage}%)! 🇩🇪`
                : `My German Citizenship Test practice: ${stats.correct}/${stats.total} correct (${stats.percentage}%)! 🇩🇪`;

            // Check if Web Share API is available
            if (navigator.share && navigator.canShare) {
                const file = new File([imageBlob], 'einbuergerungstest-results.png', { type: 'image/png' });
                const shareData = {
                    text: shareText,
                    files: [file]
                };

                // Check if we can share files
                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    return { success: true, method: 'share' };
                }
            }

            // Fallback: Download image
            const url = URL.createObjectURL(imageBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'einbuergerungstest-results.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Copy text to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
                return { success: true, method: 'download', clipboardText: shareText };
            }

            return { success: true, method: 'download' };
        } catch (error) {
            console.error('Error sharing results:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Copy results as text to clipboard
     */
    async copyResultsText() {
        const stats = this.app.statistics.getStats();
        const { hasPassed } = this.app.statistics.checkPassed();

        const text = this.app.mode === 'simulation'
            ? `German Citizenship Test Results 🇩🇪\n\n${hasPassed ? '✅ PASSED!' : '❌ NOT PASSED'}\n\nCorrect: ${stats.correct}/${stats.total}\nScore: ${stats.percentage}%\n${this.app.timer.startTime ? `Time: ${this.app.timer.formatTime(this.app.timer.getTotalTime())}` : ''}`
            : `German Citizenship Test Practice 🇩🇪\n\nAnswered: ${stats.answered}/${stats.total}\nCorrect: ${stats.correct}\nScore: ${stats.percentage}%`;

        try {
            await navigator.clipboard.writeText(text);
            return { success: true };
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return { success: false, error: error.message };
        }
    }
}
