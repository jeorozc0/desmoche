import React, { useState, useEffect } from "react";
import Card from "./card";
import { CardData } from "../../types";

interface FannedCardsProps {
  cards: CardData[];
  faceDown?: boolean;
  onCardClick?: (card: CardData, index: number) => void;
  removedCardIndex?: number;
  selectedCardIndices?: number[];  // Added this prop to the interface
}

const FannedCards: React.FC<FannedCardsProps> = ({
  cards,
  faceDown = false,
  onCardClick,
  removedCardIndex,
  selectedCardIndices = []
}) => {
  const [isHandHovered, setIsHandHovered] = useState(false);
  const [animatingCards, setAnimatingCards] = useState<CardData[]>(cards);
  const baseSpacing = 25;
  const expandedSpacing = 60;

  useEffect(() => {
    setAnimatingCards(cards);
  }, [cards]);

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => !faceDown && setIsHandHovered(true)}
      onMouseLeave={() => setIsHandHovered(false)}
    >
      {animatingCards.map((card, index) => {
        const spacing = isHandHovered ? expandedSpacing : baseSpacing;
        const translateX = (index - (animatingCards.length - 1) / 2) * spacing;
        const rotation = (index - (animatingCards.length - 1) / 2) * 3;
        const isRemoving = index === removedCardIndex;
        const isSelected = selectedCardIndices.includes(index);

        const style = {
          transform: `translateX(${translateX}px) rotate(${rotation}deg) ${isRemoving ? 'scale(0) translateY(-100px)' : ''
            }`,
          zIndex: index,
          transition: 'all 0.5s ease-out',
          opacity: isRemoving ? 0 : 1,
        };

        return (
          <div
            key={`${card.suit}-${card.number}-${index}`}
            className={`absolute left-1/2 bottom-0 -translate-x-1/2
                       w-32 h-48 rounded-lg 
                       ${!faceDown && !isRemoving ? "hover:-translate-y-8" : ""}
                       ${isSelected ? "ring-2 ring-yellow-400" : ""}
                       transition-all duration-200 ease-out`}
            style={style}
            onClick={() => !faceDown && !isRemoving && onCardClick?.(card, index)}
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
