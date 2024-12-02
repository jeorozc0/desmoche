import React from 'react';
import { Player, CardData } from '../types';
import { PlayerInfo } from './player-info';
import FannedCards from './ui/fanned-cards';
import { Loader2 } from "lucide-react";

interface GameTableProps {
  currentPlayer: string;
  otherPlayers: Player[];
  playerHand: CardData[];
  onCardClick: (card: CardData, index: number) => void;
  phase: string;
  removedCardIndex?: number;
  showPlayToast: boolean;
}

export const GameTable: React.FC<GameTableProps> = ({
  currentPlayer,
  otherPlayers,
  playerHand,
  onCardClick,
  phase,
  removedCardIndex,
  showPlayToast
}) => {
  const positions = [
    { x: "50%", y: "20px", align: "center" }, // Top
    { x: "20px", y: "50%", align: "left" }, // Left
    { x: "calc(100% - 20px)", y: "50%", align: "right" }, // Right
  ];

  return (
    <div className="relative w-full max-w-4xl aspect-square bg-green-700 rounded-full shadow-xl">
      {/* Players */}
      {otherPlayers.map((player, index) => {
        if (index >= positions.length) return null;
        const pos = positions[index];

        return (
          <div
            key={player.name}
            className="absolute"
            style={{
              left: pos.x,
              top: pos.y,
              transform:
                pos.align === "center"
                  ? "translate(-50%, 0)"
                  : pos.align === "left"
                    ? "translate(0, -50%)"
                    : "translate(-100%, -50%)",
            }}
          >
            <div className="flex flex-col items-center">
              <PlayerInfo name={player.name} />
              <div className="mt-4 w-96 h-48">
                <FannedCards cards={player.hand || []} faceDown={true} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Center table */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-48 h-48 bg-green-600/50 rounded-full flex items-center justify-center">
          {phase === "setup" && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-white font-medium">Exchanging cards...</span>
            </div>
          )}
        </div>
      </div>

      {/* Current player */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <PlayerInfo name={currentPlayer} />
        <div className="mt-4 w-96 h-48">
          <FannedCards
            cards={playerHand}
            onCardClick={onCardClick}
            removedCardIndex={removedCardIndex}
          />
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
