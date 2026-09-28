import {
  useEffect,
  useRef
} from "react";

import {
  X
} from "lucide-react";

export default function Modal({
  open,
  title,
  children,
  onClose,
  size = "md"
}) {
  const closeButtonRef =
    useRef(null);

  /*
   * Keep the latest onClose callback
   * without causing the modal effect
   * to rerun every time the parent renders.
   */
  const onCloseRef =
    useRef(onClose);

  useEffect(() => {
    onCloseRef.current =
      onClose;
  }, [onClose]);

  const sizes = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * Focus only ONCE when the modal
     * first opens.
     *
     * Previously this happened after
     * every keystroke because onClose
     * changed on every render.
     */
    const focusTimer =
      window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onCloseRef.current?.();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      window.clearTimeout(
        focusTimer
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function handleBackdropClick(
    event
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      onCloseRef.current?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-forest-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={
        handleBackdropClick
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={`my-auto max-h-[90vh] w-full overflow-y-auto rounded-[2rem] border border-forest-900/10 bg-white shadow-2xl ${
          sizes[size] ||
          sizes.md
        }`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-forest-900/10 bg-white px-6 py-5 md:px-8">
          <h2
            id="admin-modal-title"
            className="text-xl font-semibold tracking-tight text-forest-950"
          >
            {title}
          </h2>

          <button
            ref={
              closeButtonRef
            }
            type="button"
            onClick={() =>
              onCloseRef.current?.()
            }
            aria-label="Close dialog"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-forest-900/10 bg-white text-forest-900/45 transition hover:bg-mist hover:text-forest-950"
          >
            <X
              size={18}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="px-6 pb-6 pt-5 md:px-8 md:pb-8">
          {children}
        </div>
      </section>
    </div>
  );
}