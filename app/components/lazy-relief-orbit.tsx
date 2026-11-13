"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ReliefOrbit = dynamic(() => import("./relief-orbit"), {
  ssr: false,
  loading: () => null,
});

export function LazyReliefOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "160px" },
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relief-orbit-fallback" aria-hidden="true">
      {isNearViewport && <ReliefOrbit />}
    </div>
  );
}
