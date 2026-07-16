const configuredBase = import.meta.env.VITE_API_BASE_URL || "http://120.53.21.92:30997/api/v1";

export const API_BASE_URL = configuredBase.replace(/\/$/, "");
const TOKEN_KEY = "shanhai_session_token";
const TOKEN_EXPIRES_KEY = "shanhai_session_expires_at";

export interface ApiMeta {
  page: number;
  pageSize: number;
  total: number;
}
export interface ApiEnvelope<T> {
  data: T;
  meta?: ApiMeta;
}
export interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
  requestId?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function setSession(session: { token: string; expires_at: string }): void {
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(TOKEN_EXPIRES_KEY, session.expires_at);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_EXPIRES_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "无法连接服务，请稍后重试");
  }
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & ApiErrorBody;
  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new ApiError(
      response.status,
      body.error?.code || "API_ERROR",
      body.error?.message || `请求失败 (${response.status})`,
      body.error?.details,
    );
  }
  return body.data;
}

export async function apiPage<T>(path: string): Promise<ApiEnvelope<T[]>> {
  const token = getToken();
  const headers = new Headers(token ? { Authorization: `Bearer ${token}` } : undefined);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { headers });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "无法连接服务，请稍后重试");
  }
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T[]> & ApiErrorBody;
  if (!response.ok)
    throw new ApiError(
      response.status,
      body.error?.code || "API_ERROR",
      body.error?.message || "请求失败",
      body.error?.details,
    );
  return body;
}

export const jsonBody = (value: unknown): Pick<RequestInit, "body"> => ({
  body: JSON.stringify(value),
});
export const queryString = (
  values: Record<string, string | number | boolean | null | undefined>,
) => {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
};

export type Id = string | number;
export type Platform = "android" | "ios" | "pc";
export type LoginScope = "app" | "admin" | "cashier";
export type PaymentChannel = "wechat" | "alipay" | "apple";
export type AuthSession = { token: string; expires_at: string };

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}
export interface Category {
  id: string;
  key: string;
  label: string;
  parent_id: string | null;
  icon?: string | null;
  children?: Category[];
}
export interface Product {
  id: string;
  product_no: string;
  name: string;
  subtitle: string | null;
  price: string;
  cover_image: string | null;
  spec: string | null;
  stock: number;
  sales_count: number;
  category: Pick<Category, "id" | "key" | "label"> | null;
  tags: Tag[];
  story?: string | null;
  is_favorite?: boolean;
  skus?: Array<{
    id: string;
    sku_code: string;
    price: string;
    stock: number;
    attributes: Record<string, string>;
  }>;
}
export interface CartItem {
  id: string;
  product_id: string;
  sku_id: string | null;
  qty: number;
  selected: boolean;
  valid: boolean;
  stock: number;
  unit_price: string;
  line_total: string;
  product: {
    name: string;
    subtitle: string | null;
    cover_image: string | null;
    spec: string | null;
  };
}
export interface Cart {
  items: CartItem[];
  summary: { selected_count: number; total: string };
}
export interface CartItemInput {
  product_id: Id;
  sku_id?: Id | null;
  qty: number;
}
export interface Address {
  id: string;
  consignee: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  tag: string | null;
  is_default: boolean;
}
export interface AddressInput {
  consignee?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
  tag?: string | null;
  is_default?: boolean;
}
export interface CheckoutInput {
  cart_item_ids?: Id[];
  item?: CartItemInput;
  address_id?: Id;
  user_coupon_id?: Id;
}
export type OrderStatus =
  | "pending-payment"
  | "pending-shipment"
  | "pending-receipt"
  | "completed"
  | "cancelled"
  | "after-sale";
