import { Download, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api, type AppVersion } from "@/lib/api";
import { APP_VERSION, getAppPlatform, isVersionMismatch } from "@/lib/app-info";
import { notify } from "@/lib/notify";

export function AppUpdateGate() {
  const [update, setUpdate] = useState<AppVersion | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    let active = true;

    void api.app
      .latestVersion(getAppPlatform())
      .then((latest) => {
        if (active && isVersionMismatch(latest.version)) setUpdate(latest);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  if (!update) return null;

  const canDismiss = !update.force_update;
  const startUpdate = () => {
    if (!update.download_url) {
      notify.warning("更新包暂未准备完成，请稍后再试");
      return;
    }
    window.location.assign(update.download_url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-title"
      className="fixed inset-0 z-[100] grid place-items-center bg-[#020719]/65 px-5 backdrop-blur-[3px]"
    >
      <section className="w-full max-w-[340px] overflow-hidden rounded-[20px] border border-blue-200/60 bg-white shadow-[0_24px_60px_rgba(2,10,36,0.48)] rise">
        <header className="relative min-h-[142px] overflow-hidden bg-[linear-gradient(145deg,#07194b,#075cff_65%,#06369f)] px-5 pb-5 pt-4 text-white">
          <div
            className="absolute inset-0 opacity-25"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(#8ec5ff55_1px,transparent_1px),linear-gradient(90deg,#8ec5ff55_1px,transparent_1px)",
              backgroundSize: "18px 18px",
            }}
          />
          {canDismiss && (
            <button
              type="button"
              onClick={() => setUpdate(null)}
              aria-label="关闭更新提示"
              className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full border-0 bg-white/12 p-0 text-white/75 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
          <div className="relative z-10 flex items-start justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-white/30 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Sparkles size={21} />
            </span>
            <span className="rounded-full border border-cyan-200/35 bg-cyan-300/12 px-2.5 py-1 text-[8px] font-bold tracking-[0.12em] text-cyan-100">
              NEW VERSION
            </span>
          </div>
          <h2 id="update-title" className="relative z-10 mb-0 mt-4 text-[20px] font-black">
            发现新版本
          </h2>
          <p className="relative z-10 mb-0 mt-1 text-[10px] text-white/70">
            为你准备了更好的山海灵感体验
          </p>
        </header>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-2">
            <VersionCell label="当前版本" value={`v${APP_VERSION}`} muted />
            <VersionCell label="最新版本" value={`v${update.version}`} />
          </div>
          <div className="mt-4 rounded-[14px] bg-[#f4f7fb] px-3 py-3">
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#075cff]">
              <ShieldCheck size={13} />
              本次更新
            </span>
            <p className="mb-0 mt-1.5 whitespace-pre-line text-[10px] leading-5 text-slate-500">
              {update.release_notes || "优化应用体验并提升运行稳定性"}
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {canDismiss && (
              <button
                type="button"
                onClick={() => setUpdate(null)}
                className="h-10 rounded-full border border-slate-200 bg-white text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-50"
              >
                稍后再说
              </button>
            )}
            <button
              type="button"
              onClick={startUpdate}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-full border-0 bg-[#075cff] text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(7,92,255,0.3)] transition-transform active:scale-[0.98] ${canDismiss ? "" : "col-span-2"}`}
            >
              <Download size={14} />
              立即更新
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function VersionCell({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className={`rounded-[12px] px-3 py-2.5 ${muted ? "bg-slate-50" : "bg-blue-50"}`}>
      <span className="block text-[8px] text-slate-400">{label}</span>
      <b className={`mt-1 block text-[11px] ${muted ? "text-slate-500" : "text-[#075cff]"}`}>
        {value}
      </b>
    </div>
  );
}
