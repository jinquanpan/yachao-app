import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { LoadFooter, usePagedItems } from "@/hooks/use-paged-items";
import { useQuery } from "@tanstack/react-query";
import { ApiFailure } from "@/components/api-state";
import { SkeletonGrid } from "@/components/page-skeleton";
import { absoluteAsset, apiPage, type Product } from "@/lib/api";
import fallbackImage from "@/assets/product-soda.jpg";

export const Route = createFileRoute("/discover")({ component: Discover });

function Discover() {
  const query = useQuery({
    queryKey: ["products", { discover: true }],
    queryFn: () => apiPage<Product>("/products?pageSize=100&sort=newest"),
  });
  const { visibleItems, status, sentinelRef, loadMore } = usePagedItems(query.data?.data ?? [], 20);
  if (query.isLoading)
    return (
      <PhoneShell>
        <TopBar title="发现" />
        <SkeletonGrid />
      </PhoneShell>
    );
  if (query.error)
    return (
      <PhoneShell>
        <TopBar title="发现" />
        <ApiFailure error={query.error} retry={() => void query.refetch()} />
      </PhoneShell>
    );

  return (
    <PhoneShell>
      <TopBar title="发现" />
      <div className="grid grid-cols-2 gap-3 px-3">
        {visibleItems.map((product, index) => (
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            key={product.id}
            className="card rise overflow-hidden"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <img
              src={absoluteAsset(product.cover_image, fallbackImage)}
              alt={product.name}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <div className="p-2">
              <b className="block truncate text-[11px]">{product.name}</b>
              <span className="price text-[13px] text-[#075cff]">{product.price}</span>
            </div>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} className="px-3">
        <LoadFooter status={status} onRetry={loadMore} />
      </div>
      <Link to="/scan-entry" className="scan-fab" aria-label="扫描录入商品">
        <ScanLine size={22} strokeWidth={2.1} />
      </Link>
    </PhoneShell>
  );
}
