"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import {
  advanceOffset,
  clearHover,
  createGridState,
  drawGrid,
  drawVignette,
  trackHover,
  updateCellOpacities,
} from "@/lib/shape-grid-canvas";
import type {
  ShapeGridDirection,
  ShapeGridShape,
} from "@/lib/shape-grid-canvas";
import { cn } from "@/lib/utils";

export interface ShapeGridProps {
  direction?: ShapeGridDirection;
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  shape?: ShapeGridShape;
  hoverTrailAmount?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Drifting lattice of outlined cells on a canvas, filled under the pointer.
 *
 * All the geometry lives in `@/lib/shape-grid-canvas`; this component only
 * owns the effect wiring: canvas sizing, pointer tracking, and pausing the
 * animation loop when the grid is off screen or the tab is hidden.
 */
export const ShapeGrid = ({
  direction = "right",
  speed = 1,
  borderColor = "#999",
  squareSize = 40,
  hoverFillColor = "#222",
  shape = "square",
  hoverTrailAmount = 0,
  className,
  style,
}: ShapeGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const config = {
      shape,
      direction,
      speed,
      borderColor,
      squareSize,
      hoverFillColor,
      hoverTrailAmount,
    };
    const state = createGridState();

    const paint = () => {
      drawGrid({
        ctx,
        width: canvas.width,
        height: canvas.height,
        state,
        config,
      });
      drawVignette(ctx, canvas.width, canvas.height);
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (event: MouseEvent) => {
      const { left, top } = canvas.getBoundingClientRect();
      trackHover(state, event.clientX - left, event.clientY - top, config);
    };

    const handleMouseLeave = () => {
      clearHover(state, hoverTrailAmount);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const step = () => {
      advanceOffset(state, config);
      updateCellOpacities(state);
      paint();
      frameRef.current = requestAnimationFrame(step);
    };

    const start = () => {
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    const stop = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    // Reduced motion means one static frame: the grid is decoration, so
    // drifting it would be motion with no purpose.
    if (reducedMotion) {
      paint();
    }

    let isVisible = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible && !document.hidden && !reducedMotion) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden || !isVisible || reducedMotion) {
        stop();
      } else {
        start();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    if (!reducedMotion) {
      start();
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      stop();
    };
  }, [
    direction,
    speed,
    borderColor,
    hoverFillColor,
    squareSize,
    shape,
    hoverTrailAmount,
    reducedMotion,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("shapegrid-canvas", className)}
      style={style}
    />
  );
};
