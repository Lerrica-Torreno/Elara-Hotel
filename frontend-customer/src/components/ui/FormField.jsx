export default function FormField({ id, label, hint, error, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-forest-950">
        {label}
      </label>
      {typeof children === "function" ? children({ describedBy }) : children}
      {hint && <p id={hintId} className="mt-1.5 text-xs text-forest-900/55">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-semibold text-red-700">
          Error: {error}
        </p>
      )}
    </div>
  );
}
