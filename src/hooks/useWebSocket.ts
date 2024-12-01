import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Message, Player, CardData } from '../types';
import { convertServerCards } from '../utils/card-helpers';

interface WebSocketHookResult {
  connected: boolean;
  messages: Message[];
  gameState: GameState;
  playerHand: CardData[];
  connect: (gameId: string, playerName: string) => void;
  sendMessage: (action: string, data?: any) => void;
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
  });

  const playerNameRef = useRef<string>("");

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    console.log("Received message:", data);

    switch (data.action || data.event) {
      case "player_joined": {
        const playerObjects = data.players.map((name: string) => ({
          name,
          isReady: false
        }));

        setHost(data.host);
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

      case "player_ready": {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map(p =>
            p.name === data.player
              ? { ...p, isReady: true }
              : p
          )
        }));
        setMessages((prev) => [
          ...prev,
          { type: "system", text: data.message }
        ]);
        break;
      }

      case "player_not_ready": {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map(p =>
            p.name === data.player
              ? { ...p, isReady: false }
              : p
          )
        }));
        setMessages((prev) => [
          ...prev,
          { type: "system", text: data.message }
        ]);
        break;
      }

      case "game_started": {
        const players = data.players.map((p: any) => ({
          name: p.name,
          hand: p.hand ? convertServerCards(p.hand) : undefined,
          isReady: true
        }));

        const currentPlayer = players.find(
          (p: Player) => p.name === playerNameRef.current
        );
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
        setMessages((prev) => [
          ...prev,
          { type: "system", text: "Game has started!" },
        ]);
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
        setMessages((prev) => [
          ...prev,
          { type: "error", text: data.message },
        ]);
        break;

      default:
        if (data.message) {
          setMessages((prev) => [
            ...prev,
            { type: "game", text: data.message },
          ]);
        }
    }
  }, []);

  const connect = useCallback((gameId: string, playerName: string) => {
    if (!gameId || !playerName) return;

    // Store player name for reference in message handling
    playerNameRef.current = playerName;

    const ws = new WebSocket(`ws://localhost:8080/game/${gameId}/${playerName}`);

    ws.onopen = () => {
      setConnected(true);
      setMessages((prev) => [
        ...prev,
        { type: "system", text: "Connected to game server" },
      ]);
    };

    ws.onmessage = handleWebSocketMessage;

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
      console.error('WebSocket error:', error);
      setMessages((prev) => [
        ...prev,
        { type: "error", text: "Connection error occurred" },
      ]);
    };

    setSocket(ws);
  }, [handleWebSocketMessage]);

  const sendMessage = useCallback((action: string, data = {}) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action, ...data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket]);

  // Cleanup WebSocket connection when component unmounts
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
