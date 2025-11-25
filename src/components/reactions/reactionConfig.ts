import type { ReactionType } from '@/app/api/books/[slug]/reactions/route';

export interface ReactionMeta {
  type: ReactionType;
  label: string; // Display name
  image: string; // public path
  color: string; // Tailwind color classes
  hover: string; // Tailwind hover color classes
  ring: string;  // ring color when selected
}

export const reactionMetas: ReactionMeta[] = [
  {
    type: 'ANGER',
    label: 'Raiva',
    image: '/img/mascot/reactions/angry.png',
    color: 'bg-red-600/20',
    hover: 'hover:bg-red-600/40',
    ring: 'ring-red-500'
  },
  {
    type: 'FEAR',
    label: 'Susto',
    image: '/img/mascot/reactions/fear.png',
    color: 'bg-violet-600/20',
    hover: 'hover:bg-violet-600/40',
    ring: 'ring-violet-500'
  },
  {
    type: 'SADNESS',
    label: 'Tristeza',
    image: '/img/mascot/reactions/sadness.png',
    color: 'bg-indigo-600/20',
    hover: 'hover:bg-indigo-600/40',
    ring: 'ring-indigo-500'
  },
  {
    type: 'JOY',
    label: 'Alegria',
    image: '/img/mascot/reactions/happiness.png',
    color: 'bg-yellow-400/30',
    hover: 'hover:bg-yellow-400/50',
    ring: 'ring-yellow-400'
  },
  {
    type: 'LOVE',
    label: 'Amor',
    image: '/img/mascot/reactions/love.png',
    color: 'bg-pink-600/30',
    hover: 'hover:bg-pink-600/50',
    ring: 'ring-pink-500'
  }
];

export function emptyCounts(): Record<ReactionType, number> {
  return reactionMetas.reduce<Record<ReactionType, number>>((acc, m) => { acc[m.type] = 0; return acc; }, {} as Record<ReactionType, number>);
}
