import {
  Inbox
} from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  compact = false
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact
          ? "px-5 py-10"
          : "px-6 py-16"
      }`}
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-forest-900/10 bg-mist text-forest-900/40">
        <Icon
          size={23}
        />
      </div>

      <h3 className="mt-5 font-semibold text-forest-950">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-forest-900/50">
        {description}
      </p>

      {actionLabel &&
        onAction && (
          <button
            type="button"
            onClick={
              onAction
            }
            className="mt-5 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-800"
          >
            {
              actionLabel
            }
          </button>
        )}
    </div>
  );
}