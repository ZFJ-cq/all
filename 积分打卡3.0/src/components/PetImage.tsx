import type { PetSpecies } from '@/types';
import PetIllustration, { PetIllustrationSmall } from '@/components/PetIllustration';

interface PetImageProps {
  species: PetSpecies;
  size?: number;
  className?: string;
  mood?: 'happy' | 'normal' | 'sad';
}

export default function PetImage({ species, size = 120, className = '', mood = 'normal' }: PetImageProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#FFF3E8] overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <PetIllustration species={species} size={size} mood={mood} />
    </div>
  );
}

// 小尺寸版本
export function PetImageSmall({ species, size = 32, className = '', mood = 'normal' }: { species: PetSpecies; size?: number; className?: string; mood?: 'happy' | 'normal' | 'sad' }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#FFF3E8] overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <PetIllustrationSmall species={species} size={size} mood={mood} />
    </div>
  );
}
