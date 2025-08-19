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
let playerExperience = 0;
let playerLevel = 1;
let playerDamage = 2;
let maxPlayerHealth = 10;
let timerBonus = 0;

class TypingGame extends Phaser.Scene {
    constructor() { 
        super("TypingGame"); 
        this.isPaused = false;
        this.pauseOverlay = null;
        this.pauseText = null;
        this.countdownText = null;
    }

    preload() {
        // Generate simple pixel-art textures
        this.createSprites();
    }

    createSprites() {
        // Knight
        const knightGraphics = this.add.graphics();
        knightGraphics.fillStyle(0x4a90e2); knightGraphics.fillRect(0,0,32,40);
        knightGraphics.fillStyle(0x7f8c8d); knightGraphics.fillRect(8,0,16,12); // helmet
        knightGraphics.fillStyle(0xf39c12); knightGraphics.fillRect(4,12,24,8); // chest
        knightGraphics.fillStyle(0x34495e); knightGraphics.fillRect(12,20,8,20); // body
        knightGraphics.generateTexture('knight',32,40); knightGraphics.destroy();

        // Boss
        const bossGraphics = this.add.graphics();
        bossGraphics.fillStyle(0x8b0000); bossGraphics.fillRect(0,0,40,48);
        bossGraphics.fillStyle(0x2c3e50); bossGraphics.fillRect(8,0,24,16); // head
        bossGraphics.fillStyle(0xff0000); bossGraphics.fillRect(12,4,6,6); bossGraphics.fillRect(22,4,6,6); // eyes
        bossGraphics.fillStyle(0x8b4513); bossGraphics.fillRect(6,16,28,32); // body
        bossGraphics.fillStyle(0x444444); bossGraphics.fillRect(2,20,4,8); bossGraphics.fillRect(34,20,4,8); // spikes
        bossGraphics.generateTexture('boss',40,48); bossGraphics.destroy();

        // Skull for progress bar
        const skullGraphics = this.add.graphics();
        skullGraphics.fillStyle(0xffffff); skullGraphics.fillCircle(12,10,8);
        skullGraphics.fillStyle(0x000000); skullGraphics.fillCircle(8,8,2); skullGraphics.fillCircle(16,8,2);
        skullGraphics.fillRect(11,12,2,4);
        skullGraphics.fillStyle(0xffffff); skullGraphics.fillRect(5,18,14,6);
        skullGraphics.fillStyle(0x000000);
        skullGraphics.fillRect(7,20,2,2); skullGraphics.fillRect(10,20,2,2);
        skullGraphics.fillRect(13,20,2,2); skullGraphics.fillRect(16,20,2,2);
        // crown
        skullGraphics.fillStyle(0xffd700);
        skullGraphics.fillRect(4,2,16,4); skullGraphics.fillRect(8,0,2,4);
        skullGraphics.fillRect(12,0,2,4); skullGraphics.fillRect(16,0,2,4);
        skullGraphics.generateTexture('skull',24,24); skullGraphics.destroy();

        // Enemy
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0x27ae60); enemyGraphics.fillRect(0,0,28,36);
        enemyGraphics.fillStyle(0x2c3e50); enemyGraphics.fillRect(6,0,16,10); // head
        enemyGraphics.fillStyle(0xe74c3c); enemyGraphics.fillRect(8,2,4,4); enemyGraphics.fillRect(16,2,4,4); // eyes
        enemyGraphics.fillStyle(0x8b4513); enemyGraphics.fillRect(4,10,20,26); // body
        enemyGraphics.generateTexture('enemy',28,36); enemyGraphics.destroy();

