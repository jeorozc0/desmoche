import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { CardData } from '../types';
import { LoginForm } from './login-form';
import GameTable from './game-table';
import WaitingRoomDialog from './waiting-room-dialogue';
import { getSuitName } from '../utils/card-helpers';
import SelectedArea from './ui/selected-area';

const DesmocheGame = () => {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [hasExchanged, setHasExchanged] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [removedCardIndex, setRemovedCardIndex] = useState<number | undefined>(undefined);
  const [exchangeAnimationComplete, setExchangeAnimationComplete] = useState(false);
  const [showPlayToast, setShowPlayToast] = useState(false);
  const [selectedCards, setSelectedCards] = useState<CardData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const {
    connected,
    messages,
    gameState,
    playerHand,
    connect,
    sendMessage,
    host,
  } = useWebSocket();

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

  const handleCardSelect = (card: CardData, index: number) => {
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
    } else if (gameState.phase === "play") {
      if (selectedIndices.includes(index)) {
        // Deselect the card
        const cardIndex = selectedIndices.indexOf(index);
        setSelectedCards(prev => prev.filter((_, i) => i !== cardIndex));
        setSelectedIndices(prev => prev.filter((_, i) => i !== cardIndex));
      } else {
        // Select the card
        setSelectedCards(prev => [...prev, card]);
        setSelectedIndices(prev => [...prev, index]);
      }
    }
  };

  const handleDeckClick = () => {
    if (gameState.phase === "play" && gameState.currentTurn === playerName) {
      sendMessage("draw_from_deck");
    }
  };

  const handleCardRemove = (index: number) => {
    setSelectedCards(prev => prev.filter((_, i) => i !== index));
    setSelectedIndices(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateMeld = (cards: CardData[]) => {
    if (gameState.phase === "play") {
      const cardSelection = cards.map(card => `${card.number} of ${getSuitName(card.suit)}`);
      sendMessage("create_meld", { card_selection: cardSelection });
      setSelectedCards([]);
      setSelectedIndices([]);
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
    <div className="h-screen bg-gradient-to-br bg-green-600">
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
              onCardClick={handleCardSelect}
              onDeckClick={handleDeckClick}
              phase={gameState.phase}
              drawnCard={gameState.cardDrawn}
              removedCardIndex={removedCardIndex}
              showPlayToast={showPlayToast}
              discardPile={gameState.discardPile}
              currentTurn={gameState.currentTurn}
              selectedCardIndices={selectedIndices}
            />

            {/* Selected Area - Fixed to bottom left corner */}
            {gameState.phase === "play" && (
              <div className="fixed bottom-4 left-4 w-80">
                <SelectedArea
                  selectedCards={selectedCards}
                  onCardRemove={handleCardRemove}
                  onCreateMeld={() => handleCreateMeld(selectedCards)}
                />
              </div>
            )}

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