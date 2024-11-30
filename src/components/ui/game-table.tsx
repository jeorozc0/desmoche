import { useState, useCallback, useRef, useEffect } from "react";
import { User } from "lucide-react";
import FannedCards from "./fanned-cards";

interface CardData {
  suit: string; // Now expects "♠", "♥", "♦", "♣"
  number: string;
  color: "red" | "black";
}

interface Player {
  name: string;
  hand?: CardData[];
}

interface Card {
  suit: string;
  number: string;
  color: "red" | "black";
}

interface Player {
  name: string;
  hand?: Card[];
}

interface GameState {
  players: Player[];
  currentTurn: string;
  phase: string;
  dealer?: string;
  turnOrder?: string[];
}

interface Message {
  type: "system" | "error" | "game";
  text: string;
}

const WaitingRoomDialog = ({
  players,
  messages,
  onStartGame,
}: {
  players: Player[];
  messages: Message[];
  onStartGame: () => void;
}) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    bg-white/95 rounded-lg shadow-xl p-6 w-96 z-10 min-h-[400px] flex flex-col"
    >
      <h2 className="text-xl font-bold text-center mb-4">Waiting for Players</h2>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Players in Room ({players.length}/4):
        </h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.name}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded"
            >
              <User className="w-5 h-5" />
              <span>{player.name}</span>
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
            className={`p-2 rounded text-sm ${
              msg.type === "error"
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

      {players.length >= 2 ? (
        <button
          onClick={onStartGame}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
        >
          Start Game
        </button>
      ) : (
        <p className="text-center text-sm text-gray-500">
          Waiting for at least 2 players to join...
        </p>
      )}
    </div>
  );
};

// Helper function to convert server card format to our Card interface
function getSuitSymbol(suitName: string): string {
  switch (suitName) {
    case "Hearts":
      return "♥";
    case "Diamonds":
      return "♦";
    case "Clubs":
      return "♣";
    case "Spades":
      return "♠";
    default:
      return "♠";
  }
}

// Helper function to convert server card format to our Card interface
function convertServerCards(cards: string[]): CardData[] {
  return cards.map((cardStr) => {
    const [number, , suit] = cardStr.split(" "); // Splits "Ace of Hearts" into ["Ace", "of", "Hearts"]
    return {
      number: number,
      suit: getSuitSymbol(suit),
      color: suit === "Hearts" || suit === "Diamonds" ? "red" : "black",
    };
  });
}

const DesmocheGame = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [connected, setConnected] = useState(false);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentTurn: "",
    phase: "waiting",
  });

  const connect = useCallback(() => {
    if (!gameId || !playerName) return;

    const ws = new WebSocket(`ws://localhost:8080/ws/${gameId}/${playerName}`);

    ws.onopen = () => {
      setConnected(true);
      setMessages((prev) => [
        ...prev,
        { type: "system", text: "Connected to game server" },
      ]);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      switch (data.action) {
        case "player_joined": {
          const playerObjects = data.players.map((name: string) => ({ name }));
          setGameState((prev) => ({
            ...prev,
            players: playerObjects,
            phase: data.phase || prev.phase,
          }));
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              text: data.message || `${data.player} joined the game`,
            },
          ]);
          break;
        }

        case "game_started": {
          // Find current player's hand from the players data
          const players = data.players.map((p: any) => ({
            name: p.name,
            hand: p.hand ? convertServerCards(p.hand) : undefined,
          }));

          // Find and set current player's hand
          const currentPlayer = players.find((p: Player) => p.name === playerName);
          if (currentPlayer?.hand) {
            setPlayerHand(currentPlayer.hand);
          }

          setGameState((prev) => ({
            ...prev,
            players,
            phase: "playing",
            dealer: data.dealer,
            turnOrder: data.turn_order,
          }));
          setMessages((prev) => [...prev, { type: "system", text: "Game has started!" }]);
          break;
        }

        case "player_left":
          setGameState((prev) => ({
            ...prev,
            players: prev.players.filter((p) => p.name !== data.player),
          }));
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              text: data.message || `${data.player} left the game`,
            },
          ]);
          break;

        case "error":
          setMessages((prev) => [...prev, { type: "error", text: data.message }]);
          break;

        default:
          if (data.message) {
            setMessages((prev) => [...prev, { type: "game", text: data.message }]);
          }
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setMessages((prev) => [
        ...prev,
        { type: "system", text: "Disconnected from game server" },
      ]);
      setGameState((prev) => ({ ...prev, players: [] }));
      setPlayerHand([]);
    };

    ws.onerror = (error) => {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: "Connection error occurred" },
      ]);
    };

    setSocket(ws);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [gameId, playerName]);

  const sendMessage = (action: string, data = {}) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action, ...data }));
    }
  };

  const startGame = () => {
    sendMessage("start_game");
  };

  const handleCardClick = (card: Card) => {
    console.log("Card clicked:", card);
    // Add your card click handling logic here
  };

  // Get list of other players (excluding current player)
  const otherPlayers = gameState.players.filter((p) => p.name !== playerName);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Join Game</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={connect}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-green-800">
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl aspect-square bg-green-700 rounded-full shadow-xl">
          {gameState.phase !== "playing" ? (
            <WaitingRoomDialog
              players={gameState.players}
              messages={messages}
              onStartGame={startGame}
            />
          ) : (
            <>
              {/* Other players */}
              {otherPlayers.map((player, index) => {
                const positions = [
                  { x: "50%", y: "20px", align: "center" }, // Top
                  { x: "20px", y: "50%", align: "left" }, // Left
                  { x: "calc(100% - 20px)", y: "50%", align: "right" }, // Right
                ];
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
                      <User className="w-12 h-12 text-white" />
                      <div className="mt-2 bg-white/20 rounded-lg px-3 py-1">
                        <span className="text-white whitespace-nowrap">
                          {player.name}
                        </span>
                      </div>
                      <div className="mt-4 w-64 h-36">
                        <FannedCards cards={player.hand || []} faceDown={true} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Center table */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 bg-green-600/50 rounded-full flex items-center justify-center"></div>
              </div>

              {/* Current player */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <User className="w-12 h-12 text-white" />
                <div className="mt-2 bg-white/20 rounded-lg px-3 py-1">
                  <span className="text-white whitespace-nowrap">{playerName}</span>
                </div>
                <div className="mt-4 w-64 h-36">
                  <FannedCards cards={playerHand} onCardClick={handleCardClick} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesmocheGame;
