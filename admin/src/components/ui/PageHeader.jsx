export default function PageHeader({ title, description, action }) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest-950 md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-forest-900/60">{description}</p>
      </div>
      {action}
    </header>
  );
}
