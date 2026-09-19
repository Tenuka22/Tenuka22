"use client";

import {
  IconBrandCpp,
  IconBrandDocker,
  IconBrandFigma,
  IconBrandGit,
  IconBrandGolang,
  IconBrandJavascript,
  IconBrandKotlin,
  IconBrandNodejs,
  IconBrandReact,
  IconBrandRust,
  IconBrandTailwind,
  IconBrandTypescript,
  IconCloud,
  IconDatabase,
} from "@tabler/icons-react";

import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";

import { SectionHeading } from "./section-heading";

type TablerIcon = React.ComponentType<{ className?: string }>;

interface SkillGroup {
  label: string;
  skills: { icon: TablerIcon; name: string }[];
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    label: "Languages",
    skills: [
      { icon: IconBrandTypescript, name: "TypeScript" },
      { icon: IconBrandJavascript, name: "JavaScript" },
      { icon: IconBrandGolang, name: "Go" },
      { icon: IconBrandRust, name: "Rust" },
      { icon: IconBrandCpp, name: "C++" },
      { icon: IconBrandKotlin, name: "Kotlin" },
    ],
  },
  {
    label: "Frontend",
    skills: [
      { icon: IconBrandReact, name: "React" },
      { icon: IconBrandTailwind, name: "Tailwind CSS" },
      { icon: IconDatabase, name: "TanStack" },
    ],
  },
  {
    label: "Backend & infra",
    skills: [
      { icon: IconBrandNodejs, name: "Node.js" },
      { icon: IconDatabase, name: "PostgreSQL" },
      { icon: IconBrandDocker, name: "Docker" },
      { icon: IconCloud, name: "Cloudflare" },
    ],
  },
  {
    label: "Tools",
    skills: [
      { icon: IconBrandGit, name: "Git & GitHub" },
      { icon: IconBrandFigma, name: "Figma" },
    ],
  },
];

const ALL_SKILLS = SKILL_GROUPS.flatMap((group) => group.skills);

export const SkillsSection = () => (
  <section
    id="skills"
    className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-24 sm:px-12"
  >
    <SectionHeading
      eyebrow="Toolbox"
      title="Skills"
      description="Languages and tools I reach for most, from day-to-day frontend work to the infrastructure behind it."
    />

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {SKILL_GROUPS.map((group, groupIndex) => (
        <Reveal delay={groupIndex * 0.08} key={group.label}>
          <div className="border-border bg-background/60 flex h-full flex-col gap-4 rounded-3xl border p-6 backdrop-blur-md">
            <span className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.skills.map(({ icon: Icon, name }) => (
                <span
                  key={name}
                  className="border-border text-foreground flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
                >
                  <Icon className="size-3.5" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>

    <Reveal>
      <Marquee gap="0.75rem" speed={35}>
        {ALL_SKILLS.map(({ icon: Icon, name }) => (
          <span
            key={name}
            className="border-border bg-background/60 text-foreground flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs backdrop-blur-md"
          >
            <Icon className="size-3.5" />
            {name}
          </span>
        ))}
      </Marquee>
    </Reveal>
  </section>
);
