"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const displayRef = useRef(value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const counter = { value: hasAnimatedRef.current ? displayRef.current : 0 };
      hasAnimatedRef.current = true;
      gsap.to(counter, {
        value,
        duration: 1.15,
        ease: "power2.out",
        onUpdate: () => {
          displayRef.current = Math.round(counter.value);
          setDisplayValue(displayRef.current);
        },
      });
    });
    media.add("(prefers-reduced-motion: reduce)", () => {
      displayRef.current = value;
      setDisplayValue(value);
    });

    return () => media.revert();
  }, [value]);

  return (
    <span aria-label={value.toLocaleString("en-US")} aria-live="off">
      {displayValue.toLocaleString("en-US")}
    </span>
  );
}
