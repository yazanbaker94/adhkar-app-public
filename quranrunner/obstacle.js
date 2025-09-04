class Obstacle {
    constructor(x, y, width, height, type = 'rock') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.speed = 3;
        this.passed = false;
        
        // Different obstacle types
        this.types = {
            rock: { color: '#8B4513', height: 30 },
            tree: { color: '#228B22', height: 50 },
            bush: { color: '#32CD32', height: 25 },
            log: { color: '#DEB887', height: 20 }
        };
        
        // Set properties based on type
        if (this.types[this.type]) {
            this.color = this.types[this.type].color;
            this.height = this.types[this.type].height;
            this.y = y - this.height; // Position obstacle bottom on ground level
        } else {
            this.color = '#8B4513';
            this.height = 30;
            this.y = y - this.height; // Position obstacle bottom on ground level
        }
    }
    
    update(deltaTime = 1/60) {
        // Time-based movement for consistent speed across devices
        this.x -= this.speed * deltaTime * 60; // 60 FPS base
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw passed indicator
        if (this.passed && this.passedAt && Date.now() - this.passedAt < 1000) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.fillRect(this.x - 5, this.y - 10, this.width + 10, this.height + 20);
        }
        
        switch (this.type) {
            case 'rock':
                this.drawRock(ctx);
                break;
            case 'tree':
                this.drawTree(ctx);
                break;
            case 'bush':
                this.drawBush(ctx);
                break;
            case 'log':
                this.drawLog(ctx);
                break;
            default:
                this.drawRock(ctx);
        }
        
        ctx.restore();
    }
    
    drawRock(ctx) {
        // Draw rock base
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw rock highlights
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(this.x + 5, this.y + 5, 10, 8);
        ctx.fillRect(this.x + 20, this.y + 12, 8, 6);
    }
    
    drawTree(ctx) {
        // Draw tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 10, this.y + 20, 10, 30);
        
        // Draw tree leaves
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw tree highlights
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y + 12, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBush(ctx) {
        // Draw bush
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 12, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bush highlights
        ctx.fillStyle = '#90EE90';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawLog(ctx) {
        // Draw log
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw log texture
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 3);
        ctx.fillRect(this.x + 2, this.y + 8, this.width - 4, 3);
        ctx.fillRect(this.x + 2, this.y + 14, this.width - 4, 3);
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    checkCollision(player) {
        const playerBounds = player.getBounds();
        const obstacleBounds = this.getBounds();
        
        return !(playerBounds.x + playerBounds.width < obstacleBounds.x ||
                playerBounds.x > obstacleBounds.x + obstacleBounds.width ||
                playerBounds.y + playerBounds.height < obstacleBounds.y ||
                playerBounds.y > obstacleBounds.y + obstacleBounds.height);
    }
}

class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.obstacleTypes = ['rock', 'tree', 'bush', 'log'];
        this.spawnTimer = 0;
        this.spawnInterval = 80; // Frames between obstacle spawns (faster for testing)
        this.minDistance = 200; // Minimum distance between obstacles
        this.gameSpeed = 1;
        
        // Adjust spawn rate for mobile devices
        if (window.innerWidth <= 768 || 'ontouchstart' in window) {
            this.spawnInterval = 100; // Slightly slower on mobile for better performance
        }
    }
    
    update(deltaTime = 1/60) {
        // Update spawn timer with time-based increments
        this.spawnTimer += deltaTime * 60; // 60 FPS base
        
        // Spawn new obstacles
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }
        
        // Update existing obstacles with time-based movement
        this.obstacles.forEach(obstacle => obstacle.update(deltaTime));
        
        // Remove off-screen obstacles that have been passed
        this.obstacles = this.obstacles.filter(obstacle => 
            !(obstacle.isOffScreen() && obstacle.passed)
        );
        
        // Increase game speed over time (every 10 seconds)
        if (this.spawnTimer % 600 === 0) { // Every 10 seconds
            this.gameSpeed += 0.1;
            this.spawnInterval = Math.max(60, this.spawnInterval - 5);
        }
    }
    
    spawnObstacle() {
        const canvasWidth = this.canvasWidth || 800;
        const canvasHeight = this.canvasHeight || 400;
        
        // Check if there's enough space for new obstacle
        if (this.obstacles.length > 0) {
            const lastObstacle = this.obstacles[this.obstacles.length - 1];
            if (canvasWidth - lastObstacle.x < this.minDistance) {
                return; // Not enough space
            }
        }
        
        // Random obstacle type
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        
        // Random width and height
        const width = Math.random() * 30 + 20; // 20-50 pixels
        const height = Math.random() * 20 + 20; // 20-40 pixels
        
        // Create new obstacle at ground level
        const groundY = canvasHeight - 50; // 50 pixels from bottom
        const obstacle = new Obstacle(canvasWidth, groundY, width, height, type);
        obstacle.speed = 3 * this.gameSpeed;
        
        this.obstacles.push(obstacle);
        console.log(`New obstacle spawned: ${type} at x=${obstacle.x}`);
    }
    
    draw(ctx) {
        this.obstacles.forEach(obstacle => obstacle.draw(ctx));
    }
    
    checkCollisions(player) {
        return this.obstacles.some(obstacle => obstacle.checkCollision(player));
    }
    
    getPassedObstacles() {
        return this.obstacles.filter(obstacle => 
            obstacle.x + obstacle.width < 100 && !obstacle.passed
        );
    }
    
    markObstaclesPassed() {
        let newlyPassed = 0;
        this.obstacles.forEach(obstacle => {
            if (obstacle.x + obstacle.width < 100 && !obstacle.passed) {
                obstacle.passed = true;
                newlyPassed++;
                // Add visual feedback
                obstacle.passedAt = Date.now();
                console.log(`Obstacle passed! Total passed: ${this.totalPassedCount + newlyPassed}`);
            }
        });
        
        // Update total count
        if (!this.totalPassedCount) this.totalPassedCount = 0;
        this.totalPassedCount += newlyPassed;
        
        return newlyPassed;
    }
    
    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 120;
        this.gameSpeed = 1;
        this.totalPassedCount = 0;
    }
    
    // Reset just the passed count for challenge completion
    resetPassedCount() {
        this.totalPassedCount = 0;
        console.log('Obstacle manager passed count reset to 0');
    }
    
    getObstacleCount() {
        // Count obstacles that have been passed, even if they're still in the array
        return this.obstacles.filter(obstacle => obstacle.passed).length;
    }
    
    // Keep track of total passed obstacles even after they're removed
    getTotalPassedCount() {
        return this.totalPassedCount || 0;
    }
    
    // Debug method to see current obstacles
    debugObstacles() {
        console.log('Total obstacles:', this.obstacles.length);
        console.log('Passed obstacles:', this.getObstacleCount());
        this.obstacles.forEach((obstacle, index) => {
            console.log(`Obstacle ${index}: x=${obstacle.x}, passed=${obstacle.passed}`);
        });
    }
    
    // Set canvas size for fullscreen mode
    setCanvasSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}
