// Server-side card representation
export interface ServerCard {
  suit: string;
  rank: string;
  value: number;
  color: string;
  string: string;
}

// Client-side card representation (used for display)
export interface CardData {
  suit: string;
  number: string;
  color: "red" | "black";
}

// Server hand structure
export interface ServerHand {
  cards: ServerCard[];
  remaining_cards: number;
  is_empty: boolean;
}

// Server player structure
export interface ServerPlayer {
  name: string;
  hand: ServerHand;
  melds: any[]; // TODO: Define meld structure when available
  is_ready: boolean;
  total_card_count: number;
}

// Client-side player representation
export interface Player {
  name: string;
  hand?: CardData[];
  isReady: boolean;
}

// Complete game session from server
export interface GameSession {
  id: string;
  host: string;
  players: {
    [key: string]: ServerPlayer;
  };
  state: string;
  phase: string;
  deck: ServerHand;
  dealer: ServerPlayer;
  current_player_index: number;
  current_turn_player: ServerPlayer;
  turn_order: ServerPlayer[];
  card_exchanges: Record<string, any>; // TODO: Define exchange structure when available
  discard_pile: ServerCard[];
  pick_priority_queue: ServerPlayer[];
  is_empty: boolean;
}

// Client-side game state
export interface GameState {
  players: Player[];
  currentTurn: string;
  phase: string;
  state: string;
  turnOrder?: string[];
  cardDrawn?: CardData;
  discardPile?: ServerCard[]
}

// Message types for game events
export interface Message {
  type: "system" | "error" | "game";
  text: string;
}

// WebSocket response types
export interface BaseResponse {
  event: string;
  message: string;
}

export interface SessionResponse extends BaseResponse {
  data: {
    session: GameSession;
  };
}

export interface PlayerReadyResponse extends BaseResponse {
  data: {
    player: {
      is_ready: boolean;
    };
  };
}

export type ServerResponse = SessionResponse | PlayerReadyResponse;
