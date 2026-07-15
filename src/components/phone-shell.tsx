import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  House,
  LayoutGrid,
  CircleCheckBig,
  ShoppingCart,
  UserRound,
  ChevronLeft,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, isAuthenticated, type Cart } from "@/lib/api";
import { getSafeAreaInsets } from "@/utils/uniapp";

const tabs = [
  { to: "/home", label: "首页", icon: House },
  { to: "/category", label: "分类", icon: LayoutGrid },
  { to: "/discover", label: "发现", icon: CircleCheckBig },
  { to: "/cart", label: "购物车", icon: ShoppingCart },
  { to: "/profile", label: "我的", icon: UserRound },
] as const;

export function PhoneShell({
  children,
  showNav = true,
  dark = false,
  noPad = false,
}: {
  children: ReactNode;
  showNav?: boolean;
  dark?: boolean;
  noPad?: boolean;
}) {
  const [safeArea, setSafeArea] = useState(() => ({ top: 0, bottom: 0 }));
  const [isH5Plus, setIsH5Plus] = useState(false);
  useEffect(() => {
    const { top, bottom } = getSafeAreaInsets();
    setSafeArea({ top, bottom });
    setIsH5Plus("plus" in window || navigator.userAgent.includes("Html5Plus"));
  }, []);
  const safeAreaStyle = {
    "--safe-area-top": `${safeArea.top}px`,
    "--safe-area-bottom": `${safeArea.bottom}px`,
  } as CSSProperties;
  return (
    <main className={`app-stage ${isH5Plus ? "h5plus-stage" : ""}`}>
      <section className={`phone ${dark ? "phone-dark" : ""}`} style={safeAreaStyle}>
        <div className="safe-top" aria-hidden="true" />
        <div className={`phone-content ${showNav && !noPad ? "with-nav" : ""}`}>{children}</div>
        {showNav && <BottomNav />}
      </section>
    </main>
  );
}

function BottomNav() {
  const path = useLocation().pathname;
  const { data } = useQuery({
    queryKey: ["cart"],
    queryFn: () => apiRequest<Cart>("/cart"),
    enabled: isAuthenticated(),
    staleTime: 15_000,
  });
  const count = data?.items.reduce((sum, item) => sum + item.qty, 0) ?? 0;
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = path === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            data-cart-target={tab.to === "/cart" ? "true" : undefined}
            className={`nav-item ${active ? "active" : ""}`}
          >
            <span className="relative">
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              {tab.to === "/cart" && count > 0 && <b className="cart-badge">{count}</b>}
            </span>
            <em>{tab.label}</em>
          </Link>
        );
      })}
    </nav>
  );
}

export function TopBar({
  title,
  back,
  right,
  dark = false,
}: {
  title?: ReactNode;
  back?: boolean;
  right?: ReactNode;
  dark?: boolean;
}) {
  return (
    <header className={`top-bar ${dark ? "text-white" : ""}`}>
      <div>
        {back && (
          <button onClick={() => history.back()} className="icon-button" aria-label="返回">
            <ChevronLeft size={22} />
          </button>
        )}
      </div>
      <h1>{title}</h1>
      <div>{right}</div>
    </header>
  );
}

export function Brand({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <div className={`brand ${compact ? "compact" : ""} ${light ? "light" : ""}`}>
      <span className="brand-mark">山</span>
      <span>
        <strong>山海灵感</strong>
        <small>便利店</small>
      </span>
    </div>
  );
}
