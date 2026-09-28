const tones = {
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  amber:
    "border-amber-200 bg-amber-50 text-amber-800",

  red:
    "border-red-200 bg-red-50 text-red-700",

  blue:
    "border-blue-200 bg-blue-50 text-blue-700",

  gray:
    "border-slate-200 bg-slate-50 text-slate-700",

  gold:
    "border-gold/30 bg-gold/10 text-forest-900"
};

export default function Badge({
  children,
  tone = "gray"
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}