export default function PageHeader({
  eyebrow,
  title,
  description,
  action
}) {
  return (
    <header className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            {eyebrow}
          </p>
        )}

        <h1 className="text-2xl font-bold tracking-tight text-forest-950 md:text-3xl">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-forest-900/50">
          {description}
        </p>
      </div>

      {action}
    </header>
  );
}
