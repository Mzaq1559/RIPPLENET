"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { gsap } from "gsap";

interface RevealOnScrollProps extends HTMLAttributes<HTMLElement> {
  delay?: number;
  trigger?: "mount" | "scroll";
}

export function RevealOnScroll({
  children,
  ...props
}: RevealOnScrollProps) {
  const { delay = 0, trigger = "scroll", ...sectionProps } = props;
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (trigger === "mount") {
        gsap.from(element, {
          autoAlpha: 0,
          y: 16,
          duration: 0.65,
          delay,
          ease: "power2.out",
        });
        return;
      }

      if (typeof IntersectionObserver === "undefined") return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          gsap.from(element, {
            autoAlpha: 0,
            y: 18,
            duration: 0.7,
            delay,
            ease: "power2.out",
          });
          observer.unobserve(element);
        },
        { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
      );
      observer.observe(element);

      return () => observer.disconnect();
    });

    return () => media.revert();
  }, [delay, trigger]);

  return <section ref={elementRef} {...sectionProps}>{children}</section>;
}
