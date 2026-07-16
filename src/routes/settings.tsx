import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, ChevronRight, Database, Info, LogOut, ShieldCheck } from "lucide-react";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest, clearSession } from "@/lib/api";
import { APP_VERSION } from "@/lib/app-info";
import { clearUniCache, formatBytes, getUniCacheSize } from "@/utils/uniapp";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const [notice, setNotice] = useState(true);
  const [cacheSize, setCacheSize] = useState("—");
  const [confirmExit, setConfirmExit] = useState(false);
  const nav = useNavigate();
  const client = useQueryClient();
  useEffect(() => {
    getUniCacheSize()
      .then((size) => setCacheSize(formatBytes(size)))
      .catch(() => setCacheSize("不可用"));
  }, []);
  const clearCache = async () => {
    try {
      await clearUniCache();
      setCacheSize("0 B");
      notify.success("缓存已清除");
    } catch {
      notify.warning("当前环境无法清除缓存");
    }
  };
  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      clearSession();
      client.clear();
      setConfirmExit(false);
      nav({ to: "/" });
    }
  };
  return (
    <PhoneShell showNav={false}>
      <TopBar title="设置" back />
      <div className="space-y-3 px-3 pb-28">
        <section className="card overflow-hidden px-3">
          <SettingRow
            icon={Bell}
            label="消息通知"
            right={
              <button
                onClick={() => setNotice((v) => !v)}
                aria-label="消息通知开关"
                className={`relative h-6 w-10 rounded-full border-0 p-0 transition-colors ${notice ? "bg-[#075cff]" : "bg-slate-200"}`}
              >
                <i
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${notice ? "left-5" : "left-1"}`}
                />
              </button>
            }
          />
          <SettingRow
            icon={ShieldCheck}
            label="账号与安全"
            right={<ChevronRight size={15} className="text-slate-300" />}
            last
          />
        </section>
        <section className="card overflow-hidden px-3">
          <SettingRow
            icon={Database}
            label="清除缓存"
            desc="释放本地图片与临时数据"
            right={
              <button
                onClick={clearCache}
                className="flex items-center gap-1 border-0 bg-transparent p-0 text-[10px] text-slate-400"
              >
                <span>{cacheSize}</span>
                <ChevronRight size={14} />
              </button>
            }
          />
          <SettingRow
            icon={Info}
            label="当前版本"
            right={
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-[#075cff]">
                v{APP_VERSION}
              </span>
            }
            last
          />
        </section>
        <button
          onClick={() => setConfirmExit(true)}
          className="card flex h-12 w-full items-center justify-center gap-2 border-0 text-[12px] font-bold text-red-500"
        >
          <LogOut size={16} />
          退出登录
        </button>
        <p className="text-center text-[8px] leading-4 text-slate-300">
          SHAN HAI JING STORE
          <br />
          Build 2026.06.29
        </p>
      </div>
      {confirmExit && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/45 px-8 backdrop-blur-[2px]">
          <div className="w-full rounded-[20px] bg-white p-5 text-center shadow-2xl rise">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
              <LogOut size={20} />
            </span>
            <h2 className="mb-1 mt-3 text-[15px] font-black">确认退出登录？</h2>
            <p className="mt-0 text-[10px] leading-5 text-slate-400">
              退出后将返回登录页，本地购物车会被清空。
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmExit(false)}
                className="h-10 rounded-full border border-slate-200 bg-white text-[11px] font-bold"
              >
                取消
              </button>
              <button
                onClick={logout}
                className="h-10 rounded-full border-0 bg-red-500 text-[11px] font-bold text-white"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}

function SettingRow({
  icon: Icon,
  label,
  desc,
  right,
  last = false,
}: {
  icon: typeof Bell;
  label: string;
  desc?: string;
  right: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[54px] items-center justify-between ${last ? "" : "border-b border-slate-100"}`}
    >
      <span className="flex items-center gap-3">
        <i className="grid h-8 w-8 place-items-center rounded-[10px] bg-blue-50 text-[#075cff]">
          <Icon size={16} strokeWidth={1.8} />
        </i>
        <span>
          <b className="block text-[11px] font-medium">{label}</b>
          {desc && <small className="mt-0.5 block text-[8px] text-slate-400">{desc}</small>}
        </span>
      </span>
      {right}
    </div>
  );
}
