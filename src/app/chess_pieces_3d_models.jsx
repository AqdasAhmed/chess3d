"use client"

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const INITIAL_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const PIECE_TYPES = {
  p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king',
  P: 'pawn', R: 'rook', N: 'knight', B: 'bishop', Q: 'queen', K: 'king'
};

const isValidPosition = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const isOpponentPiece = (board, r, c, isWhite) => {
  if (!board[r][c]) return false;
  return isWhite ? board[r][c] === board[r][c].toLowerCase() : board[r][c] === board[r][c].toUpperCase();
};

const getValidMoves = (board, r, c, piece) => {
  const isWhite = piece === piece.toUpperCase();
  const type = piece.toLowerCase();
  const moves = [];

  const addMove = (nr, nc) => {
    if (!isValidPosition(nr, nc)) return false;
    const target = board[nr][nc];
    if (!target) {
      moves.push([nr, nc]);
      return true;
    } else if (isOpponentPiece(board, nr, nc, isWhite)) {
      moves.push([nr, nc]);
      return false;
    }
    return false;
  };

  if (type === 'p') {
    const dir = isWhite ? -1 : 1;
    if (isValidPosition(r + dir, c) && !board[r + dir][c]) {
      moves.push([r + dir, c]);
      if ((isWhite && r === 6) || (!isWhite && r === 1)) {
        if (!board[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
      }
    }
    [[dir, 1], [dir, -1]].forEach(([dr, dc]) => {
      if (isValidPosition(r + dr, c + dc) && isOpponentPiece(board, r + dr, c + dc, isWhite)) {
        moves.push([r + dr, c + dc]);
      }
    });
  } else if (type === 'n') {
    [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => addMove(r + dr, c + dc));
  } else if (type === 'r' || type === 'q') {
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
      for (let i = 1; i < 8; i++) if (!addMove(r + dr * i, c + dc * i)) break;
    });
  }
  if (type === 'b' || type === 'q') {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      for (let i = 1; i < 8; i++) if (!addMove(r + dr * i, c + dc * i)) break;
    });
  } else if (type === 'k') {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) addMove(r + dr, c + dc);
  }
  return moves;
};

function Piece({ type, color, position, isSelected, onClick }) {
  const isWhite = color === 'white';
  const meshRef = useRef();

  useFrame((state) => {
    if (isSelected && meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.1 + 0.2;
    } else if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
    }
  });

  const renderGeometry = () => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'p': return <sphereGeometry args={[0.25, 16, 16]} />;
      case 'r': return <boxGeometry args={[0.4, 0.7, 0.4]} />;
      case 'n': return <coneGeometry args={[0.3, 0.6, 4]} />;
      case 'b': return <cylinderGeometry args={[0.1, 0.3, 0.8, 16]} />;
      case 'q': return <octahedronGeometry args={[0.4]} />;
      case 'k': return <torusKnotGeometry args={[0.2, 0.08, 64, 8]} />;
      default: return <boxGeometry args={[0.3, 0.3, 0.3]} />;
    }
  };

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh ref={meshRef} castShadow>
        {renderGeometry()}
        <meshStandardMaterial
          color={isWhite ? "#f0f0f0" : "#222"}
          metalness={0.8}
          roughness={0.2}
          emissive={isSelected ? "#3b82f6" : "#000"}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}

function Board({ selectedSquare, validMoves, onSquareClick }) {
  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isDark = (r + c) % 2 === 1;
      const isSelected = selectedSquare?.[0] === r && selectedSquare?.[1] === c;
      const isValid = validMoves.some(m => m[0] === r && m[1] === c);
      squares.push(
        <mesh key={`${r}-${c}`} position={[c - 3.5, -0.5, r - 3.5]} receiveShadow onClick={() => onSquareClick(r, c)}>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color={isValid ? "#4ade80" : isSelected ? "#3b82f6" : isDark ? "#262626" : "#a3a3a3"} />
        </mesh>
      );
    }
  }
  return <group>{squares}<mesh position={[0, -0.6, 0]}><boxGeometry args={[8.5, 0.2, 8.5]} /><meshStandardMaterial color="#171717" /></mesh></group>;
}

