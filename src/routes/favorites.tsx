import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Plus, ShoppingBag } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { SkeletonGrid } from "@/components/page-skeleton";
import { absoluteAsset, apiPage, apiRequest, jsonBody, type Product } from "@/lib/api";
import fallbackImage from "@/assets/product-soda.jpg";

export const Route = createFileRoute("/favorites")({ component: Favorites });
function Favorites() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiPage<Product>("/favorites?pageSize=100"),
  });
  const list = query.data?.data ?? [];
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["favorites"] });
    client.invalidateQueries({ queryKey: ["me"] });
  };
  const remove = useMutation({
    mutationFn: (id: string) => apiRequest(`/favorites/${id}`, { method: "DELETE" }),
    onSuccess: refresh,
  });
  const add = useMutation({
    mutationFn: (id: string) =>
      apiRequest("/cart/items", { method: "POST", ...jsonBody({ product_id: id, qty: 1 }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["cart"] }),
  });
  return (
    <PhoneShell>
      <TopBar
        title={
          <>
            灵感收藏 <span className="text-[11px] font-normal text-slate-400">({list.length})</span>
          </>
        }
        back
      />
      {query.isLoading ? (
        <SkeletonGrid />
      ) : query.error ? (
        <ApiFailure error={query.error} retry={() => void query.refetch()} />
      ) : list.length ? (
        <div className="grid grid-cols-2 gap-3 px-3 pb-4">
          {list.map((p, i) => (
            <article
              key={p.id}
              className="card rise overflow-hidden"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative">
                <Link to="/product/$id" params={{ id: p.id }}>
                  <img
                    src={absoluteAsset(p.cover_image, fallbackImage)}
                    alt={p.name}
                    className="aspect-square w-full object-cover"
                  />
                </Link>
                <button
                  onClick={() => remove.mutate(p.id)}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border-0 bg-white/90 text-[#075cff] shadow"
                >
                  <Heart size={17} fill="currentColor" />
                </button>
              </div>
              <div className="p-3">
                <Link
                  to="/product/$id"
                  params={{ id: p.id }}
                  className="block truncate text-[12px] font-bold"
                >
                  {p.name}
                </Link>
                <span className="mt-0.5 block truncate text-[9px] text-slate-400">
                  {p.subtitle}
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <b className="price text-[15px] text-[#075cff]">{p.price}</b>
                  <button
                    onClick={() => add.mutate(p.id)}
                    className="grid h-7 w-7 place-items-center rounded-full border-0 bg-[#075cff] text-white"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid h-[65%] place-items-center text-center">
          <div>
            <Heart size={34} className="mx-auto text-slate-300" />
            <b className="mt-4 block text-[14px]">还没有收藏商品</b>
            <Link to="/discover" className="primary-button mx-auto mt-4 w-36">
              去逛逛
            </Link>
          </div>
        </div>
      )}
      {list.length > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-24 right-[max(20px,calc((100vw-390px)/2+20px))] grid h-11 w-11 place-items-center rounded-full bg-[#075cff] text-white shadow-lg"
        >
          <ShoppingBag size={19} />
        </Link>
      )}
    </PhoneShell>
  );
}