        // Tree
        const treeGraphics = this.add.graphics();
        treeGraphics.fillStyle(0x8b4513); treeGraphics.fillRect(15,20,10,30);
        treeGraphics.fillStyle(0x228b22); treeGraphics.fillCircle(20,20,15);
        treeGraphics.generateTexture('tree',40,50); treeGraphics.destroy();
    }

    create() {
        // Keyboard
        this.input.keyboard.on("keydown", (event) => {
            if (event.key === "Escape") {
                if (!this.isPaused) { 
                    this.pauseGame(); 
                } else { 
                    this.unpauseGame(); 
                }
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
                        currentScore += points; this.scoreText.setText(currentScore.toString());
                        playerExperience += expGain; this.updateExpBar();

                        if (playerExperience >= 100) { this.levelUp(); return; }

                        this.showPointsGained(points);
                        this.enemyTakeDamage();
                        if (this.enemyHealth <= 0) {
                            if (this.isBossFight) { this.bossFightCompleted(); }
                            else { this.enemyDefeated(); }
                        } else {
                            this.updateHealthBars();
                            this.nextWord();
                        }
                    }
                } else { // Wrong key
                    this.playerHealth -= 1; this.playerTakeDamage();
                    if (this.playerHealth <= 0) {
                        this.scene.start("GameOver", { winner: "Enemy", enemiesDefeated: this.enemyCount - 1, finalScore: currentScore, personalBest: personalBest });
                        return;
                    }
                    this.updateHealthBars();
                    this.cameras.main.shake(100, 0.01);
                    this.typedText.setTint(0xff0000);
                    this.time.delayedCall(200, () => { this.typedText.clearTint(); });
                }
            }

            if (event.key === "Backspace" && typedCorrectly > 0) {
                typedCorrectly--; this.updateWordDisplay();
                this.typedText.setText(currentWord.substring(0, typedCorrectly));
            }
        });
    }

    pauseGame() {
        this.isPaused = true;
        // Dim screen
        this.pauseOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.4).setDepth(1000);
        // Show paused text
        this.pauseText = this.add.text(400, 300, "Paused", {
            fontSize: "64px",
            fill: "#fff",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(1001);
        // Instruction text
        this.add.text(400, 370, "Press Escape to resume", {
            fontSize: "22px",
            fill: "#ffd700",
            fontFamily: "Courier New"
        }).setOrigin(0.5).setDepth(1001);
    }

    unpauseGame() {
        // Remove pause overlay/texts
        if (this.pauseOverlay) this.pauseOverlay.destroy();
        if (this.pauseText) this.pauseText.destroy();

        let count = 3;
        // Countdown before resuming
        this.countdownText = this.add.text(400, 300, count.toString(), {
            fontSize: "64px",
            fill: "#ffd700",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(1001);

        this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                count--;
                if (count > 0) {
                    this.countdownText.setText(count.toString());
                } else {
                    this.countdownText.destroy();
                    this.isPaused = false;
                }
            }
        });
    }

    levelUp() {
        const x = (i - 1) * 200;
        const box = this.add.rectangle(x, 0, 160, 80, 0x8b4513); box.setStrokeStyle(4, 0x654321);
        const inner = this.add.rectangle(x, 0, 140, 60, 0xa0522d);
        const t = this.add.text(x, 0, upgrades[i].text, { fontSize: "16px", fill: "#000", fontFamily: "Courier New", fontStyle: "bold", align: "center" }).setOrigin(0.5);
        const keyT = this.add.text(x, -30, upgrades[i].key, { fontSize: "20px", fill: "#fff", fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
        this.upgradeContainer.add([box, inner, t, keyT]);
        this.upgradeBoxes.push({ box, type: upgrades[i].type, key: upgrades[i].key });
        this.input.keyboard.on("keydown", this.handleUpgradeSelection, this);
    }

    handleUpgradeSelection(event) {
        if (!this.isLevelingUp) return;
        const key = event.key;
        let selected = null;
        for (const up of this.upgradeBoxes) { 
            if (up.key === key) { selected = up.type; break; } 
        }
        if (selected) { this.selectUpgrade(selected); }
    }

    selectUpgrade(type) {
        if (this.upgradeTimer) this.upgradeTimer.destroy();
        switch (type) {
            case "damage": playerDamage += 2; this.showUpgradeAnimation("damage"); break;
            case "health": maxPlayerHealth += 2; this.playerHealth += 2; this.showUpgradeAnimation("health"); break;
            case "timer": timerBonus += 2; this.timeLimit = (this.isBossFight ? 60 : 5) + timerBonus; this.showUpgradeAnimation("timer"); break;
        }
        this.updateHealthBars();
        const txt = this.add.text(400, 480, `Selected: ${type} upgrade!`, { fontSize: "18px", fill: "#27ae60", fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
        this.tweens.add({ targets: txt, alpha: 0, duration: 2000, onComplete: () => txt.destroy() });
        this.cleanupUpgradeUI();
    }

    autoSelectUpgrade() {
        const opts = ["damage", "health", "timer"];
        const choice = Phaser.Utils.Array.GetRandom(opts);
        this.selectUpgrade(choice);
    }

    showUpgradeAnimation(type) {
        if (type === "damage") {
            for (let i = 0; i < 20; i++) {
                const p = this.add.rectangle(150 + Math.random() * 20 - 10, 520, 3, 8, 0x00ff00);
                this.tweens.add({ targets: p, y: 420, alpha: 0, duration: 1000 + Math.random() * 500, onComplete: () => p.destroy() });
            }
        } else if (type === "health") {
            this.tweens.add({ targets: [this.playerBarBg, this.playerBar], scaleY: 1.5, duration: 300, yoyo: true });
        } else if (type === "timer") {
            this.tweens.add({ targets: [this.timerBg, this.timerBar], scaleX: 1.2, duration: 300, yoyo: true });
        }
    }

    cleanupUpgradeUI() {
        if (this.upgradeContainer) this.upgradeContainer.destroy();
        this.input.keyboard.off("keydown", this.handleUpgradeSelection, this);
        this.isLevelingUp = false;
    }

    playerAttack() { 
        this.tweens.add({ targets: this.player, scaleX: 2.2, scaleY: 2.2, duration: 150, yoyo: true, ease: 'Power2' }); 
    }

    showPointsGained(points) {
        const t = this.add.text(400, 300, `+${points}`, {
            fontSize: "24px", fill: (points === 200 ? "#e74c3c" : "#27ae60"), fontFamily: "Courier New", fontStyle: "bold"
        }).setOrigin(0.5);
        this.tweens.add({ targets: t, y: 250, alpha: 0, duration: 1000, ease: 'Power2', onComplete: () => t.destroy() });
    }

    enemyTakeDamage() { 
        this.tweens.add({ targets: this.enemy, tint: 0xff0000, duration: 200, yoyo: true, onComplete: () => this.enemy.clearTint() }); 
    }

    enemyDefeated() {
        this.tweens.add({ targets: this.enemy, alpha: 0, scaleX: 0, scaleY: 0, rotation: Math.PI * 2, duration: 500, onComplete: () => {
            this.progressBarEnemies++; this.updateProgressBar();
            if (this.progressBarEnemies >= this.maxProgressEnemies) { this.startBossFight(); }
            else { this.spawnNewEnemy(); }
        }});
    }

    createProgressBar() {
        this.progressBarContainer = this.add.container(400, 100);
        this.progressSkulls = [];
        const startX = -(this.maxProgressEnemies * 30) / 2 + 15;
        for (let i = 0; i < this.maxProgressEnemies; i++) {
            const x = startX + i * 30;
            const skull = this.add.image(x, 0, 'skull').setScale(0.8);
            if (i === this.maxProgressEnemies - 1) skull.setTint(0xff0000); // boss skull red
            else skull.setTint(0x000000);
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

    updateProgressBar() {
        for (let i = 0; i < this.progressBarEnemies && i < this.maxProgressEnemies; i++) {
            if (this.progressSkulls[i]) this.progressSkulls[i].setTint(0x888888);
        }
    }

    startBossFight() {
        this.isBossFight = true;
        this.timeLimit = 60; // fixed 60s
        this.timeLeft = this.timeLimit;
        this.enemyHealth = 30;
        this.enemy.setTexture('boss');
        this.enemy.setAlpha(1); this.enemy.setScale(0); this.enemy.setRotation(0);
        this.tweens.add({ targets: this.enemy, scaleX: 2.5, scaleY: 2.5, duration: 1000, ease: 'Back.easeOut', onComplete: () => {
            this.updateHealthBars(); this.nextWord();
            const bossText = this.add.text(400, 430, "BOSS FIGHT!", { fontSize: "24px", fill: "#ff0000", fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
            this.tweens.add({ targets: bossText, alpha: 0, duration: 3000, onComplete: () => bossText.destroy() });
        }});
    }

    bossFightCompleted() {
        currentScore += 10000; this.scoreText.setText(currentScore.toString());
        const bonus = this.add.text(400, 280, "+10000 BOSS DEFEATED!", { fontSize: "20px", fill: "#ffd700", fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
        this.tweens.add({ targets: bonus, y: 230, alpha: 0, duration: 2000, ease: 'Power2', onComplete: () => bonus.destroy() });
        this.progressBarEnemies = 0; this.isBossFight = false;
        this.timeLimit = 5 + timerBonus; // back to normal timer
        // reset skull colors
        for (let i = 0; i < this.maxProgressEnemies; i++) {
            if (!this.progressSkulls[i]) continue;
            if (i === this.maxProgressEnemies - 1) this.progressSkulls[i].setTint(0xff0000);
            else this.progressSkulls[i].setTint(0x000000);
        }
        this.spawnNewEnemy();
    }

    spawnNewEnemy() {
        this.enemyCount++;
        this.enemyHealth = this.isBossFight ? 30 : 10;
        this.enemy.setTexture(this.isBossFight ? 'boss' : 'enemy');
        const scale = this.isBossFight ? 2.5 : 2;
        this.enemy.setAlpha(1); this.enemy.setScale(0); this.enemy.setRotation(0);
        this.tweens.add({ targets: this.enemy, scaleX: scale, scaleY: scale, duration: 500, ease: 'Back.easeOut', onComplete: () => { this.updateHealthBars(); this.nextWord(); } });
    }

    updateWordDisplay() {
        this.letterSprites.forEach(s => s.destroy());
        this.letterSprites = [];
        const letterWidth = 40;
        const startX = -(currentWord.length * letterWidth) / 2 + letterWidth / 2;
        for (let i = 0; i < currentWord.length; i++) {
            const letter = currentWord[i];
            const x = startX + i * letterWidth;
            let color = "#ffffff";
            if (i < typedCorrectly) color = "#2c3e50";
            else if (i === typedCorrectly) color = "#f39c12";
            const letterText = this.add.text(x, 0, letter, { fontSize: "36px", fill: color, fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
            const bg = this.add.rectangle(x, 0, 35, 45, 0x34495e, 0.7);
            bg.setStrokeStyle(2, i < typedCorrectly ? 0x27ae60 : 0x7f8c8d);
            this.wordContainer.add([bg, letterText]);
            this.letterSprites.push(letterText, bg);
        }
    }

    update(time, delta) {
        if (this.isPaused || this.isLevelingUp) return;
        if (!this.isBossFight || this.timeLeft > 0) { this.timeLeft -= delta / 1000; }
        if (this.timeLeft <= 0 && !this.isBossFight) {
            this.playerHealth -= 2; this.playerTakeDamage();
            if (this.playerHealth <= 0) {
                this.scene.start("GameOver", { winner: "Enemy", enemiesDefeated: this.enemyCount - 1, finalScore: currentScore, personalBest: personalBest });
                return;
            }
            this.updateHealthBars(); this.nextWord();
        } else if (this.timeLeft <= 0 && this.isBossFight) {
            this.scene.start("GameOver", { winner: "Enemy", enemiesDefeated: this.enemyCount - 1, finalScore: currentScore, personalBest: personalBest });
            return;
        }

        const width = Math.max((this.timeLeft / this.timeLimit) * 400, 0);
        this.timerBar.width = width;
        if (this.timeLeft < 5) { this.timerBar.fillColor = 0xff0000; }
        else if (this.timeLeft < 10) { this.timerBar.fillColor = 0xff9500; }
        else { this.timerBar.fillColor = 0x00ff41; }
    }

    playerTakeDamage() { 
        this.tweens.add({ targets: this.player, tint: 0xff0000, duration: 300, yoyo: true, onComplete: () => this.player.clearTint() }); 
    }

    nextWord() {
        const useIntermediate = Math.random() < 0.4;
        const pool = useIntermediate ? intermediateWords : easyWords;
        isCurrentWordIntermediate = useIntermediate;
        let newWord;
        do { newWord = Phaser.Utils.Array.GetRandom(pool); } while (newWord === lastWord);
        lastWord = newWord; currentWord = newWord; typedCorrectly = 0;
        this.typedText.setText(""); this.updateWordDisplay();
        if (!this.isBossFight) this.timeLeft = this.timeLimit;
    }

    updateHealthBars() {
        const maxEnemy = this.isBossFight ? 30 : 10;
        this.playerBar.width = (this.playerHealth / maxPlayerHealth) * 140;
        this.enemyBar.width = (this.enemyHealth / maxEnemy) * 140;
        this.playerHealthText.setText(`${this.playerHealth}/${maxPlayerHealth}`);
        if (this.playerHealth <= maxPlayerHealth * 0.3) this.playerBar.fillColor = 0xe74c3c;
        else if (this.playerHealth <= maxPlayerHealth * 0.6) this.playerBar.fillColor = 0xf39c12;
        else this.playerBar.fillColor = 0x27ae60;
        if (this.isBossFight) this.enemyBar.fillColor = 0x8b0000; else this.enemyBar.fillColor = 0xe74c3c;
    }

    updateExpBar() {
        const w = Math.min((playerExperience / 100) * 140, 140);
        this.expBar.width = w;
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
        if (this.finalScore > this.personalBest) { 
            this.personalBest = this.finalScore; personalBest = this.personalBest; 
        }
    }
    create() {
        this.cameras.main.setBackgroundColor('#2d5016');
        this.add.text(400, 200, `${this.winner} Wins!`, { fontSize: "48px", fill: (this.winner === "Player" ? "#27ae60" : "#e74c3c"), fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
        this.add.text(400, 280, `Personal Best: ${this.personalBest}`, { fontSize: "24px", fill: "#f39c12", fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
        this.add.text(400, 320, `Score: ${this.finalScore}`, { fontSize: "24px", fill: (this.finalScore >= this.personalBest ? "#27ae60" : "#e74c3c"), fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
        if (this.finalScore > 0 && this.finalScore >= this.personalBest) {
            const newRec = this.add.text(400, 360, "NEW RECORD!", { fontSize: "18px", fill: "#27ae60", fontFamily: "Courier New", fontStyle: "bold" }).setOrigin(0.5);
            this.tweens.add({ targets: newRec, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
        }
        const restart = this.add.text(400, 420, "Press SPACE to restart", { fontSize: "20px", fill: "#bdc3c7", fontFamily: "Courier New" }).setOrigin(0.5);
        this.tweens.add({ targets: restart, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
        this.input.keyboard.once("keydown-SPACE", () => {
            typedCorrectly = 0; this.scene.start("TypingGame");
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [TypingGame, GameOver],
    backgroundColor: "#2d5016",
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }
};

new Phaser.Game(config);
