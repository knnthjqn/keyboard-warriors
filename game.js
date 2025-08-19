const easyWords = [
    "QUEEN", "ZERO", "KETTLE", "JACKET", "HORSE",
    "HEART", "LEAF", "WAGON", "SHARK", "QUACK",
    "VULTURE", "YATCH", "AIRPLANE", "BOOK", "TOY",
    "INDEX", "TISSUE", "ACCURATE", "DECLINE", "GENEROUS",
    "KNOWLEDGE", "STRUGGLE", "YOUTHFUL", "FREEDOM", "JUSTICE",
    "ZEPHYR", "PATIENT", "UNIFORM", "VICTORY", "ALACRITY", "ANTIPATHY",
    "ASPERSION", "ASSIDUOUS", "CAPRICIOUS", "COGENT", "DICHOTOMY", "DISSONANCE",
    "EBONY", "ENERVATE", "EQUANIMITY", "ESOTERIC", "EXPEDITIOUS", "FECUND",
    "HAPHAZARD", "ICONOCLAST", "NONCHALANT", "OBDURATE", "OBLIQUE", "ALCHEMY",
    "AMBIVALENT", "ARCANE", "CHIMERICAL", "DEFERENCE", "FELICITOUS", "OMINOUS",
    "REVERENCE", "AESTHETIC", "BENEVOLENT", "BLASPHEMOUS", "CENSURE", 
    "COMPLACENT", "DELUGE", "EGREGIOUS", "GALVANIZE", "INCENDIARY", "JUXTAPOSE"
];

const intermediateWords = [
    "DRAGON", "CASTLE", "FOREST", "BATTLE", "WIZARD",
    "OBSFUSCATE", "SHADOW", "BRIDGE", "FROZEN", "GOLDEN",
    "PLANET", "THUNDER", "CRYSTAL", "VICTORY", "ANCIENT",
    "DANGER", "INTRASIGENT", "STADIUM", "VILLIAN", "CRIMSON",
    "MASSIVE", "INFERNO", "REQUEST", "COMMIT", "INSIGHTS", "WARRIOR",
    "SUPERCILICIOUS", "ABERRATION", "ENIGMATIC", "IMPERTINENT", "INTRANSIGENT",
    "NEFARIOUS", "SAGACIOUS", "TENACIOUS", "ZEALOUS", "INTRANSIGENT", "CONUNDRUM"
];

