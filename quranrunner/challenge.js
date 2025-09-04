class QuranChallenge {
    constructor() {
        this.isActive = false;
        this.currentVerse = null;
        this.challengeCompleted = false;
        this.modal = document.getElementById('challengeModal');
        this.verseText = document.getElementById('verseText');
        this.wordOptions = document.getElementById('wordOptions');
        this.feedback = document.getElementById('feedback');
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Modal should only close when user selects an answer
        // No click-outside-to-close functionality
    }
    
    startChallenge() {
        // Prevent multiple challenges from starting
        if (this.isActive) {
            console.log('Challenge already active, ignoring new challenge request');
            return;
        }
        
        this.isActive = true;
        this.challengeCompleted = false;
        
        // Get random verse
        this.currentVerse = getRandomVerse();
        
        // Create verse with missing word
        const challengeVerse = createChallengeVerse(this.currentVerse);
        
        // Display challenge
        this.verseText.textContent = challengeVerse;
        this.createWordOptions();
        
        // Show modal
        this.modal.classList.remove('hidden');
        
        console.log('Challenge started with verse:', this.currentVerse.verse);
        console.log('Challenge modal displayed, waiting for user input...');
        
        // Pause game
        this.pauseGame();
    }
    
    createWordOptions() {
        this.wordOptions.innerHTML = '';
        
        // Create pairs of Arabic words and their transliterations
        const wordPairs = this.currentVerse.options.map((option, index) => ({
            arabic: option,
            transliteration: this.currentVerse.optionsTransliteration[index]
        }));
        
        // Shuffle the pairs together
        const shuffledPairs = this.shuffleArray(wordPairs);
        
        shuffledPairs.forEach((pair) => {
            const button = document.createElement('button');
            button.className = 'word-option';
            
            // Create option content with Arabic text and transliteration
            const arabicText = document.createElement('div');
            arabicText.className = 'option-arabic';
            arabicText.textContent = pair.arabic;
            
            const transliteration = document.createElement('div');
            transliteration.className = 'option-transliteration';
            transliteration.textContent = pair.transliteration;
            
            button.appendChild(arabicText);
            button.appendChild(transliteration);
            
            button.addEventListener('click', () => {
                this.checkAnswer(pair.arabic);
            });
            
            this.wordOptions.appendChild(button);
        });
    }
    
    checkAnswer(selectedWord) {
        const isCorrect = selectedWord === this.currentVerse.missingWord;
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(selectedWord);
        }
    }
    
    handleCorrectAnswer() {
        this.challengeCompleted = true;
        this.feedback.textContent = 'Correct! Well done!';
        this.feedback.className = 'feedback success';
        
        // Highlight correct answer
        const buttons = this.wordOptions.querySelectorAll('.word-option');
        buttons.forEach(button => {
            if (button.querySelector('.option-arabic').textContent === this.currentVerse.missingWord) {
                button.classList.add('correct');
            }
        });
        
        console.log('Challenge completed successfully!');
        
        // Show success message for 1 second, then return to game
        setTimeout(() => {
            this.feedback.textContent = '🎉 Excellent! Returning to game...';
            this.showCountdownProgress(1);
            
            // Complete challenge after 1 second
            setTimeout(() => {
                this.completeChallenge();
            }, 1000);
        }, 1000);
    }
    
    handleIncorrectAnswer(selectedWord) {
        this.feedback.textContent = 'Try again!';
        this.feedback.className = 'feedback error';
        
        // Highlight incorrect selection
        const buttons = this.wordOptions.querySelectorAll('.word-option');
        buttons.forEach(button => {
            if (button.querySelector('.option-arabic').textContent === selectedWord) {
                button.classList.add('incorrect');
            }
        });
        
        // Clear feedback after delay
        setTimeout(() => {
            this.feedback.textContent = '';
            this.feedback.className = 'feedback';
            
            // Remove incorrect highlighting
            buttons.forEach(button => {
                button.classList.remove('incorrect');
            });
        }, 1000);
    }
    
    completeChallenge() {
        console.log('Completing challenge and resuming game...');
        
        this.isActive = false;
        this.challengeCompleted = false;
        this.currentVerse = null;
        
        this.closeChallenge();
        
        // Add a small delay before resuming to prevent immediate re-trigger
        setTimeout(() => {
            this.resumeGame();
            
            // Trigger game resume callback
            if (this.onChallengeComplete) {
                this.onChallengeComplete();
            }
        }, 100);
    }
    
    closeChallenge() {
        this.modal.classList.add('hidden');
        this.feedback.textContent = '';
        this.feedback.className = 'feedback';
        
        // Clear word options
        this.wordOptions.innerHTML = '';
        
        // Clear verse text fields
        this.verseText.textContent = '';
        
        // Remove countdown progress bar
        const progressBar = this.modal.querySelector('.countdown-progress');
        if (progressBar) {
            progressBar.remove();
        }
    }
    
    pauseGame() {
        // This will be handled by the main game loop
        if (this.onGamePause) {
            this.onGamePause();
        }
    }
    
    resumeGame() {
        // This will be handled by the main game loop
        if (this.onGameResume) {
            this.onGameResume();
        }
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    isChallengeActive() {
        return this.isActive;
    }
    
    showCountdownProgress(seconds) {
        // Create or update countdown progress bar
        let progressBar = this.modal.querySelector('.countdown-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'countdown-progress';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressFill.style.width = '100%';
            
            progressBar.appendChild(progressFill);
            this.feedback.parentNode.insertBefore(progressBar, this.feedback.nextSibling);
        }
        
        // Update progress bar width based on countdown
        const progressFill = progressBar.querySelector('.progress-fill');
        const progressPercent = (seconds / 3) * 100;
        progressFill.style.width = progressPercent + '%';
    }
    
    reset() {
        this.isActive = false;
        this.challengeCompleted = false;
        this.currentVerse = null;
        this.closeChallenge();
    }
}

