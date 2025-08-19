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

// Track previously used words to minimize repeats
let usedEasyWords = [];
let usedIntermediateWords = [];

class TypingGame extends Phaser.Scene {
    constructor() {
        super("TypingGame");
    }

    preload() {
        this.createSprites();
        this.createProgressBar();
    }

    createSprites() {
        // ... unchanged ...
        // [omitted for brevity, same as original]
    }

    createProgressBar() {
        // ... unchanged ...
        // [omitted for brevity, same as original]
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
        this.maxProgressEnemies = 10;
        this.isBossFight = false;
        this.isLevelingUp = false;

        // Reset used words each game start
        usedEasyWords = [];
        usedIntermediateWords = [];

        // ... unchanged UI setup code ...
        // [omitted for brevity, same as original]

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
            
            if (this.isPaused || this.isLevelingUp) return;
            
            const key = event.key.toUpperCase();

            // Only allow letters
            if (key.length === 1 && key.match(/[A-Z]/)) {
                // FIX: Only check if the next letter exists
                if (typedCorrectly < currentWord.length && key === currentWord[typedCorrectly]) {
                    typedCorrectly++;
                    this.updateWordDisplay();
                    this.typedText.setText(currentWord.substring(0, typedCorrectly));
                    
                    this.playerAttack();

                    // FIX: Only check completion when reaching last letter
                    if (typedCorrectly === currentWord.length) {
                        this.enemyHealth -= playerDamage;

                        // Add score and experience based on difficulty
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

    // ... pauseGame, unpauseGame, startCountdown, playerAttack, showPointsGained, enemyTakeDamage,
    // enemyDefeated, updateProgressBar, startBossFight, bossFightCompleted, spawnNewEnemy, updateWordDisplay, update, playerTakeDamage ... unchanged

    nextWord() {
        // FIX: Adjust chances - 70% easy, 30% intermediate
        const useIntermediate = Math.random() < 0.3; // 30% intermediate
        const wordPool = useIntermediate ? intermediateWords : easyWords;
        const usedWords = useIntermediate ? usedIntermediateWords : usedEasyWords;
        isCurrentWordIntermediate = useIntermediate;

        // Select a word that hasn't recently appeared
        let newWord;
        let availableWords = wordPool.filter(word => !usedWords.includes(word));
        if (availableWords.length === 0) {
            // Reset used words if all have been used
            usedWords.length = 0;
            availableWords = [...wordPool];
        }
        do {
            newWord = Phaser.Utils.Array.GetRandom(availableWords);
        } while ((newWord === lastWord) && availableWords.length > 1);

        // Save word to used list to minimize repeats
        usedWords.push(newWord);

        lastWord = newWord;
        currentWord = newWord;
        typedCorrectly = 0;

        this.typedText.setText("");
        this.updateWordDisplay();
        this.timeLeft = this.timeLimit;
    }

    updateHealthBars() {
        const maxHealth = this.isBossFight ? 30 : 10;
        this.playerBar.width = (this.playerHealth / 10) * 140;
        this.enemyBar.width = (this.enemyHealth / maxHealth) * 140;

        if (this.playerHealth <= 3) {
            this.playerBar.fillColor = 0xe74c3c;
        } else if (this.playerHealth <= 6) {
            this.playerBar.fillColor = 0xf39c12;
        } else {
            this.playerBar.fillColor = 0x27ae60;
        }
        if (this.isBossFight) {
            this.enemyBar.fillColor = 0x8b0000;
        }
    }
}

class GameOver extends Phaser.Scene {
    // ... unchanged ...
    // [omitted for brevity, same as original]
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
