import { CardData, ServerCard } from "../types";

export function getSuitSymbol(suitName: string): string {
  switch (suitName) {
    case "Hearts": return "♥";
    case "Diamonds": return "♦";
    case "Clubs": return "♣";
    case "Spades": return "♠";
    default: return suitName;
  }
}

export function getSuitName(symbol: string): string {
  switch (symbol) {
    case "♥": return "Hearts";
    case "♦": return "Diamonds";
    case "♣": return "Clubs";
    case "♠": return "Spades";
    default: return symbol;
  }
}

export function convertServerCards(cards: ServerCard[]): CardData[] {
  return cards.map((card) => ({
    suit: getSuitSymbol(card.suit),
    number: card.rank,
    color: card.color.toLowerCase() as "red" | "black"
  }));
}
