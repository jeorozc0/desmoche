import React, { useState } from "react";
import Card from "./card";

interface CardData {
  suit: string;
  number: string;
  color: "red" | "black";
}

interface FannedCardsProps {
  cards: CardData[];
  faceDown?: boolean;
  onCardClick?: (card: CardData) => void;
}

const FannedCards: React.FC<FannedCardsProps> = ({
  cards,
  faceDown = false,
  onCardClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative w-full h-full">
      {cards.map((card, index) => {
        const rotation = (index - (cards.length - 1) / 2) * 10;
        const translateX = (index - (cards.length - 1) / 2) * 30;
        const isHovered = hoveredIndex === index;

        // Calculate hover transformation
        const hoverStyle = isHovered
          ? {
              transform: `translateX(${translateX}px) translateY(-50px) rotate(0deg) scale(1.1)`,
              zIndex: 100,
            }
          : {
              transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
              zIndex: index,
            };

        return (
          <div
            key={index}
            className={`absolute left-1/2 bottom-0 -translate-x-1/2
                       w-24 h-36 rounded-lg cursor-pointer
                       transition-all duration-200 ease-out
                       ${!faceDown ? "hover:shadow-xl" : ""}`}
            style={hoverStyle}
            onMouseEnter={() => !faceDown && setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => !faceDown && onCardClick?.(card)}
          >
            {faceDown ? (
              <div className="w-full h-full">
                <svg
                  viewBox="0 0 240 336"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <rect
                    width="240"
                    height="336"
                    rx="16"
                    fill="#2563eb"
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                  <path
                    d="M40 40 L200 296 M200 40 L40 296"
                    stroke="#1e40af"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ) : (
              <Card suit={card.suit} number={card.number} color={card.color} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FannedCards;
