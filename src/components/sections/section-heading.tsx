"use client";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) => (
  <Reveal className={cn("flex flex-col gap-3", className)}>
    <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase">
      <span className="bg-foreground size-1 rounded-full" />
      {eyebrow}
    </span>
    <h2 className="text-foreground text-2xl font-medium tracking-tight sm:text-3xl">
      {title}
    </h2>
    {description ? (
      <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
        {description}
      </p>
    ) : null}
  </Reveal>
);
