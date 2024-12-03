import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Message, CardData, GameSession } from '../types';
import { convertServerCards, getSuitSymbol } from '../utils/card-helpers';

interface BaseResponse {
  event: string;
  message: string;
}

interface SessionResponse extends BaseResponse {
  data: {
    discard_pile: CardData[]
    card_drawn: any;
    session: GameSession;
  };
}

interface PlayerReadyResponse extends BaseResponse {
  data: {
    player: {
      name: string;
      is_ready: boolean;
    };
  };
}

type ServerResponse = SessionResponse | PlayerReadyResponse;

interface WebSocketHookResult {
  connected: boolean;
  messages: Message[];
  gameState: GameState;
  playerHand: CardData[];
  connect: (gameId: string, playerName: string) => void;
  sendMessage: (event: string, data?: any) => void;
  host: string;
}

export function useWebSocket(): WebSocketHookResult {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [host, setHost] = useState<string>("");
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentTurn: "",
    phase: "waiting",
    state: "lobby"
  });

  const playerNameRef = useRef<string>("");

  const isSessionResponse = (data: any): data is SessionResponse => {
    return 'data' in data && 'session' in data.data;
  };

  const isDataResponse = (data: any): data is SessionResponse => {
    return 'data' in data;
  };

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    const data: ServerResponse = JSON.parse(event.data);
    console.log("Received message:", data);

    // Always add the message to messages list if it exists
    if (data.message) {
      setMessages(prev => [
        ...prev,
        {
          type: data.event === "error" ? "error" : "system",
          text: data.message
        }
      ]);
    }

    if (data.event.includes("_exception")) {
      console.log("Not so fast!")
      return null;
    }

    switch (data.event) {
      case "player_joined": {
        if (isSessionResponse(data)) {
          const session = data.data.session;
          const playersList = Object.values(session.players).map(player => ({
            name: player.name,
            isReady: player.is_ready,
            hand: player.hand.cards.length > 0 ? convertServerCards(player.hand.cards) : undefined
          }));

          setHost(session.host);
          setGameState(prev => ({
            ...prev,
            players: playersList,
            phase: session.phase,
            state: session.state
          }));
        }
        break;
      }

      case "player_ready": {
        if ('data' in data && 'player' in data.data) {
          const playerData = data.data.player;
          setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
              p.name === playerData.name  // Use the player name from the response
                ? { ...p, isReady: playerData.is_ready }
                : p
            )
          }));
        }
        break;
      }

      case "player_not_ready": {
        if ('data' in data && 'player' in data.data) {
          const playerData = data.data.player;
          setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
              p.name === playerNameRef.current
                ? { ...p, isReady: playerData.is_ready }
                : p
            )
          }));
        }
        break;
      }

      case "game_started": {
        if (isSessionResponse(data)) {
          const session = data.data.session;
          const players = Object.values(session.players).map(player => ({
            name: player.name,
            isReady: player.is_ready,
            hand: convertServerCards(player.hand.cards)
          }));

          // Set initial player hand
          const currentPlayer = session.players[playerNameRef.current];
          if (currentPlayer?.hand?.cards) {
            setPlayerHand(convertServerCards(currentPlayer.hand.cards));
          }

          setGameState(prev => ({
            ...prev,
            players,
            phase: session.phase,
            state: session.state,
            currentTurn: session.current_turn_player.name
          }));
        }
        break;
      }

      case "card_exchange_complete": {
        if (isSessionResponse(data)) {
          const session = data.data.session;

          // Update all players' hands
          const players = Object.values(session.players).map(player => ({
            name: player.name,
            isReady: player.is_ready,
            hand: convertServerCards(player.hand.cards)
          }));

          // Update current player's hand
          const currentPlayer = session.players[playerNameRef.current];
          if (currentPlayer?.hand?.cards) {
            setPlayerHand(convertServerCards(currentPlayer.hand.cards));
          }

          setGameState(prev => ({
            ...prev,
            players,
            phase: session.phase
          }));
        }
        break;
      }
      case "no_automatic_win": {
        if (isSessionResponse(data)) {
          const session = data.data.session;
          setGameState(prev => ({
            ...prev,
            phase: session.phase
          }));
        }
        break;
      }

      case "can_create_meld": {
        if (isDataResponse(data)) {
          const cardDrawn = data.data.card_drawn;

          // Convert and add the drawn card to player's hand
          const newCard = {
            suit: getSuitSymbol(
              cardDrawn.suit),
            number: cardDrawn.rank,
            color: cardDrawn.color.toLowerCase() as "red" | "black"
          };

          setPlayerHand(prev => [...prev, newCard]);

          setGameState(prev => ({
            ...prev,
            cardDrawn: cardDrawn
          }));
        }
        break;
      }

      case "card_discarded": {
        if (isSessionResponse(data)) {
          const discardPile = data.data.session.discard_pile
          console.log(discardPile)
          setGameState(prev => ({
            ...prev,
            discardPile: discardPile
          }));
        }
        break;
      }

      case "player_left": {
        if (isSessionResponse(data)) {
          const session = data.data.session;
          setGameState(prev => ({
            ...prev,
            players: Object.values(session.players).map(player => ({
              name: player.name,
              isReady: player.is_ready,
              hand: convertServerCards(player.hand.cards)
            }))
          }));
        }
        break;
      }
    }
  }, []);

  const connect = useCallback((gameId: string, playerName: string) => {
    if (!gameId || !playerName) return;

    playerNameRef.current = playerName;

    const ws = new WebSocket(`ws://localhost:8080/game/${gameId}/${playerName}`);

    ws.onopen = () => {
      setConnected(true);
      setMessages(prev => [
        ...prev,
        { type: "system", text: "Connected to game server" }
      ]);
    };

    ws.onmessage = handleWebSocketMessage;

    ws.onclose = () => {
      setConnected(false);
      setMessages(prev => [
        ...prev,
        { type: "system", text: "Disconnected from game server" }
      ]);
      setGameState(prev => ({
        ...prev,
        players: [],
        phase: "waiting",
        state: "lobby"
      }));
      setPlayerHand([]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessages(prev => [
        ...prev,
        { type: "error", text: "Connection error occurred" }
      ]);
    };

    setSocket(ws);
  }, [handleWebSocketMessage]);

  const sendMessage = useCallback((event: string, data = {}) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, ...data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return {
    connected,
    messages,
    gameState,
    playerHand,
    connect,
    sendMessage,
    host,
  };
}
