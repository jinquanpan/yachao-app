import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { SkeletonList } from "@/components/page-skeleton";
import {
  absoluteAsset,
  apiPage,
  apiRequest,
  jsonBody,
  queryString,
  type Category as CategoryType,
  type Product,
} from "@/lib/api";
import fallbackImage from "@/assets/product-soda.jpg";
export const Route = createFileRoute("/category")({ component: Category });
function Category() {
  const [active, setActive] = useState("all");
  const [keyword, setKeyword] = useState("");
  const client = useQueryClient();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<CategoryType[]>("/categories"),
  });
  const products = useQuery({
    queryKey: ["products", { active, keyword }],
    queryFn: () =>
      apiPage<Product>(
        `/products${queryString({ pageSize: 100, category: active === "all" ? undefined : active, keyword: keyword || undefined })}`,
      ),
  });
  const add = useMutation({
    mutationFn: (id: string) =>
      apiRequest("/cart/items", { method: "POST", ...jsonBody({ product_id: id, qty: 1 }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["cart"] }),
  });
  const categoryList = [
    { id: "all", key: "all", label: "推荐", parent_id: null },
    ...(categories.data ?? []),
  ];
  return (
    <PhoneShell>
      <TopBar title="全部分类" back />
      <div className="mx-4 flex h-10 items-center gap-2 rounded-full bg-white px-4">
        <Search size={15} className="text-slate-400" />
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索商品"
          className="w-full border-0 bg-transparent text-[12px] outline-none"
        />
      </div>
      <div className="mt-3 flex h-[calc(100%-92px)]">
        <aside className="w-[82px] shrink-0">
          {categoryList.map((c) => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`relative h-[51px] w-full border-0 bg-transparent text-[12px] ${active === c.key ? "font-bold text-white" : "text-slate-600"}`}
            >
              <i
                className={`absolute inset-y-2 left-2 right-1 -z-0 rounded-r-[10px] rounded-l-[4px] ${active === c.key ? "bg-[#075cff]" : ""}`}
              />
              <span className="relative">{c.label}</span>
            </button>
          ))}
        </aside>
        <div className="flex-1 space-y-2 overflow-y-auto pr-3 pb-3">
          {products.isLoading ? (
            <SkeletonList />
          ) : products.error ? (
            <ApiFailure error={products.error} retry={() => void products.refetch()} />
          ) : (
            products.data?.data.map((p, i) => (
              <Link
                to="/product/$id"
                params={{ id: p.id }}
                key={p.id}
                className="card rise flex min-h-[78px] items-center gap-2 p-2"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <img
                  src={absoluteAsset(p.cover_image, fallbackImage)}
                  className="h-16 w-16 rounded-[10px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[11px]">{p.name}</b>
                  <span className="block truncate text-[9px] text-slate-400">{p.subtitle}</span>
                  <span className="price mt-1 block text-[13px]">{p.price}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    add.mutate(p.id);
                  }}
                  className="grid h-6 w-6 place-items-center rounded-full border-0 bg-[#075cff] text-white"
                >
                  <Plus size={14} />
                </button>
              </Link>
            ))
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
