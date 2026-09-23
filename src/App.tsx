import { useRef, useCallback } from 'react';
import { useSnakeGame, Direction, Difficulty } from './hooks/useSnakeGame';

function App() {
  const {
    snake,
    food,
    gameState,
    score,
    highScore,
    difficulty,
    eatenAnimation,
    gridSize,
    setDifficulty,
    resetGame,
    togglePause,
    changeDirection,
  } = useSnakeGame();

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Touch swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const minSwipe = 30;

      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

      let newDir: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        newDir = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        newDir = dy > 0 ? 'DOWN' : 'UP';
      }
      changeDirection(newDir);
      touchStartRef.current = null;
    },
    [changeDirection]
  );

  const cellSize = `calc(min(70vw, 70vh, 500px) / ${gridSize})`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
          🐍 Snake Game
        </h1>

        {/* Score Board */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Score</span>
            <span
              className={`text-2xl font-bold text-green-400 transition-transform duration-200 ${
                eatenAnimation ? 'scale-125' : 'scale-100'
              }`}
            >
              {score}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Best</span>
            <span className="text-2xl font-bold text-yellow-400">{highScore}</span>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              disabled={gameState === 'playing' || gameState === 'paused'}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                difficulty === d
                  ? d === 'easy'
                    ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50'
                    : d === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50'
                    : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {d === 'easy' ? '🟢 Easy' : d === 'medium' ? '🟡 Medium' : '🔴 Hard'}
            </button>
          ))}
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl shadow-green-900/20"
        style={{
          width: `calc(${gridSize} * ${cellSize})`,
          height: `calc(${gridSize} * ${cellSize})`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isDark = (x + y) % 2 === 0;
            return (
              <div
                key={i}
                className={`${isDark ? 'bg-gray-800/80' : 'bg-gray-800/50'}`}
              />
            );
          })}
        </div>

        {/* Food */}
        <div
          className="absolute rounded-full transition-all duration-200 animate-pulse"
          style={{
            width: cellSize,
            height: cellSize,
            left: `calc(${food.x} * ${cellSize})`,
            top: `calc(${food.y} * ${cellSize})`,
            background: 'radial-gradient(circle, #ef4444 40%, #dc2626 100%)',
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          const opacity = Math.max(0.4, 1 - index * 0.03);
          return (
            <div
              key={index}
              className={`absolute transition-all duration-75 ${
                isHead ? 'rounded-md z-10' : 'rounded-sm'
              }`}
              style={{
                width: cellSize,
                height: cellSize,
                left: `calc(${segment.x} * ${cellSize})`,
                top: `calc(${segment.y} * ${cellSize})`,
                background: isHead
                  ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                  : `rgba(16, 185, 129, ${opacity})`,
                boxShadow: isHead ? '0 0 10px rgba(52, 211, 153, 0.5)' : 'none',
                transform: isHead ? 'scale(1.05)' : 'scale(0.9)',
              }}
            />
          );
        })}

        {/* Overlay states */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <div className="text-5xl mb-4 animate-bounce">🐍</div>
            <p className="text-white text-lg font-medium mb-2">Ready to play?</p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-200"
            >
              Start Game
            </button>
            <p className="text-gray-400 text-xs mt-3">Press Space or Enter</p>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <div className="text-4xl mb-3">⏸️</div>
            <p className="text-white text-xl font-bold mb-2">Paused</p>
            <button
              onClick={togglePause}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200"
            >
              Resume
            </button>
            <p className="text-gray-400 text-xs mt-3">Press Space or Esc</p>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <div className="text-4xl mb-3">💀</div>
            <p className="text-red-400 text-2xl font-bold mb-1">Game Over!</p>
            <p className="text-gray-300 text-lg mb-1">
              Score: <span className="text-green-400 font-bold">{score}</span>
            </p>
            {score >= highScore && score > 0 && (
              <p className="text-yellow-400 text-sm mb-3 animate-pulse">🏆 New High Score!</p>
            )}
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-200 mt-2"
            >
              Play Again
            </button>
            <p className="text-gray-400 text-xs mt-3">Press Space or Enter</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg mt-4">
        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-4">
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              ⏸ Pause
            </button>
          )}
          {gameState === 'paused' && (
            <button
              onClick={togglePause}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              ▶ Resume
            </button>
          )}
          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={resetGame}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              🔄 Restart
            </button>
          )}
        </div>

        {/* D-Pad for mobile */}
        <div className="flex flex-col items-center md:hidden">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              changeDirection('UP');
            }}
            className="w-14 h-14 bg-gray-700/80 hover:bg-gray-600 active:bg-gray-500 rounded-xl flex items-center justify-center text-2xl text-white mb-1 transition-all active:scale-95 shadow-lg"
          >
            ▲
          </button>
          <div className="flex gap-1">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                changeDirection('LEFT');
              }}
              className="w-14 h-14 bg-gray-700/80 hover:bg-gray-600 active:bg-gray-500 rounded-xl flex items-center justify-center text-2xl text-white transition-all active:scale-95 shadow-lg"
            >
              ◀
            </button>
            <div className="w-14 h-14" />
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                changeDirection('RIGHT');
              }}
              className="w-14 h-14 bg-gray-700/80 hover:bg-gray-600 active:bg-gray-500 rounded-xl flex items-center justify-center text-2xl text-white transition-all active:scale-95 shadow-lg"
            >
              ▶
            </button>
          </div>
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              changeDirection('DOWN');
            }}
            className="w-14 h-14 bg-gray-700/80 hover:bg-gray-600 active:bg-gray-500 rounded-xl flex items-center justify-center text-2xl text-white mt-1 transition-all active:scale-95 shadow-lg"
          >
            ▼
          </button>
        </div>

        {/* Keyboard hints for desktop */}
        <div className="hidden md:flex justify-center gap-4 text-xs text-gray-500 mt-2">
          <span>↑↓←→ or WASD to move</span>
          <span>•</span>
          <span>Space to pause</span>
          <span>•</span>
          <span>Swipe on mobile</span>
        </div>
      </div>
    </div>
  );
}

export default App;
