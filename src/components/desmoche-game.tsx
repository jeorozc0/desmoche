import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { CardData } from '../types';
import { LoginForm } from './login-form';
import { GameTable } from './game-table';
import WaitingRoomDialog from './waiting-room-dialogue';

const DesmocheGame = () => {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const {
    connected,
    messages,
    gameState,
    playerHand,
    connect,
    sendMessage,
    host,
  } = useWebSocket();

  const handleConnect = () => {
    if (gameId && playerName) {
      connect(gameId, playerName);
    }
  };

  const handleStartGame = () => {
    sendMessage("start_game");
  };

  const handleToggleReady = () => {
    sendMessage("toggle_ready");
  };

  const handleCardClick = (card: CardData) => {
    console.log("Card clicked:", card);
  };

  if (!connected) {
    return (
      <LoginForm
        gameId={gameId}
        playerName={playerName}
        onGameIdChange={setGameId}
        onPlayerNameChange={setPlayerName}
        onConnect={handleConnect}
      />
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-700">
      <div className="w-full h-full flex items-center justify-center p-4">
        {gameState.phase !== "playing" ? (
          <WaitingRoomDialog
            players={gameState.players}
            messages={messages}
            onStartGame={handleStartGame}
            onToggleReady={handleToggleReady}
            currentPlayer={playerName}
            host={host}
          />
        ) : (
          <GameTable
            currentPlayer={playerName}
            otherPlayers={gameState.players.filter(p => p.name !== playerName)}
            playerHand={playerHand}
            onCardClick={handleCardClick}
          />
        )}
      </div>
    </div>
  );
};

export default DesmocheGame;
