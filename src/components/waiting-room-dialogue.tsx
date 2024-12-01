import React, { useRef, useEffect } from 'react';
import { User, Check, Crown } from "lucide-react";
import { Player, Message } from '../types';

interface PlayerWithReady extends Player {
  isReady?: boolean;
}

interface WaitingRoomDialogProps {
  players: PlayerWithReady[];
  messages: Message[];
  onStartGame: () => void;
  onToggleReady: () => void;
  currentPlayer: string;
  host: string;
}

export const WaitingRoomDialog: React.FC<WaitingRoomDialogProps> = ({
  players,
  messages,
  onStartGame,
  onToggleReady,
  currentPlayer,
  host,
}) => {
  const logRef = useRef<HTMLDivElement>(null);
  const isHost = currentPlayer === host;

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  // Count how many players are ready
  const readyCount = players.filter(p => p.isReady).length;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    bg-white/95 rounded-lg shadow-xl p-6 w-96 z-10 min-h-[400px] flex flex-col">
      <h2 className="text-xl font-bold text-center mb-4">Waiting for Players</h2>

      {/* Player List with Ready Status */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Players Ready ({readyCount}/{players.length}):
        </h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.name}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{player.name}</span>
                {player.name === host && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              {player.isReady && (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Game Log */}
      <div
        ref={logRef}
        className="flex-1 bg-gray-50 rounded-lg p-3 mb-4 overflow-y-auto max-h-48 space-y-2"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded text-sm ${msg.type === "error"
              ? "bg-red-100 text-red-800"
              : msg.type === "system"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100"
              }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Controls Section */}
      <div className="space-y-2">
        {/* Ready Button for All Players */}
        <button
          onClick={onToggleReady}
          className={`w-full py-2 px-4 rounded transition-colors font-medium
            ${players.find(p => p.name === currentPlayer)?.isReady
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"}`}
        >
          {players.find(p => p.name === currentPlayer)?.isReady
            ? "Not Ready"
            : "Ready"}
        </button>

        {/* Start Game Button (only for host) */}
        {isHost && players.length >= 2 && (
          <button
            onClick={onStartGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default WaitingRoomDialog;
