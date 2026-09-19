"use client";

import { IconArrowUpRight, IconExternalLink, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useState } from "react";

import { Drawer } from "@/components/motion/drawer";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import type { Project } from "@/data/projects";
import { SPRING_PANEL, SPRING_PRESS } from "@/lib/ease";

export const ProjectCard = ({
  project,
  index,
}: {
  project: Project;
  index: number;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Reveal delay={index * 0.08}>
      <div className="border-border bg-background/60 flex h-full flex-col overflow-hidden rounded-3xl border backdrop-blur-md">
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${project.title}`}
          className="group hover:bg-muted/60 block p-0 transition-[padding] duration-300 hover:p-4"
        >
          <TiltCard className="aspect-video w-full shadow-lg" max={8}>
            <div className="bg-muted border-border relative h-full w-full overflow-hidden rounded-2xl border">
              <img
                src={project.image}
                alt={`${project.title} home page`}
                loading="lazy"
                width={1280}
                height={720}
                className="h-full w-full object-cover object-top"
              />
              <span className="border-border bg-background/70 text-foreground absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                <IconArrowUpRight className="size-4" />
              </span>
            </div>
          </TiltCard>
        </a>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-foreground text-lg font-medium tracking-tight">
              {project.title}
            </h3>
            <span className="text-muted-foreground shrink-0 text-xs">
              {project.year}
            </span>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="border-border text-muted-foreground rounded-full border px-2.5 py-1 text-xs"
              >
                {tech}
              </span>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            whileTap={{ scale: 0.97 }}
            transition={SPRING_PRESS}
            className="border-border text-foreground hover:bg-accent mt-auto flex w-fit items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Requirements & build notes
          </motion.button>
        </div>
      </div>

      <Drawer
        ariaLabel={`${project.title} requirements and build notes`}
        onOpenChange={setOpen}
        open={open}
        side="right"
      >
        <div className="border-border flex items-center justify-between border-b p-6">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              {project.year} · {project.role}
            </span>
            <h3 className="text-foreground text-lg font-medium tracking-tight">
              {project.title}
            </h3>
          </div>
          <motion.button
            type="button"
            onClick={() => setOpen(false)}
            whileTap={{ scale: 0.9 }}
            transition={SPRING_PANEL}
            aria-label="Close"
            className="border-border text-foreground hover:bg-accent flex size-8 shrink-0 items-center justify-center rounded-full border"
          >
            <IconX className="size-4" />
          </motion.button>
        </div>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
              What the client needed
            </span>
            <ul className="flex flex-col gap-1.5">
              {project.requirements.map((requirement) => (
                <li
                  key={requirement}
                  className="text-muted-foreground flex gap-2 text-sm leading-relaxed"
                >
                  <span className="text-foreground">·</span>
                  {requirement}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
              Build notes
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {project.story}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="border-border text-muted-foreground rounded-full border px-2.5 py-1 text-xs"
              >
                {tech}
              </span>
            ))}
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="border-border bg-background/60 text-foreground hover:bg-accent mt-auto flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium backdrop-blur-md transition-colors"
          >
            Visit {project.title}
            <IconExternalLink className="size-4" />
          </a>
        </div>
      </Drawer>
    </Reveal>
  );
};
