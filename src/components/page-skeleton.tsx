import { PhoneShell } from "@/components/phone-shell";

export type SkeletonVariant = "home" | "grid" | "list" | "detail" | "profile" | "form";

function Bone({ className = "" }: { className?: string }) {
  return <span className={`skeleton-bone ${className}`} aria-hidden="true" />;
}

function HeaderBone() {
  return (
    <div className="flex h-[50px] items-center justify-between px-4">
      <Bone className="h-8 w-8 rounded-full" />
      <Bone className="h-4 w-24" />
      <Bone className="h-8 w-8 rounded-full" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-[14px] bg-white p-2 shadow-[0_8px_28px_#1c3f7b0b]">
          <Bone className="aspect-[1.08/1] w-full rounded-[11px]" />
          <Bone className="mt-3 h-3 w-3/4" />
          <Bone className="mt-2 h-2 w-1/2" />
          <div className="mt-3 flex items-center justify-between">
            <Bone className="h-4 w-14" />
            <Bone className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 px-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex h-[94px] items-center gap-3 rounded-[14px] bg-white p-3">
          <Bone className="h-4 w-4 rounded-full" />
          <Bone className="h-[68px] w-[62px] rounded-[10px]" />
          <div className="flex-1">
            <Bone className="h-3 w-3/4" />
            <Bone className="mt-2 h-2 w-1/2" />
            <Bone className="mt-5 h-4 w-16" />
          </div>
          <Bone className="h-7 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ variant = "list" }: { variant?: SkeletonVariant }) {
  if (variant === "home")
    return (
      <div className="skeleton-page px-4 pt-2" aria-busy="true" aria-label="页面加载中">
        <div className="flex h-9 items-center justify-between">
          <Bone className="h-7 w-28" />
          <div className="flex gap-2">
            <Bone className="h-8 w-8 rounded-full" />
            <Bone className="h-8 w-8 rounded-full" />
            <Bone className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <Bone className="mt-4 h-[126px] w-full rounded-[18px] skeleton-hero" />
        <div className="mt-4 grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="grid justify-items-center gap-2">
              <Bone className="h-10 w-10 rounded-[13px]" />
              <Bone className="h-2 w-10" />
            </div>
          ))}
        </div>
        <div className="my-5 flex justify-between">
          <Bone className="h-4 w-28" />
          <Bone className="h-4 w-4" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="w-[108px] shrink-0 rounded-[14px] bg-white p-2">
              <Bone className="h-[94px] w-full rounded-[10px]" />
              <Bone className="mt-2 h-3 w-20" />
              <Bone className="mt-2 h-2 w-14" />
            </div>
          ))}
        </div>
        <div className="my-5">
          <Bone className="h-4 w-32" />
        </div>
        <SkeletonGrid count={4} />
      </div>
    );
  if (variant === "grid")
    return (
      <div className="skeleton-page" aria-busy="true" aria-label="页面加载中">
        <HeaderBone />
        <Bone className="mx-4 mb-4 h-10 w-[calc(100%-2rem)] rounded-full" />
        <SkeletonGrid />
      </div>
    );
  if (variant === "detail")
    return (
      <div className="skeleton-page" aria-busy="true" aria-label="页面加载中">
        <Bone className="h-[390px] w-full rounded-none skeleton-hero" />
        <div className="-mt-5 rounded-t-[24px] bg-white px-4 pb-8 pt-6">
          <Bone className="h-5 w-2/3" />
          <Bone className="mt-3 h-3 w-1/2" />
          <Bone className="mt-4 h-7 w-24" />
          <div className="mt-5 space-y-3 rounded-[14px] bg-slate-50 p-4">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-4/5" />
            <Bone className="h-3 w-3/5" />
          </div>
        </div>
      </div>
    );
  if (variant === "profile")
    return (
      <div className="skeleton-page px-4 pt-3" aria-busy="true" aria-label="页面加载中">
        <div className="flex justify-end gap-2">
          <Bone className="h-9 w-9 rounded-full" />
          <Bone className="h-9 w-9 rounded-full" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Bone className="h-14 w-14 rounded-full" />
          <div className="flex-1">
            <Bone className="h-4 w-28" />
            <Bone className="mt-2 h-3 w-36" />
          </div>
        </div>
        <Bone className="mt-5 h-[68px] w-full rounded-[14px]" />
        <Bone className="mt-4 h-[116px] w-full rounded-[14px]" />
        <div className="mt-3 space-y-px overflow-hidden rounded-[14px] bg-white">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex h-12 items-center gap-3 px-3">
              <Bone className="h-7 w-7 rounded-lg" />
              <Bone className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  if (variant === "form")
    return (
      <div className="skeleton-page" aria-busy="true" aria-label="页面加载中">
        <HeaderBone />
        <div className="px-4">
          <Bone className="h-36 w-full rounded-[20px] skeleton-hero" />
          <div className="mt-4 space-y-4 rounded-[16px] bg-white p-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i}>
                <Bone className="h-3 w-20" />
                <Bone className="mt-2 h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Bone className="mt-5 h-11 w-full rounded-full" />
        </div>
      </div>
    );
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="页面加载中">
      <HeaderBone />
      <SkeletonList />
    </div>
  );
}

export function RouteSkeleton({ pathname }: { pathname?: string }) {
  const path = pathname ?? (typeof window !== "undefined" ? window.location.hash.slice(1) : "");
  const variant: SkeletonVariant =
    path === "/home"
      ? "home"
      : path === "/profile"
        ? "profile"
        : path.startsWith("/product/") || path.startsWith("/order/")
          ? "detail"
          : path === "/scan-entry"
            ? "form"
            : path === "/category" || path === "/discover" || path === "/favorites"
              ? "grid"
              : "list";
  return (
    <PhoneShell
      showNav={
        !path.startsWith("/product/") &&
        !path.startsWith("/order/") &&
        path !== "/checkout" &&
        path !== "/address" &&
        path !== "/scan-entry"
      }
    >
      <PageSkeleton variant={variant} />
    </PhoneShell>
  );
}
