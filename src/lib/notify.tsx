import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api";

type NoticeKind = "success" | "error" | "warning" | "info";

const noticeTheme = {
  success: { icon: CircleCheck, iconClass: "bg-emerald-300/15 text-emerald-200" },
  error: { icon: CircleAlert, iconClass: "bg-rose-300/15 text-rose-200" },
  warning: { icon: TriangleAlert, iconClass: "bg-amber-300/15 text-amber-200" },
  info: { icon: Info, iconClass: "bg-cyan-300/15 text-cyan-200" },
} as const;

function showNotice(kind: NoticeKind, message: string) {
  const { icon: Icon, iconClass } = noticeTheme[kind];

  return toast.custom(
    (id) => (
      <article
        role={kind === "error" ? "alert" : "status"}
        className="flex w-[min(360px,calc(100vw-32px))] items-center gap-2 rounded-[14px] border border-cyan-300/25 bg-[#06183f]/95 px-3 py-2.5 text-[11px] text-white shadow-[0_12px_30px_rgba(0,0,0,0.32)] backdrop-blur-md rise"
      >
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${iconClass}`}>
          <Icon size={14} />
        </span>
        <p className="m-0 flex-1 leading-4">{message}</p>
        <button
          type="button"
          onClick={() => toast.dismiss(id)}
          aria-label="关闭提示"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-0 bg-white/10 p-0 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X size={13} />
        </button>
      </article>
    ),
    { duration: 2600 },
  );
}

export const notify = {
  success: (message: string) => showNotice("success", message),
  error: (message: string) => showNotice("error", message),
  warning: (message: string) => showNotice("warning", message),
  info: (message: string) => showNotice("info", message),
  apiError: (error: unknown) => showNotice("error", errorMessage(error)),
};
