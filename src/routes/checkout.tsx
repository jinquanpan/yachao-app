import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { SkeletonList } from "@/components/page-skeleton";
import {
  absoluteAsset,
  apiRequest,
  errorMessage,
  jsonBody,
  type Address,
  type Cart,
  type Order,
} from "@/lib/api";
import fallbackImage from "@/assets/product-soda.jpg";

export const Route = createFileRoute("/checkout")({ component: Checkout });
interface Preview {
  lines: Array<{
    cart_item_id: string;
    qty: number;
    product_snapshot: { name: string; cover_image: string | null };
  }>;
  summary: { subtotal: string; shipping_fee: string; discount: string; pay_amount: string };
}
function Checkout() {
  const nav = useNavigate();
  const client = useQueryClient();
  const cart = useQuery({ queryKey: ["cart"], queryFn: () => apiRequest<Cart>("/cart") });
  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: () => apiRequest<Address[]>("/addresses"),
  });
  const selected = cart.data?.items.filter((item) => item.selected && item.valid) ?? [];
  const address = addresses.data?.find((item) => item.is_default) ?? addresses.data?.[0];
  const preview = useQuery({
    queryKey: ["checkout", selected.map((item) => item.id)],
    queryFn: () =>
      apiRequest<Preview>("/checkout/preview", {
        method: "POST",
        ...jsonBody({ cart_item_ids: selected.map((item) => item.id), address_id: address?.id }),
      }),
    enabled: selected.length > 0 && Boolean(address),
  });
  const create = useMutation({
    mutationFn: () =>
      apiRequest<Order>("/orders", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        ...jsonBody({ cart_item_ids: selected.map((item) => item.id), address_id: address!.id }),
      }),
    onSuccess: (order) => {
      client.invalidateQueries({ queryKey: ["cart"] });
      client.invalidateQueries({ queryKey: ["orders"] });
      nav({ to: "/order/$id", params: { id: order.order_no } });
    },
  });
  if (cart.isLoading || addresses.isLoading)
    return (
      <PhoneShell showNav={false}>
        <TopBar title="结算" back />
        <SkeletonList count={4} />
      </PhoneShell>
    );
  const failure = cart.error || addresses.error || preview.error;
  if (failure)
    return (
      <PhoneShell showNav={false}>
        <TopBar title="结算" back />
        <ApiFailure
          error={failure}
          retry={() => {
            void cart.refetch();
            void addresses.refetch();
            void preview.refetch();
          }}
        />
      </PhoneShell>
    );
  const summary = preview.data?.summary;
  return (
    <PhoneShell showNav={false}>
      <TopBar title="结算" back />
      <div className="space-y-3 px-3">
        <Link to="/address" className="card block p-4">
          <b className="text-[12px]">收货地址</b>
          {address ? (
            <div className="mt-3 flex items-center justify-between">
              <div>
                <b className="text-[12px]">
                  {address.consignee}{" "}
                  <span className="font-normal text-slate-500">{address.phone}</span>
                </b>
                <p className="mb-0 mt-1 text-[10px] leading-5 text-slate-500">
                  {address.province}
                  {address.city}
                  {address.district}
                  {address.detail}
                </p>
              </div>
              <ChevronRight size={16} />
            </div>
          ) : (
            <p className="text-[10px] text-red-500">请先新增收货地址</p>
          )}
        </Link>
        <div className="card p-3">
          <div className="flex gap-2 overflow-x-auto">
            {selected.map((item) => (
              <div key={item.id} className="relative shrink-0">
                <img
                  src={absoluteAsset(item.product.cover_image, fallbackImage)}
                  className="h-14 w-14 rounded-[9px] object-cover"
                />
                <span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-1 text-[8px] text-white">
                  ×{item.qty}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <b className="text-[12px]">配送方式</b>
          <p className="text-[10px] text-slate-500">快递配送（免运费），预计 1-2 天送达</p>
        </div>
        <div className="card space-y-4 p-4 text-[11px]">
          <Row a="商品金额" b={`¥${summary?.subtotal ?? "0.00"}`} />
          <Row a="运费" b={`¥${summary?.shipping_fee ?? "0.00"}`} />
          <Row a="优惠" b={`- ¥${summary?.discount ?? "0.00"}`} />
        </div>
        {create.error && (
          <p className="px-2 text-[10px] text-red-500">{errorMessage(create.error)}</p>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex h-[72px] items-center justify-between border-t bg-white px-4">
        <span className="text-[11px]">
          合计：<b className="price text-[17px]">{summary?.pay_amount ?? "0.00"}</b>
        </span>
        <button
          onClick={() => create.mutate()}
          disabled={!selected.length || !address || create.isPending || preview.isLoading}
          className="primary-button h-11 px-7 disabled:opacity-40"
        >
          {create.isPending ? "提交中…" : "提交订单"}
        </button>
      </div>
    </PhoneShell>
  );
}
function Row({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex justify-between">
      <span>{a}</span>
      <b>{b}</b>
    </div>
  );
}
