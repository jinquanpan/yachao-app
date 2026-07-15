import { RefreshCw, WifiOff } from "lucide-react";
import { errorMessage } from "@/lib/api";

export function ApiFailure({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="grid min-h-48 place-items-center px-6 text-center">
      <div>
        <WifiOff className="mx-auto text-slate-300" size={30} />
        <b className="mt-3 block text-[12px]">服务暂时不可用</b>
        <p className="text-[10px] text-slate-400">{errorMessage(error)}</p>
        {retry && (
          <button
            onClick={retry}
            className="mx-auto mt-3 flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white px-4 text-[10px]"
          >
            <RefreshCw size={13} />
            重新加载
          </button>
        )}
      </div>
    </div>
  );
}
