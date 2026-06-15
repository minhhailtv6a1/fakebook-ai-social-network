import type { ToastType } from "@/lib/types";

export interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastState | null;
  visible: boolean;
}

export default function Toast({ toast, visible }: ToastProps) {
  if (!toast) {
    return null;
  }

  const tone =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-600"
      : toast.type === "error"
        ? "border-red-200 bg-red-600"
        : "border-blue-200 bg-[#1877f2]";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 top-4 z-[200] w-[calc(100%-2rem)] max-w-sm rounded-xl border px-4 py-3 text-sm font-semibold text-white shadow-2xl transition-all duration-300 sm:right-6 sm:top-6 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      } ${tone}`}
    >
      {toast.message}
    </div>
  );
}