export interface OrderItem {
  id: string;
  product_id: string;
  sku_id: string | null;
  qty: number;
  price: string;
  product_snapshot: { name?: string; subtitle?: string; cover_image?: string; spec?: string };
}
export interface Order {
  id: string;
  order_no: string;
  status: OrderStatus;
  total: string;
  discount: string;
  pay_amount: string;
  address_snapshot: Address;
  carrier?: string | null;
  tracking_no?: string | null;
  created_at: string;
  items: OrderItem[];
}
export interface Coupon {
  id: string;
  name?: string;
  title?: string;
  amount?: string;
  threshold?: string | null;
  status?: "unused" | "used" | "expired";
  expires_at?: string | null;
}
export interface Payment {
  id?: string;
  payment_no: string;
  order_no?: string;
  channel?: PaymentChannel;
  status?: string;
  amount?: string;
  paid_at?: string | null;
}
export interface PaymentCallbackInput {
  payment_no: string;
  trade_no: string;
  status: "paid" | "failed";
  paid_at?: string;
}
export interface Refund {
  id?: string;
  refund_no: string;
  order_no?: string;
  amount?: string;
  reason?: string | null;
  status?: string;
}
export interface RefundCallbackInput {
  refund_no: string;
  status: "processed" | "failed";
}
export interface ScanProduct {
  id: string;
  barcode: string;
  name: string;
  price: string;
  category_id?: string | null;
  cover_image?: string | null;
  status?: string;
  created_at?: string;
}
export interface AppVersion {
  id?: string;
  platform?: Platform;
  version: string;
  download_url: string;
  release_notes?: string | null;
  force_update?: boolean;
  created_at?: string;
}
export interface PublishAppVersionInput {
  platform: Platform;
  version: string;
  download_url: string;
  force_update?: boolean;
  release_notes?: string | null;
}
export interface MeAccess {
  role: string;
  login_scopes: LoginScope[];
}
export interface Me {
  id: string;
  phone: string;
  nickname: string | null;
  avatar_url: string | null;
  stats: {
    favorites: number;
    available_coupons: number;
    orders: Partial<Record<OrderStatus, number>>;
  };
}

type PageParams = {
  page?: number;
  pageSize?: number;
};
type ProductQuery = PageParams & {
  category?: string;
  keyword?: string;
  tag?: string;
  sort?: "newest" | "sales" | "price_asc" | "price_desc";
};
type OrderQuery = PageParams & {
  status?: OrderStatus | "all";
};
type IdempotentInit = {
  idempotencyKey?: string;
};
type SignedCallbackInit = {
  signature: string;
};

function idempotencyHeaders(idempotencyKey?: string): HeadersInit | undefined {
  return idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined;
}

function signatureHeaders(signature: string): HeadersInit {
  return { "x-signature": signature };
}

