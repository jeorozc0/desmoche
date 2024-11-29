import Card from "./cards";

const FannedCards = ({ cards }) => {
  return (
    <div className="flex relative">
      {cards.map((card, i) => (
        <div
          key={i}
          className="absolute transition-transform hover:-translate-y-4 cursor-pointer"
          style={{
            left: `${i * 30}px`,
            zIndex: i,
          }}
        >
          <div className="w-24 h-36">
            <Card {...card} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FannedCards;
