import { CardData } from "../types";

export function getSuitSymbol(suitName: string): string {
  switch (suitName) {
    case "Hearts": return "♥";
    case "Diamonds": return "♦";
    case "Clubs": return "♣";
    case "Spades": return "♠";
    default: return "♠";
  }
}

export function convertServerCards(cards: string[]): CardData[] {
  return cards.map((cardStr) => {
    const [number, , suit] = cardStr.split(" ");
    return {
      number,
      suit: getSuitSymbol(suit),
      color: suit === "Hearts" || suit === "Diamonds" ? "red" : "black",
    };
  });
}
