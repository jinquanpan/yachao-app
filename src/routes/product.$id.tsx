import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Share2, ShoppingCart, Check, Heart, MoreHorizontal } from "lucide-react";
import { PhoneShell } from "@/components/phone-shell";
import mascot from "@/assets/mascot-dragon.jpg";
import fallbackImage from "@/assets/product-soda.jpg";
import { ApiFailure } from "@/components/api-state";
import { PageSkeleton } from "@/components/page-skeleton";
import { absoluteAsset, apiRequest, jsonBody, type Product } from "@/lib/api";

export const Route = createFileRoute("/product/$id")({ component: ProductPage });

function ProductPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [done, setDone] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiRequest<Product>(`/products/${id}`),
  });
  const p = query.data;
  const cart = useMutation({
    mutationFn: () =>
      apiRequest("/cart/items", { method: "POST", ...jsonBody({ product_id: id, qty: 1 }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["cart"] }),
  });
  const favorite = useMutation({
    mutationFn: (liked: boolean) =>
      apiRequest(`/favorites/${id}`, { method: liked ? "DELETE" : "PUT" }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["product", id] });
      client.invalidateQueries({ queryKey: ["favorites"] });
      client.invalidateQueries({ queryKey: ["me"] });
    },
  });
  if (query.isLoading)
    return (
      <PhoneShell showNav={false}>
        <PageSkeleton variant="detail" />
      </PhoneShell>
    );
  if (query.error || !p)
    return (
      <PhoneShell showNav={false}>
        <ApiFailure error={query.error} retry={() => void query.refetch()} />
      </PhoneShell>
    );
  const liked = Boolean(p.is_favorite);
  const image = absoluteAsset(p.cover_image, fallbackImage);
  const onAdd = () =>
    cart.mutate(undefined, {
      onSuccess: () => {
        setDone(true);
        setTimeout(() => setDone(false), 1300);
      },
    });
  return (
    <PhoneShell showNav={false} noPad>
      <div className="relative h-[47%] min-h-[320px] overflow-hidden bg-[#07388f]">
        <img src={image} className="h-full w-full object-cover" />
        <div className="absolute left-3 right-3 top-2 flex justify-between">
          <button
            type="button"
            onClick={() => history.back()}
            aria-label="返回上一页"
            className="product-back"
          >
            <ChevronLeft size={21} strokeWidth={2.4} />
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => favorite.mutate(liked)}
              aria-label={liked ? "取消收藏" : "收藏"}
              className={`icon-button backdrop-blur ${liked ? "bg-white text-[#075cff]" : "bg-black/20 text-white"}`}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
            </button>
            <button
              aria-label="分享商品"
              className="icon-button bg-black/20 text-white backdrop-blur"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/25 px-2 py-1 text-[9px] text-white">
          1/5
        </span>
      </div>
      <section className="rounded-t-[24px] bg-white px-4 pb-24 pt-4">
        <div className="flex justify-between">
          <div>
            <h1 className="m-0 text-[15px] font-black">{p.name}</h1>
            <p className="mt-1 text-[10px] text-slate-500">{p.subtitle}</p>
          </div>
          <MoreHorizontal size={18} />
        </div>
        <div className="price mt-2 text-[24px] text-[#075cff]">{p.price}</div>
        <div className="mt-2 flex gap-2">
          {p.tags.slice(0, 2).map((t) => (
            <span
              key={t.id}
              className="rounded border border-red-300 px-1.5 py-0.5 text-[9px] text-red-500"
            >
              {t.name}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-[12px] bg-[#f7f8fb] px-3">
          <Row a="规格" b={p.spec || "默认规格"} />
          <Row a="配送" b={p.stock > 0 ? "现货，24小时内发货" : "暂时缺货"} />
        </div>
        <div className="mt-4 rounded-[14px] bg-[#f7f8fb] p-3">
          <b className="text-[11px]">灵感故事</b>
          <p className="mb-0 text-[10px] leading-5 text-slate-500">
            {p.story || "这件灵感补给正在书写自己的山海故事。"}
          </p>
        </div>
      </section>
      <div className="absolute bottom-0 left-0 right-0 flex h-[72px] items-center gap-2 border-t bg-white px-3 pb-[max(env(safe-area-inset-bottom),4px)]">
        <Link
          to="/cart"
          className="flex w-[46px] shrink-0 flex-col items-center justify-center gap-0.5 whitespace-nowrap text-[8px] leading-none text-slate-500"
        >
          <ShoppingCart size={18} />
          <span>购物车</span>
        </Link>
        <button
          onClick={onAdd}
          disabled={cart.isPending || p.stock < 1}
          className="h-11 min-w-0 flex-1 rounded-full border border-[#075cff] bg-white px-2 text-[12px] font-bold text-[#075cff] disabled:opacity-40"
        >
          加入购物车
        </button>
        <button
          onClick={() => cart.mutate(undefined, { onSuccess: () => nav({ to: "/checkout" }) })}
          disabled={cart.isPending || p.stock < 1}
          className="h-11 min-w-0 flex-1 rounded-full border-0 bg-[#075cff] px-2 text-[12px] font-bold text-white disabled:opacity-40"
        >
          立即购买
        </button>
      </div>
      {done && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-[#02143be8]">
          <div className="text-center text-white">
            <h2 className="m-0 text-[28px] font-black">
              加入购物车
              <br />
              成功!
            </h2>
            <div className="relative mx-auto mt-3 w-44">
              <img src={mascot} className="h-48 w-44 rounded-[28px] object-cover" />
              <span className="absolute right-0 top-2 grid h-9 w-9 place-items-center rounded-full bg-cyan-300">
                <Check size={22} />
              </span>
            </div>
            <Link to="/cart" className="primary-button mt-5 w-56">
              去购物车看看
            </Link>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}
function Row({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex h-10 items-center justify-between border-b border-slate-100 text-[10px] last:border-0">
      <span className="text-slate-500">{a}</span>
      <b>{b} ›</b>
    </div>
  );
}