export const api = {
  health: () => apiRequest<unknown>("/health"),
  auth: {
    phoneLogin: (body: {
      phone: string;
      code: string;
      device?: string;
      platform?: Platform;
      login_scope?: LoginScope;
    }) =>
      apiRequest<{ session: AuthSession }>("/auth/phone/login", {
        method: "POST",
        ...jsonBody(body),
      }),
    oauthLogin: (body: {
      identity_type: "wechat" | "apple";
      identifier: string;
      credential?: string;
      phone?: string;
      device?: string;
      platform?: Platform;
      login_scope?: LoginScope;
    }) =>
      apiRequest<{ session: AuthSession }>("/auth/oauth/login", {
        method: "POST",
        ...jsonBody(body),
      }),
    register: (body: {
      phone: string;
      code: string;
      password: string;
      account?: string;
      nickname?: string;
      device?: string;
      platform?: Platform;
    }) =>
      apiRequest<{ session: AuthSession }>("/auth/register", {
        method: "POST",
        ...jsonBody(body),
      }),
    passwordLogin: (body: {
      account: string;
      password: string;
      device?: string;
      platform?: Platform;
      login_scope?: LoginScope;
    }) =>
      apiRequest<{ session: AuthSession }>("/auth/password/login", {
        method: "POST",
        ...jsonBody(body),
      }),
    setPassword: (body: { phone: string; code: string; password: string }) =>
      apiRequest<void>("/auth/password/set", {
        method: "POST",
        ...jsonBody(body),
      }),
    wechatLogin: (body: {
      code: string;
      phone?: string;
      phone_code?: string;
      device?: string;
      platform?: Platform;
      login_scope?: LoginScope;
    }) =>
      apiRequest<{ session: AuthSession }>("/auth/wechat/login", {
        method: "POST",
        ...jsonBody(body),
      }),
    refresh: (token: string) =>
      apiRequest<{ session: AuthSession }>("/auth/refresh", {
        method: "POST",
        ...jsonBody({ token }),
      }),
    logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
  },
  me: {
    get: () => apiRequest<Me>("/me"),
    update: (body: { nickname?: string | null; avatar_url?: string | null }) =>
      apiRequest<Me>("/me", { method: "PATCH", ...jsonBody(body) }),
    coupons: (status?: "unused" | "used" | "expired") =>
      apiRequest<Coupon[]>(`/me/coupons${queryString({ status })}`),
    access: () => apiRequest<MeAccess>("/me/access"),
  },
  catalog: {
    home: () =>
      apiRequest<{
        banners?: unknown[];
        categories: Category[];
        recommendations: Array<{ products: Product[] }>;
      }>("/home"),
    categories: () => apiRequest<Category[]>("/categories"),
    products: (params: ProductQuery = {}) =>
      apiPage<Product>(`/products${queryString(params)}`),
    product: (id: Id) => apiRequest<Product>(`/products/${id}`),
  },
  cart: {
    get: () => apiRequest<Cart>("/cart"),
    addItem: (body: CartItemInput) =>
      apiRequest<CartItem>("/cart/items", { method: "POST", ...jsonBody(body) }),
    clearItems: (selected = false) =>
      apiRequest<void>(`/cart/items${queryString({ selected })}`, { method: "DELETE" }),
    updateItem: (id: Id, body: { qty?: number; selected?: boolean }) =>
      apiRequest<CartItem>(`/cart/items/${id}`, { method: "PATCH", ...jsonBody(body) }),
    removeItem: (id: Id) => apiRequest<void>(`/cart/items/${id}`, { method: "DELETE" }),
    updateSelection: (body: { selected: boolean; item_ids?: Id[] }) =>
      apiRequest<Cart>("/cart/selection", { method: "PATCH", ...jsonBody(body) }),
  },
  favorites: {
    list: (params: PageParams = {}) => apiPage<Product>(`/favorites${queryString(params)}`),
    add: (productId: Id) => apiRequest<unknown>(`/favorites/${productId}`, { method: "PUT" }),
    remove: (productId: Id) =>
      apiRequest<unknown>(`/favorites/${productId}`, { method: "DELETE" }),
  },
  addresses: {
    list: () => apiRequest<Address[]>("/addresses"),
    create: (body: AddressInput) =>
      apiRequest<Address>("/addresses", { method: "POST", ...jsonBody(body) }),
    update: (id: Id, body: AddressInput) =>
      apiRequest<Address>(`/addresses/${id}`, { method: "PATCH", ...jsonBody(body) }),
    remove: (id: Id) => apiRequest<void>(`/addresses/${id}`, { method: "DELETE" }),
    setDefault: (id: Id) => apiRequest<Address>(`/addresses/${id}/default`, { method: "PUT" }),
  },
  orders: {
    preview: (body: CheckoutInput) =>
      apiRequest<{
        items: CartItem[];
        summary: { selected_count?: number; total: string; discount?: string; pay_amount?: string };
      }>("/checkout/preview", { method: "POST", ...jsonBody(body) }),
    create: (body: CheckoutInput & { address_id: Id; remark?: string }, init: IdempotentInit = {}) =>
      apiRequest<Order>("/orders", {
        method: "POST",
        headers: idempotencyHeaders(init.idempotencyKey),
        ...jsonBody(body),
      }),
    list: (params: OrderQuery = {}) => apiPage<Order>(`/orders${queryString(params)}`),
    counts: () => apiRequest<Partial<Record<OrderStatus, number>>>("/orders/counts"),
    detail: (orderNo: string) => apiRequest<Order>(`/orders/${orderNo}`),
    cancel: (orderNo: string, reason?: string) =>
      apiRequest<Order>(`/orders/${orderNo}/cancel`, {
        method: "POST",
        ...jsonBody(reason ? { reason } : {}),
      }),
    confirmReceipt: (orderNo: string) =>
      apiRequest<Order>(`/orders/${orderNo}/confirm-receipt`, { method: "POST" }),
  },
  payments: {
    create: (orderNo: string, channel: PaymentChannel) =>
      apiRequest<Payment>(`/orders/${orderNo}/payments`, {
        method: "POST",
        ...jsonBody({ channel }),
      }),
    detail: (paymentNo: string) => apiRequest<Payment>(`/payments/${paymentNo}`),
    callback: (
      channel: PaymentChannel,
      body: PaymentCallbackInput,
      init: SignedCallbackInit,
    ) =>
      apiRequest<unknown>(`/payments/callback/${channel}`, {
        method: "POST",
        headers: signatureHeaders(init.signature),
        ...jsonBody(body),
      }),
    requestRefund: (
      orderNo: string,
      body: { amount: string; reason?: string },
      init: IdempotentInit = {},
    ) =>
      apiRequest<Refund>(`/orders/${orderNo}/refunds`, {
        method: "POST",
        headers: idempotencyHeaders(init.idempotencyKey),
        ...jsonBody(body),
      }),
    refunds: (orderNo: string) => apiRequest<Refund[]>(`/orders/${orderNo}/refunds`),
    refundCallback: (
      channel: PaymentChannel,
      body: RefundCallbackInput,
      init: SignedCallbackInit,
    ) =>
      apiRequest<unknown>(`/refunds/callback/${channel}`, {
        method: "POST",
        headers: signatureHeaders(init.signature),
        ...jsonBody(body),
      }),
  },
  coupons: {
    available: () => apiRequest<Coupon[]>("/coupons/available"),
    claim: (id: Id) => apiRequest<Coupon>(`/coupons/${id}/claim`, { method: "POST" }),
  },
  scan: {
    barcode: (barcode: string) => apiRequest<unknown>(`/scan/barcodes/${barcode}`),
    submitProduct: (body: {
      barcode: string;
      name: string;
      price: string;
      category_id?: Id;
      cover_image?: string;
    }) => apiRequest<ScanProduct>("/scan/products", { method: "POST", ...jsonBody(body) }),
    mine: (params: PageParams = {}) => apiPage<ScanProduct>(`/scan/products/mine${queryString(params)}`),
  },
  uploads: {
    image: (image: File | Blob) => {
      const formData = new FormData();
      formData.set("image", image);
      return apiRequest<{ url: string }>("/uploads/images", { method: "POST", body: formData });
    },
  },
  app: {
    latestVersion: (platform: Platform) =>
      apiRequest<AppVersion>(`/app/versions/latest${queryString({ platform })}`),
    publishVersion: (body: PublishAppVersionInput) =>
      apiRequest<AppVersion>("/app/versions/publish", { method: "POST", ...jsonBody(body) }),
  },
  admin: {
    adjustStock: (
      productId: Id,
      body: { change_qty: number; reason: string; sku_id?: Id; biz_id?: string; operator_id?: Id },
    ) =>
      apiRequest<unknown>(`/admin/products/${productId}/stock-adjustments`, {
        method: "POST",
        ...jsonBody(body),
      }),
    shipOrder: (
      orderNo: string,
      body: { carrier: string; tracking_no: string; operator_id?: Id },
    ) => apiRequest<Order>(`/admin/orders/${orderNo}/ship`, { method: "POST", ...jsonBody(body) }),
    approveScanProduct: (id: Id, body: { stock?: number; reviewer_id?: Id } = {}) =>
      apiRequest<unknown>(`/admin/scan-products/${id}/approve`, {
        method: "POST",
        ...jsonBody(body),
      }),
    rejectScanProduct: (id: Id, body: { reason: string; reviewer_id?: Id }) =>
      apiRequest<unknown>(`/admin/scan-products/${id}/reject`, {
        method: "POST",
        ...jsonBody(body),
      }),
    resource: {
      list: <T>(resource: string, params: PageParams = {}) =>
        apiPage<T>(`/resources/${resource}${queryString(params)}`),
      create: <T>(resource: string, body: Record<string, unknown>) =>
        apiRequest<T>(`/resources/${resource}`, { method: "POST", ...jsonBody(body) }),
    },
  },
} as const;

export function absoluteAsset(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return new URL(url, API_BASE_URL.replace(/\/api\/v1$/, "")).toString();
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败，请稍后重试";
}
