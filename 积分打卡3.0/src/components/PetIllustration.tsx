import type { PetSpecies } from '@/types';

interface PetIllustrationProps {
  species: PetSpecies;
  size?: number;
  mood?: 'happy' | 'normal' | 'sad';
  className?: string;
}

/* ───────── shared defs (gradients / filters) ───────── */
function SharedDefs() {
  return (
    <defs>
      {/* soft shadow */}
      <filter id="petShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000022" />
      </filter>
      {/* sparkle highlight */}
      <filter id="petGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* cheek blush */}
      <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FF8A9E" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FF8A9E" stopOpacity="0" />
      </radialGradient>
      {/* eye highlight */}
      <radialGradient id="eyeShine" cx="35%" cy="30%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* ───────── mood helpers ───────── */
function EyeGroup({ cx, cy, r = 7, mood }: { cx: number; cy: number; r?: number; mood: string }) {
  if (mood === 'happy') {
    return (
      <g>
        <path
          d={`M${cx - r},${cy} Q${cx},${cy - r * 1.2} ${cx + r},${cy}`}
          fill="none"
          stroke="#3E2723"
          strokeWidth={r * 0.55}
          strokeLinecap="round"
        />
        {/* sparkle */}
        <circle cx={cx + r * 0.3} cy={cy - r * 0.5} r={r * 0.25} fill="#FFF" opacity={0.9} />
      </g>
    );
  }
  if (mood === 'sad') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r * 0.85} ry={r * 0.7} fill="#3E2723" />
        <ellipse cx={cx} cy={cy} rx={r * 0.5} ry={r * 0.45} fill="#1A1A2E" />
        <ellipse cx={cx - r * 0.2} cy={cy - r * 0.2} rx={r * 0.3} ry={r * 0.25} fill="url(#eyeShine)" />
        {/* sad brow */}
        <path
          d={`M${cx - r * 0.9},${cy - r * 1.5} Q${cx},${cy - r * 2.2} ${cx + r * 0.9},${cy - r * 1.2}`}
          fill="none"
          stroke="#5D4037"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* tear */}
        <ellipse cx={cx + r * 0.6} cy={cy + r * 0.8} rx={1.5} ry={2.5} fill="#64B5F6" opacity={0.7} />
      </g>
    );
  }
  // normal
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.05} fill="#3E2723" />
      <ellipse cx={cx} cy={cy + r * 0.1} rx={r * 0.6} ry={r * 0.55} fill="#1A1A2E" />
      <ellipse cx={cx - r * 0.25} cy={cy - r * 0.25} rx={r * 0.35} ry={r * 0.3} fill="url(#eyeShine)" />
      <circle cx={cx + r * 0.3} cy={cy + r * 0.2} r={r * 0.15} fill="#FFF" opacity={0.6} />
    </g>
  );
}

function MouthGroup({ cx, cy, mood }: { cx: number; cy: number; mood: string }) {
  if (mood === 'happy') {
    return (
      <g>
        <path
          d={`M${cx - 6},${cy} Q${cx},${cy + 8} ${cx + 6},${cy}`}
          fill="#FF8A80"
          stroke="#5D4037"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <path
          d={`M${cx - 5},${cy + 0.5} Q${cx},${cy + 5} ${cx + 5},${cy + 0.5}`}
          fill="#E57373"
        />
      </g>
    );
  }
  if (mood === 'sad') {
    return (
      <path
        d={`M${cx - 5},${cy + 3} Q${cx},${cy - 2} ${cx + 5},${cy + 3}`}
        fill="none"
        stroke="#5D4037"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    );
  }
  return (
    <g>
      <path
        d={`M${cx - 4},${cy} Q${cx},${cy + 4} ${cx + 4},${cy}`}
        fill="none"
        stroke="#5D4037"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </g>
  );
}

function CheekBlush({ x, y, r = 8 }: { x: number; y: number; r?: number }) {
  return <ellipse cx={x} cy={y} rx={r} ry={r * 0.65} fill="url(#blushGrad)" />;
}

/* ═══════════════════════════════════════════════════════
   PET RENDERERS — each returns a <g> with viewBox 0 0 200 200
   ═══════════════════════════════════════════════════════ */

function CatSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="catBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFD4A8" />
          <stop offset="100%" stopColor="#FF9A56" />
        </radialGradient>
        <radialGradient id="catBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFF3E0" />
          <stop offset="100%" stopColor="#FFE4C4" />
        </radialGradient>
      </defs>
      {/* tail */}
      <path d="M140,145 Q170,120 160,85 Q155,70 165,60" fill="none" stroke="#FF9A56" strokeWidth={8} strokeLinecap="round" />
      <path d="M140,145 Q170,120 160,85 Q155,70 165,60" fill="none" stroke="#FFD4A8" strokeWidth={4} strokeLinecap="round" />
      {/* body */}
      <ellipse cx="100" cy="140" rx="48" ry="42" fill="url(#catBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="148" rx="30" ry="25" fill="url(#catBelly)" />
      {/* paws */}
      <ellipse cx="72" cy="172" rx="14" ry="8" fill="#FF9A56" />
      <ellipse cx="128" cy="172" rx="14" ry="8" fill="#FF9A56" />
      <ellipse cx="72" cy="172" rx="8" ry="4" fill="#FFE4C4" />
      <ellipse cx="128" cy="172" rx="8" ry="4" fill="#FFE4C4" />
      {/* head */}
      <ellipse cx="100" cy="90" rx="42" ry="40" fill="url(#catBody)" filter="url(#petShadow)" />
      {/* ears */}
      <path d="M65,68 L55,30 L82,58 Z" fill="#FF9A56" />
      <path d="M135,68 L145,30 L118,58 Z" fill="#FF9A56" />
      <path d="M68,64 L60,38 L80,58 Z" fill="#FFB6C1" />
      <path d="M132,64 L140,38 L120,58 Z" fill="#FFB6C1" />
      {/* face */}
      <ellipse cx="100" cy="100" rx="28" ry="22" fill="#FFE4C4" opacity={0.5} />
      {/* eyes */}
      <EyeGroup cx={82} cy={85} r={7} mood={mood} />
      <EyeGroup cx={118} cy={85} r={7} mood={mood} />
      {/* nose */}
      <ellipse cx={100} cy={97} rx={4} ry={3} fill="#FF8A80" />
      {/* whiskers */}
      <line x1="60" y1="92" x2="78" y2="95" stroke="#D7CCC8" strokeWidth={1.2} />
      <line x1="58" y1="98" x2="78" y2="98" stroke="#D7CCC8" strokeWidth={1.2} />
      <line x1="60" y1="104" x2="78" y2="101" stroke="#D7CCC8" strokeWidth={1.2} />
      <line x1="140" y1="92" x2="122" y2="95" stroke="#D7CCC8" strokeWidth={1.2} />
      <line x1="142" y1="98" x2="122" y2="98" stroke="#D7CCC8" strokeWidth={1.2} />
      <line x1="140" y1="104" x2="122" y2="101" stroke="#D7CCC8" strokeWidth={1.2} />
      {/* mouth */}
      <MouthGroup cx={100} cy={103} mood={mood} />
      {/* blush */}
      <CheekBlush x={72} y={98} r={9} />
      <CheekBlush x={128} y={98} r={9} />
      {/* bow tie */}
      <path d="M88,122 L100,128 L112,122 L100,130 Z" fill="#FF5252" />
      <circle cx="100" cy="125" r={3} fill="#D32F2F" />
      <path d="M88,122 L80,118 L88,128 Z" fill="#FF5252" />
      <path d="M112,122 L120,118 L112,128 Z" fill="#FF5252" />
      {/* sparkle */}
      <g filter="url(#petGlow)" opacity={0.8}>
        <path d="M155,55 L157,50 L159,55 L164,57 L159,59 L157,64 L155,59 L150,57 Z" fill="#FFD54F" />
      </g>
    </g>
  );
}

function DogSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="dogBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#E8C36A" />
          <stop offset="100%" stopColor="#D4A44C" />
        </radialGradient>
        <radialGradient id="dogBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFF8E1" />
          <stop offset="100%" stopColor="#FFE4C4" />
        </radialGradient>
      </defs>
      {/* tail */}
      <path d="M142,130 Q165,100 158,75" fill="none" stroke="#D4A44C" strokeWidth={8} strokeLinecap="round" />
      {/* body */}
      <ellipse cx="100" cy="142" rx="48" ry="40" fill="url(#dogBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="150" rx="30" ry="24" fill="url(#dogBelly)" />
      {/* paws */}
      <ellipse cx="70" cy="174" rx="15" ry="9" fill="#D4A44C" />
      <ellipse cx="130" cy="174" rx="15" ry="9" fill="#D4A44C" />
      <ellipse cx="70" cy="175" rx="9" ry={4} fill="#FFE4C4" />
      <ellipse cx="130" cy="175" rx="9" ry={4} fill="#FFE4C4" />
      {/* head */}
      <ellipse cx="100" cy="88" rx="44" ry="42" fill="url(#dogBody)" filter="url(#petShadow)" />
      {/* floppy ears */}
      <ellipse cx="56" cy="88" rx="18" ry="32" fill="#8B6914" transform="rotate(-15,56,88)" />
      <ellipse cx="56" cy="90" rx="12" ry="24" fill="#A0792C" transform="rotate(-15,56,90)" />
      <ellipse cx="144" cy="88" rx="18" ry="32" fill="#8B6914" transform="rotate(15,144,88)" />
      <ellipse cx="144" cy="90" rx="12" ry="24" fill="#A0792C" transform="rotate(15,144,90)" />
      {/* face patch */}
      <ellipse cx="100" cy="98" rx="26" ry="20" fill="#FFF8E1" opacity={0.6} />
      {/* eyes */}
      <EyeGroup cx={82} cy={82} r={7} mood={mood} />
      <EyeGroup cx={118} cy={82} r={7} mood={mood} />
      {/* nose */}
      <ellipse cx={100} cy={96} rx={6} ry={4.5} fill="#3E2723" />
      <ellipse cx={98} cy={95} rx={2} ry={1.2} fill="#5D4037" opacity={0.5} />
      {/* mouth */}
      <MouthGroup cx={100} cy={104} mood={mood} />
      {mood === 'happy' && (
        <path d="M94,104 Q100,112 106,104" fill="#FF8A80" stroke="none" />
      )}
      {/* tongue */}
      {mood === 'happy' && (
        <g>
          <ellipse cx={104} cy={112} rx={5} ry={7} fill="#FF8A80" />
          <line x1={104} y1={108} x2={104} y2={116} stroke="#E57373" strokeWidth={0.8} />
        </g>
      )}
      {/* blush */}
      <CheekBlush x={72} y={96} r={9} />
      <CheekBlush x={128} y={96} r={9} />
      {/* bandana */}
      <path d="M70,118 Q100,132 130,118 L125,130 Q100,140 75,130 Z" fill="#2196F3" />
      <path d="M85,130 L80,148 L90,138 Z" fill="#2196F3" />
      <path d="M115,130 L120,148 L110,138 Z" fill="#2196F3" />
      <circle cx="100" cy="126" r={3} fill="#1565C0" />
      {/* bone */}
      <g transform="translate(148,65) rotate(25)">
        <rect x={-2} y={-8} width={4} height={16} rx={2} fill="#FFF8E1" />
        <circle cx={-3} cy={-8} r={3} fill="#FFF8E1" />
        <circle cx={3} cy={-8} r={3} fill="#FFF8E1" />
        <circle cx={-3} cy={8} r={3} fill="#FFF8E1" />
        <circle cx={3} cy={8} r={3} fill="#FFF8E1" />
      </g>
    </g>
  );
}

function RabbitSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="rabbitBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F0F0" />
        </radialGradient>
        <radialGradient id="rabbitEar" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#FF8A9E" />
        </radialGradient>
      </defs>
      {/* tail puff */}
      <circle cx={140} cy={148} r={12} fill="#FFF" opacity={0.9} />
      <circle cx={145} cy={144} r={8} fill="#FFF" opacity={0.7} />
      {/* body */}
      <ellipse cx="100" cy="142" rx="46" ry="40" fill="url(#rabbitBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="150" rx="28" ry="22" fill="#FFF5F5" />
      {/* paws */}
      <ellipse cx={72} cy={174} rx={14} ry={8} fill="#F5F0F0" />
      <ellipse cx={128} cy={174} rx={14} ry={8} fill="#F5F0F0" />
      <ellipse cx={72} cy={175} rx={8} ry={4} fill="#FFB6C1" opacity={0.4} />
      <ellipse cx={128} cy={175} rx={8} ry={4} fill="#FFB6C1" opacity={0.4} />
      {/* head */}
      <ellipse cx="100" cy="88" rx="40" ry="38" fill="url(#rabbitBody)" filter="url(#petShadow)" />
      {/* long ears */}
      <ellipse cx={78} cy={38} rx={14} ry={38} fill="#F5F0F0" />
      <ellipse cx={78} cy={38} rx={9} ry={30} fill="url(#rabbitEar)" />
      <ellipse cx={122} cy={38} rx={14} ry={38} fill="#F5F0F0" />
      <ellipse cx={122} cy={38} rx={9} ry={30} fill="url(#rabbitEar)" />
      {/* face */}
      <ellipse cx={100} cy={98} rx={24} ry={18} fill="#FFF5F5" opacity={0.5} />
      {/* eyes */}
      <EyeGroup cx={82} cy={84} r={7} mood={mood} />
      <EyeGroup cx={118} cy={84} r={7} mood={mood} />
      {/* nose */}
      <ellipse cx={100} cy={95} rx={4} ry={3} fill="#FF8A9E" />
      {/* whiskers */}
      <line x1="62" y1="92" x2="78" y2="95" stroke="#E0E0E0" strokeWidth={1} />
      <line x1="62" y1="98" x2="78" y2="98" stroke="#E0E0E0" strokeWidth={1} />
      <line x1="138" y1="92" x2="122" y2="95" stroke="#E0E0E0" strokeWidth={1} />
      <line x1="138" y1="98" x2="122" y2="98" stroke="#E0E0E0" strokeWidth={1} />
      {/* mouth */}
      <MouthGroup cx={100} cy={101} mood={mood} />
      {/* blush */}
      <CheekBlush x={72} y={96} r={9} />
      <CheekBlush x={128} y={96} r={9} />
      {/* carrot accessory */}
      <g transform="translate(150,70) rotate(20)">
        <path d="M0,0 L6,-25 L12,0 Z" fill="#FF7043" />
        <path d="M3,-25 L6,-35 L9,-25" fill="#66BB6A" />
        <path d="M1,-24 L-3,-32 L5,-26" fill="#81C784" />
        <path d="M11,-24 L15,-32 L7,-26" fill="#81C784" />
        <line x1={3} y1={-5} x2={9} y2={-8} stroke="#E64A19" strokeWidth={0.8} />
        <line x1={2} y1={-12} x2={10} y2={-15} stroke="#E64A19" strokeWidth={0.8} />
      </g>
      {/* heart */}
      <g filter="url(#petGlow)" opacity={0.7}>
        <path d="M155,50 C155,47 158,44 161,47 C164,44 167,47 167,50 C167,54 161,58 161,58 C161,58 155,54 155,50Z" fill="#FF8A80" />
      </g>
    </g>
  );
}

function HamsterSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="hamsterBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFF0D0" />
          <stop offset="100%" stopColor="#E8C36A" />
        </radialGradient>
        <radialGradient id="hamsterBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF8E1" />
        </radialGradient>
      </defs>
      {/* body - very round */}
      <ellipse cx="100" cy="130" rx="52" ry="48" fill="url(#hamsterBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="140" rx="34" ry="30" fill="url(#hamsterBelly)" />
      {/* tiny paws */}
      <ellipse cx={68} cy={168} rx={12} ry={7} fill="#E8C36A" />
      <ellipse cx={132} cy={168} rx={12} ry={7} fill="#E8C36A" />
      <ellipse cx={68} cy={169} rx={7} ry={3.5} fill="#FFF0D0" />
      <ellipse cx={132} cy={169} rx={7} ry={3.5} fill="#FFF0D0" />
      {/* head */}
      <ellipse cx="100" cy="82" rx="44" ry="40" fill="url(#hamsterBody)" filter="url(#petShadow)" />
      {/* round ears */}
      <circle cx={60} cy={58} r={16} fill="#E8C36A" />
      <circle cx={60} cy={58} r={10} fill="#FFB6C1" />
      <circle cx={140} cy={58} r={16} fill="#E8C36A" />
      <circle cx={140} cy={58} r={10} fill="#FFB6C1" />
      {/* chubby cheeks */}
      <ellipse cx={68} cy={92} rx={18} ry={14} fill="#FFF0D0" opacity={0.7} />
      <ellipse cx={132} cy={92} rx={18} ry={14} fill="#FFF0D0" opacity={0.7} />
      {/* eyes */}
      <EyeGroup cx={84} cy={80} r={6.5} mood={mood} />
      <EyeGroup cx={116} cy={80} r={6.5} mood={mood} />
      {/* nose */}
      <ellipse cx={100} cy={90} rx={3.5} ry={2.5} fill="#FF8A80" />
      {/* mouth */}
      <MouthGroup cx={100} cy={96} mood={mood} />
      {/* blush */}
      <CheekBlush x={72} y={92} r={10} />
      <CheekBlush x={128} y={92} r={10} />
      {/* sunflower seed */}
      <g transform="translate(148,120) rotate(30)">
        <ellipse cx={0} cy={0} rx={4} ry={8} fill="#5D4037" />
        <line x1={-1} y1={-6} x2={1} y2={6} stroke="#4E342E" strokeWidth={0.6} />
        <ellipse cx={0} cy={-8} rx={2.5} ry={2} fill="#8D6E63" />
      </g>
      {/* sparkles */}
      <g filter="url(#petGlow)" opacity={0.7}>
        <path d="M50,40 L51.5,36 L53,40 L57,41.5 L53,43 L51.5,47 L50,43 L46,41.5 Z" fill="#FFD54F" />
      </g>
    </g>
  );
}

function FishSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="fishBody" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#81D4FA" />
          <stop offset="100%" stopColor="#4FC3F7" />
        </radialGradient>
        <linearGradient id="fishTail" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF7043" />
          <stop offset="100%" stopColor="#FFAB91" />
        </linearGradient>
      </defs>
      {/* bubbles */}
      <circle cx={145} cy={55} r={4} fill="#B3E5FC" opacity={0.6} />
      <circle cx={155} cy={42} r={3} fill="#B3E5FC" opacity={0.5} />
      <circle cx={150} cy={30} r={2} fill="#B3E5FC" opacity={0.4} />
      {/* tail */}
      <path d="M140,100 Q170,75 165,60 Q155,80 140,85 Z" fill="url(#fishTail)" />
      <path d="M140,100 Q170,125 165,140 Q155,120 140,115 Z" fill="url(#fishTail)" />
      {/* body */}
      <ellipse cx="95" cy="100" rx="55" ry="38" fill="url(#fishBody)" filter="url(#petShadow)" />
      {/* belly */}
      <ellipse cx="90" cy="110" rx="38" ry="18" fill="#E1F5FE" opacity={0.6} />
      {/* scales pattern */}
      <path d="M75,88 Q80,82 85,88" fill="none" stroke="#29B6F6" strokeWidth={0.8} opacity={0.5} />
      <path d="M85,88 Q90,82 95,88" fill="none" stroke="#29B6F6" strokeWidth={0.8} opacity={0.5} />
      <path d="M95,88 Q100,82 105,88" fill="none" stroke="#29B6F6" strokeWidth={0.8} opacity={0.5} />
      <path d="M80,96 Q85,90 90,96" fill="none" stroke="#29B6F6" strokeWidth={0.8} opacity={0.5} />
      <path d="M90,96 Q95,90 100,96" fill="none" stroke="#29B6F6" strokeWidth={0.8} opacity={0.5} />
      <path d="M100,96 Q105,90 110,96" fill="none" stroke="#29B6F6" strokeWidth={0.8} opacity={0.5} />
      {/* dorsal fin */}
      <path d="M80,65 Q95,40 110,65" fill="#FF7043" />
      <path d="M85,65 Q95,48 105,65" fill="#FFAB91" />
      {/* pectoral fin */}
      <path d="M70,105 Q55,120 65,130 Q72,118 75,110 Z" fill="#FF7043" opacity={0.8} />
      {/* eyes */}
      <EyeGroup cx={62} cy={92} r={7} mood={mood} />
      {/* mouth */}
      {mood === 'happy' ? (
        <path d="M42,100 Q46,106 42,108" fill="none" stroke="#5D4037" strokeWidth={1.5} strokeLinecap="round" />
      ) : mood === 'sad' ? (
        <path d="M42,104 Q46,100 42,98" fill="none" stroke="#5D4037" strokeWidth={1.5} strokeLinecap="round" />
      ) : (
        <path d="M42,100 Q47,103 42,105" fill="none" stroke="#5D4037" strokeWidth={1.5} strokeLinecap="round" />
      )}
      {/* blush */}
      <CheekBlush x={55} y={104} r={8} />
      {/* crown */}
      <g transform="translate(80,52)">
        <path d="M-8,8 L-6,-2 L0,4 L6,-2 L8,8 Z" fill="#FFD54F" />
        <circle cx={-6} cy={-2} r={2} fill="#FF7043" />
        <circle cx={0} cy={3} r={2} fill="#4FC3F7" />
        <circle cx={6} cy={-2} r={2} fill="#FF7043" />
      </g>
      {/* star */}
      <g filter="url(#petGlow)" opacity={0.7}>
        <path d="M155,75 L156.5,71 L158,75 L162,76.5 L158,78 L156.5,82 L155,78 L151,76.5 Z" fill="#FFD54F" />
      </g>
    </g>
  );
}

function BirdSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="birdBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="100%" stopColor="#EF5350" />
        </radialGradient>
        <radialGradient id="birdBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="100%" stopColor="#FFD54F" />
        </radialGradient>
      </defs>
      {/* tail feathers */}
      <path d="M130,135 Q155,120 160,140 Q150,130 145,140 Z" fill="#EF5350" />
      <path d="M128,140 Q158,130 162,150 Q148,138 142,148 Z" fill="#C62828" />
      <path d="M132,130 Q150,115 155,130 Q148,122 142,132 Z" fill="#FF8A80" />
      {/* body */}
      <ellipse cx="100" cy="120" rx="42" ry="40" fill="url(#birdBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="130" rx="28" ry="24" fill="url(#birdBelly)" />
      {/* wing */}
      <path d="M60,110 Q40,95 55,130 Q65,115 70,120 Z" fill="#C62828" />
      <path d="M62,112 Q48,100 58,128 Q66,116 68,118 Z" fill="#EF5350" opacity={0.6} />
      {/* feet */}
      <g transform="translate(85,158)">
        <line x1={0} y1={0} x2={-5} y2={12} stroke="#FF8F00" strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={13} stroke="#FF8F00" strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={0} x2={5} y2={12} stroke="#FF8F00" strokeWidth={2} strokeLinecap="round" />
      </g>
      <g transform="translate(115,158)">
        <line x1={0} y1={0} x2={-5} y2={12} stroke="#FF8F00" strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={13} stroke="#FF8F00" strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={0} x2={5} y2={12} stroke="#FF8F00" strokeWidth={2} strokeLinecap="round" />
      </g>
      {/* head */}
      <ellipse cx="100" cy="78" rx="36" ry="34" fill="url(#birdBody)" filter="url(#petShadow)" />
      {/* eyes */}
      <EyeGroup cx={86} cy={74} r={7} mood={mood} />
      <EyeGroup cx={114} cy={74} r={7} mood={mood} />
      {/* beak */}
      <path d="M96,86 L100,96 L104,86 Z" fill="#FF8F00" />
      <path d="M98,86 L100,92 L102,86 Z" fill="#FFB300" />
      {/* blush */}
      <CheekBlush x={76} y={84} r={8} />
      <CheekBlush x={124} y={84} r={8} />
      {/* top feathers */}
      <path d="M95,48 Q98,35 100,45 Q102,35 105,48" fill="#C62828" />
      <path d="M97,48 Q99,38 101,47 Q103,38 104,48" fill="#FF8A80" />
      {/* sailor hat */}
      <g transform="translate(100,42)">
        <ellipse cx={0} cy={0} rx={22} ry={5} fill="#1565C0" />
        <path d="M-14,0 L-10,-18 L10,-18 L14,0 Z" fill="#1976D2" />
        <rect x={-10} y={-18} width={20} height={3} fill="#FFF" />
      </g>
      {/* musical notes */}
      <g opacity={0.6}>
        <text x={148} y={60} fontSize={14} fill="#FFD54F">♪</text>
        <text x={158} y={48} fontSize={10} fill="#FFD54F">♫</text>
      </g>
    </g>
  );
}

function DragonSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="dragonBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#CE93D8" />
          <stop offset="100%" stopColor="#9C27B0" />
        </radialGradient>
        <radialGradient id="dragonBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#C8E6C9" />
          <stop offset="100%" stopColor="#A5D6A7" />
        </radialGradient>
      </defs>
      {/* tail */}
      <path d="M138,145 Q165,150 170,130 Q172,120 178,118" fill="none" stroke="#9C27B0" strokeWidth={8} strokeLinecap="round" />
      <path d="M175,115 L182,118 L175,122 Z" fill="#66BB6A" />
      {/* body */}
      <ellipse cx="100" cy="140" rx="48" ry="42" fill="url(#dragonBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="148" rx="30" ry="26" fill="url(#dragonBelly)" />
      {/* belly scales */}
      <path d="M85,140 Q90,136 95,140" fill="none" stroke="#81C784" strokeWidth={0.8} opacity={0.6} />
      <path d="M95,140 Q100,136 105,140" fill="none" stroke="#81C784" strokeWidth={0.8} opacity={0.6} />
      <path d="M105,140 Q110,136 115,140" fill="none" stroke="#81C784" strokeWidth={0.8} opacity={0.6} />
      {/* paws */}
      <ellipse cx={70} cy={174} rx={14} ry={8} fill="#9C27B0" />
      <ellipse cx={130} cy={174} rx={14} ry={8} fill="#9C27B0" />
      {/* claws */}
      <path d="M62,174 L58,170 M66,174 L62,168 M70,174 L66,170" stroke="#66BB6A" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M122,174 L118,170 M126,174 L122,168 M130,174 L126,170" stroke="#66BB6A" strokeWidth={1.5} strokeLinecap="round" />
      {/* wings */}
      <path d="M55,115 Q25,80 40,60 Q50,75 60,90 Q55,70 70,55 Q72,80 68,100 Z" fill="#BA68C8" opacity={0.8} />
      <path d="M145,115 Q175,80 160,60 Q150,75 140,90 Q145,70 130,55 Q128,80 132,100 Z" fill="#BA68C8" opacity={0.8} />
      {/* head */}
      <ellipse cx="100" cy="85" rx="42" ry="40" fill="url(#dragonBody)" filter="url(#petShadow)" />
      {/* horns */}
      <path d="M70,58 Q62,35 68,28" fill="none" stroke="#66BB6A" strokeWidth={5} strokeLinecap="round" />
      <path d="M130,58 Q138,35 132,28" fill="none" stroke="#66BB6A" strokeWidth={5} strokeLinecap="round" />
      <circle cx={68} cy={26} r={4} fill="#81C784" />
      <circle cx={132} cy={26} r={4} fill="#81C784" />
      {/* face */}
      <ellipse cx={100} cy={95} rx={26} ry={20} fill="#C8E6C9" opacity={0.4} />
      {/* eyes */}
      <EyeGroup cx={82} cy={80} r={7} mood={mood} />
      <EyeGroup cx={118} cy={80} r={7} mood={mood} />
      {/* nostrils */}
      <ellipse cx={94} cy={94} rx={2.5} ry={2} fill="#7B1FA2" />
      <ellipse cx={106} cy={94} rx={2.5} ry={2} fill="#7B1FA2" />
      {/* mouth */}
      {mood === 'happy' ? (
        <path d="M88,100 Q100,110 112,100" fill="#FF8A80" stroke="#5D4037" strokeWidth={1} />
      ) : mood === 'sad' ? (
        <path d="M90,104 Q100,98 110,104" fill="none" stroke="#5D4037" strokeWidth={1.5} strokeLinecap="round" />
      ) : (
        <path d="M90,100 Q100,105 110,100" fill="none" stroke="#5D4037" strokeWidth={1.5} strokeLinecap="round" />
      )}
      {/* blush */}
      <CheekBlush x={72} y={92} r={9} />
      <CheekBlush x={128} y={92} r={9} />
      {/* tiny crown */}
      <g transform="translate(100,38)">
        <path d="M-12,8 L-10,-5 L-4,3 L0,-8 L4,3 L10,-5 L12,8 Z" fill="#FFD54F" />
        <rect x={-12} y={8} width={24} height={4} rx={1} fill="#FFC107" />
        <circle cx={0} cy={-8} r={2.5} fill="#FF7043" />
        <circle cx={-10} cy={-5} r={2} fill="#4FC3F7" />
        <circle cx={10} cy={-5} r={2} fill="#4FC3F7" />
      </g>
      {/* fire breath hint */}
      {mood === 'happy' && (
        <g opacity={0.7}>
          <path d="M88,102 Q82,108 78,105 Q80,100 85,98" fill="#FF7043" opacity={0.6} />
          <path d="M112,102 Q118,108 122,105 Q120,100 115,98" fill="#FF7043" opacity={0.6} />
        </g>
      )}
      {/* sparkles */}
      <g filter="url(#petGlow)" opacity={0.6}>
        <path d="M45,45 L46.5,41 L48,45 L52,46.5 L48,48 L46.5,52 L45,48 L41,46.5 Z" fill="#FFD54F" />
      </g>
    </g>
  );
}

function TurtleSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="turtleShell" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="100%" stopColor="#6D4C41" />
        </radialGradient>
        <radialGradient id="turtleBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#A5D6A7" />
          <stop offset="100%" stopColor="#66BB6A" />
        </radialGradient>
      </defs>
      {/* shell pattern */}
      <ellipse cx="100" cy="120" rx="52" ry="40" fill="url(#turtleShell)" filter="url(#petShadow)" />
      {/* shell hexagon pattern */}
      <path d="M100,88 L115,98 L115,118 L100,128 L85,118 L85,98 Z" fill="#795548" opacity={0.5} />
      <path d="M100,92 L112,100 L112,116 L100,124 L88,116 L88,100 Z" fill="#8D6E63" opacity={0.4} />
      <path d="M72,105 L85,98 L85,118 L72,125 Z" fill="#795548" opacity={0.4} />
      <path d="M128,105 L115,98 L115,118 L128,125 Z" fill="#795548" opacity={0.4} />
      {/* shell highlight */}
      <ellipse cx="95" cy="105" rx="18" ry="10" fill="#A1887F" opacity={0.3} />
      {/* head */}
      <ellipse cx="100" cy="72" rx="30" ry="28" fill="url(#turtleBody)" />
      {/* eyes */}
      <EyeGroup cx={88} cy={68} r={6} mood={mood} />
      <EyeGroup cx={112} cy={68} r={6} mood={mood} />
      {/* mouth */}
      <MouthGroup cx={100} cy={80} mood={mood} />
      {/* blush */}
      <CheekBlush x={78} y={76} r={7} />
      <CheekBlush x={122} y={76} r={7} />
      {/* legs */}
      <ellipse cx={58} cy={140} rx={14} ry={10} fill="#66BB6A" />
      <ellipse cx={142} cy={140} rx={14} ry={10} fill="#66BB6A" />
      <ellipse cx={65} cy={155} rx={10} ry={8} fill="#66BB6A" />
      <ellipse cx={135} cy={155} rx={10} ry={8} fill="#66BB6A" />
      {/* toe details */}
      <circle cx={50} cy={142} r={3} fill="#A5D6A7" />
      <circle cx={56} cy={145} r={3} fill="#A5D6A7" />
      <circle cx={62} cy={145} r={3} fill="#A5D6A7" />
      <circle cx={138} cy={142} r={3} fill="#A5D6A7" />
      <circle cx={144} cy={145} r={3} fill="#A5D6A7" />
      <circle cx={150} cy={142} r={3} fill="#A5D6A7" />
      {/* tail */}
      <path d="M100,158 Q105,168 100,172 Q95,168 100,158" fill="#66BB6A" />
      {/* glasses */}
      <circle cx={88} cy={68} r={10} fill="none" stroke="#5D4037" strokeWidth={2} />
      <circle cx={112} cy={68} r={10} fill="none" stroke="#5D4037" strokeWidth={2} />
      <line x1={98} y1={68} x2={102} y2={68} stroke="#5D4037" strokeWidth={2} />
      <line x1={78} y1={66} x2={72} y2={62} stroke="#5D4037" strokeWidth={1.5} />
      <line x1={122} y1={66} x2={128} y2={62} stroke="#5D4037" strokeWidth={1.5} />
      {/* book */}
      <g transform="translate(148,100) rotate(15)">
        <rect x={-10} y={-12} width={20} height={24} rx={2} fill="#1565C0" />
        <rect x={-8} y={-10} width={16} height={20} rx={1} fill="#E3F2FD" />
        <line x1={-5} y1={-5} x2={5} y2={-5} stroke="#90CAF9" strokeWidth={1} />
        <line x1={-5} y1={-1} x2={5} y2={-1} stroke="#90CAF9" strokeWidth={1} />
        <line x1={-5} y1={3} x2={3} y2={3} stroke="#90CAF9" strokeWidth={1} />
      </g>
    </g>
  );
}

function PenguinSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="penguinBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#546E7A" />
          <stop offset="100%" stopColor="#37474F" />
        </radialGradient>
        <radialGradient id="penguinBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#ECEFF1" />
        </radialGradient>
      </defs>
      {/* body */}
      <ellipse cx="100" cy="128" rx="44" ry="50" fill="url(#penguinBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="135" rx="30" ry="35" fill="url(#penguinBelly)" />
      {/* flippers */}
      <path d="M56,110 Q38,130 48,155 Q55,140 60,125 Z" fill="#37474F" />
      <path d="M144,110 Q162,130 152,155 Q145,140 140,125 Z" fill="#37474F" />
      {/* feet */}
      <ellipse cx={82} cy={175} rx={16} ry={6} fill="#FF8F00" />
      <ellipse cx={118} cy={175} rx={16} ry={6} fill="#FF8F00" />
      {/* head */}
      <ellipse cx="100" cy="72" rx="38" ry="36" fill="url(#penguinBody)" />
      {/* white face patch */}
      <ellipse cx="100" cy="76" rx="26" ry="22" fill="#ECEFF1" />
      {/* eyes */}
      <EyeGroup cx={86} cy={70} r={6.5} mood={mood} />
      <EyeGroup cx={114} cy={70} r={6.5} mood={mood} />
      {/* beak */}
      <path d="M94,80 L100,90 L106,80 Z" fill="#FF8F00" />
      <path d="M97,80 L100,86 L103,80 Z" fill="#FFB300" />
      {/* blush */}
      <CheekBlush x={76} y={78} r={8} />
      <CheekBlush x={124} y={78} r={8} />
      {/* bow tie */}
      <path d="M88,98 L100,104 L112,98 L100,106 Z" fill="#F44336" />
      <circle cx={100} cy={101} r={3} fill="#C62828" />
      <path d="M88,98 L80,94 L88,104 Z" fill="#F44336" />
      <path d="M112,98 L120,94 L112,104 Z" fill="#F44336" />
      {/* snowflake */}
      <g filter="url(#petGlow)" opacity={0.7}>
        <path d="M155,55 L156.5,50 L158,55 L163,56.5 L158,58 L156.5,63 L155,58 L150,56.5 Z" fill="#B3E5FC" />
      </g>
      <g filter="url(#petGlow)" opacity={0.5}>
        <path d="M45,45 L46,42 L47,45 L50,46 L47,47 L46,50 L45,47 L42,46 Z" fill="#B3E5FC" />
      </g>
    </g>
  );
}

function FoxSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="foxBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFAB91" />
          <stop offset="100%" stopColor="#FF7043" />
        </radialGradient>
        <radialGradient id="foxBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF3E0" />
        </radialGradient>
      </defs>
      {/* fluffy tail */}
      <path d="M135,140 Q170,120 165,90 Q160,75 155,80 Q158,95 150,110 Q145,120 135,130 Z" fill="#FF7043" />
      <path d="M135,140 Q160,125 158,100 Q155,90 150,95 Q152,108 145,120 Q140,128 135,135 Z" fill="#FFF" opacity={0.8} />
      <path d="M155,80 Q160,70 155,65 Q150,68 152,78 Z" fill="#FFF" />
      {/* body */}
      <ellipse cx="100" cy="140" rx="46" ry="38" fill="url(#foxBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="148" rx="28" ry="22" fill="url(#foxBelly)" />
      {/* paws */}
      <ellipse cx={72} cy={172} rx={13} ry={8} fill="#FF7043" />
      <ellipse cx={128} cy={172} rx={13} ry={8} fill="#FF7043" />
      <ellipse cx={72} cy={173} rx={8} ry={4} fill="#FFF3E0" />
      <ellipse cx={128} cy={173} rx={8} ry={4} fill="#FFF3E0" />
      {/* head */}
      <ellipse cx="100" cy="85" rx="42" ry="38" fill="url(#foxBody)" filter="url(#petShadow)" />
      {/* pointy ears */}
      <path d="M65,65 L50,25 L80,55 Z" fill="#FF7043" />
      <path d="M135,65 L150,25 L120,55 Z" fill="#FF7043" />
      <path d="M68,60 L55,32 L78,54 Z" fill="#FFF3E0" />
      <path d="M132,60 L145,32 L122,54 Z" fill="#FFF3E0" />
      {/* white face */}
      <path d="M75,80 Q100,65 125,80 Q120,105 100,110 Q80,105 75,80 Z" fill="#FFF3E0" />
      {/* eyes */}
      <EyeGroup cx={84} cy={82} r={6.5} mood={mood} />
      <EyeGroup cx={116} cy={82} r={6.5} mood={mood} />
      {/* nose */}
      <ellipse cx={100} cy={94} rx={4} ry={3} fill="#3E2723" />
      <ellipse cx={99} cy={93} rx={1.5} ry={1} fill="#5D4037" opacity={0.4} />
      {/* mouth */}
      <MouthGroup cx={100} cy={100} mood={mood} />
      {/* blush */}
      <CheekBlush x={74} y={92} r={8} />
      <CheekBlush x={126} y={92} r={8} />
      {/* scarf */}
      <path d="M68,112 Q100,122 132,112 L128,124 Q100,134 72,124 Z" fill="#4CAF50" />
      <path d="M100,124 L95,148 L108,148 L103,124 Z" fill="#4CAF50" />
      <path d="M95,148 L92,155 L100,152 L108,155 L105,148 Z" fill="#388E3C" />
      <line x1={95} y1={130} x2={103} y2={130} stroke="#388E3C" strokeWidth={0.8} />
      <line x1={94} y1={136} x2={104} y2={136} stroke="#388E3C" strokeWidth={0.8} />
      <line x1={93} y1={142} x2={105} y2={142} stroke="#388E3C" strokeWidth={0.8} />
      {/* leaf */}
      <g transform="translate(155,68) rotate(30)">
        <path d="M0,0 Q8,-8 0,-16 Q-8,-8 0,0 Z" fill="#66BB6A" />
        <line x1={0} y1={-1} x2={0} y2={-14} stroke="#4CAF50" strokeWidth={0.8} />
      </g>
    </g>
  );
}

function BearSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="bearBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#A1887F" />
          <stop offset="100%" stopColor="#8D6E63" />
        </radialGradient>
        <radialGradient id="bearBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#EFEBE9" />
          <stop offset="100%" stopColor="#D7CCC8" />
        </radialGradient>
      </defs>
      {/* body */}
      <ellipse cx="100" cy="140" rx="50" ry="44" fill="url(#bearBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="148" rx="32" ry="28" fill="url(#bearBelly)" />
      {/* paws */}
      <ellipse cx={66} cy={174} rx={16} ry={10} fill="#8D6E63" />
      <ellipse cx={134} cy={174} rx={16} ry={10} fill="#8D6E63" />
      {/* paw pads */}
      <ellipse cx={66} cy={175} rx={9} ry={5} fill="#D7CCC8" />
      <ellipse cx={134} cy={175} rx={9} ry={5} fill="#D7CCC8" />
      <circle cx={60} cy={173} r={3} fill="#BCAAA4" />
      <circle cx={66} cy={171} r={3} fill="#BCAAA4" />
      <circle cx={72} cy={173} r={3} fill="#BCAAA4" />
      <circle cx={128} cy={173} r={3} fill="#BCAAA4" />
      <circle cx={134} cy={171} r={3} fill="#BCAAA4" />
      <circle cx={140} cy={173} r={3} fill="#BCAAA4" />
      {/* head */}
      <ellipse cx="100" cy="82" rx="44" ry="42" fill="url(#bearBody)" filter="url(#petShadow)" />
      {/* round ears */}
      <circle cx={60} cy={52} r={18} fill="#8D6E63" />
      <circle cx={60} cy={52} r={11} fill="#BCAAA4" />
      <circle cx={140} cy={52} r={18} fill="#8D6E63" />
      <circle cx={140} cy={52} r={11} fill="#BCAAA4" />
      {/* muzzle */}
      <ellipse cx={100} cy={94} rx={22} ry={16} fill="#D7CCC8" />
      {/* eyes */}
      <EyeGroup cx={82} cy={78} r={7} mood={mood} />
      <EyeGroup cx={118} cy={78} r={7} mood={mood} />
      {/* nose */}
      <ellipse cx={100} cy={90} rx={6} ry={4.5} fill="#3E2723" />
      <ellipse cx={98} cy={89} rx={2} ry={1.2} fill="#5D4037" opacity={0.4} />
      {/* mouth */}
      <MouthGroup cx={100} cy={97} mood={mood} />
      {/* blush */}
      <CheekBlush x={72} y={92} r={9} />
      <CheekBlush x={128} y={92} r={9} />
      {/* honey pot */}
      <g transform="translate(148,105) rotate(15)">
        <path d="M-10,0 Q-12,8 -10,16 Q0,20 10,16 Q12,8 10,0 Z" fill="#FF8F00" />
        <path d="M-8,2 Q0,0 8,2 Q6,8 0,8 Q-6,8 -8,2 Z" fill="#FFB300" />
        <rect x={-12} y={-2} width={24} height={4} rx={2} fill="#6D4C41" />
        {/* honey drip */}
        <path d="M-4,16 Q-3,22 -5,24" fill="none" stroke="#FFB300" strokeWidth={2} strokeLinecap="round" />
      </g>
      {/* bees */}
      <g opacity={0.7}>
        <ellipse cx={42} cy={42} rx={5} ry={4} fill="#FFD54F" />
        <line x1={38} y1={42} x2={46} y2={42} stroke="#3E2723" strokeWidth={0.8} />
        <line x1={38} y1={40} x2={46} y2={40} stroke="#3E2723" strokeWidth={0.8} />
        <ellipse cx={38} cy={38} rx={4} ry={2.5} fill="#FFF" opacity={0.6} transform="rotate(-30,38,38)" />
      </g>
    </g>
  );
}

function DeerSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="deerBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#BCAAA4" />
          <stop offset="100%" stopColor="#A1887F" />
        </radialGradient>
        <radialGradient id="deerBelly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFF8E1" />
          <stop offset="100%" stopColor="#FFE0B2" />
        </radialGradient>
      </defs>
      {/* tail */}
      <ellipse cx={142} cy={128} rx={8} ry={5} fill="#A1887F" />
      {/* body */}
      <ellipse cx="100" cy="140" rx="46" ry="38" fill="url(#deerBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="148" rx="28" ry="22" fill="url(#deerBelly)" />
      {/* spots on body */}
      <circle cx={80} cy={130} r={4} fill="#D7CCC8" opacity={0.5} />
      <circle cx={95} cy={125} r={3} fill="#D7CCC8" opacity={0.5} />
      <circle cx={115} cy={132} r={3.5} fill="#D7CCC8" opacity={0.5} />
      <circle cx={108} cy={122} r={2.5} fill="#D7CCC8" opacity={0.5} />
      {/* legs */}
      <rect x={72} y={162} width={8} height={18} rx={4} fill="#A1887F" />
      <rect x={120} y={162} width={8} height={18} rx={4} fill="#A1887F" />
      <ellipse cx={76} cy={180} rx={6} ry={3} fill="#8D6E63" />
      <ellipse cx={124} cy={180} rx={6} ry={3} fill="#8D6E63" />
      {/* head */}
      <ellipse cx="100" cy="82" rx="38" ry="36" fill="url(#deerBody)" filter="url(#petShadow)" />
      {/* antlers */}
      <g stroke="#6D4C41" strokeWidth={3.5} fill="none" strokeLinecap="round">
        <path d="M75,55 Q68,30 60,22" />
        <path d="M68,38 Q58,32 52,28" />
        <path d="M65,30 Q72,22 70,15" />
        <path d="M125,55 Q132,30 140,22" />
        <path d="M132,38 Q142,32 148,28" />
        <path d="M135,30 Q128,22 130,15" />
      </g>
      {/* antler tips */}
      <circle cx={60} cy={20} r={3} fill="#8D6E63" />
      <circle cx={52} cy={26} r={2.5} fill="#8D6E63" />
      <circle cx={70} cy={13} r={2.5} fill="#8D6E63" />
      <circle cx={140} cy={20} r={3} fill="#8D6E63" />
      <circle cx={148} cy={26} r={2.5} fill="#8D6E63" />
      <circle cx={130} cy={13} r={2.5} fill="#8D6E63" />
      {/* ears */}
      <ellipse cx={65} cy={62} rx={10} ry={16} fill="#A1887F" transform="rotate(-15,65,62)" />
      <ellipse cx={65} cy={62} rx={6} ry={11} fill="#FFB6C1" opacity={0.5} transform="rotate(-15,65,62)" />
      <ellipse cx={135} cy={62} rx={10} ry={16} fill="#A1887F" transform="rotate(15,135,62)" />
      <ellipse cx={135} cy={62} rx={6} ry={11} fill="#FFB6C1" opacity={0.5} transform="rotate(15,135,62)" />
      {/* face */}
      <ellipse cx={100} cy={92} rx={20} ry={14} fill="#FFF8E1" opacity={0.5} />
      {/* eyes */}
      <EyeGroup cx={84} cy={78} r={7} mood={mood} />
      <EyeGroup cx={116} cy={78} r={7} mood={mood} />
      {/* nose */}
      <ellipse cx={100} cy={90} rx={4} ry={3} fill="#5D4037" />
      {/* mouth */}
      <MouthGroup cx={100} cy={96} mood={mood} />
      {/* blush */}
      <CheekBlush x={74} y={88} r={8} />
      <CheekBlush x={126} y={88} r={8} />
      {/* flower crown */}
      <g>
        <circle cx={80} cy={52} r={5} fill="#FF8A80" />
        <circle cx={80} cy={52} r={2.5} fill="#FFD54F" />
        <circle cx={92} cy={48} r={5} fill="#CE93D8" />
        <circle cx={92} cy={48} r={2.5} fill="#FFF" />
        <circle cx={108} cy={48} r={5} fill="#81D4FA" />
        <circle cx={108} cy={48} r={2.5} fill="#FFF" />
        <circle cx={120} cy={52} r={5} fill="#FF8A80" />
        <circle cx={120} cy={52} r={2.5} fill="#FFD54F" />
        <path d="M80,52 Q92,45 108,45 Q120,52 120,52" fill="none" stroke="#66BB6A" strokeWidth={2} />
      </g>
      {/* butterfly */}
      <g transform="translate(150,60)" opacity={0.8}>
        <ellipse cx={-4} cy={-3} rx={5} ry={4} fill="#CE93D8" transform="rotate(-20)" />
        <ellipse cx={4} cy={-3} rx={5} ry={4} fill="#CE93D8" transform="rotate(20)" />
        <ellipse cx={-3} cy={3} rx={3.5} ry={3} fill="#BA68C8" transform="rotate(10)" />
        <ellipse cx={3} cy={3} rx={3.5} ry={3} fill="#BA68C8" transform="rotate(-10)" />
        <ellipse cx={0} cy={0} rx={1.5} ry={4} fill="#4A148C" />
      </g>
    </g>
  );
}

