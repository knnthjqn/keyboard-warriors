const gameState = {
    currentWord: "",
    lastWord: "",
    typedCorrectly: 0,
    currentScore: 0,
    personalBest: 0,
    isCurrentWordIntermediate: false,
    playerExperience: 0,
    playerLevel: 1,
    playerDamage: 2,
    maxPlayerHealth: 10,
    timerBonus: 0
};

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

class TypingGame extends Phaser.Scene {
    constructor() {
        super({ key: "TypingGame" });
    }

    preload() {
        this.createSprites();
    }

    createSprites() {
        // ... (sprites code unchanged)
        // [Sprites code omitted for brevity, unchanged from previous]
        // You can copy-paste the original sprite creation code here.
    }

    create() {
        // Initialize game variables
        this.timeLimit = 5 + gameState.timerBonus;
        this.timeLeft = this.timeLimit;
        this.playerHealth = gameState.maxPlayerHealth;
        this.enemyHealth = 10;
        this.enemyCount = 1;
        gameState.currentScore = 0;
        this.isPaused = false;
        this.progressBarEnemies = 0;
        this.maxProgressEnemies = 10;
        this.isBossFight = false;
        this.isLevelingUp = false;

        // ... (rest of create code unchanged)
        // [Background, characters, UI, progress bar, input, nextWord]
        this.cameras.main.setBackgroundColor('#2d5016');
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(450, 550);
            const tree = this.add.image(x, y, 'tree').setScale(0.8 + Math.random() * 0.4);
            tree.setTint(0x1a4a1a + Math.random() * 0x003300);
        }
        this.add.rectangle(400, 580, 800, 40, 0x4a3c2a);
        this.player = this.add.image(150, 500, 'knight').setScale(2);
        this.enemy = this.add.image(650, 500, 'enemy').setScale(2);
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
        this.createUI();
        this.createProgressBar();
        this.setupInput();
        this.nextWord();
    }

    // ... (UI, progress bar, input handlers unchanged)

    handleLetterInput(key) {
        if (key === gameState.currentWord[gameState.typedCorrectly]) {
            gameState.typedCorrectly++;
            this.updateWordDisplay();
            this.typedText.setText(gameState.currentWord.substring(0, gameState.typedCorrectly));

            this.playerAttack();

            if (gameState.typedCorrectly === gameState.currentWord.length) {
                this.wordCompleted();
            }
        } else {
            this.wrongLetter();
        }
    }

    wordCompleted() {
        this.enemyHealth -= gameState.playerDamage;

        const points = gameState.isCurrentWordIntermediate ? 200 : 100;
        const expGain = gameState.isCurrentWordIntermediate ? 20 : 10;
        gameState.currentScore += points;
        gameState.playerExperience += expGain;

        this.scoreText.setText(gameState.currentScore.toString());
        this.updateExpBar();

        if (gameState.playerExperience >= 100) {
            this.levelUp();
            return;
        }

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

    wrongLetter() {
        this.playerHealth -= 1;
        this.playerTakeDamage();

        if (this.playerHealth <= 0) {
            // Reset upgrades and player stats to default before game over
            gameState.playerLevel = 1;
            gameState.playerDamage = 2;
            gameState.maxPlayerHealth = 10;
            gameState.timerBonus = 0;
            gameState.playerExperience = 0;

            this.scene.start("GameOver", { 
                winner: "Game Over", // Changed text
                enemiesDefeated: this.enemyCount - 1,
                finalScore: gameState.currentScore,
                personalBest: gameState.personalBest,
                died: true // Flag to indicate player died
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

    levelUp() {
        this.isLevelingUp = true;
        gameState.playerExperience = 0;
        gameState.playerLevel++;
        this.levelText.setText(`LV: ${gameState.playerLevel}`);
        this.updateExpBar();

        const levelUpText = this.add.text(400, 350, "You leveled up!", {
            fontSize: "28px",
            fill: "#ffd700",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.createUpgradeChoices();

        this.upgradeTimer = this.time.delayedCall(10000, () => {
            this.autoSelectUpgrade();
        });

        this.tweens.add({
            targets: levelUpText,
            alpha: 0,
            duration: 2000,
            onComplete: () => levelUpText.destroy()
        });
    }

    createUpgradeChoices() {
        this.upgradeContainer = this.add.container(400, 400);

        const upgrades = [
            { text: "+2 damage", key: "1", type: "damage" },
            { text: "+2 health", key: "2", type: "health" },
            { text: "+2 second timer", key: "3", type: "timer" }
        ];

        this.upgradeBoxes = [];

        for (let i = 0; i < upgrades.length; i++) {
            const x = (i - 1) * 200;

            const box = this.add.rectangle(x, 0, 160, 80, 0x8b4513);
            box.setStrokeStyle(4, 0x654321);

            const innerBox = this.add.rectangle(x, 0, 140, 60, 0xa0522d);

            const upgradeText = this.add.text(x, 0, upgrades[i].text, {
                fontSize: "16px",
                fill: "#000",
                fontFamily: "Courier New",
                fontStyle: "bold",
                align: "center"
            }).setOrigin(0.5);

            const keyText = this.add.text(x, -30, upgrades[i].key, {
                fontSize: "20px",
                fill: "#fff",
                fontFamily: "Courier New",
                fontStyle: "bold"
            }).setOrigin(0.5);

            this.upgradeContainer.add([box, innerBox, upgradeText, keyText]);
            this.upgradeBoxes.push({ box, type: upgrades[i].type, key: upgrades[i].key });
        }

        this.upgradeInputHandler = (event) => {
            if (!this.isLevelingUp) return;

            const key = event.key;
            let selectedUpgrade = null;

            for (let upgrade of this.upgradeBoxes) {
                if (upgrade.key === key) {
                    selectedUpgrade = upgrade.type;
                    break;
                }
            }

            if (selectedUpgrade) {
                this.selectUpgrade(selectedUpgrade);
            }
        };

        this.input.keyboard.on("keydown", this.upgradeInputHandler);
    }

    selectUpgrade(upgradeType) {
        if (this.upgradeTimer) {
            this.upgradeTimer.destroy();
        }

        switch (upgradeType) {
            case "damage":
                gameState.playerDamage += 2;
                this.showUpgradeAnimation("damage");
                break;
            case "health":
                gameState.maxPlayerHealth += 2;
                this.playerHealth += 2;
                this.showUpgradeAnimation("health");
                break;
            case "timer":
                gameState.timerBonus += 2;
                this.timeLimit = (this.isBossFight ? 60 : 5) + gameState.timerBonus;
                this.showUpgradeAnimation("timer");
                break;
        }

        this.updateHealthBars();

        const upgradeText = this.add.text(400, 480, `Selected: ${upgradeType} upgrade!`, {
            fontSize: "18px",
            fill: "#27ae60",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: upgradeText,
            alpha: 0,
            duration: 2000,
            onComplete: () => upgradeText.destroy()
        });

        this.cleanupUpgradeUI();

        // FIX: Immediately generate a new word after upgrade selection.
        this.nextWord();
    }

    autoSelectUpgrade() {
        const upgrades = ["damage", "health", "timer"];
        const randomUpgrade = Phaser.Utils.Array.GetRandom(upgrades);
        this.selectUpgrade(randomUpgrade);
    }

    showUpgradeAnimation(type) {
        switch (type) {
            case "damage":
                for (let i = 0; i < 20; i++) {
                    const particle = this.add.rectangle(
                        150 + Math.random() * 20 - 10,
                        520,
                        3, 8,
                        0x00ff00
                    );
                    this.tweens.add({
                        targets: particle,
                        y: 420,
                        alpha: 0,
                        duration: 1000 + Math.random() * 500,
                        onComplete: () => particle.destroy()
                    });
                }
                break;
            case "health":
                this.tweens.add({
                    targets: [this.playerBarBg, this.playerBar],
                    scaleY: 1.5,
                    duration: 300,
                    yoyo: true
                });
                break;
            case "timer":
                this.tweens.add({
                    targets: [this.timerBg, this.timerBar],
                    scaleX: 1.2,
                    duration: 300,
                    yoyo: true
                });
                break;
        }
    }

    cleanupUpgradeUI() {
        if (this.upgradeContainer) {
            this.upgradeContainer.destroy();
        }
        if (this.upgradeInputHandler) {
            this.input.keyboard.off("keydown", this.upgradeInputHandler);
        }
        this.isLevelingUp = false;
    }

    pauseGame() {
        this.isPaused = true;
        this.pauseOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
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
        if (this.pauseOverlay) this.pauseOverlay.destroy();
        if (this.pauseText) this.pauseText.destroy();
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
                    this.isPaused = false;
                }
            }
        });
    }

    playerAttack() {
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
            onComplete: () => pointsText.destroy()
        });
    }

    enemyTakeDamage() {
        this.tweens.add({
            targets: this.enemy,
            tint: 0xff0000,
            duration: 200,
            yoyo: true,
            onComplete: () => this.enemy.clearTint()
        });
    }

    playerTakeDamage() {
        this.tweens.add({
            targets: this.player,
            tint: 0xff0000,
            duration: 300,
            yoyo: true,
            onComplete: () => this.player.clearTint()
        });
    }

    enemyDefeated() {
        this.tweens.add({
            targets: this.enemy,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            rotation: Math.PI * 2,
            duration: 500,
            onComplete: () => {
                this.progressBarEnemies++;
                this.updateProgressBar();
                if (this.progressBarEnemies >= this.maxProgressEnemies) {
                    this.startBossFight();
                } else {
                    this.spawnNewEnemy();
                }
            }
        });
    }

    updateProgressBar() {
        for (let i = 0; i < this.progressBarEnemies && i < this.maxProgressEnemies; i++) {
            if (this.progressSkulls[i]) {
                this.progressSkulls[i].setTint(0x888888); // Gray for defeated
            }
        }
    }

    startBossFight() {
        this.isBossFight = true;
        this.timeLimit = 60; // Boss fight timer (no bonus)
        this.timeLeft = this.timeLimit;
        this.enemyHealth = 30;

        this.enemy.setTexture('boss');
        this.enemy.setScale(2.5);

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
                const bossText = this.add.text(400, 480, "BOSS FIGHT!", {
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
        gameState.currentScore += 10000;
        this.scoreText.setText(gameState.currentScore.toString());

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

        this.progressBarEnemies = 0;
        this.isBossFight = false;
        this.timeLimit = 5 + gameState.timerBonus;

        for (let i = 0; i < this.maxProgressEnemies; i++) {
            if (this.progressSkulls[i]) {
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

        this.enemy.setTexture(this.isBossFight ? 'boss' : 'enemy');
        const scale = this.isBossFight ? 2.5 : 2;

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
        this.letterSprites.forEach(sprite => sprite.destroy());
        this.letterSprites = [];

        const letterWidth = 40;
        const startX = -(gameState.currentWord.length * letterWidth) / 2 + letterWidth / 2;

        for (let i = 0; i < gameState.currentWord.length; i++) {
            const letter = gameState.currentWord[i];
            const x = startX + i * letterWidth;

            let color = "#ffffff"; // white for untyped
            if (i < gameState.typedCorrectly) {
                color = "#2c3e50"; // dark for completed
            } else if (i === gameState.typedCorrectly) {
                color = "#f39c12"; // orange for current letter
            }

            const letterText = this.add.text(x, 0, letter, {
                fontSize: "36px",
                fill: color,
                fontFamily: "Courier New",
                fontStyle: "bold"
            }).setOrigin(0.5);

            const bg = this.add.rectangle(x, 0, 35, 45, 0x34495e, 0.7);
            bg.setStrokeStyle(2, i < gameState.typedCorrectly ? 0x27ae60 : 0x7f8c8d);

            this.wordContainer.add([bg, letterText]);
            this.letterSprites.push(letterText);
            this.letterSprites.push(bg);
        }
    }

    nextWord() {
        const useIntermediate = Math.random() < 0.4;
        const wordPool = useIntermediate ? intermediateWords : easyWords;
        gameState.isCurrentWordIntermediate = useIntermediate;

        let newWord;
        do {
            newWord = Phaser.Utils.Array.GetRandom(wordPool);
        } while (newWord === gameState.lastWord);

        gameState.lastWord = newWord;
        gameState.currentWord = newWord;
        gameState.typedCorrectly = 0;

        this.typedText.setText("");
        this.updateWordDisplay();

        if (!this.isBossFight) {
            this.timeLeft = this.timeLimit;
        }
    }

    updateHealthBars() {
        const maxHealth = this.isBossFight ? 30 : 10;
        this.playerBar.width = (this.playerHealth / gameState.maxPlayerHealth) * 140;
        this.enemyBar.width = (this.enemyHealth / maxHealth) * 140;

        this.playerHealthText.setText(`${this.playerHealth}/${gameState.maxPlayerHealth}`);

        if (this.playerHealth <= gameState.maxPlayerHealth * 0.3) {
            this.playerBar.fillColor = 0xe74c3c;
        } else if (this.playerHealth <= gameState.maxPlayerHealth * 0.6) {
            this.playerBar.fillColor = 0xf39c12;
        } else {
            this.playerBar.fillColor = 0x27ae60;
        }

        if (this.isBossFight) {
            this.enemyBar.fillColor = 0x8b0000;
        }
    }

    updateExpBar() {
        const width = (gameState.playerExperience / 100) * 140;
        this.expBar.width = width;
    }

    update(time, delta) {
        if (this.isPaused || this.isLevelingUp) return;

        if (!this.isBossFight || this.timeLeft > 0) {
            this.timeLeft -= delta / 1000;
        }

        if (this.timeLeft <= 0 && !this.isBossFight) {
            this.playerHealth -= 2;
            this.playerTakeDamage();

            if (this.playerHealth <= 0) {
                // Reset upgrades and player stats to default before game over
                gameState.playerLevel = 1;
                gameState.playerDamage = 2;
                gameState.maxPlayerHealth = 10;
                gameState.timerBonus = 0;
                gameState.playerExperience = 0;

                this.scene.start("GameOver", { 
                    winner: "Game Over",
                    enemiesDefeated: this.enemyCount - 1,
                    finalScore: gameState.currentScore,
                    personalBest: gameState.personalBest,
                    died: true
                });
                return;
            }
            this.updateHealthBars();
            this.nextWord();
        } else if (this.timeLeft <= 0 && this.isBossFight) {
            // Reset upgrades and player stats to default before game over
            gameState.playerLevel = 1;
            gameState.playerDamage = 2;
            gameState.maxPlayerHealth = 10;
            gameState.timerBonus = 0;
            gameState.playerExperience = 0;

            this.scene.start("GameOver", { 
                winner: "Game Over",
                enemiesDefeated: this.enemyCount - 1,
                finalScore: gameState.currentScore,
                personalBest: gameState.personalBest,
                died: true
            });
            return;
        }

        const width = Math.max((this.timeLeft / this.timeLimit) * 400, 0);
        this.timerBar.width = width;

        if (this.timeLeft < 5) {
            this.timerBar.fillColor = 0xff0000;
        } else if (this.timeLeft < 10) {
            this.timerBar.fillColor = 0xff9500;
        } else {
            this.timerBar.fillColor = 0x00ff41;
        }
    }
}

// Game Over Scene
class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: "GameOver" });
    }

    init(data) {
        this.winner = data.winner;
        this.enemiesDefeated = data.enemiesDefeated || 0;
        this.finalScore = data.finalScore || 0;
        this.personalBest = data.personalBest || 0;
        this.died = data.died || false;
        if (this.finalScore > this.personalBest) {
            this.personalBest = this.finalScore;
            gameState.personalBest = this.personalBest;
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d5016');
        // Changed: Show "Game Over" text if player died, otherwise winner
        let winnerText = this.died ? "Game Over" : `${this.winner} Wins!`;
        this.add.text(400, 200, winnerText, {
            fontSize: "48px",
            fill: "#e74c3c",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(400, 280, `Personal Best: ${this.personalBest}`, {
            fontSize: "24px",
            fill: "#f39c12",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(400, 320, `Score: ${this.finalScore}`, {
            fontSize: "24px",
            fill: this.finalScore >= this.personalBest ? "#27ae60" : "#e74c3c",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        if (this.finalScore > 0 && this.finalScore >= this.personalBest) {
            const newRecordText = this.add.text(400, 360, "NEW RECORD!", {
                fontSize: "18px",
                fill: "#27ae60",
                fontFamily: "Courier New",
                fontStyle: "bold"
            }).setOrigin(0.5);
            this.tweens.add({
                targets: newRecordText,
                alpha: 0.3,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        const restartText = this.add.text(400, 420, "Press SPACE to restart", {
            fontSize: "20px",
            fill: "#bdc3c7",
            fontFamily: "Courier New"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: restartText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.once("keydown-SPACE", () => {
            // Reset game state and player upgrades/stats on restart
            gameState.typedCorrectly = 0;
            gameState.currentScore = 0;
            gameState.playerLevel = 1;
            gameState.playerDamage = 2;
            gameState.maxPlayerHealth = 10;
            gameState.timerBonus = 0;
            gameState.playerExperience = 0;

            this.scene.start("TypingGame");
        });
    }
}

// Game configuration
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
    }
};

// Start the game
new Phaser.Game(config);
