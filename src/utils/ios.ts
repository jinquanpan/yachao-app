export type IosPermissionState =
  | "authorized"
  | "denied"
  | "undetermined"
  | "notdeny"
  | "unknown"
  | "unsupported";

type PlusNavigator = {
  checkPermission: (permission: string) => IosPermissionState;
};

type PlusRuntime = {
  openURL: (url: string, error?: (reason: unknown) => void) => void;
};

function getPlusApi() {
  return (
    globalThis as typeof globalThis & {
      plus?: { navigator?: PlusNavigator; runtime?: PlusRuntime };
    }
  ).plus;
}

/** iOS permissions are triggered by their capability API; this reads the current H5+ state. */
export function checkIosPermission(permission: string): IosPermissionState {
  return getPlusApi()?.navigator?.checkPermission(permission) ?? "unknown";
}

/** Open the current app's iOS system settings page after a permission is denied. */
export function openIosAppSettings(): Promise<void> {
  const runtime = getPlusApi()?.runtime;
  if (!runtime) return Promise.reject(new Error("H5+ iOS runtime API is unavailable"));

  return new Promise((resolve, reject) => {
    runtime.openURL("app-settings:", reject);
    resolve();
  });
}
