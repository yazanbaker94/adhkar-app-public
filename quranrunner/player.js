class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityY = 0;
        this.velocityX = 0;
        this.isJumping = false;
        this.isOnGround = true;
        this.gravity = 0.8;
        this.jumpPower = -15;
        this.groundY = y;
        this.speed = 5;
        
        // Animation properties
        this.frameX = 0;
        this.frameY = 0;
        this.frameCount = 0;
        this.animationSpeed = 8;
        
        // Colors for simple graphics
        this.color = '#4A90E2';
        this.eyeColor = '#000';
        this.shoeColor = '#8B4513';
    }
    
    update(deltaTime = 1/60) {
        // Apply gravity with time-based movement
        if (!this.isOnGround) {
            this.velocityY += this.gravity * deltaTime * 60; // 60 FPS base
        }
        
        // Update position with time-based movement
        this.y += this.velocityY * deltaTime * 60;
        this.x += this.velocityX * deltaTime * 60;
        
        // Ground collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isOnGround = true;
            this.isJumping = false;
        }
        
        // Keep player in bounds
        if (this.x < 0) this.x = 0;
        if (this.x > 800 - this.width) this.x = 800 - this.width;
        
        // Animation frame update (keep frame-based for smooth animation)
        this.frameCount++;
        if (this.frameCount >= this.animationSpeed) {
            this.frameCount = 0;
            this.frameX = (this.frameX + 1) % 4; // 4 animation frames
        }
    }
    
    jump(onJumpSound) {
        if (this.isOnGround && !this.isJumping) {
            this.velocityY = this.jumpPower;
            this.isOnGround = false;
            this.isJumping = true;
            this.frameY = 1; // Jumping animation frame
            
            // Play jump sound
            if (onJumpSound) {
                onJumpSound();
            }
        }
    }
    
    moveLeft() {
        this.velocityX = -this.speed;
        this.frameY = 2; // Left movement frame
    }
    
    moveRight() {
        this.velocityX = this.speed;
        this.frameY = 3; // Right movement frame
    }
    
    stopMoving() {
        this.velocityX = 0;
        this.frameY = 0; // Idle frame
    }
    
    draw(ctx) {
        // Save context
        ctx.save();
    
        // --- Draw thobe body (long robe) ---
        ctx.fillStyle = 'white'; // thobe color
        ctx.fillRect(this.x, this.y, this.width, this.height + 25);
    
        // --- Draw kufi cap (white half-circle) ---
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y - 15, 10, Math.PI, 2 * Math.PI); 
        ctx.fill();
    
        // --- Draw head ---
        ctx.fillStyle = '#FFB6C1'; // skin color
        ctx.fillRect(this.x + 5, this.y - 15, 20, 20);
    
        // --- Draw eyes ---
        ctx.fillStyle = this.eyeColor;
        ctx.fillRect(this.x + 8, this.y - 12, 3, 3);
        ctx.fillRect(this.x + 18, this.y - 12, 3, 3);
    
        // --- Draw arms (sleeves in thobe color) ---
        ctx.fillStyle = 'white';
        if (this.isJumping) {
            // Arms up when jumping
            ctx.fillRect(this.x - 5, this.y + 5, 8, 15);
            ctx.fillRect(this.x + 27, this.y + 5, 8, 15);
        } else {
            // Normal arm position
            ctx.fillRect(this.x - 5, this.y + 10, 8, 15);
            ctx.fillRect(this.x + 27, this.y + 10, 8, 15);
        }
    
        // --- Legs are mostly hidden by robe ---
        // Just draw a small bit if needed
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 5, this.y + this.height + 20, 8, 5);
        ctx.fillRect(this.x + 17, this.y + this.height + 20, 8, 5);
    
        // --- Draw shoes ---
        ctx.fillStyle = this.shoeColor;
        ctx.fillRect(this.x + 3, this.y + this.height + 25, 10, 5);
        ctx.fillRect(this.x + 17, this.y + this.height + 25, 10, 5);
    
        // Restore context
        ctx.restore();
    }
    
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    reset() {
        this.x = 100;
        this.y = this.groundY;
        this.velocityY = 0;
        this.velocityX = 0;
        this.isJumping = false;
        this.isOnGround = true;
        this.frameX = 0;
        this.frameY = 0;
    }
}
