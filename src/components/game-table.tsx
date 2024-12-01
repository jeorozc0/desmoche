
import React from 'react';
import { Player, CardData } from '../types';
import { PlayerInfo } from './player-info';
import FannedCards from './ui/fanned-cards';

interface GameTableProps {
  currentPlayer: string;
  otherPlayers: Player[];
  playerHand: CardData[];
  onCardClick: (card: CardData) => void;
}

export const GameTable: React.FC<GameTableProps> = ({
  currentPlayer,
  otherPlayers,
  playerHand,
  onCardClick,
}) => {
  const positions = [
    { x: "50%", y: "20px", align: "center" }, // Top
    { x: "20px", y: "50%", align: "left" }, // Left
    { x: "calc(100% - 20px)", y: "50%", align: "right" }, // Right
  ];

  return (
    <div className="relative w-full max-w-4xl aspect-square bg-green-700 rounded-full shadow-xl">
      {/* Other players */}
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
        <div className="w-48 h-48 bg-green-600/50 rounded-full flex items-center justify-center" />
      </div>

      {/* Current player */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <PlayerInfo name={currentPlayer} />
        <div className="mt-4 w-96 h-48">
          <FannedCards cards={playerHand} onCardClick={onCardClick} />
        </div>
      </div>
    </div>
  );
};
