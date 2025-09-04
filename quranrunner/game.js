class AudioManager {
    constructor() {
        this.sounds = {
            jump: new Audio('sounds/jump.mp3'),
            hit: new Audio('sounds/hit.mp3'),
            bismillah: new Audio('sounds/bismillah.mp3')
        };
        
        // Configure audio settings
        this.sounds.jump.volume = 0.7;
        this.sounds.hit.volume = 0.8;
        this.sounds.bismillah.volume = 0.8;
        
        // Preload sounds
        this.preloadSounds();
    }
    
    preloadSounds() {
        // Preload all sounds for better performance
        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
            sound.load();
        });
    }
    
    playJump() {
        this.sounds.jump.currentTime = 0;
        this.sounds.jump.play().catch(e => console.log('Jump sound failed:', e));
    }
    
    playHit() {
        this.sounds.hit.currentTime = 0;
        this.sounds.hit.play().catch(e => console.log('Hit sound failed:', e));
    }
    
    playBismillah() {
        this.sounds.bismillah.currentTime = 0;
        this.sounds.bismillah.play().catch(e => console.log('Bismillah sound failed:', e));
    }
    
    
    setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = volume;
        });
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game objects
        this.player = new Player(100, 320, 30, 30);
        this.obstacleManager = new ObstacleManager();
        this.challenge = new QuranChallenge();
        this.stateManager = new GameStateManager();
        
        // Game loop
        this.lastTime = 0;
        this.gameSpeed = 1;
        this.isRunning = false;
        this.frameCount = 0;
        this.obstacleUpdateCooldown = false;
        
        // Background
        this.backgroundX = 0;
        this.backgroundSpeed = 2;
        
        // Device detection and performance optimization
        this.isMobile = this.detectMobile();
        this.targetFPS = this.isMobile ? 30 : 60; // Lower FPS for mobile
        this.frameInterval = 1000 / this.targetFPS;
        
        // Audio system
        this.audio = new AudioManager();
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Connect challenge callbacks
        this.connectChallengeCallbacks();
        
        // Setup fullscreen functionality (desktop only)
        if (!this.isMobile) {
            this.setupFullscreen();
        }
        
        // Start game
        this.start();
    }
    
    detectMobile() {
        // Detect mobile devices
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        console.log('Device detected:', isMobile ? 'Mobile' : 'Desktop', 'Touch:', isTouchDevice);
        return isMobile || isTouchDevice;
    }
    
    setupInput() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Jump on spacebar
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.stateManager.isRunning()) {
                    this.player.jump(() => this.audio.playJump());
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse/touch input for jumping
        this.canvas.addEventListener('click', () => {
            if (this.stateManager.isRunning()) {
                this.player.jump(() => this.audio.playJump());
            }
        });
        
        // Touch support for mobile with gesture detection
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.stateManager.isRunning()) return;
            
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const touchEndTime = Date.now();
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const touchDuration = touchEndTime - touchStartTime;
            
            // If it's a quick tap (short duration and small movement), jump
            if (touchDuration < 200 && Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
                this.player.jump(() => this.audio.playJump());
            }
            // If it's a swipe (longer duration or larger movement), move player
            else if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Super fast right movement for mobile
                    this.player.velocityX = 50; // 10x faster than normal speed
                    this.player.frameY = 3; // Right movement frame
                    // Stop moving after a short delay
                    setTimeout(() => this.player.stopMoving(), 150);
                } else {
                    // Super fast left movement for mobile
                    this.player.velocityX = -50; // 10x faster than normal speed
                    this.player.frameY = 2; // Left movement frame
                    // Stop moving after a short delay
                    setTimeout(() => this.player.stopMoving(), 150);
                }
            }
        });
    }
    
    connectChallengeCallbacks() {
        this.challenge.onChallengeComplete = () => {
            this.stateManager.completeChallenge();
        };
        
        this.challenge.onGamePause = () => {
            // Game is already paused by state manager
        };
        
        this.challenge.onGameResume = () => {
            // Game will resume automatically
        };
        
        // Connect obstacle reset callback
        this.stateManager.onObstacleReset = () => {
            this.obstacleManager.resetPassedCount();
            
            // Set obstacle update cooldown to prevent immediate re-triggering
            this.obstacleUpdateCooldown = true;
            setTimeout(() => {
                this.obstacleUpdateCooldown = false;
                console.log('Obstacle update cooldown expired');
            }, 2000); // 2 second cooldown
        };
    }
    
    setupFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (!fullscreenBtn) {
            console.error('Fullscreen button not found!');
            return;
        }
        
        fullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleFullscreen();
        });
        
        // Listen for escape key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen()) {
                this.exitFullscreen();
            }
        });
        
        // Handle window resize (orientation changes, etc.)
        window.addEventListener('resize', () => {
            if (this.isFullscreen()) {
                // Re-detect mobile status
                this.isMobile = this.detectMobile();
                this.targetFPS = this.isMobile ? 30 : 60;
                this.frameInterval = 1000 / this.targetFPS;
                
                // Resize canvas to new dimensions
                this.resizeCanvasToFullscreen();
                console.log('Fullscreen canvas resized due to window resize');
            }
        });
        
        // Handle orientation change specifically for mobile
        if (this.isMobile) {
            this.setupMobileOrientationHandling();
        }
    }
    
    setupMobileOrientationHandling() {
        // Handle orientation change events
        window.addEventListener('orientationchange', () => {
            // Small delay to ensure viewport has updated
            setTimeout(() => {
                this.handleMobileOrientationChange();
            }, 100);
        });
        
        // Also handle resize events for mobile
        window.addEventListener('resize', () => {
            if (this.isMobile) {
                // Debounce resize events
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.handleMobileOrientationChange();
                }, 150);
            }
        });
    }
    
    handleMobileOrientationChange() {
        // Re-detect mobile status and update game
        this.isMobile = this.detectMobile();
        this.targetFPS = this.isMobile ? 30 : 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Only refresh viewport if not in challenge mode
        if (!this.stateManager.isChallenge()) {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                // Temporarily disable viewport
                viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0';
                
                // Force a reflow
                document.body.style.display = 'none';
                document.body.offsetHeight; // Trigger reflow
                document.body.style.display = '';
                
                // Reset viewport
                setTimeout(() => {
                    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
                }, 10);
            }
        }
        
        console.log('Mobile orientation changed, viewport refreshed');
    }
    
    toggleFullscreen() {
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    enterFullscreen() {
        const gameContainer = document.querySelector('.game-container');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        gameContainer.classList.add('fullscreen');
        fullscreenBtn.textContent = '⛶ Exit Fullscreen';
        
        // Resize canvas to full screen
        this.resizeCanvasToFullscreen();
        
        console.log('Entered fullscreen mode');
    }
    
    exitFullscreen() {
        const gameContainer = document.querySelector('.game-container');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        gameContainer.classList.remove('fullscreen');
        fullscreenBtn.textContent = '⛶ Fullscreen';
        
        // Resize canvas back to normal
        this.resizeCanvasToNormal();
        
        console.log('Exited fullscreen mode');
    }
    
    isFullscreen() {
        return document.querySelector('.game-container').classList.contains('fullscreen');
    }
    
    resizeCanvasToFullscreen() {
        // Get actual available screen dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Original game aspect ratio (800x400 = 2:1)
        const gameAspectRatio = 2; // width/height
        
        if (this.isMobile) {
            // For mobile, maintain aspect ratio and fit within screen
            const availableWidth = screenWidth * 0.95; // 95% to account for browser UI
            const availableHeight = screenHeight * 0.9; // 90% to leave room for UI elements
            
            // Calculate dimensions that maintain aspect ratio
            let canvasWidth = availableWidth;
            let canvasHeight = canvasWidth / gameAspectRatio;
            
            // If height is too big, scale down based on height
            if (canvasHeight > availableHeight) {
                canvasHeight = availableHeight;
                canvasWidth = canvasHeight * gameAspectRatio;
            }
            
            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
            this.width = canvasWidth;
            this.height = canvasHeight;
        } else {
            // Desktop can use full dimensions
            this.canvas.width = screenWidth;
            this.canvas.height = screenHeight;
            this.width = screenWidth;
            this.height = screenHeight;
        }
        
        // Update player ground position
        this.player.groundY = this.height - this.player.height - 50;
        this.player.y = this.player.groundY;
        
        // Update obstacle manager
        this.obstacleManager.setCanvasSize(this.width, this.height);
        
        console.log(`Fullscreen canvas resized to: ${this.width}x${this.height} (Mobile: ${this.isMobile})`);
    }
    
    resizeCanvasToNormal() {
        // Set canvas back to normal dimensions
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.width = 800;
        this.height = 400;
        
        // Update player ground position
        this.player.groundY = this.height - this.player.height - 50;
        this.player.y = this.player.groundY;
        
        // Update obstacle manager
        this.obstacleManager.setCanvasSize(this.width, this.height);
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        
        // Only update if enough time has passed for target FPS
        if (deltaTime >= this.frameInterval) {
            this.lastTime = currentTime - (deltaTime % this.frameInterval);
            
            this.update(deltaTime);
            this.draw();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.stateManager.isPaused()) {
            return; // Don't update game objects when paused
        }
        
        this.frameCount++;
        
        // Convert deltaTime to seconds for consistent speed across devices
        const deltaTimeSeconds = deltaTime / 1000;
        
        // Update player with time-based movement
        this.player.update(deltaTimeSeconds);
        
        // Handle player movement
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.moveLeft();
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.moveRight();
        } else {
            this.player.stopMoving();
        }
        
        // Update obstacles with time-based movement
        this.obstacleManager.update(deltaTimeSeconds);
        
        // Check collisions
        if (this.obstacleManager.checkCollisions(this.player)) {
            this.audio.playHit();
            this.gameOver();
            return;
        }
        
        // Update obstacle count and check for challenge trigger
        const newlyPassed = this.obstacleManager.markObstaclesPassed();
        if (newlyPassed > 0) {
            console.log(`Newly passed obstacles: ${newlyPassed}`);
        }
        
        // Use total passed count instead of current array count
        const passedCount = this.obstacleManager.getTotalPassedCount();
        
        // Only update obstacle count if game is running (not during challenge)
        if (this.stateManager.isRunning()) {
            // Add a small delay after challenge completion to prevent immediate updates
            if (!this.obstacleUpdateCooldown) {
                this.stateManager.updateObstacleCount(passedCount);
            } else {
                console.log('Obstacle update cooldown active, skipping update');
            }
        } else {
            console.log('Game paused, not updating obstacle count:', passedCount);
        }
        
        // Debug obstacle count every 60 frames (about once per second)
        if (this.frameCount % 60 === 0) {
            console.log(`Total passed obstacles: ${passedCount}/3`);
            console.log(`Current array obstacles: ${this.obstacleManager.getObstacleCount()}`);
            this.obstacleManager.debugObstacles();
        }
        
        // Check if challenge should be triggered
        if (this.stateManager.getCurrentState() === 'CHALLENGE' && !this.challenge.isChallengeActive()) {
            // Add a small delay to prevent immediate re-triggering
            if (!this.challengeCooldown) {
                this.challengeCooldown = true;
                setTimeout(() => {
                    this.challengeCooldown = false;
                }, 1000); // Increased to 1000ms cooldown
                
                console.log('Starting Quran challenge...');
                this.challenge.startChallenge();
            }
        }
        
        // Update background with time-based movement
        this.backgroundX -= this.backgroundSpeed * deltaTimeSeconds * 60; // 60 FPS base
        if (this.backgroundX <= -this.width) {
            this.backgroundX = 0;
        }
        
        // Add score based on time survived
        this.stateManager.addScore(1);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw ground
        this.drawGround();
        
        // Draw game objects
        this.player.draw(this.ctx);
        this.obstacleManager.draw(this.ctx);
        
        // Draw UI elements
        this.drawUI();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Clouds
        this.drawClouds();
        
        // Mountains
        this.drawMountains();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Cloud 1
        this.ctx.beginPath();
        this.ctx.arc(100 + this.backgroundX * 0.5, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(130 + this.backgroundX * 0.5, 80, 25, 0, Math.PI * 2);
        this.ctx.arc(160 + this.backgroundX * 0.5, 80, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cloud 2
        this.ctx.beginPath();
        this.ctx.arc(400 + this.backgroundX * 0.3, 60, 25, 0, Math.PI * 2);
        this.ctx.arc(425 + this.backgroundX * 0.3, 60, 20, 0, Math.PI * 2);
        this.ctx.arc(450 + this.backgroundX * 0.3, 60, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cloud 3
        this.ctx.beginPath();
        this.ctx.arc(600 + this.backgroundX * 0.7, 100, 20, 0, Math.PI * 2);
        this.ctx.arc(620 + this.backgroundX * 0.7, 100, 15, 0, Math.PI * 2);
        this.ctx.arc(640 + this.backgroundX * 0.7, 100, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMountains() {
        // Calculate ground position based on canvas height
        const groundY = this.height - 50; // 50 pixels from bottom
        
        this.ctx.fillStyle = '#8B7355';
        
        // Mountain 1
        this.ctx.beginPath();
        this.ctx.moveTo(0 + this.backgroundX * 0.1, groundY);
        this.ctx.lineTo(200 + this.backgroundX * 0.1, groundY - 150);
        this.ctx.lineTo(400 + this.backgroundX * 0.1, groundY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Mountain 2
        this.ctx.fillStyle = '#A0522D';
        this.ctx.beginPath();
        this.ctx.moveTo(300 + this.backgroundX * 0.15, groundY);
        this.ctx.lineTo(500 + this.backgroundX * 0.15, groundY - 170);
        this.ctx.lineTo(700 + this.backgroundX * 0.15, groundY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add SakinahTime.com text on the mountains
        this.ctx.save(); // Save current context state
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // Position text on the larger mountain (Mountain 2)
        const textX = 500 + this.backgroundX * 0.15;
        const textY = groundY - 85; // Middle of the mountain
        
        this.ctx.fillText('SakinahTime.com', textX, textY);
        
        this.ctx.restore(); // Restore previous context state
    }
    
    drawGround() {
        // Calculate ground position based on canvas height
        const groundY = this.height - 50; // 50 pixels from bottom
        const groundHeight = 50;
        
        // Ground
        this.ctx.fillStyle = '#8FBC8F';
        this.ctx.fillRect(0, groundY, this.width, groundHeight);
        
        // Ground texture
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < this.width; i += 20) {
            this.ctx.fillRect(i + this.backgroundX, groundY, 2, groundHeight);
        }
    }
    
    drawUI() {
        // Draw instructions only
        if (this.stateManager.isRunning()) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.width - 250, 10, 240, 40);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            this.ctx.fillText('SPACE to jump', this.width - 240, 30);
            this.ctx.fillText('ARROWS to move', this.width - 240, 45);
        }
    }
    
    gameOver() {
        this.stateManager.gameOver();
        this.isRunning = false;
        
        // Show game over screen
        this.showGameOver();
    }
    
    showGameOver() {
        // Create game over overlay
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <p>Final Score: ${this.stateManager.score}</p>
                <p>Challenges Completed: ${this.stateManager.challengeCount}</p>
                <button id="restartBtn" class="restart-btn">Play Again</button>
            </div>
        `;
        
        // The overlay will use CSS classes for styling
        const restartBtn = overlay.querySelector('#restartBtn');
        
        restartBtn.addEventListener('click', () => {
            this.audio.playBismillah();
            this.restart();
            document.body.removeChild(overlay);
        });
        
        document.body.appendChild(overlay);
    }
    
    restart() {
        // Reset all game objects
        this.player.reset();
        this.obstacleManager.reset();
        this.challenge.reset();
        this.stateManager.reset();
        
        // Reset background
        this.backgroundX = 0;
        
        // Restart game loop
        this.isRunning = true;
        this.gameLoop();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
