export type PcPermissionState = PermissionState | "unsupported";

/** Browsers can query permission state, but most permissions must be requested by using the feature. */
export async function checkPcPermission(permission: string): Promise<PcPermissionState> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unsupported";

  try {
    const result = await navigator.permissions.query({ name: permission } as PermissionDescriptor);
    return result.state;
  } catch {
    return "unsupported";
  }
}

export function requestPcPermissions(permissions: string[]): Promise<PcPermissionState[]> {
  return Promise.all(permissions.map(checkPcPermission));
}

/** PC web has no matching App cache-size capability; keep a no-op adapter for callers. */
export function getPcCacheSize(): Promise<number> {
  return Promise.resolve(0);
}

/** PC web intentionally does not clear browser storage from the App cache action. */
export function clearPcCache(): Promise<void> {
  return Promise.resolve();
}