export default function App() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [turn, setTurn] = useState('white');
  const [history, setHistory] = useState([]);
  const [captured, setCaptured] = useState({ white: [], black: [] });
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const [promotion, setPromotion] = useState(null); // { r, c, color }
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const handleSquareClick = (r, c) => {
    if (winner || promotion) return;
    const piece = board[r][c];
    const isWhiteTurn = turn === 'white';

    if (piece && ((isWhiteTurn && piece === piece.toUpperCase()) || (!isWhiteTurn && piece === piece.toLowerCase()))) {
      setSelectedSquare([r, c]);
      setValidMoves(getValidMoves(board, r, c, piece));
    } else if (selectedSquare) {
      const isValidMove = validMoves.some(m => m[0] === r && m[1] === c);
      if (isValidMove) {
        const [sr, sc] = selectedSquare;
        const movingPiece = board[sr][sc];
        const capturedPiece = board[r][c];

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = movingPiece;
        newBoard[sr][sc] = null;

        // Save History
        setHistory(prev => [...prev, { board: board.map(row => [...row]), turn, captured }]);

        // Track Captures & Win Condition
        if (capturedPiece) {
          const capColor = capturedPiece === capturedPiece.toUpperCase() ? 'white' : 'black';
          setCaptured(prev => ({ ...prev, [capColor]: [...prev[capColor], capturedPiece] }));
          if (capturedPiece.toLowerCase() === 'k') setWinner(isWhiteTurn ? 'White' : 'Black');
        }

        // Handle Promotion Check
        if (movingPiece.toLowerCase() === 'p' && (r === 0 || r === 7)) {
          setPromotion({ r, c, color: isWhiteTurn ? 'white' : 'black' });
        } else {
          setTurn(isWhiteTurn ? 'black' : 'white');
        }

        setSelectedSquare(null);
        setValidMoves([]);
        setBoard(newBoard);
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  const undoMove = () => {
    if (history.length === 0 || winner || promotion) return;
    const lastState = history[history.length - 1];
    setBoard(lastState.board);
    setTurn(lastState.turn);
    setCaptured(lastState.captured);
    setHistory(prev => prev.slice(0, -1));
  };

  const promotePawn = (choice) => {
    const newBoard = board.map(row => [...row]);
    newBoard[promotion.r][promotion.c] = choice;

    // Remove one instance of the chosen piece from captured if it's a recall
    const capColor = promotion.color;
    const newCapturedList = [...captured[capColor]];
    const idx = newCapturedList.indexOf(choice);
    if (idx > -1) newCapturedList.splice(idx, 1);

    setCaptured(prev => ({ ...prev, [capColor]: newCapturedList }));
    setBoard(newBoard);
    setPromotion(null);
    setTurn(turn === 'white' ? 'black' : 'white');
  };

  return (
    <div className="w-full h-screen bg-black relative flex overflow-hidden font-sans text-white">
      {/* Sidebar - Stats & History */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-blue-500">3D Grandmaster</h1>
        <div className="mt-2 flex items-center gap-4">
          <div className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${turn === 'white' ? 'bg-white text-black' : 'bg-neutral-800 text-white border border-neutral-700'}`}>
            White
          </div>
          <div className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${turn === 'black' ? 'bg-white text-black' : 'bg-neutral-800 text-white border border-neutral-700'}`}>
            Black
          </div>
        </div>
        {/* <p className="mt-4 text-neutral-400 font-medium uppercase tracking-widest text-xs">{status}</p> */}
      </div>
      <div onClick={isInstructionOpen ? () => setIsInstructionOpen(false) : () => setIsInstructionOpen(true)} className="absolute top-8 right-8 z-10 bg-neutral-800/80 backdrop-blur p-2 rounded-lg border border-white/10 max-w-sm">
        < svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ transition: 'transform 0.3s ease', transform: isInstructionOpen ? 'rotate(0deg)' : 'rotate(45deg)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      {isInstructionOpen && (
        <div className="absolute top-20 right-8 z-10 bg-neutral-800/80 backdrop-blur p-6 rounded-2xl border border-white/10 max-w-xs">
          <h3 className="text-sm font-bold mb-2">How to Play</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Click a piece to select it (highlights valid moves in green). Click a destination square to move. Capture opponent pieces to win. Pawns promote to queens at the opposite end.
          </p>
          <div className="mt-1 flex gap-2">
            <button onClick={undoMove} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold transition-all">UNDO</button>
            <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all">RESET</button>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 relative">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 10, 10]} fov={40} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} makeDefault />
          <Suspense fallback={null}>
            <Environment preset="apartment" />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} castShadow intensity={2} />
            <group rotation={[0, turn === 'black' && !winner ? Math.PI : 0, 0]}>
              <Board selectedSquare={selectedSquare} validMoves={validMoves} onSquareClick={handleSquareClick} />
              {board.map((row, r) => row.map((piece, c) => piece && (
                <Piece key={`${r}-${c}-${piece}`} type={piece} color={piece === piece.toUpperCase() ? 'white' : 'black'} position={[c - 3.5, 0, r - 3.5]} isSelected={selectedSquare?.[0] === r && selectedSquare?.[1] === c} onClick={() => handleSquareClick(r, c)} />
              )))}
            </group>
            <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={20} blur={2} />
          </Suspense>
        </Canvas>

        {/* Overlays */}
        {winner && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in duration-500">
            <div className="text-center">
              <h2 className="text-6xl font-black italic text-blue-500 mb-2">CHECKMATE</h2>
              <p className="text-xl uppercase tracking-[0.5em] text-white/50 mb-8">{winner} Wins</p>
              <button onClick={() => window.location.reload()} className="px-12 py-4 bg-white text-black font-black uppercase rounded-full hover:scale-105 transition-transform">Play Again</button>
            </div>
          </div>
        )}

        {promotion && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-900 p-8 rounded-3xl border border-white/10 text-center max-w-sm">
              <h3 className="text-xl font-bold mb-2">Pawn Promotion</h3>
              <p className="text-xs text-neutral-400 mb-6 uppercase tracking-widest">Recall a captured piece</p>
              <div className="grid grid-cols-2 gap-3">
                {(promotion.color === 'white' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n']).map(p => (
                  <button
                    key={p}
                    onClick={() => promotePawn(p)}
                    className="p-4 bg-neutral-800 hover:bg-blue-600 rounded-xl transition-all flex flex-col items-center gap-2 group"
                  >
                    <span className="text-3xl">{p}</span>
                    <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 uppercase">{PIECE_TYPES[p.toLowerCase()]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}