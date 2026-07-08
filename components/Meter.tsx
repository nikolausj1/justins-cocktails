/**
 * Drawn 1-10 meter replacing the vault's emoji scales. Values arrive 0-10
 * (Butterbeer uses annotated zeroes); dots fill up to the value.
 */
export function Meter({
  label,
  lowWord,
  highWord,
  value,
}: {
  label: string;
  lowWord: string;
  highWord: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</span>
        <span className="text-[11px] text-ink-soft">
          {lowWord} <span aria-hidden="true">–</span> {highWord}
        </span>
      </div>
      <div
        className="mt-1.5 flex items-center gap-[5px]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-label={`${label}: ${value} of 10 (${lowWord} to ${highWord})`}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={`h-[9px] w-[9px] rounded-full border ${
              i < value ? "bg-fir border-fir" : "border-ink-soft/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
