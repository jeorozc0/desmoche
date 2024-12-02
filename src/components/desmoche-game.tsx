import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { CardData } from '../types';
import { LoginForm } from './login-form';
import { GameTable } from './game-table';
import WaitingRoomDialog from './waiting-room-dialogue';
import { getSuitName } from '../utils/card-helpers';

const DesmocheGame = () => {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [hasExchanged, setHasExchanged] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [removedCardIndex, setRemovedCardIndex] = useState<number | undefined>(undefined);
  const [exchangeAnimationComplete, setExchangeAnimationComplete] = useState(false);
  const [showPlayToast, setShowPlayToast] = useState(false);

  const {
    connected,
    messages,
    gameState,
    playerHand,
    connect,
    sendMessage,
    host,
  } = useWebSocket();

  console.log(gameState.phase)
  // Handle phase changes
  useEffect(() => {
    if (gameState.phase !== "setup") {
      setHasExchanged(false);
      setRemovedCardIndex(undefined);
      setExchangeAnimationComplete(false);
    }

    if (gameState.phase === "play") {
      setShowPlayToast(true);
      const timer = setTimeout(() => {
        setShowPlayToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase]);

  // Reset animation state when hands are updated
  useEffect(() => {
    if (exchangeAnimationComplete) {
      setRemovedCardIndex(undefined);
      setExchangeAnimationComplete(false);
    }
  }, [playerHand]);

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

  const handleCardClick = (card: CardData, index: number) => {
    if (gameState.phase === "setup") {
      if (!hasExchanged) {
        setRemovedCardIndex(index);
        sendMessage("exchange_card", { card: `${card.number} of ${getSuitName(card.suit)}` });
        setTimeout(() => {
          setHasExchanged(true);
          setExchangeAnimationComplete(true);
        }, 500);
      } else {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    }
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
        {gameState.state !== "game" ? (
          <WaitingRoomDialog
            players={gameState.players}
            messages={messages}
            onStartGame={handleStartGame}
            onToggleReady={handleToggleReady}
            currentPlayer={playerName}
            host={host}
          />
        ) : (
          <>
            <GameTable
              currentPlayer={playerName}
              otherPlayers={gameState.players.filter(p => p.name !== playerName)}
              playerHand={playerHand}
              onCardClick={handleCardClick}
              phase={gameState.phase}
              removedCardIndex={removedCardIndex}
              showPlayToast={showPlayToast}
            />

            {showAlert && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 
                           bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg
                           transition-opacity duration-300">
                You have already exchanged a card for this round!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DesmocheGame;
