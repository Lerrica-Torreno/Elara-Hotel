export default function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft ${className}`}>
      {(title || action) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-forest-950">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-forest-900/55">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
