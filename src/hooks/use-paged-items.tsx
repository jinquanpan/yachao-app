import { useCallback, useEffect, useRef, useState } from "react";

export type LoadStatus = "more" | "loading" | "done";

export function usePagedItems<T>(items: T[], pageSize = 20) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(pageSize, items.length));
  const [status, setStatus] = useState<LoadStatus>(() => items.length > pageSize ? "more" : "done");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(pageSize, items.length));
    setStatus(items.length > pageSize ? "more" : "done");
  }, [items.length, pageSize]);

  const loadMore = useCallback(() => {
    if (status !== "more") return;
    setStatus("loading");
    timerRef.current = window.setTimeout(() => {
      setVisibleCount((current) => {
        const next = Math.min(current + pageSize, items.length);
        setStatus(next < items.length ? "more" : "done");
        return next;
      });
    }, 420);
  }, [items.length, pageSize, status]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollRoot = sentinel?.closest<HTMLElement>(".phone-content");
    if (!sentinel || !scrollRoot) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { root: scrollRoot, rootMargin: "0px 0px 100px", threshold: 0.01 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  return { visibleItems: items.slice(0, visibleCount), status, sentinelRef, loadMore };
}

export function LoadFooter({ status, onRetry }: { status: LoadStatus; onRetry?: () => void }) {
  return <div className="load-footer" role="status" aria-live="polite">
    {status === "loading" && <><i className="load-spinner" />正在加载...</>}
    {status === "more" && <button type="button" onClick={onRetry}>继续上滑加载更多</button>}
    {status === "done" && <><span className="load-line" />没有更多商品了<span className="load-line" /></>}
  </div>;
}
