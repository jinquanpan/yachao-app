import type { Platform } from "@/lib/api";

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.1";

export function getAppPlatform(): Platform {
  const runtime = (globalThis as typeof globalThis & { plus?: { os?: { name?: string } } }).plus?.os
    ?.name;
  const platform = runtime?.toLowerCase() ?? globalThis.navigator?.userAgent.toLowerCase() ?? "";

  if (platform.includes("android")) return "android";
  if (platform.includes("ios") || platform.includes("iphone") || platform.includes("ipad"))
    return "ios";
  return "pc";
}

export function isVersionMismatch(latest: string): boolean {
  return latest.replace(/^v/i, "").trim() !== APP_VERSION.replace(/^v/i, "").trim();
}
