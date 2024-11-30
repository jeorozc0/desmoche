export interface Player {
  name: string;
  hand?: string[];
}

export interface GameState {
  players: Player[];
  currentTurn: string;
  phase: string;
  dealer?: string;
  turnOrder?: string[];
}

export interface Message {
  type: "system" | "error" | "game";
  text: string;
}

export interface GameMessage {
  action: string;
  message?: string;
  player?: string;
  players?: Player[];
  dealer?: string;
  turn_order?: string[];
  error?: string;
}
