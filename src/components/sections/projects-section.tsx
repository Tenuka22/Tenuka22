"use client";

import { PROJECTS } from "@/data/projects";

import { ProjectCard } from "./project-card";
import { SectionHeading } from "./section-heading";

export const ProjectsSection = () => (
  <section
    id="projects"
    className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-24 sm:px-12"
  >
    <SectionHeading
      eyebrow="Selected work"
      title="Projects"
      description="A handful of live sites I've built and shipped end to end, from storefronts to internal administration systems."
    />

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {PROJECTS.map((project, index) => (
        <ProjectCard index={index} key={project.slug} project={project} />
      ))}
    </div>
  </section>
);
