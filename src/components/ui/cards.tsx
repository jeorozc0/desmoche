const Card = ({ suit = "♠", number = "A", color = "black" }) => {
  return (
    <div className="w-full h-full aspect-[3/4] hover:scale-110">
      <svg
        viewBox="0 0 240 336"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect
          width="240"
          height="336"
          rx="16"
          fill="white"
          stroke="#000"
          strokeWidth="2"
        />

        <text x="20" y="40" fontSize="32" fill={color} className="select-none">
          {number}
        </text>
        <text x="20" y="80" fontSize="32" fill={color} className="select-none">
          {suit}
        </text>

        <text
          x="120"
          y="168"
          fontSize="96"
          fill={color}
          textAnchor="middle"
          className="select-none"
        >
          {suit}
        </text>

        <g transform="rotate(180 120 168)">
          <text x="20" y="40" fontSize="32" fill={color} className="select-none">
            {number}
          </text>
          <text x="20" y="80" fontSize="32" fill={color} className="select-none">
            {suit}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Card;