// Game state management
class GameStateManager {
    constructor() {
        this.currentState = 'RUNNING'; // RUNNING, PAUSED, CHALLENGE, GAME_OVER
        this.obstacleCount = 0;
        this.maxObstaclesBeforeChallenge = 3;
        this.score = 0;
        this.challengeCount = 0;
        this.justCompletedChallenge = false;
    }
    
    updateObstacleCount(count) {
        // Don't update obstacle count if we're in challenge state
        if (this.currentState === 'CHALLENGE') {
            console.log('Ignoring obstacle count update during challenge:', count);
            return;
        }
        
        // Add a small delay after challenge completion to prevent immediate re-trigger
        if (this.justCompletedChallenge) {
            console.log('Just completed challenge, ignoring obstacle count update:', count);
            this.justCompletedChallenge = false;
            return;
        }
        
        this.obstacleCount = count;
        console.log('Obstacle count updated to:', count);
        
        // Check if challenge should be triggered
        if (this.obstacleCount >= this.maxObstaclesBeforeChallenge && this.currentState === 'RUNNING') {
            this.triggerChallenge();
        }
    }
    
    triggerChallenge() {
        console.log('Triggering challenge, current state:', this.currentState);
        
        // Prevent multiple challenges from being triggered
        if (this.currentState === 'RUNNING' && this.obstacleCount >= this.maxObstaclesBeforeChallenge) {
            this.currentState = 'CHALLENGE';
            this.obstacleCount = 0; // Reset for next cycle
            this.challengeCount++;
            
            console.log('Challenge triggered! Obstacles reset to 0, total challenges:', this.challengeCount);
            
            // Update UI
            this.updateUI();
        } else {
            console.log('Cannot trigger challenge - state:', this.currentState, 'obstacles:', this.obstacleCount);
        }
    }
    
    completeChallenge() {
        console.log('Completing challenge, transitioning to RUNNING state');
        
        this.currentState = 'RUNNING';
        this.obstacleCount = 0; // Ensure obstacle count is reset
        this.justCompletedChallenge = true; // Flag to prevent immediate re-trigger
        this.updateUI();
        
        // Signal that obstacle manager should also reset its count
        if (this.onObstacleReset) {
            this.onObstacleReset();
        }
        
        console.log('Game resumed, obstacle count reset to 0, ready for next cycle');
    }
    
    gameOver() {
        this.currentState = 'GAME_OVER';
        this.updateUI();
    }
    
    reset() {
        this.currentState = 'RUNNING';
        this.obstacleCount = 0;
        this.score = 0;
        this.challengeCount = 0;
        this.updateUI();
    }
    
    updateUI() {
        // Update obstacle count display
        const obstacleDisplay = document.getElementById('obstacle-count');
        if (obstacleDisplay) {
            obstacleDisplay.textContent = this.obstacleCount;
        }
        
        // Update score display
        const scoreDisplay = document.getElementById('score');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    getCurrentState() {
        return this.currentState;
    }
    
    isRunning() {
        return this.currentState === 'RUNNING';
    }
    
    isPaused() {
        return this.currentState === 'PAUSED' || this.currentState === 'CHALLENGE';
    }
    
    isGameOver() {
        return this.currentState === 'GAME_OVER';
    }
}
