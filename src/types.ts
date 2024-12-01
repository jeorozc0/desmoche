export interface CardData {
  suit: string;
  number: string;
  color: "red" | "black";
}

export interface Player {
  name: string;
  hand?: CardData[];
  ready?: boolean;
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
