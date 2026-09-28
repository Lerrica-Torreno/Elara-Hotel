export default function FormField({
  id,
  label,
  hint,
  error,
  children
}) {
  const hintId =
    hint
      ? `${id}-hint`
      : undefined;

  const errorId =
    error
      ? `${id}-error`
      : undefined;

  const describedBy =
    [
      hintId,
      errorId
    ]
      .filter(Boolean)
      .join(" ") ||
    undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-forest-950"
      >
        {label}
      </label>

      {typeof children ===
      "function"
        ? children({
            describedBy
          })
        : children}

      {hint && (
        <p
          id={hintId}
          className="mt-1.5 text-xs leading-5 text-forest-900/45"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-xs font-semibold text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}