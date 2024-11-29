import { User } from "lucide-react";
import FannedCards from "./ui/fanned-cards";

const GameTable = () => {
  // Sample cards for testing
  const currentPlayerCards = [
    { suit: "♠", number: "A", color: "black" },
    { suit: "♥", number: "K", color: "red" },
    { suit: "♦", number: "Q", color: "red" },
    { suit: "♣", number: "J", color: "black" },
  ];

  const centerCards = [
    { suit: "♠", number: "10", color: "black" },
    { suit: "♥", number: "9", color: "red" },
  ];

  return (
    <div className="w-full h-screen bg-green-800 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-square bg-green-700 rounded-full shadow-xl">
        {/* Top player */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <User className="w-12 h-12 text-white" />
          <div className="mt-2 bg-white/20 rounded-lg px-3 py-1">
            <span className="text-white">5 cards</span>
          </div>
        </div>

        {/* Left player */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
          <User className="w-12 h-12 text-white" />
          <div className="ml-2 bg-white/20 rounded-lg px-3 py-1">
            <span className="text-white">3 cards</span>
          </div>
        </div>

        {/* Right player */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
          <div className="mr-2 bg-white/20 rounded-lg px-3 py-1">
            <span className="text-white">4 cards</span>
          </div>
          <User className="w-12 h-12 text-white" />
        </div>

        {/* Center table cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-48 h-48 bg-green-600/50 rounded-full flex items-center justify-center">
            <div className="w-32 h-36 relative">
              <FannedCards cards={centerCards} />
            </div>
          </div>
        </div>

        {/* Current player's cards */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-64 h-36">
            <FannedCards cards={currentPlayerCards} />
          </div>
          <div className="mt-2 bg-white/20 rounded-lg px-3 py-1">
            <span className="text-white">Your turn</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTable;