function UnicornSVG({ mood }: { mood: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="unicornBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8F0FF" />
        </radialGradient>
        <linearGradient id="rainbowMane" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="20%" stopColor="#FFD54F" />
          <stop offset="40%" stopColor="#66BB6A" />
          <stop offset="60%" stopColor="#42A5F5" />
          <stop offset="80%" stopColor="#7E57C2" />
          <stop offset="100%" stopColor="#EC407A" />
        </linearGradient>
        <linearGradient id="rainbowHorn" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="50%" stopColor="#FFF8E1" />
          <stop offset="100%" stopColor="#FFD54F" />
        </linearGradient>
        <linearGradient id="rainbowTail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="25%" stopColor="#FFD54F" />
          <stop offset="50%" stopColor="#66BB6A" />
          <stop offset="75%" stopColor="#42A5F5" />
          <stop offset="100%" stopColor="#CE93D8" />
        </linearGradient>
      </defs>
      {/* rainbow tail */}
      <path d="M135,135 Q165,110 170,85 Q168,100 160,115 Q165,90 158,70 Q155,90 148,108 Q155,80 145,60 Q142,85 138,110 Z" fill="url(#rainbowTail)" opacity={0.9} />
      {/* body */}
      <ellipse cx="100" cy="140" rx="46" ry="40" fill="url(#unicornBody)" filter="url(#petShadow)" />
      <ellipse cx="100" cy="148" rx="28" ry="24" fill="#FFF" opacity={0.6} />
      {/* legs */}
      <rect x={74} y={166} width={8} height={16} rx={4} fill="#F8F0FF" />
      <rect x={118} y={166} width={8} height={16} rx={4} fill="#F8F0FF" />
      <ellipse cx={78} cy={182} rx={6} ry={3} fill="#E1BEE7" />
      <ellipse cx={122} cy={182} rx={6} ry={3} fill="#E1BEE7" />
      {/* head */}
      <ellipse cx="100" cy="82" rx="40" ry="38" fill="url(#unicornBody)" filter="url(#petShadow)" />
      {/* horn */}
      <path d="M95,52 L100,18 L105,52" fill="url(#rainbowHorn)" />
      <line x1={96} y1={45} x2={104} y2={45} stroke="#FFD54F" strokeWidth={0.8} opacity={0.6} />
      <line x1={97} y1={38} x2={103} y2={38} stroke="#FFD54F" strokeWidth={0.8} opacity={0.6} />
      <line x1={98} y1={31} x2={102} y2={31} stroke="#FFD54F" strokeWidth={0.8} opacity={0.6} />
      {/* horn glow */}
      <circle cx={100} cy={18} r={5} fill="#FFD54F" opacity={0.3} filter="url(#petGlow)" />
      {/* ears */}
      <path d="M70,60 L62,38 L80,55 Z" fill="#F8F0FF" />
      <path d="M72,58 L66,42 L78,55 Z" fill="#F3E5F5" />
      <path d="M130,60 L138,38 L120,55 Z" fill="#F8F0FF" />
      <path d="M128,58 L134,42 L122,55 Z" fill="#F3E5F5" />
      {/* rainbow mane */}
      <path d="M72,60 Q60,72 55,88 Q58,75 68,65 Z" fill="#FF8A80" />
      <path d="M68,65 Q55,78 52,95 Q56,80 64,70 Z" fill="#FFD54F" />
      <path d="M64,70 Q50,85 50,100 Q54,88 60,76 Z" fill="#66BB6A" />
      <path d="M60,76 Q48,92 50,108 Q52,95 58,82 Z" fill="#42A5F5" />
      <path d="M58,82 Q46,98 48,115 Q50,102 55,90 Z" fill="#CE93D8" />
      {/* eyes */}
      <EyeGroup cx={84} cy={80} r={7} mood={mood} />
      <EyeGroup cx={116} cy={80} r={7} mood={mood} />
      {/* nose */}
      <ellipse cx={100} cy={92} rx={3.5} ry={2.5} fill="#E1BEE7" />
      {/* mouth */}
      <MouthGroup cx={100} cy={98} mood={mood} />
      {/* blush */}
      <CheekBlush x={74} y={90} r={9} />
      <CheekBlush x={126} y={90} r={9} />
      {/* stars and sparkles */}
      <g filter="url(#petGlow)" opacity={0.8}>
        <path d="M45,35 L46.5,30 L48,35 L53,36.5 L48,38 L46.5,43 L45,38 L40,36.5 Z" fill="#FFD54F" />
        <path d="M155,45 L156,42 L157,45 L160,46 L157,47 L156,50 L155,47 L152,46 Z" fill="#CE93D8" />
        <path d="M50,100 L51,97 L52,100 L55,101 L52,102 L51,105 L50,102 L47,101 Z" fill="#81D4FA" />
      </g>
      {/* necklace */}
      <path d="M78,110 Q100,118 122,110" fill="none" stroke="#E1BEE7" strokeWidth={2} />
      <circle cx={100} cy={116} r={4} fill="#CE93D8" />
      <path d="M97,116 L100,110 L103,116 L100,122 Z" fill="#F48FB1" />
    </g>
  );
}

/* ───────── pet map ───────── */
const petRenderers: Record<PetSpecies, (props: { mood: string }) => JSX.Element> = {
  cat: CatSVG,
  dog: DogSVG,
  rabbit: RabbitSVG,
  hamster: HamsterSVG,
  fish: FishSVG,
  bird: BirdSVG,
  dragon: DragonSVG,
  turtle: TurtleSVG,
  penguin: PenguinSVG,
  fox: FoxSVG,
  bear: BearSVG,
  deer: DeerSVG,
  unicorn: UnicornSVG,
};

/* ═══════════════════════════════════════════════════════
   EXPORTED COMPONENTS
   ═══════════════════════════════════════════════════════ */

export default function PetIllustration({
  species,
  size = 120,
  mood = 'normal',
  className = '',
}: PetIllustrationProps) {
  const PetSVG = petRenderers[species];
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SharedDefs />
      <PetSVG mood={mood} />
    </svg>
  );
}

export function PetIllustrationSmall({
  species,
  size = 32,
  mood = 'normal',
  className = '',
}: PetIllustrationProps) {
  return (
    <PetIllustration
      species={species}
      size={size}
      mood={mood}
      className={className}
    />
  );
}
