import React from 'react';

interface LoginFormProps {
  gameId: string;
  playerName: string;
  onGameIdChange: (value: string) => void;
  onPlayerNameChange: (value: string) => void;
  onConnect: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  gameId,
  playerName,
  onGameIdChange,
  onPlayerNameChange,
  onConnect,
}) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Join Game</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Game ID"
          value={gameId}
          onChange={(e) => onGameIdChange(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Player Name"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={onConnect}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Join Game
        </button>
      </div>
    </div>
  </div>
);
