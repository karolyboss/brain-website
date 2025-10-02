'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import './DegenDodge.css';

type GameObject = {
  id: number;
  type: 'rot' | 'obstacle' | 'powerup';
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  emoji: string;
  value?: number;
  effect?: string;
  rarity?: number;
};

type Player = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isInvincible: boolean;
  multiplier: number;
  score: number;
  rotBalance: number;
  activeEffects: {type: string, endTime: number}[];
};

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 40;

// Game assets
const ROT_EMOJI = '🪙';
const OBSTACLES = [
  { emoji: '📱', value: -10, speed: 3 },
  { emoji: '📺', value: -10, speed: 4 },
  { emoji: '🎮', value: -10, speed: 3.5 },
  { emoji: '🍔', value: -5, speed: 2.5, effect: 'slow' },
  { emoji: '🎥', value: -15, speed: 5, effect: 'confuse' },
];

const POWER_UPS = [
  { emoji: '🧠', effect: 'invincible', duration: 10000, rarity: 0.3 },
  { emoji: '⚡', effect: 'speed', duration: 8000, rarity: 0.4 },
  { emoji: '💎', effect: '2x', duration: 30000, rarity: 0.2 },
  { emoji: '🔥', effect: '5x', duration: 30000, rarity: 0.08 },
  { emoji: '🚀', effect: '10x', duration: 30000, rarity: 0.02 },
  { emoji: '🌟', effect: '100x', duration: 30000, rarity: 0.005 },
];

