import Card from './card';
import { CardData } from '../../types';
import { X } from 'lucide-react';

interface SelectedAreaProps {
  selectedCards: CardData[];
  onCardRemove: (index: number) => void;
  onCreateMeld?: () => void;
}

const SelectedArea: React.FC<SelectedAreaProps> = ({
  selectedCards,
  onCardRemove,
  onCreateMeld
}) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 min-h-[12rem]">
      {selectedCards.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-white/50">Click cards to add them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {selectedCards.map((card, index) => (
              <div
                key={`${card.suit}-${card.number}-${index}`}
                className="relative w-32 group shrink-0"
              >
                <button
                  onClick={() => onCardRemove(index)}
                  className="absolute -top-2 -right-2 z-10 bg-red-500 rounded-full p-1
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <Card suit={card.suit} number={card.number} color={card.color} />
              </div>
            ))}
          </div>

          {selectedCards.length >= 3 && (
            <button
              onClick={onCreateMeld}
              className="w-full bg-blue-600 text-white py-2 rounded-lg
                       hover:bg-blue-700 transition-colors"
            >
              Create Meld
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectedArea;
