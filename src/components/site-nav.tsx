"use client";

import { IconBrandGithub, IconMoon, IconSparkles, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/lib/hooks/use-theme";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
] as const;

export function SiteNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex w-full items-center justify-between px-6 py-5 sm:px-10">
      <a
        href="#home"
        className="flex items-center gap-2 text-sm font-medium tracking-tight text-foreground"
      >
        <IconSparkles className="size-4" />
        Tenuka Omaljith
      </a>

      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex flex-col items-center gap-1.5 transition-colors hover:text-foreground",
              link.label === "Home" && "text-foreground",
            )}
          >
            {link.label}
            {link.label === "Home" ? (
              <span className="size-1 rounded-full bg-foreground" />
            ) : null}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-background/60 text-foreground backdrop-blur-md transition-colors hover:bg-accent"
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
          className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:bg-accent"
        >
          <IconBrandGithub className="size-4" />
          GitHub
        </a>
      </div>
    </header>
  );
}
