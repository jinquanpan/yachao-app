import { requestAndroidPermissions, type AndroidPermissionResult } from "./android";
import { checkIosPermission, type IosPermissionState } from "./ios";
import { requestPcPermissions, type PcPermissionState } from "./pc";

export type AppPlatform = "android" | "ios" | "pc";

type UniSystemInfo = { platform?: string };
type UniApi = { getSystemInfoSync?: () => UniSystemInfo };

function getPlatform(): AppPlatform {
  const uni = (globalThis as typeof globalThis & { uni?: UniApi }).uni;
  const platform = uni?.getSystemInfoSync?.().platform?.toLowerCase();
  if (platform === "android") return "android";
  if (platform === "ios") return "ios";
  return "pc";
}

/** The only permission entry point pages and business components should import. */
export function requestPermissions(
  permissions: string[],
): Promise<AndroidPermissionResult | IosPermissionState[] | PcPermissionState[]> {
  const platform = getPlatform();
  if (platform === "android") return requestAndroidPermissions(permissions);
  if (platform === "ios") return Promise.resolve(permissions.map(checkIosPermission));
  return requestPcPermissions(permissions);
}

export { checkIosPermission, openIosAppSettings } from "./ios";
export { checkPcPermission } from "./pc";
export type { AndroidPermissionResult } from "./android";
export type { IosPermissionState } from "./ios";
export type { PcPermissionState } from "./pc";
