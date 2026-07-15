import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, PackageOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { SkeletonList } from "@/components/page-skeleton";
import { absoluteAsset, apiPage, type Order, type OrderStatus } from "@/lib/api";
import fallbackImage from "@/assets/product-soda.jpg";

export const Route = createFileRoute("/orders/$status")({ component: Orders });
const tabs: [string, string][] = [
  ["all", "全部"],
  ["pending-payment", "待付款"],
  ["pending-shipment", "待发货"],
  ["pending-receipt", "待收货"],
  ["completed", "已完成"],
];
const labels: Record<OrderStatus, string> = {
  "pending-payment": "待付款",
  "pending-shipment": "待发货",
  "pending-receipt": "待收货",
  completed: "已完成",
  cancelled: "已取消",
  "after-sale": "售后",
};
function Orders() {
  const { status } = Route.useParams();
  const query = useQuery({
    queryKey: ["orders", status],
    queryFn: () => apiPage<Order>(`/orders?status=${status}&pageSize=100`),
  });
  const list = query.data?.data ?? [];
  return (
    <PhoneShell showNav={false}>
      <TopBar title="我的订单" back />
      <div className="flex overflow-x-auto border-b border-slate-100 bg-white px-2">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            to="/orders/$status"
            params={{ status: key }}
            className={`relative min-w-[72px] flex-1 py-3 text-center text-[10px] ${status === key ? "font-bold text-[#075cff]" : "text-slate-500"}`}
          >
            {label}
            {status === key && (
              <i className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded bg-[#075cff]" />
            )}
          </Link>
        ))}
      </div>
      {query.isLoading ? (
        <SkeletonList />
      ) : query.error ? (
        <ApiFailure error={query.error} retry={() => void query.refetch()} />
      ) : list.length ? (
        <div className="space-y-3 p-3">
          {list.map((order, i) => (
            <Link
              key={order.order_no}
              to="/order/$id"
              params={{ id: order.order_no }}
              className="card rise block p-3"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[9px] text-slate-400">订单号 {order.order_no}</span>
                <b className="text-[10px] text-[#075cff]">{labels[order.status]}</b>
              </div>
              <div className="mt-3 flex gap-2 overflow-hidden">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="relative shrink-0">
                    <img
                      src={absoluteAsset(item.product_snapshot.cover_image, fallbackImage)}
                      className="h-[62px] w-[62px] rounded-[10px] object-cover"
                    />
                    <span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-1 text-[8px] text-white">
                      ×{item.qty}
                    </span>
                  </div>
                ))}
                <div className="ml-auto flex min-w-24 flex-col items-end justify-center">
                  <span className="text-[9px] text-slate-400">
                    共 {order.items.reduce((n, x) => n + x.qty, 0)} 件
                  </span>
                  <b className="price mt-1 text-[15px]">{order.pay_amount}</b>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-[9px] text-slate-400">
                  {new Date(order.created_at).toLocaleString("zh-CN")}
                </span>
                <span className="flex items-center text-[9px]">
                  查看详情 <ChevronRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid h-[60%] place-items-center text-center">
          <div>
            <PackageOpen size={42} className="mx-auto text-slate-300" />
            <b className="mt-3 block text-[13px]">暂无相关订单</b>
            <Link to="/home" className="primary-button mx-auto mt-4 w-32">
              去逛逛
            </Link>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}
