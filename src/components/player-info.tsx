import { User } from "lucide-react";
import React from 'react';

interface PlayerInfoProps {
  name: string;
  className?: string;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({ name, className }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <User className="w-12 h-12 text-white" />
    <div className="mt-2 bg-white/20 rounded-lg px-3 py-1">
      <span className="text-white whitespace-nowrap">{name}</span>
    </div>
  </div>
);
