import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { ChromaticTextReveal } from "@/components/motion/chromatic-text-reveal";
import { ShaderBackground } from "@/components/motion/shader-background";
import { useTheme } from "@/lib/hooks/use-theme";

export const Route = createFileRoute("/")({ component: App });

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
      <ShaderBackground
        variant="grain-gradient"
        colors={
          theme === "dark"
            ? ["#3a2233", "#1f2c40", "#3a3320", "#241d3a"]
            : ["#ffd6e8", "#c9e4ff", "#fff3c4", "#d9c9ff"]
        }
        colorBack={theme === "dark" ? "#0a0a0a" : "#fff"}
        softness={0.85}
        className="absolute inset-0 z-0 h-full"
        speed={2}
      />
      <div
        id="home"
        className="relative z-10 mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center gap-10 px-6 pt-28 pb-16 sm:px-12"
      >
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
    </div>
  );
};
