import { FC } from 'react';

interface EventCardProps {
  text: string;
  expiresIn: number;
  onSendEnergy: () => void;
}

export const EventCard: FC<EventCardProps> = ({
  text,
  expiresIn,
  onSendEnergy,
}) => (
  <button
    className="card w-full aspect-square mx-2 text-center space-y-2 transition-transform hover:shadow-key active:scale-95"
    onClick={onSendEnergy}
  >
    <p className="card-title">{text}</p>
  </button>
);
