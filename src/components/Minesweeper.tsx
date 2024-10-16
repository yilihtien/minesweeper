"use client";

import React, { useState, useEffect } from 'react';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

interface GameConfig {
  width: number;
  height: number;
  mines: number;
}

const difficultyLevels: { [key: string]: GameConfig } = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 30, mines: 99 },
};

const Minesweeper: React.FC = () => {
  const [difficulty, setDifficulty] = useState<string>('beginner');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    initializeBoard();
  }, [difficulty]);

  const initializeBoard = () => {
    const { width, height, mines } = difficultyLevels[difficulty];
    const newBoard: Cell[][] = [];
    for (let i = 0; i < height; i++) {
      newBoard.push([]);
      for (let j = 0; j < width; j++) {
        newBoard[i].push({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
    }

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const randomRow = Math.floor(Math.random() * height);
      const randomCol = Math.floor(Math.random() * width);
      if (!newBoard[randomRow][randomCol].isMine) {
        newBoard[randomRow][randomCol].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < height && nj >= 0 && nj < width && newBoard[ni][nj].isMine) {
                count++;
              }
            }
          }
          newBoard[i][j].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setWin(false);
    setScore(0);
    setStartTime(null);
  };

  const revealCell = (row: number, col: number) => {
    if (gameOver || win || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    if (startTime === null) {
      setStartTime(Date.now());
    }

    const newBoard = [...board];
    newBoard[row][col].isRevealed = true;

    if (newBoard[row][col].isMine) {
      setGameOver(true);
    } else if (newBoard[row][col].neighborMines === 0) {
      revealNeighbors(newBoard, row, col);
    }

    setBoard(newBoard);
    updateScore();
    checkWinCondition();
  };

  const revealNeighbors = (board: Cell[][], row: number, col: number) => {
    const { width, height } = difficultyLevels[difficulty];
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        const ni = row + di;
        const nj = col + dj;
        if (ni >= 0 && ni < height && nj >= 0 && nj < width && !board[ni][nj].isRevealed && !board[ni][nj].isFlagged) {
          board[ni][nj].isRevealed = true;
          if (board[ni][nj].neighborMines === 0) {
            revealNeighbors(board, ni, nj);
          }
        }
      }
    }
  };

  const toggleFlag = (row: number, col: number) => {
    if (gameOver || win || board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...board];
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
  };

  const checkWinCondition = () => {
    const { width, height, mines } = difficultyLevels[difficulty];
    let revealedCount = 0;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (board[i][j].isRevealed) {
          revealedCount++;
        }
      }
    }
    if (revealedCount === width * height - mines) {
      setWin(true);
      updateScore();
    }
  };

  const updateScore = () => {
    if (startTime !== null) {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      const { mines } = difficultyLevels[difficulty];
      const revealedCells = board.flat().filter(cell => cell.isRevealed).length;
      const newScore = Math.max(0, mines * 10 - timeElapsed + revealedCells);
      setScore(newScore);
    }
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
  };

  return (
    <div className="minesweeper">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white shadow-lg">踩地雷</h1>
      <div className="controls mb-6 flex flex-col md:flex-row items-center">
        <select 
          value={difficulty} 
          onChange={handleDifficultyChange} 
          className="select mb-4 md:mb-0 md:mr-4"
        >
          <option value="beginner">初級</option>
          <option value="intermediate">中級</option>
          <option value="expert">高級</option>
        </select>
        {(gameOver || win) && (
          <button 
            onClick={initializeBoard} 
            className="btn btn-success"
          >
            重新開始
          </button>
        )}
      </div>
      <div className="score mb-6 text-white text-xl font-semibold">得分: {score}</div>
      <div className={`board board-grid-${difficulty}`}>
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${
                cell.isRevealed 
                  ? 'bg-gray-100 hover:bg-gray-200' 
                  : 'bg-blue-400 hover:bg-blue-500'
              } ${
                cell.isFlagged ? 'bg-yellow-300 hover:bg-yellow-400' : ''
              }`}
              onClick={() => revealCell(rowIndex, colIndex)}
              onContextMenu={(e) => {
                e.preventDefault();
                toggleFlag(rowIndex, colIndex);
              }}
            >
              {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && (
                <span className={`
                  ${cell.neighborMines === 1 ? 'text-blue-500' : ''}
                  ${cell.neighborMines === 2 ? 'text-green-500' : ''}
                  ${cell.neighborMines === 3 ? 'text-red-500' : ''}
                  ${cell.neighborMines === 4 ? 'text-purple-500' : ''}
                  ${cell.neighborMines >= 5 ? 'text-yellow-500' : ''}
                `}>
                  {cell.neighborMines}
                </span>
              )}
              {cell.isRevealed && cell.isMine && '💣'}
              {cell.isFlagged && !cell.isRevealed && '🚩'}
            </button>
          ))
        ))}
      </div>
      {gameOver && <div className="game-over">遊戲結束！</div>}
      {win && <div className="win">恭喜你贏了！</div>}
    </div>
  );
};

export default Minesweeper;
