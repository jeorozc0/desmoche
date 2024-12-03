import React from 'react';
import { Player, CardData, ServerCard } from '../types';
import { PlayerInfo } from './player-info';
import FannedCards from './ui/fanned-cards';
import Card from './ui/card';
import { Loader2 } from "lucide-react";
import { getSuitSymbol } from '../utils/card-helpers';

interface GameTableProps {
  currentPlayer: string;
  otherPlayers: Player[];
  playerHand: CardData[];
  onCardClick: (card: CardData, index: number) => void;
  onDeckClick: () => void;
  phase: string;
  drawnCard?: CardData;
  discardPile?: ServerCard[];
  removedCardIndex?: number;
  showPlayToast: boolean;
  currentTurn: string;
  selectedCardIndices: number[];
}

export const GameTable: React.FC<GameTableProps> = ({
  currentPlayer,
  otherPlayers,
  playerHand,
  onCardClick,
  onDeckClick,
  phase,
  removedCardIndex,
  showPlayToast,
  currentTurn,
  discardPile = [],
  selectedCardIndices
}) => {
  const positions = [
    { x: "50%", y: "20px", align: "center" }, // Top
    { x: "20px", y: "50%", align: "left" }, // Left
    { x: "calc(100% - 20px)", y: "50%", align: "right" }, // Right
  ];

  const isPlayerTurn = currentTurn === currentPlayer;

  // Get the top card of the discard pile
  const topDiscardCard = discardPile.length > 0 ? discardPile[0] : null;

  return (
    <div className="relative w-full max-w-4xl aspect-square bg-green-700 rounded-full shadow-xl">
      {/* Other players */}
      {otherPlayers.map((player, index) => {
        if (index >= positions.length) return null;
        const pos = positions[index];
        const isTheirTurn = currentTurn === player.name;
        const containerStyle = {
          left: pos.x,
          top: pos.y,
          transform:
            pos.align === "center"
              ? "translate(-50%, 0)"
              : pos.align === "left"
                ? "translate(0, -50%)"
                : "translate(-100%, -50%)",
        };

        return (
          <div key={player.name} className="absolute" style={containerStyle}>
            <div className={`flex flex-col items-center rounded-xl p-4
                           ${isTheirTurn ? 'bg-yellow-500/20 animate-pulse' : ''}`}>
              <PlayerInfo name={player.name} />
              <div className="flex items-center mt-4">
                <div className="w-96 h-48">
                  <FannedCards cards={player.hand || []} faceDown={true} />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Center table */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {phase === "setup" ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="text-white font-medium">Exchanging cards...</span>
          </div>
        ) : (
          <div className="w-96 h-48 bg-green-600/50 rounded-full flex items-center justify-center gap-8">
            {/* Draw pile */}
            <div
              className={`w-32 h-48 relative transition-transform duration-200
                         ${isPlayerTurn ? 'hover:scale-105 cursor-pointer' : 'opacity-80'}`}
              onClick={() => isPlayerTurn && onDeckClick()}
            >
              <div className="absolute inset-0">
                <svg
                  viewBox="0 0 240 336"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <rect
                    width="240"
                    height="336"
                    rx="16"
                    fill="#2563eb"
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                  <path
                    d="M40 40 L200 296 M200 40 L40 296"
                    stroke="#1e40af"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Discard pile */}
            {phase === "play" && (
              <div className="relative w-32 h-48">
                {/* Show stacked effect for cards underneath */}
                {[...Array(Math.min(3, discardPile.length))].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-32 h-48"
                    style={{
                      top: `${-i * 2}px`,
                      left: `${-i * 2}px`,
                      transform: `rotate(${i * 2}deg)`,
                      zIndex: -i
                    }}
                  >
                    {topDiscardCard && (
                      <Card
                        suit={getSuitSymbol(topDiscardCard.suit)}
                        number={topDiscardCard.value.toString()}
                        color={topDiscardCard.color}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current player */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className={`rounded-xl p-4 ${isPlayerTurn ? 'bg-yellow-500/20 animate-pulse' : ''}`}>
          <PlayerInfo name={currentPlayer} />
          <div className="flex items-center mt-4">
            <div className="w-96 h-48">
              <FannedCards
                cards={playerHand}
                onCardClick={onCardClick}
                removedCardIndex={removedCardIndex}
                selectedCardIndices={selectedCardIndices}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Play phase toast */}
      {showPlayToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
                       bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg
                       transition-all duration-300 ease-in-out
                       animate-fade-in-down">
          All cards exchanged. Play on!
        </div>
      )}
    </div>
  );
};

export default GameTable;