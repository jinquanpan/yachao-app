import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  ShoppingBag,
  Settings,
  Store,
  Gift,
  Cat,
  CupSoda,
  Boxes,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brand, PhoneShell } from "@/components/phone-shell";
import soda from "@/assets/product-soda.jpg";
import type { MouseEvent } from "react";
import { LoadFooter, usePagedItems } from "@/hooks/use-paged-items";
import { ApiFailure } from "@/components/api-state";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  absoluteAsset,
  apiPage,
  apiRequest,
  jsonBody,
  type Category,
  type Product,
} from "@/lib/api";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "山海灵感便利店 · 首页" }] }),
  component: Home,
});
const shortcuts = [
  { label: "灵感便利", icon: Store, color: "#1264ff" },
  { label: "创意周边", icon: Gift, color: "#ff941c" },
  { label: "神兽零食", icon: Cat, color: "#ffb41f" },
  { label: "饮品专区", icon: CupSoda, color: "#0866ff" },
  { label: "潮玩盲盒", icon: Boxes, color: "#ff633a" },
];

function flyToCart(event: MouseEvent<HTMLButtonElement>, image: string, onAdd: () => void) {
  event.preventDefault();
  event.stopPropagation();
  onAdd();
  const target = document.querySelector<HTMLElement>('[data-cart-target="true"]');
  if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const from = event.currentTarget.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const flyer = document.createElement("img");
  flyer.src = image;
  flyer.alt = "";
  flyer.className = "cart-flyer";
  Object.assign(flyer.style, {
    left: `${from.left + from.width / 2 - 16}px`,
    top: `${from.top + from.height / 2 - 16}px`,
  });
  document.body.appendChild(flyer);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const motion = flyer.animate(
    [
      { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
      {
        transform: `translate3d(${dx * 0.52}px,${dy * 0.42 - 105}px,0) scale(.72) rotate(12deg)`,
        opacity: 1,
        offset: 0.52,
      },
      { transform: `translate3d(${dx}px,${dy}px,0) scale(.16) rotate(28deg)`, opacity: 0.25 },
    ],
    { duration: 720, easing: "cubic-bezier(.22,.7,.28,1)", fill: "forwards" },
  );
  motion.onfinish = () => {
    flyer.remove();
    target.classList.remove("cart-bump");
    void target.offsetWidth;
    target.classList.add("cart-bump");
    window.setTimeout(() => target.classList.remove("cart-bump"), 420);
  };
}

function Home() {
  const client = useQueryClient();
  const productsQuery = useQuery({
    queryKey: ["products", {}],
    queryFn: () => apiPage<Product>("/products?pageSize=100"),
  });
  const homeQuery = useQuery({
    queryKey: ["home"],
    queryFn: () =>
      apiRequest<{ categories: Category[]; recommendations: Array<{ products: Product[] }> }>(
        "/home",
      ),
  });
  const products = productsQuery.data?.data ?? [];
  const recommendations = homeQuery.data?.recommendations[0]?.products ?? products.slice(0, 4);
  const addMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("/cart/items", { method: "POST", ...jsonBody({ product_id: id, qty: 1 }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["cart"] }),
  });
  const { visibleItems, status, sentinelRef, loadMore } = usePagedItems(products, 20);
  if (productsQuery.isLoading)
    return (
      <PhoneShell>
        <PageSkeleton variant="home" />
      </PhoneShell>
    );
  if (productsQuery.error)
    return (
      <PhoneShell>
        <ApiFailure error={productsQuery.error} retry={() => void productsQuery.refetch()} />
      </PhoneShell>
    );
  return (
    <PhoneShell>
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between">
          <Brand compact />
          <div className="flex gap-1">
            <button className="icon-button">
              <Search size={19} />
            </button>
            <Link to="/cart" className="icon-button">
              <ShoppingBag size={19} />
            </Link>
            <button className="icon-button">
              <Settings size={19} />
            </button>
          </div>
        </div>
        <div className="relative mt-4 h-[126px] overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#071b50,#064be2)] p-4 text-white">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(#4e86ff22 1px,transparent 1px),linear-gradient(90deg,#4e86ff22 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10">
            <h1 className="m-0 text-[22px] font-black">灵感补给站</h1>
            <p className="mt-1 text-[9px] tracking-[.12em] text-white/60">
              INSPIRATION
              <br />
              <b className="text-[#ffd325]">STATION</b>
            </p>
          </div>
          <img
            src={soda}
            className="absolute -right-1 -top-9 h-[190px] w-[190px] rotate-12 rounded-full object-cover mix-blend-screen"
          />
          <div className="absolute right-4 bottom-3 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_6px_#4ee9ff]" />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-1">
          {shortcuts.map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1.5 border-0 bg-transparent p-0"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-[13px]"
                style={{ background: `${color}16`, color }}
              >
                <Icon size={21} strokeWidth={2.2} />
              </span>
              <span className="whitespace-nowrap text-[9px] font-medium">{label}</span>
            </button>
          ))}
        </div>
        <div className="section-head">
          <h2>
            灵感推荐 <small>RECOMMEND</small>
          </h2>
          <Link to="/category">
            <ChevronRight size={17} />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {recommendations.slice(0, 4).map((p, i) => {
            const image = absoluteAsset(p.cover_image, soda);
            return (
              <Link
                to="/product/$id"
                params={{ id: p.id }}
                key={p.id}
                className="card rise w-[108px] shrink-0 overflow-hidden p-2"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <div className="h-[94px] overflow-hidden rounded-[10px] bg-[#f3f6fb]">
                  <img src={image} className="h-full w-full object-cover" />
                </div>
                <div className="mt-1.5 truncate text-[11px] font-bold">{p.name}</div>
                <div className="truncate text-[8px] text-slate-400">{p.subtitle}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="price text-[13px] text-[#075cff]">{p.price}</span>
                  <button
                    onClick={(e) => flyToCart(e, image, () => addMutation.mutate(p.id))}
                    aria-label={`添加${p.name}到购物车`}
                    className="grid h-5 w-5 place-items-center rounded-full border-0 bg-[#075cff] text-white"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="section-head">
          <h2>
            神兽新品 <small>{visibleItems.length} ITEMS</small>
          </h2>
          <Link to="/category">
            <ChevronRight size={17} className="text-slate-400" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {visibleItems.map((p, i) => {
            const image = absoluteAsset(p.cover_image, soda);
            return (
              <Link
                to="/product/$id"
                params={{ id: p.id }}
                key={p.id}
                className="card rise min-w-0 overflow-hidden p-2"
                style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
              >
                <div className="relative aspect-[1.14/1] overflow-hidden rounded-[11px] bg-[#eef2f8]">
                  <img
                    src={image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {p.tags[0] && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[7px] font-bold text-[#075cff] backdrop-blur">
                      {p.tags[0].name}
                    </span>
                  )}
                </div>
                <div className="px-0.5 pb-0.5 pt-2">
                  <b className="block truncate text-[11px]">{p.name}</b>
                  <span className="mt-0.5 block truncate text-[8px] text-slate-400">
                    {p.subtitle}
                  </span>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="price text-[13px] text-[#075cff]">{p.price}</span>
                    <button
                      onClick={(e) => flyToCart(e, image, () => addMutation.mutate(p.id))}
                      aria-label={`添加${p.name}到购物车`}
                      className="grid h-6 w-6 place-items-center rounded-full border-0 bg-[#075cff] text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div ref={sentinelRef}>
          <LoadFooter status={status} onRetry={loadMore} />
        </div>
      </div>
    </PhoneShell>
  );
}
