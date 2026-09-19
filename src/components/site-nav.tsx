"use client";

import {
  IconBrandGithub,
  IconMoon,
  IconSparkles,
  IconSun,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/lib/hooks/use-theme";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
] as const;

export const SiteNav = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-20 w-full transition-[background-color,backdrop-filter,border-color] duration-300",
        scrolled && "border-border bg-background/70 border-b backdrop-blur-md"
      )}
    >
      <div className="pointer-events-auto mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 sm:px-12">
        <a
          href="#home"
          className="text-foreground flex items-center gap-2 text-sm font-medium tracking-tight"
        >
          <IconSparkles className="size-4" />
          Tenuka Omaljith
        </a>

        <nav className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "hover:text-foreground relative flex flex-row items-center gap-1.5 transition-colors",
                link.label === "Home" && "text-foreground"
              )}
            >
              {link.label === "Home" ? (
                <span className="bg-foreground size-1 rounded-full" />
              ) : null}
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="border-border bg-background/60 text-foreground hover:bg-accent flex size-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors"
          >
            {theme === "dark" ? (
              <IconMoon className="size-4" />
            ) : (
              <IconSun className="size-4" />
            )}
          </button>
          <a
            href="https://github.com/Tenuka22"
            target="_blank"
            rel="noreferrer"
            className="border-border bg-background/60 text-foreground hover:bg-accent flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors"
          >
            <IconBrandGithub className="size-4" />
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
};
