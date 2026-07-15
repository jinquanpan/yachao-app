export type AndroidPermissionResult = {
  granted: string[];
  deniedPresent: string[];
  deniedAlways: string[];
};

type PlusAndroid = {
  requestPermissions: (
    permissions: string[],
    success: (result: Partial<AndroidPermissionResult>) => void,
    fail: (error: unknown) => void,
  ) => void;
};

function getAndroidApi(): PlusAndroid | undefined {
  return (globalThis as typeof globalThis & { plus?: { android?: PlusAndroid } }).plus?.android;
}

/** Request Android runtime permissions through the H5+ bridge. */
export function requestAndroidPermissions(permissions: string[]): Promise<AndroidPermissionResult> {
  const android = getAndroidApi();
  if (!android) return Promise.reject(new Error("H5+ Android permission API is unavailable"));

  return new Promise((resolve, reject) => {
    android.requestPermissions(
      permissions,
      (result) =>
        resolve({
          granted: result.granted ?? [],
          deniedPresent: result.deniedPresent ?? [],
          deniedAlways: result.deniedAlways ?? [],
        }),
      reject,
    );
  });
}
