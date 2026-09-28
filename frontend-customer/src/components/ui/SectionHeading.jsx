export default function SectionHeading({ eyebrow, title, description, align = "left" }) {
  const centered = align === "center";

  return (
    <header className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest-950 md:text-4xl">{title}</h2>
      {description && <p className="mt-4 leading-7 text-forest-900/65">{description}</p>}
    </header>
  );
}
