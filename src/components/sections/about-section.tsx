"use client";

import { IconPlaneTilt } from "@tabler/icons-react";

import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Reveal } from "@/components/motion/reveal";

import { SectionHeading } from "./section-heading";

export const AboutSection = () => (
  <section
    id="about"
    className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-24 sm:px-12"
  >
    <SectionHeading eyebrow="About" title="Who I am" />

    <Reveal className="flex max-w-2xl flex-col gap-4">
      <AnimatedBadge
        className="w-fit"
        icon={<IconPlaneTilt className="size-3.5" />}
        status="info"
      >
        Open to work · Sri Lanka (UTC+5:30) · replies within a day
      </AnimatedBadge>

      <p className="text-foreground text-base leading-relaxed sm:text-lg">
        I&apos;m Tenuka, a website developer and systems engineer building fast,
        clean and meaningful web applications. I care about quality staying
        consistent from the first commit to production, not just the demo.
      </p>
      <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
        Most of my work spans full storefronts, admissions and administration
        systems, and backend services, usually in TypeScript, React and Go,
        deployed on Cloudflare. I favour boring, maintainable solutions over
        clever ones, and ship in small, reviewed changes rather than large
        rewrites.
      </p>
    </Reveal>
  </section>
);
