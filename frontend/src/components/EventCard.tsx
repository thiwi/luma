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
    className="card w-full text-center space-y-2 transition-transform hover:shadow-key active:scale-95"
    onClick={onSendEnergy}
  >
    <span className="text-4xl block">{symbol}</span>
    <p className="card-title">{text}</p>
  </button>
);
