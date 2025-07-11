import { FC } from 'react';

interface EventCardProps {
  symbol: string;
  text: string;
  expiresIn: number;
  onSendEnergy: () => void;
}

export const EventCard: FC<EventCardProps> = ({
  symbol,
  text,
  expiresIn,
  onSendEnergy,
}) => (
  <button
    className="rounded-md shadow-ambient hover:shadow-key bg-dawnSand dark:bg-nightBlue/20 p-6 w-full text-left flex items-center space-x-3 transition-shadow"
    onClick={onSendEnergy}
  >
    <span className="text-3xl">{symbol}</span>
    <div className="flex-1">
      <p className="font-semibold">{text}</p>
      <p className="text-xs opacity-70">{Math.ceil(expiresIn / 60)}m left</p>
    </div>
  </button>
);
