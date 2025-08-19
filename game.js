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
let typedCorrectly = 0;
let currentScore = 0;
let personalBest = 0;
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
        this.createSprites();
        this.createProgressBar();
    }

    createSprites() {
        // Knight sprite
        const knightGraphics = this.add.graphics();
        knightGraphics.fillStyle(0x4a90e2);
        knightGraphics.fillRect(0, 0, 32, 40);
        knightGraphics.fillStyle(0x7f8c8d);
        knightGraphics.fillRect(8, 0, 16, 12);
        knightGraphics.fillStyle(0xf39c12);
        knightGraphics.fillRect(4, 12, 24, 8);
        knightGraphics.fillStyle(0x34495e);
        knightGraphics.fillRect(12, 20, 8, 20);
        knightGraphics.generateTexture('knight', 32, 40);
        knightGraphics.destroy();

        // Boss sprite
        const bossGraphics = this.add.graphics();
        bossGraphics.fillStyle(0x8b0000);
        bossGraphics.fillRect(0, 0, 40, 48);
        bossGraphics.fillStyle(0x2c3e50);
        bossGraphics.fillRect(8, 0, 24, 16);
        bossGraphics.fillStyle(0xff0000);
        bossGraphics.fillRect(12, 4, 6, 6);
        bossGraphics.fillRect(22, 4, 6, 6);
        bossGraphics.fillStyle(0x8b4513);
        bossGraphics.fillRect(6, 16, 28, 32);
        bossGraphics.fillStyle(0x444444);
        bossGraphics.fillRect(2, 20, 4, 8);
        bossGraphics.fillRect(34, 20, 4, 8);
        bossGraphics.generateTexture('boss', 40, 48);
        bossGraphics.destroy();

        // Skull sprite
        const skullGraphics = this.add.graphics();
        skullGraphics.fillStyle(0xffffff);
        skullGraphics.fillCircle(12, 10, 8);
        skullGraphics.fillStyle(0x000000);
        skullGraphics.fillCircle(8, 8, 2);
        skullGraphics.fillCircle(16, 8, 2);
        skullGraphics.fillRect(11, 12, 2, 4);
        skullGraphics.fillStyle(0xffffff);
        skullGraphics.fillRect(5, 18, 14, 6);
        skullGraphics.fillStyle(0x000000);
        skullGraphics.fillRect(7, 20, 2, 2);
        skullGraphics.fillRect(10, 20, 2, 2);
        skullGraphics.fillRect(13, 20, 2, 2);
        skullGraphics.fillRect(16, 20, 2, 2);
        skullGraphics.fillStyle(0xffd700);
        skullGraphics.fillRect(4, 2, 16, 4);
        skullGraphics.fillRect(8, 0, 2, 4);
        skullGraphics.fillRect(12, 0, 2, 4);
        skullGraphics.fillRect(16, 0, 2, 4);
        skullGraphics.generateTexture('skull', 24, 24);
        skullGraphics.destroy();

        // Enemy sprite
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0x27ae60);
        enemyGraphics.fillRect(0, 0, 28, 36);
        enemyGraphics.fillStyle(0x2c3e50);
        enemyGraphics.fillRect(6, 0, 16, 10);
        enemyGraphics.fillStyle(0xe74c3c);
        enemyGraphics.fillRect(8, 2, 4, 4);
        enemyGraphics.fillRect(16, 2, 4, 4);
        enemyGraphics.fillStyle(0x8b4513);
        enemyGraphics.fillRect(4, 10, 20, 26);
        enemyGraphics.generateTexture('enemy', 28, 36);
        enemyGraphics.destroy();

        // Tree background
        const treeGraphics = this.add.graphics();
        treeGraphics.fillStyle(0x8b4513);
        treeGraphics.fillRect(15, 20, 10, 30);
        treeGraphics.fillStyle(0x228b22);
        treeGraphics.fillCircle(20, 20, 15);
        treeGraphics.generateTexture('tree', 40, 50);
        treeGraphics.destroy();
    }

    createProgressBar() {
        this.maxProgressEnemies = 10;
        this.progressBarContainer = this.add.container(400, 100);
        this.progressSkulls = [];

        const startX = -(this.maxProgressEnemies * 30) / 2 + 15;
        for (let i = 0; i < this.maxProgressEnemies; i++) {
            const x = startX + i * 30;
            const skull = this.add.image(x, 0, 'skull').setScale(0.8);
            if (i === this.maxProgressEnemies - 1) {
                skull.setTint(0xff0000);
            } else {
                skull.setTint(0x000000);
            }
            this.progressBarContainer.add(skull);
            this.progressSkulls.push(skull);

            if (i < this.maxProgressEnemies - 1) {
                for (let j = 0; j < 3; j++) {
                    const dash = this.add.rectangle(x + 12 + j * 6, 0, 4, 2, 0x666666);
                    this.progressBarContainer.add(dash);
                }
            }
        }
    }

    create() {
        this.timeLimit = 5 + timerBonus;
        this.timeLeft = this.timeLimit;
        this.playerHealth = maxPlayerHealth;
        this.enemyHealth = 10;
        this.enemyCount = 1;
        currentScore = 0;
        this.isPaused = false;
        this.progressBarEnemies = 0;
        this.isBossFight = false;
        this.isLevelingUp = false;

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

        this.tweens.add({ targets: this.player, y: 495, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: this.enemy, y: 495, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.wordContainer = this.add.container(400, 200);
        this.letterSprites = [];

        this.typedText = this.add.text(400, 300, "", {
            fontSize: "24px", fill: "#00ff41", fontFamily: "Courier New"
        }).setOrigin(0.5);

        this.add.text(150, 140, "EXP", { fontSize: "12px", fill: "#fff", fontFamily: "Courier New" }).setOrigin(0.5);
        this.expBarBg = this.add.rectangle(80, 160, 140, 12, 0x2c3e50).setOrigin(0, 0.5);
        this.expBarBg.setStrokeStyle(1, 0x34495e);
        this.expBar = this.add.rectangle(80, 160, 0, 10, 0x9b59b6).setOrigin(0, 0.5);

        this.levelText = this.add.text(150, 180, `LV: ${playerLevel}`, {
            fontSize: "14px", fill: "#e74c3c", fontFamily: "Courier New", fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(400, 420, "SCORE", { fontSize: "14px", fill: "#fff", fontFamily: "Courier New" }).setOrigin(0.5);
        this.scoreText = this.add.text(400, 440, "0", {
            fontSize: "20px", fill: "#f39c12", fontFamily: "Courier New", fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(400, 30, "TIME", { fontSize: "16px", fill: "#fff", fontFamily: "Courier New" }).setOrigin(0.5);
        this.timerBg = this.add.rectangle(400, 50, 400, 24, 0x2c3e50);
        this.timerBg.setStrokeStyle(2, 0x34495e);
        this.timerBar = this.add.rectangle(200, 50, 400, 20, 0x00ff41).setOrigin(0, 0.5);

        this.add.text(150, 80, "KNIGHT", { fontSize: "14px", fill: "#fff", fontFamily: "Courier New" }).setOrigin(0.5);
        this.playerBarBg = this.add.rectangle(80, 100, 140, 16, 0x2c3e50).setOrigin(0, 0.5);
        this.playerBarBg.setStrokeStyle(1, 0x34495e);
        this.playerBar = this.add.rectangle(80, 100, 140, 14, 0x27ae60).setOrigin(0, 0.5);
        this.playerHealthText = this.add.text(150, 120, `${this.playerHealth}/${maxPlayerHealth}`, {
            fontSize: "12px", fill: "#fff", fontFamily: "Courier New"
        }).setOrigin(0.5);

        this.add.text(650, 80, "ENEMY", { fontSize: "14px", fill: "#fff", fontFamily: "Courier New" }).setOrigin(0.5);
        this.enemyBarBg = this.add.rectangle(580, 100, 140, 16, 0x2c3e50).setOrigin(0, 0.5);
        this.enemyBarBg.setStrokeStyle(1, 0x34495e);
        this.enemyBar = this.add.rectangle(580, 100, 140, 14, 0xe74c3c).setOrigin(0, 0.5);

        this.nextWord();

        this.input.keyboard.on("keydown", (event) => {
            if (event.key === "Escape") {
                if (!this.isPaused) this.pauseGame();
                else this.unpauseGame();
                return;
            }

            if (this.isPaused || this.isLevelingUp) return;

            const key = event.key.toUpperCase();
            if (key.length === 1 && key.match(/[A-Z]/)) {
                if (key === currentWord[typedCorrectly]) {
                    typedCorrectly++;
                    this.updateWordDisplay();
                    this.typedText.setText(currentWord.substring(0, typedCorrectly));
                    this.playerAttack();

                    if (typedCorrectly === currentWord.length) {
                        this.enemyHealth -= playerDamage;

                        const points = isCurrentWordIntermediate ? 200 : 100;
                        const expGain = isCurrentWordIntermediate ? 20 : 10;
                        currentScore += points;
                        playerExperience += expGain;
                        this.scoreText.setText(currentScore.toString());
                        this.updateExpBar();

                        if (playerExperience >= 100) {
                            this.levelUp();
                            return;
                        }

                        this.showPointsGained(points);
                        this.enemyTakeDamage();

                        if (this.enemyHealth <= 0) {
                            if (this.isBossFight) this.bossFightCompleted();
                            else this.enemyDefeated();
                        }

                        this.updateHealthBars();
                        this.nextWord(); // ✅ immediately move to new word
                    }
                } else {
                    this.playerHealth -= 1;
                    this.playerTakeDamage();
                    if (this.playerHealth <= 0) {
                        this.scene.start("GameOver", {
                            winner: "Enemy", enemiesDefeated: this.enemyCount - 1,
                            finalScore: currentScore, personalBest: personalBest
                        });
                        return;
                    }
                    this.updateHealthBars();
                    this.cameras.main.shake(100, 0.01);
                    this.typedText.setTint(0xff0000);
                    this.time.delayedCall(200, () => { this.typedText.clearTint(); });
                }
            }

            if (event.key === "Backspace" && typedCorrectly > 0) {
                typedCorrectly--;
                this.updateWordDisplay();
                this.typedText.setText(currentWord.substring(0, typedCorrectly));
            }
        });
    }

    updateExpBar() {
        const expPercent = Math.min(playerExperience / 100, 1);
        this.expBar.width = 140 * expPercent;
    }

    levelUp() {
        playerLevel++;
        playerExperience = 0;
        this.levelText.setText(`LV: ${playerLevel}`);
        this.updateExpBar();
        maxPlayerHealth += 2;
        playerDamage += 1;
        this.playerHealth = maxPlayerHealth;
        this.updateHealthBars();

        const lvlText = this.add.text(400, 250, "LEVEL UP!", {
            fontSize: "32px", fill: "#ffd700",
            fontFamily: "Courier New", fontStyle: "bold"
        }).setOrigin(0.5);
        this.tweens.add({ targets: lvlText, y: 200, alpha: 0, duration: 1500, onComplete: () => lvlText.destroy() });
    }

    // --- keep rest of your methods (pause, unpause, startCountdown, playerAttack, showPointsGained, enemyTakeDamage, enemyDefeated, updateProgressBar, startBossFight, bossFightCompleted, spawnNewEnemy, updateWordDisplay, update, playerTakeDamage, nextWord, updateHealthBars) as in your original ---
}

// GameOver scene stays unchanged...

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [TypingGame, GameOver],
    backgroundColor: "#2d5016",
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }
};

new Phaser.Game(config);

