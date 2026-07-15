import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Check, ChevronRight, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { SkeletonList } from "@/components/page-skeleton";
import { absoluteAsset, apiRequest, jsonBody, type Cart as CartData } from "@/lib/api";
import fallbackImage from "@/assets/product-soda.jpg";

export const Route = createFileRoute("/cart")({ component: Cart });

function Cart() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["cart"], queryFn: () => apiRequest<CartData>("/cart") });
  const refresh = () => client.invalidateQueries({ queryKey: ["cart"] });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      apiRequest(`/cart/items/${id}`, { method: "PATCH", ...jsonBody(body) }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiRequest(`/cart/items/${id}`, { method: "DELETE" }),
    onSuccess: refresh,
  });
  if (query.isLoading)
    return (
      <PhoneShell>
        <TopBar title="购物车" />
        <SkeletonList />
      </PhoneShell>
    );
  if (query.error)
    return (
      <PhoneShell>
        <TopBar title="购物车" />
        <ApiFailure error={query.error} retry={() => void query.refetch()} />
      </PhoneShell>
    );
  const cart = query.data!;
  const selected = cart.items.filter((item) => item.selected && item.valid);
  return (
    <PhoneShell>
      <TopBar
        title={
          <>
            购物车{" "}
            <span className="text-[12px] font-normal text-slate-400">({cart.items.length})</span>
          </>
        }
      />
      <div className="space-y-3 px-3">
        {cart.items.map((item, index) => (
          <article
            key={item.id}
            className={`card rise flex items-center gap-2.5 p-3 ${item.valid ? "" : "opacity-50"}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <button
              onClick={() => update.mutate({ id: item.id, body: { selected: !item.selected } })}
              className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${item.selected ? "border-[#075cff] bg-[#075cff] text-white" : "border-slate-300 bg-white"}`}
            >
              {item.selected && <Check size={11} strokeWidth={3} />}
            </button>
            <Link to="/product/$id" params={{ id: item.product_id }} className="shrink-0">
              <img
                src={absoluteAsset(item.product.cover_image, fallbackImage)}
                alt={item.product.name}
                className="h-[70px] w-[58px] rounded-[9px] object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1 self-stretch py-1">
              <Link
                to="/product/$id"
                params={{ id: item.product_id }}
                className="group flex items-start justify-between gap-1"
              >
                <span className="min-w-0">
                  <b className="block truncate text-[12px]">{item.product.name}</b>
                  <span className="block truncate text-[9px] text-slate-400">
                    {item.product.subtitle}
                  </span>
                </span>
                <ChevronRight size={14} className="mt-1 text-slate-300" />
              </Link>
              <div className="mt-4 flex items-center justify-between">
                <span className="price text-[13px]">{item.unit_price}</span>
                <span className="flex items-center rounded-lg bg-[#f4f6fa]">
                  <button
                    onClick={() =>
                      item.qty === 1
                        ? remove.mutate(item.id)
                        : update.mutate({ id: item.id, body: { qty: item.qty - 1 } })
                    }
                    className="grid h-7 w-7 place-items-center border-0 bg-transparent"
                  >
                    {item.qty === 1 ? <Trash2 size={11} /> : <Minus size={12} />}
                  </button>
                  <b className="w-5 text-center text-[10px]">{item.qty}</b>
                  <button
                    onClick={() => update.mutate({ id: item.id, body: { qty: item.qty + 1 } })}
                    disabled={item.qty >= item.stock}
                    className="grid h-7 w-7 place-items-center border-0 bg-transparent disabled:opacity-30"
                  >
                    <Plus size={12} />
                  </button>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="absolute bottom-[72px] left-0 right-0 flex h-[64px] items-center justify-between border-t border-slate-100 bg-white px-4">
        <div>
          <span className="text-[10px] text-slate-500">
            已选 {selected.reduce((n, item) => n + item.qty, 0)} 件 合计：
          </span>
          <b className="price text-[16px]">{cart.summary.total}</b>
        </div>
        <Link
          to="/checkout"
          disabled={!selected.length}
          className={`primary-button h-9 px-5 text-[11px] ${selected.length ? "" : "pointer-events-none opacity-40"}`}
        >
          去结算
        </Link>
      </div>
    </PhoneShell>
  );
}