export default function DegenDodge() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [player, setPlayer] = useState<Player>({
    x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
    y: GAME_HEIGHT - PLAYER_SIZE - 20,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: 5,
    isInvincible: false,
    multiplier: 1,
    score: 0,
    rotBalance: 0,
    activeEffects: []
  });

  // Initialize high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('degenDodgeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }
      
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      gameTimeRef.current += deltaTime;

      // Update game state
      updateGame(deltaTime);
      
      // Continue the game loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  // Spawn objects at intervals
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnInterval = setInterval(() => {
      spawnObject();
    }, 1000);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver]);

  const spawnObject = () => {
    const x = Math.random() * (GAME_WIDTH - 40) + 20;
    const typeRoll = Math.random();
    
    if (typeRoll < 0.7) {
      // Spawn ROT token
      const isGolden = Math.random() < 0.1; // 10% chance for golden token
      setGameObjects(prev => [...prev, {
        id: Date.now(),
        type: 'rot',
        x,
        y: -40,
        width: 30,
        height: 30,
        speed: 2 + Math.random() * 2,
        emoji: isGolden ? '🌟' : ROT_EMOJI,
        value: isGolden ? 10 : 1
      }]);
    } else if (typeRoll < 0.95) {
      // Spawn obstacle
      const obstacle = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
      setGameObjects(prev => [...prev, {
        id: Date.now(),
        type: 'obstacle',
        x,
        y: -40,
        width: 40,
        height: 40,
        speed: obstacle.speed,
        emoji: obstacle.emoji,
        value: obstacle.value,
        effect: obstacle.effect
      }]);
    } else {
      // Spawn power-up (5% chance)
      const powerUp = getRandomPowerUp();
      if (powerUp) {
        setGameObjects(prev => [...prev, {
          id: Date.now(),
          type: 'powerup',
          x,
          y: -40,
          width: 35,
          height: 35,
          speed: 1.5,
          emoji: powerUp.emoji,
          effect: powerUp.effect,
          rarity: powerUp.rarity
        }]);
      }
    }
  };

  const getRandomPowerUp = () => {
    const roll = Math.random();
    let cumulativeRarity = 0;
    
    for (const powerUp of POWER_UPS) {
      cumulativeRarity += powerUp.rarity || 0;
      if (roll <= cumulativeRarity) {
        return powerUp;
      }
    }
    
    return POWER_UPS[0]; // Fallback to first power-up
  };

  const playerRef = useRef<Player>(player);

  // Keep playerRef in sync with player state
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const updateGame = (deltaTime: number) => {
    setPlayer(prevPlayer => {
      // Update active effects
      const now = Date.now();
      const activeEffects = prevPlayer.activeEffects.filter(
        effect => effect.endTime > now
      );

      const isInvincible = activeEffects.some(e => e.type === 'invincible');
      const speedMultiplier = activeEffects.some(e => e.type === 'speed') ? 1.8 : 1;
      let scoreMultiplier = 1;

      activeEffects.forEach(effect => {
        if (effect.type.endsWith('x')) {
          scoreMultiplier = parseFloat(effect.type.replace('x', ''));
        }
      });

      return {
        ...prevPlayer,
        isInvincible,
        activeEffects,
        multiplier: scoreMultiplier
      };
    });

    // Update game objects
    setGameObjects(prevObjects => {
      const newObjects = prevObjects
        .map(obj => ({
          ...obj,
          y: obj.y + obj.speed
        }))
        .filter(obj => obj.y < GAME_HEIGHT + 50); // Remove objects that are off-screen

      // Check for collisions using current player state
      newObjects.forEach(obj => {
        if (checkCollision(playerRef.current, obj)) {
          handleCollision(obj);
          obj.y = GAME_HEIGHT + 100; // Move collided object off-screen to be removed
        }
      });

      return newObjects;
    });
  };

  const checkCollision = (obj1: any, obj2: any) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };

  const handleCollision = (obj: GameObject) => {
    const currentPlayer = playerRef.current;

    if (obj.type === 'rot') {
      // Collect ROT token
      const value = obj.value || 1;
      setPlayer(prev => ({
        ...prev,
        rotBalance: prev.rotBalance + value * prev.multiplier,
        score: prev.score + 10 * prev.multiplier
      }));

      // Play sound or show effect
      playSound('collect');
    }
    else if (obj.type === 'obstacle' && !currentPlayer.isInvincible) {
      // Hit by obstacle
      const value = obj.value || -10;
      const nextBalance = Math.max(0, currentPlayer.rotBalance + value);

      setPlayer(prev => ({
        ...prev,
        rotBalance: Math.max(0, prev.rotBalance + value),
        isInvincible: true
      }));

      // Apply obstacle effect
      if (obj.effect === 'slow') {
        // Slow down player temporarily
        setTimeout(() => {
          setPlayer(prev => ({
            ...prev,
            speed: 5 // Reset speed
          }));
        }, 3000);
      } else if (obj.effect === 'confuse') {
        // Reverse controls temporarily
        setTimeout(() => {
          // Reset controls
        }, 3000);
      }

      playSound('hit');

      // Check for game over using current state
      if (nextBalance <= 0) {
        setGameOver(true);
        if (currentPlayer.score > highScore) {
          setHighScore(currentPlayer.score);
          localStorage.setItem('degenDodgeHighScore', currentPlayer.score.toString());
        }
      }
    }
    else if (obj.type === 'powerup') {
      // Apply power-up effect
      const effectType = obj.effect || '';
      const effectDuration = POWER_UPS.find(p => p.effect === effectType)?.duration || 5000;

      setPlayer(prev => {
        const existingEffectIndex = prev.activeEffects.findIndex(e => e.type === effectType);
        const newEffects = [...prev.activeEffects];

        if (existingEffectIndex >= 0) {
          newEffects[existingEffectIndex] = {
            type: effectType,
            endTime: Date.now() + effectDuration
          };
        } else {
          newEffects.push({
            type: effectType,
            endTime: Date.now() + effectDuration
          });
        }

        return {
          ...prev,
          activeEffects: newEffects
        };
      });

      playSound('powerup');
    }
  };

  const playSound = (type: string) => {
    // In a real implementation, you would play sounds here
    // For now, we'll just log the sound that would play
    console.log(`Playing sound: ${type}`);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    const moveAmount = 20;

    switch (e.key) {
      case 'ArrowLeft':
      case 'Left':
      case 'KeyA':
      case 'a':
      case 'A':
        setPlayer(prev => ({
          ...prev,
          x: Math.max(0, prev.x - moveAmount)
        }));
        break;
      case 'ArrowRight':
      case 'Right':
      case 'KeyD':
      case 'd':
      case 'D':
        setPlayer(prev => ({
          ...prev,
          x: Math.min(GAME_WIDTH - prev.width, prev.x + moveAmount)
        }));
        break;
      case 'ArrowUp':
      case 'Up':
      case 'KeyW':
      case 'w':
      case 'W':
        setPlayer(prev => ({
          ...prev,
          y: Math.max(0, prev.y - moveAmount)
        }));
        break;
      case 'ArrowDown':
      case 'Down':
      case 'KeyS':
      case 's':
      case 'S':
        setPlayer(prev => ({
          ...prev,
          y: Math.min(GAME_HEIGHT - prev.height - 20, prev.y + moveAmount)
        }));
        break;
      default:
        return;
    }

    // Prevent the page from scrolling when using arrow keys
    e.preventDefault();
  }, [gameOver, gameStarted]);

  useEffect(() => {
    const relevantKeys = new Set([
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Left',
      'Right',
      'Up',
      'Down',
      'KeyA',
      'KeyD',
      'KeyW',
      'KeyS',
      'a',
      'A',
      'd',
      'D',
      'w',
      'W',
      's',
      'S'
    ]);

    const handleKeyDownEvent = (event: KeyboardEvent) => {
      if (!relevantKeys.has(event.key) && !relevantKeys.has(event.code)) {
        return;
      }

      handleKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDownEvent, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDownEvent);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameStarted && gameAreaRef.current) {
      gameAreaRef.current.focus({ preventScroll: true });
    }
  }, [gameStarted]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gameStarted || gameOver) return;
    
    const touch = e.touches[0];
    const gameArea = gameAreaRef.current?.getBoundingClientRect();
    
    if (gameArea) {
      const x = touch.clientX - gameArea.left - player.width / 2;
      const y = touch.clientY - gameArea.top - player.height / 2;
      
      setPlayer(prev => ({
        ...prev,
        x: Math.max(0, Math.min(GAME_WIDTH - prev.width, x)),
        y: Math.max(0, Math.min(GAME_HEIGHT - prev.height - 20, y))
      }));
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setPlayer({
      x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
      y: GAME_HEIGHT - PLAYER_SIZE - 20,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      speed: 5,
      isInvincible: false,
      multiplier: 1,
      score: 0,
      rotBalance: 10, // Start with 10 ROT
      activeEffects: []
    });
    setGameObjects([]);
    gameTimeRef.current = 0;
    lastTimeRef.current = 0;
  };

  const renderEffectIcons = () => {
    return player.activeEffects.map((effect, index) => {
      const powerUp = POWER_UPS.find(p => p.effect === effect.type);
      if (!powerUp) return null;
      
      const timeLeft = Math.ceil((effect.endTime - Date.now()) / 1000);
      
      return (
        <div key={index} className="effect-icon" title={`${effect.type} (${timeLeft}s)`}>
          {powerUp.emoji}
          <span className="effect-timer">{timeLeft}</span>
        </div>
      );
    });
  };

  return (
    <div className="degen-dodge-container">
      <div className="game-header">
        <div className="score">Score: {player.score}</div>
        <div className="high-score">High Score: {Math.max(highScore, player.score)}</div>
        <div className="rot-balance">$ROT: {player.rotBalance}</div>
        <div className="multiplier" style={{ color: player.multiplier > 1 ? '#4CAF50' : 'white' }}>
          {player.multiplier}x Multiplier
        </div>
      </div>
      
      <div 
        ref={gameAreaRef}
        className="game-area"
        onTouchMove={handleTouchMove}
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          opacity: player.isInvincible ? 0.7 : 1,
          border: player.isInvincible ? '2px dashed red' : '2px solid #4A148C'
        }}
      >
        {!gameStarted && !gameOver && !showTutorial && (
          <div className="start-screen">
            <h2>Degen Dodge</h2>
            <p>Collect $ROT, avoid brain rot!</p>
            <button onClick={startGame}>Start Game</button>
            <button 
              className="tutorial-button"
              onClick={() => setShowTutorial(true)}
            >
              How to Play
            </button>
          </div>
        )}
        
        {showTutorial && (
          <div className="tutorial-screen">
            <h2>How to Play</h2>
            <div className="tutorial-content">
              <div className="tutorial-section">
                <h3>Controls</h3>
                <p>Use <strong>arrow keys</strong> or <strong>swipe</strong> to move</p>
                <p>Collect <span className="rot-emoji">🪙</span> to earn $ROT</p>
                <p>Avoid the brain-rotting items!</p>
              </div>
              
              <div className="tutorial-section">
                <h3>Power-Ups</h3>
                <div className="powerup-list">
                  <div className="powerup-item">
                    <span className="powerup-emoji">🧠</span>
                    <span className="powerup-desc">Invincibility (10s)</span>
                  </div>
                  <div className="powerup-item">
                    <span className="powerup-emoji">⚡</span>
                    <span className="powerup-desc">Speed Boost (8s)</span>
                  </div>
                  <div className="powerup-item">
                    <span className="powerup-emoji">💎</span>
                    <span className="powerup-desc">2x $ROT (30s)</span>
                  </div>
                  <div className="powerup-item">
                    <span className="powerup-emoji">🔥</span>
                    <span className="powerup-desc">5x $ROT (30s)</span>
                  </div>
                  <div className="powerup-item">
                    <span className="powerup-emoji">🚀</span>
                    <span className="powerup-desc">10x $ROT (30s)</span>
                  </div>
                  <div className="powerup-item legendary">
                    <span className="powerup-emoji">🌟</span>
                    <span className="powerup-desc">100x $ROT (30s) - LEGENDARY!</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              className="back-button"
              onClick={() => setShowTutorial(false)}
            >
              Back to Game
            </button>
          </div>
        )}
        
        {gameOver && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>You collected: {player.rotBalance} $ROT</p>
            <p>Final Score: {player.score}</p>
            {player.score === highScore && (
              <p className="new-highscore">New High Score! 🎉</p>
            )}
            <button onClick={startGame}>Play Again</button>
            <button 
              className="tutorial-button"
              onClick={() => {
                setShowTutorial(true);
                setGameOver(false);
              }}
            >
              How to Play
            </button>
          </div>
        )}
        
        {/* Player */}
        <div 
          className={`player ${player.isInvincible ? 'invincible' : ''}`}
          style={{
            left: `${player.x}px`,
            top: `${player.y}px`,
            width: `${player.width}px`,
            height: `${player.height}px`,
            transform: `scale(${player.multiplier > 1 ? 1.2 : 1})`,
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          🧠
          {player.multiplier > 1 && (
            <div className="multiplier-badge">{player.multiplier}x</div>
          )}
        </div>
        
        {/* Game Objects */}
        {gameObjects.map(obj => (
          <div
            key={obj.id}
            className={`game-object ${obj.type} ${obj.effect || ''}`}
            style={{
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.width}px`,
              height: `${obj.height}px`,
              animation: obj.type === 'rot' ? 'float 2s ease-in-out infinite' : 'none'
            }}
          >
            {obj.emoji}
            {obj.type === 'rot' && obj.emoji === '🌟' && (
              <div className="sparkle">✨</div>
            )}
          </div>
        ))}
        
        {/* Active Effects */}
        <div className="active-effects">
          {renderEffectIcons()}
        </div>
      </div>
      
      <div className="game-controls">
        <div className="mobile-controls">
          <button 
            className="control-button left" 
            onTouchStart={() => {
              if (!gameStarted || gameOver) return;
              setPlayer(prev => ({
                ...prev,
                x: Math.max(0, prev.x - 20)
              }));
            }}
          >
            ←
          </button>
          <button 
            className="control-button right"
            onTouchStart={() => {
              if (!gameStarted || gameOver) return;
              setPlayer(prev => ({
                ...prev,
                x: Math.min(GAME_WIDTH - prev.width, prev.x + 20)
              }));
            }}
          >
            →
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
