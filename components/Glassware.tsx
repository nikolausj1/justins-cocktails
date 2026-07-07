/**
 * Hand-drawn-feeling line illustrations of glassware, keyed off each recipe's
 * Glassware field. Stroke-only, inherits currentColor, so the same drawing works
 * on cards, detail heroes, and hover states.
 */

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const thin = { ...strokeProps, strokeWidth: 1.4 };

const DRAWINGS: Record<string, React.ReactNode> = {
  rocks: (
    <>
      <path {...strokeProps} d="M24 22 L26 74 Q26 78 31 78 L65 78 Q70 78 70 74 L72 22 Z" />
      <path {...thin} d="M27 42 L69 42" />
      {/* ice */}
      <path {...thin} d="M36 50 l11 3 -2.6 11 -11 -3 z" />
      <path {...thin} d="M52 56 l10 -2.5 2.5 10 -10 2.5 z" />
      {/* citrus wheel */}
      <circle {...thin} cx={63} cy={26} r={9} />
      <path {...thin} d="M63 17 v18 M54 26 h18 M56.6 19.6 l12.8 12.8 M69.4 19.6 L56.6 32.4" />
    </>
  ),
  coupe: (
    <>
      <path {...strokeProps} d="M22 22 L74 22 Q73 44 48 46 Q23 44 22 22 Z" />
      <path {...strokeProps} d="M48 46 L48 72" />
      <path {...strokeProps} d="M32 78 Q48 72 64 78" />
      <path {...thin} d="M26 30 L70 30" />
      {/* cherry on pick */}
      <path {...thin} d="M58 8 L44 26" />
      <circle {...thin} cx={47} cy={23} r={4} />
    </>
  ),
  martini: (
    <>
      <path {...strokeProps} d="M18 20 L78 20 L48 50 Z" />
      <path {...strokeProps} d="M48 50 L48 74" />
      <path {...strokeProps} d="M33 79 Q48 74 63 79" />
      <path {...thin} d="M26 28 L70 28" />
      {/* olive pick */}
      <path {...thin} d="M64 8 L42 34" />
      <circle {...thin} cx={48} cy={27} r={4.5} />
    </>
  ),
  collins: (
    <>
      <path {...strokeProps} d="M32 14 L34 78 Q34 81 38 81 L58 81 Q62 81 62 78 L64 14 Z" />
      <path {...thin} d="M34 30 L62 30" />
      {/* straw */}
      <path {...thin} d="M58 6 L52 40" />
      {/* bubbles */}
      <circle {...thin} cx={44} cy={44} r={2.4} />
      <circle {...thin} cx={52} cy={56} r={1.8} />
      <circle {...thin} cx={45} cy={66} r={2.2} />
    </>
  ),
  "copper-mug": (
    <>
      <path {...strokeProps} d="M24 24 L27 76 Q27 79 31 79 L63 79 Q67 79 67 76 L70 24 Z" />
      <path {...strokeProps} d="M69 34 Q84 34 82 47 Q80 59 67 58" />
      <path {...thin} d="M26 34 L68 34" />
      {/* hammered texture */}
      <circle {...thin} cx={40} cy={48} r={1.2} />
      <circle {...thin} cx={52} cy={44} r={1.2} />
      <circle {...thin} cx={46} cy={60} r={1.2} />
      <circle {...thin} cx={56} cy={66} r={1.2} />
      <circle {...thin} cx={37} cy={68} r={1.2} />
      {/* mint sprig */}
      <path {...thin} d="M45 24 Q44 14 52 10 M52 10 q6 -2 8 3 q-6 4 -8 -3 M52 10 q-7 1 -6 8 q7 0 6 -8" />
    </>
  ),
  mug: (
    <>
      <path {...strokeProps} d="M26 30 L28 76 Q28 80 33 80 L61 80 Q66 80 66 76 L68 30 Z" />
      <path {...strokeProps} d="M67 40 Q82 40 80 52 Q78 63 66 62" />
      {/* foam */}
      <path {...thin} d="M26 30 Q30 21 38 25 Q42 17 50 21 Q56 15 62 22 Q69 20 68 30" />
    </>
  ),
  flute: (
    <>
      <path {...strokeProps} d="M38 12 L40 44 Q42 54 48 54 Q54 54 56 44 L58 12 Z" />
      <path {...strokeProps} d="M48 54 L48 76" />
      <path {...strokeProps} d="M35 80 Q48 76 61 80" />
      <path {...thin} d="M39 22 L57 22" />
      <circle {...thin} cx={46} cy={32} r={1.6} />
      <circle {...thin} cx={51} cy={40} r={1.4} />
      <circle {...thin} cx={47} cy={46} r={1.2} />
    </>
  ),
  hurricane: (
    <>
      <path {...strokeProps} d="M38 10 L58 10 Q56 22 60 30 Q66 40 60 52 Q54 60 54 66 L42 66 Q42 60 36 52 Q30 40 36 30 Q40 22 38 10 Z" />
      <path {...strokeProps} d="M48 66 L48 76 M36 80 Q48 76 60 80" />
      <path {...thin} d="M37 28 Q40 21 39 14 L57 14 Q56 21 59 28" />
      {/* umbrella */}
      <path {...thin} d="M62 6 L54 20 M53 9 q9 -6 14 2 q-8 4 -14 -2" />
    </>
  ),
  wine: (
    <>
      <path {...strokeProps} d="M32 12 L64 12 Q66 34 48 40 Q30 34 32 12 Z" />
      <path {...strokeProps} d="M48 40 L48 70" />
      <path {...strokeProps} d="M34 76 Q48 70 62 76" />
      <path {...thin} d="M33 22 L63 22" />
      {/* orange slice on rim */}
      <path {...thin} d="M60 12 a8 8 0 0 1 8 -8 l0 8 z" />
    </>
  ),
  "beer-bottle": (
    <>
      <path {...strokeProps} d="M42 8 L54 8 L54 26 Q60 34 60 44 L60 76 Q60 80 56 80 L40 80 Q36 80 36 76 L36 44 Q36 34 42 26 Z" />
      <path {...thin} d="M42 8 L54 8 L54 13 L42 13 Z" />
      <path {...thin} d="M36 50 L60 50 M36 64 L60 64" />
      {/* citrus wedge in neck */}
      <path {...thin} d="M44 22 q4 -5 8 0" />
    </>
  ),
  bottle: (
    <>
      <path {...strokeProps} d="M42 6 L54 6 L54 22 Q62 28 62 38 L62 76 Q62 80 58 80 L38 80 Q34 80 34 76 L34 38 Q34 28 42 22 Z" />
      <path {...thin} d="M40 6 L56 6" />
      <path {...thin} d="M34 44 L62 44 L62 66 L34 66 Z" />
      <path {...thin} d="M40 52 L56 52 M40 58 L50 58" />
    </>
  ),
  misc: (
    <>
      {/* cobbler shaker */}
      <path {...strokeProps} d="M40 6 L56 6 L58 14 L38 14 Z" />
      <path {...strokeProps} d="M36 14 L60 14 L58 26 L38 26 Z" />
      <path {...strokeProps} d="M34 26 L62 26 L58 78 Q58 81 54 81 L42 81 Q38 81 38 78 Z" />
      <path {...thin} d="M36 38 L60 38" />
    </>
  ),
};

export function Glassware({
  keyName,
  className,
}: {
  keyName: string;
  className?: string;
}) {
  const drawing = DRAWINGS[keyName] ?? DRAWINGS.misc;
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" className={className}>
      {drawing}
    </svg>
  );
}
