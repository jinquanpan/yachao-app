import { clearPcCache, getPcCacheSize } from "./pc";

export type SafeAreaInsets = { top: number; right: number; bottom: number; left: number };

type UniSystemInfo = {
  screenWidth?: number;
  screenHeight?: number;
  safeArea?: { top: number; right: number; bottom: number; left: number };
  safeAreaInsets?: Partial<SafeAreaInsets>;
};

type UniStorageInfo = { currentSize?: number };
type UniApi = {
  getWindowInfo?: () => UniSystemInfo;
  getSystemInfoSync?: () => UniSystemInfo;
  getStorageInfo?: (options: {
    success: (result: UniStorageInfo) => void;
    fail: (error: unknown) => void;
  }) => void;
  clearStorage?: (options: { success: () => void; fail: (error: unknown) => void }) => void;
};

function getUni(): UniApi | undefined {
  return (globalThis as typeof globalThis & { uni?: UniApi }).uni;
}

export function getSafeAreaInsets(): SafeAreaInsets {
  const uni = getUni();
  const info = uni?.getWindowInfo?.() ?? uni?.getSystemInfoSync?.();
  const insets = info?.safeAreaInsets;
  if (insets)
    return {
      top: insets.top ?? 0,
      right: insets.right ?? 0,
      bottom: insets.bottom ?? 0,
      left: insets.left ?? 0,
    };

  const safeArea = info?.safeArea;
  if (!safeArea) return { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    top: safeArea.top,
    right: Math.max(0, (info?.screenWidth ?? safeArea.right) - safeArea.right),
    bottom: Math.max(0, (info?.screenHeight ?? safeArea.bottom) - safeArea.bottom),
    left: safeArea.left,
  };
}

export function getUniCacheSize(): Promise<number> {
  const uni = getUni();
  if (!uni?.getStorageInfo) return getPcCacheSize();
  return new Promise((resolve, reject) =>
    uni.getStorageInfo?.({
      success: ({ currentSize = 0 }) => resolve(currentSize * 1024),
      fail: reject,
    }),
  );
}

export function clearUniCache(): Promise<void> {
  const uni = getUni();
  if (!uni?.clearStorage) return clearPcCache();
  return new Promise((resolve, reject) => uni.clearStorage?.({ success: resolve, fail: reject }));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
