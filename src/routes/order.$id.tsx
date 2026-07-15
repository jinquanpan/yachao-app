import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock3, MapPin, PackageCheck, Truck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  absoluteAsset,
  apiRequest,
  errorMessage,
  jsonBody,
  type Order,
  type OrderStatus,
} from "@/lib/api";
import fallbackImage from "@/assets/product-soda.jpg";

export const Route = createFileRoute("/order/$id")({ component: OrderDetail });
const labels: Record<OrderStatus, string> = {
  "pending-payment": "待付款",
  "pending-shipment": "待发货",
  "pending-receipt": "待收货",
  completed: "已完成",
  cancelled: "已取消",
  "after-sale": "售后",
};
function OrderDetail() {
  const { id } = Route.useParams();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiRequest<Order>(`/orders/${id}`),
  });
  const order = query.data;
  const action = useMutation({
    mutationFn: (path: string) =>
      apiRequest<Order>(`/orders/${id}/${path}`, {
        method: "POST",
        ...jsonBody(path === "cancel" ? { reason: "用户取消订单" } : {}),
      }),
    onSuccess: (data) => {
      client.setQueryData(["order", id], data);
      client.invalidateQueries({ queryKey: ["orders"] });
      client.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const payment = useMutation({
    mutationFn: () =>
      apiRequest<{ payment_no: string }>(`/orders/${id}/payments`, {
        method: "POST",
        ...jsonBody({ channel: "wechat" }),
      }),
  });
  if (query.isLoading)
    return (
      <PhoneShell showNav={false}>
        <TopBar title="订单详情" back />
        <PageSkeleton variant="detail" />
      </PhoneShell>
    );
  if (query.error || !order)
    return (
      <PhoneShell showNav={false}>
        <TopBar title="订单详情" back />
        <ApiFailure error={query.error} />
      </PhoneShell>
    );
  const meta =
    order.status === "pending-payment"
      ? { icon: Clock3, title: "等待付款", desc: "请在有效时间内完成支付" }
      : order.status === "pending-shipment"
        ? { icon: PackageCheck, title: "等待发货", desc: "山海仓正在准备你的灵感补给" }
        : order.status === "pending-receipt"
          ? { icon: Truck, title: "运输中", desc: order.tracking_no || "包裹正在向你靠近" }
          : { icon: Check, title: labels[order.status], desc: "感谢这次山海相遇" };
  const Icon = meta.icon;
  const address = order.address_snapshot;
  return (
    <PhoneShell showNav={false}>
      <TopBar title="订单详情" back />
      <div className="px-3 pb-24">
        <section className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#061b52,#075cff)] p-5 text-white">
          <Icon size={25} />
          <h1 className="mb-1 mt-3 text-[20px] font-black">{meta.title}</h1>
          <p className="m-0 text-[10px] text-white/65">{meta.desc}</p>
        </section>
        <section className="card mt-3 p-4">
          <div className="flex gap-3">
            <MapPin size={18} className="text-[#075cff]" />
            <div>
              <b className="text-[11px]">
                {address.consignee}{" "}
                <span className="font-normal text-slate-400">{address.phone}</span>
              </b>
              <p className="mb-0 mt-1 text-[9px] text-slate-500">
                {address.province}
                {address.city}
                {address.district}
                {address.detail}
              </p>
            </div>
          </div>
        </section>
        <section className="card mt-3 p-3">
          {order.items.map((item) => (
            <Link
              key={item.id}
              to="/product/$id"
              params={{ id: item.product_id }}
              className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0"
            >
              <img
                src={absoluteAsset(item.product_snapshot.cover_image, fallbackImage)}
                className="h-14 w-14 rounded-[9px] object-cover"
              />
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[11px]">{item.product_snapshot.name}</b>
                <span className="text-[9px] text-slate-400">{item.product_snapshot.spec}</span>
                <div className="mt-1 flex justify-between">
                  <b className="price text-[11px]">{item.price}</b>
                  <span className="text-[9px] text-slate-400">×{item.qty}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
        <section className="card mt-3 space-y-3 p-4 text-[10px]">
          <Row a="订单编号" b={order.order_no} />
          <Row a="创建时间" b={new Date(order.created_at).toLocaleString("zh-CN")} />
          <Row a="商品金额" b={`¥${order.total}`} />
          <div className="flex justify-between border-t pt-3">
            <b>实付款</b>
            <b className="price text-[16px] text-[#075cff]">{order.pay_amount}</b>
          </div>
        </section>
        {(action.error || payment.error) && (
          <p className="text-[10px] text-red-500">{errorMessage(action.error || payment.error)}</p>
        )}
        {payment.data && (
          <p className="text-[10px] text-[#075cff]">
            支付单 {payment.data.payment_no} 已创建，请在支付渠道完成付款。
          </p>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex h-[70px] items-center justify-end gap-2 border-t bg-white px-3">
        {order.status === "pending-payment" && (
          <>
            <button
              onClick={() => action.mutate("cancel")}
              className="h-10 rounded-full border border-slate-200 bg-white px-5 text-[11px]"
            >
              取消订单
            </button>
            <button onClick={() => payment.mutate()} className="primary-button h-10 px-6">
              立即付款
            </button>
          </>
        )}
        {order.status === "pending-receipt" && (
          <button
            onClick={() => action.mutate("confirm-receipt")}
            className="primary-button h-10 px-7"
          >
            确认收货
          </button>
        )}
        {order.status === "completed" && (
          <Link to="/home" className="primary-button h-10 px-7">
            再次购买
          </Link>
        )}
      </div>
    </PhoneShell>
  );
}
function Row({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-400">{a}</span>
      <span className="text-right">{b}</span>
    </div>
  );
}
