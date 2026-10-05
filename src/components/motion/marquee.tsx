import { isValidElement } from "react";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface MarqueeProps {
  /** Pass an array of keyed elements (e.g. `items.map(...)`). */
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  speed?: number;
  pauseOnHover?: boolean;
  gap?: string;
  className?: string;
  fade?: boolean;
}

export const Marquee = ({
  children,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  gap = "1rem",
  className,
  fade = true,
}: MarqueeProps) => {
  const vertical = direction === "up" || direction === "down";
  const reverse = direction === "right" || direction === "down";
  const items = Array.isArray(children) ? children : [children];

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        fade &&
          !vertical &&
          "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        fade &&
          vertical &&
          "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
        className
      )}
      // gap on the wrapper too, so the seam between the two tracks matches the
      // spacing between items and the loop stays even.
      style={{ "--gap": gap, gap } as CSSProperties}
    >
      {[0, 1].map((dup) => (
        <div
          key={dup}
          aria-hidden={dup === 1}
          inert={dup === 1}
          style={{
            animationDuration: `${speed}s`,
            animationDirection: reverse ? "reverse" : "normal",
            gap,
          }}
          className={cn(
            "flex shrink-0 items-center",
            vertical
              ? "animate-marquee-vertical flex-col"
              : "animate-marquee flex-row",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
        >
          {items.map((child) => {
            const itemKey =
              isValidElement(child) && child.key !== null
                ? child.key
                : "unkeyed";
            return (
              <div className="shrink-0" key={`${dup}-${itemKey}`}>
                {child}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
