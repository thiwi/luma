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
    className="card w-full text-left flex items-center space-x-3 transition-transform hover:shadow-key active:scale-95"
    onClick={onSendEnergy}
  >
    <span className="text-3xl">{symbol}</span>
    <div className="flex-1">
      <p className="card-title text-left">{text}</p>
      <p className="card-subtext text-left">
        {Math.ceil(expiresIn / 60)}m left
      </p>
    </div>
  </button>
);
