import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Settings,
  Edit3,
  ChevronRight,
  Heart,
  MapPin,
  CircleHelp,
  Package,
  Truck,
  ClipboardCheck,
  RotateCcw,
  WalletCards,
} from "lucide-react";
import { PhoneShell } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { PageSkeleton } from "@/components/page-skeleton";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, type Me, type OrderStatus } from "@/lib/api";
import mascot from "@/assets/mascot-dragon.jpg";

export const Route = createFileRoute("/profile")({ component: Profile });
const orderLinks = [
  { t: "待付款", status: "pending-payment", i: WalletCards },
  { t: "待发货", status: "pending-shipment", i: ClipboardCheck },
  { t: "待收货", status: "pending-receipt", i: Truck },
  { t: "已完成", status: "completed", i: Package },
  { t: "售后", status: "after-sale", i: RotateCcw },
];
const menu = [
  { t: "灵感收藏", i: Heart, to: "/favorites" },
  { t: "地址管理", i: MapPin, to: "/address" },
  { t: "设置", i: Settings, to: "/settings" },
  { t: "帮助与客服", i: CircleHelp },
];

function Profile() {
  const query = useQuery({ queryKey: ["me"], queryFn: () => apiRequest<Me>("/me") });
  const { data } = query;
  if (query.isLoading)
    return (
      <PhoneShell>
        <PageSkeleton variant="profile" />
      </PhoneShell>
    );
  if (query.error)
    return (
      <PhoneShell>
        <ApiFailure error={query.error} retry={() => void query.refetch()} />
      </PhoneShell>
    );
  const favoriteCount = data?.stats.favorites ?? 0;
  const orderCounts = data?.stats.orders ?? {};
  return (
    <PhoneShell>
      <div className="px-4 pt-3">
        <div className="flex justify-end gap-1">
          <button className="icon-button">
            <Edit3 size={18} />
          </button>
          <Link to="/settings" className="icon-button" aria-label="设置">
            <Settings size={19} />
          </Link>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <img
            src={data?.avatar_url || mascot}
            className="h-14 w-14 rounded-full border-2 border-white object-cover shadow"
          />
          <div>
            <h1 className="m-0 text-[15px] font-black">{data?.nickname || "山海探索者"}</h1>
            <Link
              to="/membership"
              className="mt-1 flex items-center gap-1 text-[9px] text-slate-500"
            >
              <b className="rounded bg-[#075cff] px-1.5 py-0.5 text-white">MEMBER</b>{" "}
              {data?.phone?.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
            </Link>
          </div>
        </div>
        <div className="profile-stats mt-4 grid h-[68px] grid-cols-3 items-center text-center">
          <Link
            to="/favorites"
            className="group flex h-full flex-col items-center justify-center rounded-l-[14px] transition-colors active:bg-blue-50"
          >
            <b className="block text-[15px] leading-none group-active:text-[#075cff]">
              {favoriteCount}
            </b>
            <span className="mt-2 text-[9px] text-slate-400">收藏商品</span>
          </Link>
          <Stat n={String(data?.stats.available_coupons ?? 0)} t="优惠券" />
          <Stat n="—" t="积分" />
        </div>
        <section className="card mt-4 p-3">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[12px] font-black">我的订单</h2>
            <Link
              to="/orders/$status"
              params={{ status: "all" }}
              className="flex items-center text-[9px] text-slate-400"
            >
              全部订单 <ChevronRight size={13} />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-5">
            {orderLinks.map(({ t, status, i: Icon }) => {
              const count = orderCounts[status as OrderStatus] ?? 0;
              return (
                <Link
                  key={t}
                  to="/orders/$status"
                  params={{ status }}
                  className="relative flex flex-col items-center gap-1"
                >
                  <span className="relative">
                    <Icon size={18} strokeWidth={1.5} />
                    {count > 0 && (
                      <b className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#075cff] px-1 text-[8px] text-white">
                        {count}
                      </b>
                    )}
                  </span>
                  <span className="text-[9px]">{t}</span>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="card mt-3 overflow-hidden px-3">
          {menu.map(({ t, i: Icon, to }) => {
            const content = (
              <>
                <span className="flex items-center gap-3">
                  <Icon size={17} strokeWidth={1.6} />
                  {t}
                </span>
                <ChevronRight size={15} className="text-slate-300" />
              </>
            );
            return to ? (
              <Link
                key={t}
                to={to}
                className="flex h-[48px] items-center justify-between border-b border-slate-100 text-[11px] last:border-0"
              >
                {content}
              </Link>
            ) : (
              <button
                key={t}
                className="flex h-[48px] w-full items-center justify-between border-0 border-b border-slate-100 bg-transparent text-[11px] last:border-0"
              >
                {content}
              </button>
            );
          })}
        </section>
      </div>
    </PhoneShell>
  );
}
function Stat({ n, t }: { n: string; t: string }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center before:absolute before:left-0 before:h-7 before:w-px before:bg-slate-200">
      <b className="block text-[15px] leading-none">{n}</b>
      <span className="mt-2 text-[9px] text-slate-400">{t}</span>
    </div>
  );
}