let currentWord = "";
        let lastWord = "";
        let typedCorrectly = 0; // Track how many letters typed correctly
        let currentScore = 0;
        let personalBest = 0; // Removed localStorage
        let isCurrentWordIntermediate = false;
        let playerExperience = 0;
        let playerLevel = 1;
        let playerDamage = 2;
        let maxPlayerHealth = 10;
        let timerBonus = 0;

        class TypingGame extends Phaser.Scene {
            constructor() {
                super("TypingGame");
            }

            preload() {
                // Create simple pixel art sprites
                this.createSprites();
                
                // Create progress bar skulls
                this.createProgressBar();
            }

            createSprites() {
                // Create knight sprite (player)
                const knightGraphics = this.add.graphics();
                knightGraphics.fillStyle(0x4a90e2);
                knightGraphics.fillRect(0, 0, 32, 40);
                knightGraphics.fillStyle(0x7f8c8d);
                knightGraphics.fillRect(8, 0, 16, 12); // helmet
                knightGraphics.fillStyle(0xf39c12);
                knightGraphics.fillRect(4, 12, 24, 8); // chest
                knightGraphics.fillStyle(0x34495e);
                knightGraphics.fillRect(12, 20, 8, 20); // body
                knightGraphics.generateTexture('knight', 32, 40);
                knightGraphics.destroy();

                // Create boss sprite (larger, different color)
                const bossGraphics = this.add.graphics();
                bossGraphics.fillStyle(0x8b0000); // Dark red
                bossGraphics.fillRect(0, 0, 40, 48);
                bossGraphics.fillStyle(0x2c3e50);
                bossGraphics.fillRect(8, 0, 24, 16); // larger head
                bossGraphics.fillStyle(0xff0000);
                bossGraphics.fillRect(12, 4, 6, 6); // eyes
                bossGraphics.fillRect(22, 4, 6, 6);
                bossGraphics.fillStyle(0x8b4513);
                bossGraphics.fillRect(6, 16, 28, 32); // larger body
                // Add spikes/details
                bossGraphics.fillStyle(0x444444);
                bossGraphics.fillRect(2, 20, 4, 8);
                bossGraphics.fillRect(34, 20, 4, 8);
                bossGraphics.generateTexture('boss', 40, 48);
                bossGraphics.destroy();

                // Create skull sprites for progress bar
                const skullGraphics = this.add.graphics();
                skullGraphics.fillStyle(0xffffff);
                skullGraphics.fillCircle(12, 10, 8); // skull head
                skullGraphics.fillStyle(0x000000);
                skullGraphics.fillCircle(8, 8, 2); // left eye
                skullGraphics.fillCircle(16, 8, 2); // right eye
                skullGraphics.fillRect(11, 12, 2, 4); // nose
                skullGraphics.fillStyle(0xffffff);
                skullGraphics.fillRect(5, 18, 14, 6); // jaw
                skullGraphics.fillStyle(0x000000);
                skullGraphics.fillRect(7, 20, 2, 2); // teeth
                skullGraphics.fillRect(10, 20, 2, 2);
                skullGraphics.fillRect(13, 20, 2, 2);
                skullGraphics.fillRect(16, 20, 2, 2);
                // Crown for boss skull
                skullGraphics.fillStyle(0xffd700);
                skullGraphics.fillRect(4, 2, 16, 4);
                skullGraphics.fillRect(8, 0, 2, 4);
                skullGraphics.fillRect(12, 0, 2, 4);
                skullGraphics.fillRect(16, 0, 2, 4);
                skullGraphics.generateTexture('skull', 24, 24);
                skullGraphics.destroy();

                // Create enemy sprite (goblin/orc)
                const enemyGraphics = this.add.graphics();
                enemyGraphics.fillStyle(0x27ae60);
                enemyGraphics.fillRect(0, 0, 28, 36);
                enemyGraphics.fillStyle(0x2c3e50);
                enemyGraphics.fillRect(6, 0, 16, 10); // head
                enemyGraphics.fillStyle(0xe74c3c);
                enemyGraphics.fillRect(8, 2, 4, 4); // eyes
                enemyGraphics.fillRect(16, 2, 4, 4);
                enemyGraphics.fillStyle(0x8b4513);
                enemyGraphics.fillRect(4, 10, 20, 26); // body
                enemyGraphics.generateTexture('enemy', 28, 36);
                enemyGraphics.destroy();

                // Create forest background elements
                const treeGraphics = this.add.graphics();
                treeGraphics.fillStyle(0x8b4513);
                treeGraphics.fillRect(15, 20, 10, 30); // trunk
                treeGraphics.fillStyle(0x228b22);
                treeGraphics.fillCircle(20, 20, 15); // leaves
                treeGraphics.generateTexture('tree', 40, 50);
                treeGraphics.destroy();
            }

            createProgressBar() {
                this.progressBarContainer = this.add.container(400, 100);
                this.progressSkulls = [];
                
                const startX = -(this.maxProgressEnemies * 30) / 2 + 15;
                
                for (let i = 0; i < this.maxProgressEnemies; i++) {
                    const x = startX + i * 30;
                    const skull = this.add.image(x, 0, 'skull').setScale(0.8);
                    
                    // Set initial colors: first 9 skulls black, last skull (boss) red
                    if (i === this.maxProgressEnemies - 1) {
                        skull.setTint(0xff0000); // Boss skull red
                    } else {
                        skull.setTint(0x000000); // Regular skulls black
                    }
                    
                    this.progressBarContainer.add(skull);
                    this.progressSkulls.push(skull);
                    
                    // Add dashed line between skulls (except after last one)
                    if (i < this.maxProgressEnemies - 1) {
                        for (let j = 0; j < 3; j++) {
                            const dash = this.add.rectangle(x + 12 + j * 6, 0, 4, 2, 0x666666);
                            this.progressBarContainer.add(dash);
                        }
                    }
                }
            }

            create() {
                this.timeLimit = 5 + timerBonus; // Add timer bonus
                this.timeLeft = this.timeLimit;
                this.playerHealth = maxPlayerHealth;
                this.enemyHealth = 10;
                this.enemyCount = 1;
                currentScore = 0; // Reset score at game start
                this.isPaused = false;
                this.progressBarEnemies = 0; // Track enemies defeated in current progress bar
                this.maxProgressEnemies = 10; // 10 skulls total
                this.isBossFight = false;
                this.isLevelingUp = false;

                // Create forest background
                this.cameras.main.setBackgroundColor('#2d5016');
                
                // Add trees for forest atmosphere
                for (let i = 0; i < 8; i++) {
                    const x = Phaser.Math.Between(50, 750);
                    const y = Phaser.Math.Between(450, 550);
                    const tree = this.add.image(x, y, 'tree').setScale(0.8 + Math.random() * 0.4);
                    tree.setTint(0x1a4a1a + Math.random() * 0x003300);
                }

                // Add ground
                const ground = this.add.rectangle(400, 580, 800, 40, 0x4a3c2a);

                // Create characters
                this.player = this.add.image(150, 500, 'knight').setScale(2);
                this.enemy = this.add.image(650, 500, 'enemy').setScale(2);

                // Add floating animation to characters
                this.tweens.add({
                    targets: this.player,
                    y: 495,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                this.tweens.add({
                    targets: this.enemy,
                    y: 495,
                    duration: 1800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Word display with individual letter styling
                this.wordContainer = this.add.container(400, 200); // Moved down
                this.letterSprites = [];

                // Typed text display
                this.typedText = this.add.text(400, 300, "", { // Moved down
                    fontSize: "24px",
                    fill: "#00ff41",
                    fontFamily: "Courier New"
                }).setOrigin(0.5);

                // Experience bar
                this.add.text(150, 140, "EXP", {
                    fontSize: "12px",
                    fill: "#fff",
                    fontFamily: "Courier New"
                }).setOrigin(0.5);
                
                this.expBarBg = this.add.rectangle(80, 160, 140, 12, 0x2c3e50).setOrigin(0, 0.5);
                this.expBarBg.setStrokeStyle(1, 0x34495e);
                this.expBar = this.add.rectangle(80, 160, 0, 10, 0x9b59b6).setOrigin(0, 0.5);

                // Level display
                this.levelText = this.add.text(150, 180, `LV: ${playerLevel}`, {
                    fontSize: "14px",
                    fill: "#e74c3c",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                }).setOrigin(0.5);

                // Score display
                this.add.text(400, 420, "SCORE", { // Moved down
                    fontSize: "14px",
                    fill: "#fff",
                    fontFamily: "Courier New"
                }).setOrigin(0.5);
                
                this.scoreText = this.add.text(400, 440, "0", { // Moved down
                    fontSize: "20px",
                    fill: "#f39c12",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                }).setOrigin(0.5);

                // Timer display
                this.add.text(400, 30, "TIME", {
                    fontSize: "16px",
                    fill: "#fff",
                    fontFamily: "Courier New"
                }).setOrigin(0.5);

                // Timer bar background
                this.timerBg = this.add.rectangle(400, 50, 400, 24, 0x2c3e50);
                this.timerBg.setStrokeStyle(2, 0x34495e);

                // Timer bar foreground
                this.timerBar = this.add.rectangle(200, 50, 400, 20, 0x00ff41).setOrigin(0, 0.5);

                // Health bars
                this.add.text(150, 80, "KNIGHT", { 
                    fontSize: "14px", 
                    fill: "#fff",
                    fontFamily: "Courier New"
                }).setOrigin(0.5);
                
                this.playerBarBg = this.add.rectangle(80, 100, 140, 16, 0x2c3e50).setOrigin(0, 0.5);
                this.playerBarBg.setStrokeStyle(1, 0x34495e);
                this.playerBar = this.add.rectangle(80, 100, 140, 14, 0x27ae60).setOrigin(0, 0.5);

                // Health text with current/max display
                this.playerHealthText = this.add.text(150, 120, `${this.playerHealth}/${maxPlayerHealth}`, {
                    fontSize: "12px",
                    fill: "#fff",
                    fontFamily: "Courier New"
                }).setOrigin(0.5);

                this.add.text(650, 80, "ENEMY", { 
                    fontSize: "14px", 
                    fill: "#fff",
                    fontFamily: "Courier New"
                }).setOrigin(0.5);
                
                this.enemyBarBg = this.add.rectangle(580, 100, 140, 16, 0x2c3e50).setOrigin(0, 0.5);
                this.enemyBarBg.setStrokeStyle(1, 0x34495e);
                this.enemyBar = this.add.rectangle(580, 100, 140, 14, 0xe74c3c).setOrigin(0, 0.5);

                // First word
                this.nextWord();

                // Key input - automatically register when scene starts
                this.input.keyboard.on("keydown", (event) => {
                    // Handle pause/unpause
                    if (event.key === "Escape") {
                        if (!this.isPaused) {
                            this.pauseGame();
                        } else {
                            this.unpauseGame();
                        }
                        return;
                    }
                    
                    // Don't process other keys if game is paused or leveling up
                    if (this.isPaused || this.isLevelingUp) return;
                    
                    const key = event.key.toUpperCase();
                    
                    if (key.length === 1 && key.match(/[A-Z]/)) {
                        // Check if this is the next correct letter
                        if (key === currentWord[typedCorrectly]) {
                            typedCorrectly++;
                            this.updateWordDisplay();
                            this.typedText.setText(currentWord.substring(0, typedCorrectly));
                            
                            // Player attack animation
                            this.playerAttack();
                            
                            // Check if word is complete
                            if (typedCorrectly === currentWord.length) {
                                this.enemyHealth -= playerDamage;
                                
                                // Add score and experience based on difficulty
                                const points = isCurrentWordIntermediate ? 200 : 100;
                                const expGain = isCurrentWordIntermediate ? 20 : 10;
                                currentScore += points;
                                playerExperience += expGain;
                                
                                this.scoreText.setText(currentScore.toString());
                                this.updateExpBar();
                                
                                // Check for level up
                                if (playerExperience >= 100) {
                                    this.levelUp();
                                    return;
                                }
                                
                                // Show points gained
                                this.showPointsGained(points);
                                
                                this.enemyTakeDamage();
                                
                                if (this.enemyHealth <= 0) {
                                    if (this.isBossFight) {
                                        this.bossFightCompleted();
                                    } else {
                                        this.enemyDefeated();
                                    }
                                } else {
                                    this.updateHealthBars();
                                    this.nextWord();
                                }
                            }
                        } else {
                            // Wrong letter - damage player and visual feedback
                            this.playerHealth -= 1;
                            this.playerTakeDamage();
                            
                            if (this.playerHealth <= 0) {
                                this.scene.start("GameOver", { 
                                    winner: "Enemy", 
                                    enemiesDefeated: this.enemyCount - 1,
                                    finalScore: currentScore,
                                    personalBest: personalBest
                                });
                                return;
                            }
                            
                            this.updateHealthBars();
                            this.cameras.main.shake(100, 0.01);
                            this.typedText.setTint(0xff0000);
                            this.time.delayedCall(200, () => {
                                this.typedText.clearTint();
                            });
                        }
                    }
                    
                    if (event.key === "Backspace" && typedCorrectly > 0) {
                        typedCorrectly--;
                        this.updateWordDisplay();
                        this.typedText.setText(currentWord.substring(0, typedCorrectly));
                    }
                });
            }

            pauseGame() {
                this.isPaused = true;
                
                // Create lighter blur effect
                this.cameras.main.setPostPipeline('LightBlurPostFX');
                
                // Create pause overlay with less opacity
                this.pauseOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.1);
                this.pauseText = this.add.text(400, 300, "GAME PAUSED\nPress ESC to resume", {
                    fontSize: "32px",
                    fill: "#fff",
                    fontFamily: "Courier New",
                    fontStyle: "bold",
                    align: "center",
                    stroke: "#000",
                    strokeThickness: 4
                }).setOrigin(0.5).setDepth(1000);
            }

            unpauseGame() {
                // Remove pause overlay
                if (this.pauseOverlay) this.pauseOverlay.destroy();
                if (this.pauseText) this.pauseText.destroy();
                
                // Start countdown
                this.startCountdown();
            }

            startCountdown() {
                let count = 3;
                const countdownText = this.add.text(400, 300, count.toString(), {
                    fontSize: "72px",
                    fill: "#fff",
                    fontFamily: "Courier New",
                    fontStyle: "bold",
                    stroke: "#000",
                    strokeThickness: 6
                }).setOrigin(0.5).setDepth(1000);

                const countdownTimer = this.time.addEvent({
                    delay: 1000,
                    repeat: 2,
                    callback: () => {
                        count--;
                        if (count > 0) {
                            countdownText.setText(count.toString());
                        } else {
                            countdownText.destroy();
                            // Remove blur and unpause
                            this.cameras.main.resetPostPipeline();
                            this.isPaused = false;
                        }
                    }
                });
            }

            playerAttack() {
                // Simple attack animation
                this.tweens.add({
                    targets: this.player,
                    scaleX: 2.2,
                    scaleY: 2.2,
                    duration: 150,
                    yoyo: true,
                    ease: 'Power2'
                });
            }

            showPointsGained(points) {
                // Create floating points text
                const pointsText = this.add.text(400, 300, `+${points}`, {
                    fontSize: "24px",
                    fill: points === 200 ? "#e74c3c" : "#27ae60",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                }).setOrigin(0.5);
                
                this.tweens.add({
                    targets: pointsText,
                    y: 250,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Power2',
                    onComplete: () => {
                        pointsText.destroy();
                    }
                });
            }

            enemyTakeDamage() {
                // Enemy damage animation
                this.tweens.add({
                    targets: this.enemy,
                    tint: 0xff0000,
                    duration: 200,
                    yoyo: true,
                    onComplete: () => {
                        this.enemy.clearTint();
                    }
                });
            }

            enemyDefeated() {
                // Enemy defeat animation
                this.tweens.add({
                    targets: this.enemy,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    rotation: Math.PI * 2,
                    duration: 500,
                    onComplete: () => {
                        // Update progress bar
                        this.progressBarEnemies++;
                        this.updateProgressBar();
                        
                        // Check if it's time for boss fight
                        if (this.progressBarEnemies >= this.maxProgressEnemies) {
                            this.startBossFight();
                        } else {
                            this.spawnNewEnemy();
                        }
                    }
                });
            }

            updateProgressBar() {
                // Change skulls to gray when defeated
                for (let i = 0; i < this.progressBarEnemies && i < this.maxProgressEnemies; i++) {
                    if (this.progressSkulls[i]) { // Check if skull exists
                        this.progressSkulls[i].setTint(0x888888); // Gray for defeated
                    }
                }
            }

            startBossFight() {
                this.isBossFight = true;
                this.timeLimit = 60; // 1 minute for boss fight
                this.timeLeft = this.timeLimit;
                this.enemyHealth = 30; // Boss has 30 health
                
                // Change enemy to boss sprite
                this.enemy.setTexture('boss');
                this.enemy.setScale(2.5); // Larger boss
                
                // Boss entrance animation
                this.enemy.setAlpha(1);
                this.enemy.setScale(0);
                this.tweens.add({
                    targets: this.enemy,
                    scaleX: 2.5,
                    scaleY: 2.5,
                    duration: 1000,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this.updateHealthBars();
                        this.nextWord();
                        
                        // Boss fight indicator
                        const bossText = this.add.text(400, 430, "BOSS FIGHT!", {
                            fontSize: "24px",
                            fill: "#ff0000",
                            fontFamily: "Courier New",
                            fontStyle: "bold"
                        }).setOrigin(0.5);
                        
                        this.tweens.add({
                            targets: bossText,
                            alpha: 0,
                            duration: 3000,
                            onComplete: () => bossText.destroy()
                        });
                    }
                });
            }

            bossFightCompleted() {
                // Add boss defeat bonus
                currentScore += 10000;
                this.scoreText.setText(currentScore.toString());
                
                // Show bonus points
                const bonusText = this.add.text(400, 280, "+10000 BOSS DEFEATED!", {
                    fontSize: "20px",
                    fill: "#ffd700",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                }).setOrigin(0.5);
                
                this.tweens.add({
                    targets: bonusText,
                    y: 230,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Power2',
                    onComplete: () => bonusText.destroy()
                });
                
                // Reset progress bar and continue with regular enemies
                this.progressBarEnemies = 0;
                this.isBossFight = false;
                this.timeLimit = 5; // Back to regular timer
                
                // Reset all skulls to initial colors
                for (let i = 0; i < this.maxProgressEnemies; i++) {
                    if (this.progressSkulls[i]) { // Check if skull exists
                        if (i === this.maxProgressEnemies - 1) {
                            this.progressSkulls[i].setTint(0xff0000); // Boss skull back to red
                        } else {
                            this.progressSkulls[i].setTint(0x000000); // Regular skulls back to black
                        }
                    }
                }
                
                this.spawnNewEnemy();
            }

            spawnNewEnemy() {
                this.enemyCount++;
                this.enemyHealth = this.isBossFight ? 30 : 10;
                
                // Use appropriate sprite and scale
                this.enemy.setTexture(this.isBossFight ? 'boss' : 'enemy');
                const scale = this.isBossFight ? 2.5 : 2;
                
                // Respawn enemy with animation
                this.enemy.setAlpha(1);
                this.enemy.setScale(0);
                this.enemy.setRotation(0);
                
                this.tweens.add({
                    targets: this.enemy,
                    scaleX: scale,
                    scaleY: scale,
                    duration: 500,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this.updateHealthBars();
                        this.nextWord();
                    }
                });
            }

            updateWordDisplay() {
                // Clear existing letters
                this.letterSprites.forEach(sprite => sprite.destroy());
                this.letterSprites = [];

                const letterWidth = 40;
                const startX = -(currentWord.length * letterWidth) / 2 + letterWidth / 2;

                for (let i = 0; i < currentWord.length; i++) {
                    const letter = currentWord[i];
                    const x = startX + i * letterWidth;
                    
                    // Determine color based on typing progress
                    let color = "#ffffff"; // white for untyped
                    if (i < typedCorrectly) {
                        color = "#2c3e50"; // dark for completed
                    } else if (i === typedCorrectly) {
                        color = "#f39c12"; // orange for current letter
                    }
                    
                    const letterText = this.add.text(x, 0, letter, {
                        fontSize: "36px",
                        fill: color,
                        fontFamily: "Courier New",
                        fontStyle: "bold"
                    }).setOrigin(0.5);

                    // Add background for better visibility
                    const bg = this.add.rectangle(x, 0, 35, 45, 0x34495e, 0.7);
                    bg.setStrokeStyle(2, i < typedCorrectly ? 0x27ae60 : 0x7f8c8d);
                    
                    this.wordContainer.add([bg, letterText]);
                    this.letterSprites.push(letterText);
                    this.letterSprites.push(bg);
                }
            }

            update(time, delta) {
                // Don't update game mechanics if paused
                if (this.isPaused) return;
                
                this.timeLeft -= delta / 1000;
                
                if (this.timeLeft <= 0) {
                    this.playerHealth -= 2;
                    this.playerTakeDamage();
                    
                    if (this.playerHealth <= 0) {
                        this.scene.start("GameOver", { 
                            winner: "Enemy", 
                            enemiesDefeated: this.enemyCount - 1,
                            finalScore: currentScore,
                            personalBest: personalBest
                        });
                        return;
                    }
                    this.updateHealthBars();
                    this.nextWord();
                }

                // Update timer bar
                const width = Math.max((this.timeLeft / this.timeLimit) * 400, 0);
                this.timerBar.width = width;
                
                // Change timer color as it gets low
                if (this.timeLeft < 5) {
                    this.timerBar.fillColor = 0xff0000;
                } else if (this.timeLeft < 10) {
                    this.timerBar.fillColor = 0xff9500;
                } else {
                    this.timerBar.fillColor = 0x00ff41;
                }
            }

            playerTakeDamage() {
                // Player damage animation
                this.tweens.add({
                    targets: this.player,
                    tint: 0xff0000,
                    duration: 300,
                    yoyo: true,
                    onComplete: () => {
                        this.player.clearTint();
                    }
                });
            }

            nextWord() {
                // Randomly choose between easy and intermediate words
                const useIntermediate = Math.random() < 0.4; // 40% chance for intermediate
                const wordPool = useIntermediate ? intermediateWords : easyWords;
                isCurrentWordIntermediate = useIntermediate;
                
                let newWord;
                do {
                    newWord = Phaser.Utils.Array.GetRandom(wordPool);
                } while (newWord === lastWord);
                
                lastWord = newWord;
                currentWord = newWord;
                typedCorrectly = 0;
                
                this.typedText.setText("");
                this.updateWordDisplay();
                this.timeLeft = this.timeLimit; // Reset timer when new word appears
            }

            updateHealthBars() {
                const maxHealth = this.isBossFight ? 30 : 10;
                this.playerBar.width = (this.playerHealth / 10) * 140;
                this.enemyBar.width = (this.enemyHealth / maxHealth) * 140;
                
                // Change color based on health
                if (this.playerHealth <= 3) {
                    this.playerBar.fillColor = 0xe74c3c;
                } else if (this.playerHealth <= 6) {
                    this.playerBar.fillColor = 0xf39c12;
                } else {
                    this.playerBar.fillColor = 0x27ae60;
                }
                
                // Boss health bar is always red
                if (this.isBossFight) {
                    this.enemyBar.fillColor = 0x8b0000;
                }
            }
        }

        class GameOver extends Phaser.Scene {
            constructor() {
                super("GameOver");
            }

            init(data) {
                this.winner = data.winner;
                this.enemiesDefeated = data.enemiesDefeated || 0;
                this.finalScore = data.finalScore || 0;
                this.personalBest = data.personalBest || 0;
                
                // Update personal best if current score is higher
                if (this.finalScore > this.personalBest) {
                    this.personalBest = this.finalScore;
                    personalBest = this.personalBest;
                }
            }

            create() {
                this.cameras.main.setBackgroundColor('#2d5016');
                
                // Game over title
                this.add.text(400, 200, `${this.winner} Wins!`, {
                    fontSize: "48px",
                    fill: this.winner === "Player" ? "#27ae60" : "#e74c3c",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                }).setOrigin(0.5);

                // Score display
                this.add.text(400, 280, `Personal Best: ${this.personalBest}`, {
                    fontSize: "24px",
                    fill: "#f39c12",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                }).setOrigin(0.5);

                this.add.text(400, 320, `Score: ${this.finalScore}`, {
                    fontSize: "24px",
                    fill: this.finalScore > this.personalBest ? "#27ae60" : "#e74c3c",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                }).setOrigin(0.5);

                // New record indicator
                if (this.finalScore > 0 && this.finalScore >= this.personalBest) {
                    const newRecordText = this.add.text(400, 360, "NEW RECORD!", {
                        fontSize: "18px",
                        fill: "#27ae60",
                        fontFamily: "Courier New",
                        fontStyle: "bold"
                    }).setOrigin(0.5);
                    
                    // Blinking effect for new record
                    this.tweens.add({
                        targets: newRecordText,
                        alpha: 0.3,
                        duration: 500,
                        yoyo: true,
                        repeat: -1
                    });
                }

                // Restart instruction
                this.add.text(400, 420, "Press SPACE to restart", {
                    fontSize: "20px",
                    fill: "#bdc3c7",
                    fontFamily: "Courier New"
                }).setOrigin(0.5);

                // Blinking effect for restart text
                this.tweens.add({
                    targets: this.children.getByName('restartText') || this.children.list[this.children.list.length - 1],
                    alpha: 0.3,
                    duration: 800,
                    yoyo: true,
                    repeat: -1
                });

                this.input.keyboard.once("keydown-SPACE", () => {
                    // Reset game state
                    typedCorrectly = 0;
                    this.scene.start("TypingGame");
                });
            }
        }

        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            scene: [TypingGame, GameOver],
            backgroundColor: "#2d5016",
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 }
                }
            },
            pipeline: {
                'BlurPostFX': class extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
                    constructor(game) {
                        super({
                            game,
                            renderTarget: true,
                            fragShader: `
                                precision mediump float;
                                uniform sampler2D uMainSampler;
                                varying vec2 outTexCoord;
                                void main(void) {
                                    vec4 color = texture2D(uMainSampler, outTexCoord);
                                    vec4 blur = vec4(0.0);
                                    float blurSize = 0.008;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x - 4.0*blurSize, outTexCoord.y)) * 0.05;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x - 3.0*blurSize, outTexCoord.y)) * 0.09;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x - 2.0*blurSize, outTexCoord.y)) * 0.12;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x - blurSize, outTexCoord.y)) * 0.15;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x, outTexCoord.y)) * 0.16;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x + blurSize, outTexCoord.y)) * 0.15;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x + 2.0*blurSize, outTexCoord.y)) * 0.12;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x + 3.0*blurSize, outTexCoord.y)) * 0.09;
                                    blur += texture2D(uMainSampler, vec2(outTexCoord.x + 4.0*blurSize, outTexCoord.y)) * 0.05;
                                    gl_FragColor = blur;
                                }
                            `
                        });
                    }
                }
            }
        };

        new Phaser.Game(config);

