import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { ChromaticTextReveal } from "@/components/motion/chromatic-text-reveal";
import { ShapeGrid } from "@/components/motion/shape-grid";
import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { useTheme } from "@/lib/hooks/use-theme";

const SOCIAL_LINKS = [
  {
    icon: IconBrandGithub,
    label: "GitHub",
    href: "https://github.com/Tenuka22",
  },
  {
    icon: IconBrandLinkedin,
    label: "LinkedIn",
    href: "https://linkedin.com/in/tenuka-omaljith-31b61538a",
  },
  {
    icon: IconBrandInstagram,
    label: "Instagram",
    href: "https://www.instagram.com/tenuka22/",
  },
  {
    icon: IconMail,
    label: "Email",
    href: "mailto:tenukaomaljith2009@gmail.com",
  },
] as const;

const App = () => {
  const { theme } = useTheme();

  return (
    <div className="relative flex min-h-svh flex-col">
      <ShapeGrid
        borderColor={theme === "dark" ? "#333" : "#ccc"}
        hoverFillColor={theme === "dark" ? "#1a1a2e" : "#f0f0f5"}
        className="absolute inset-0 -z-10 h-full w-full opacity-50"
        direction="diagonal"
        speed={0.3}
        squareSize={50}
        shape="square"
      />
      <section
        id="home"
        className="relative flex min-h-svh w-full flex-col overflow-hidden"
      >
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 pt-28 pb-16 sm:px-12">
          <div className="flex flex-col items-start gap-6 pt-14">
            <div className="@container w-full">
              <ChromaticTextReveal
                prefix="Tenuka Omaljith,"
                words={[
                  "Website Developer",
                  "Systems Engineer.",
                  "Backend Architech.",
                ]}
                startOnView={false}
                className="text-foreground shrink-0 flex-col [font-size:clamp(1.25rem,7.8cqw,3rem)] leading-[1.12] font-medium tracking-[-0.1rem]"
              />
            </div>

            <p className="text-muted-foreground max-w-md text-sm leading-relaxed sm:text-base">
              I build fast, clean and meaningful web applications. Passionate
              about modern technologies, design and solving real problems.
            </p>

            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="border-border bg-background/60 text-foreground hover:bg-accent flex size-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-row gap-4">
            <span className="bg-border h-8 w-px" />
            <span className="flex flex-row gap-2">
              Scroll to explore
              <span aria-hidden>↓</span>
            </span>
          </div>
        </div>
      </section>

      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </div>
  );
};

export const Route = createFileRoute("/")({ component: App });
