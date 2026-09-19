"use client";

import {
  IconArrowLeft,
  IconArrowsSplit,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBug,
  IconChartLine,
  IconChevronRight,
  IconClock,
  IconCloudUpload,
  IconGitBranch,
  IconGitPullRequest,
  IconInbox,
  IconMail,
  IconMessageCircle,
  IconPackage,
  IconPalette,
  IconPlaneTilt,
  IconRefresh,
  IconRocket,
  IconServer,
  IconVideo,
  IconWorld,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SPRING_PANEL, SPRING_PRESS } from "@/lib/ease";
import { ExpandableTabs } from "@/components/motion/expandable-tabs";

type TablerIcon = React.ComponentType<{ className?: string }>;

function ZedIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Zed</title>
      <path d="M2.25 1.5a.75.75 0 0 0-.75.75v16.5H0V2.25A2.25 2.25 0 0 1 2.25 0h20.095c1.002 0 1.504 1.212.795 1.92L10.764 14.298h3.486V12.75h1.5v1.922a1.125 1.125 0 0 1-1.125 1.125H9.264l-2.578 2.578h11.689V9h1.5v9.375a1.5 1.5 0 0 1-1.5 1.5H5.185L2.562 22.5H21.75a.75.75 0 0 0 .75-.75V5.25H24v16.5A2.25 2.25 0 0 1 21.75 24H1.655C.653 24 .151 22.788.86 22.08L13.19 9.75H9.75v1.5h-1.5V9.375A1.125 1.125 0 0 1 9.375 8.25h5.314l2.625-2.625H5.625V15h-1.5V5.625a1.5 1.5 0 0 1 1.5-1.5h13.19L21.438 1.5z" />
    </svg>
  );
}

type MenuRow = {
  icon: TablerIcon;
  label: string;
  text: string;
  code?: string;
};

function Row({
  row,
  onSelect,
}: {
  row: MenuRow;
  onSelect: (row: MenuRow) => void;
}) {
  return (
    <motion.button
      type="button"
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      animate="rest"
      onClick={() => onSelect(row)}
      className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground"
    >
      <motion.span
        variants={{
          rest: { backgroundColor: "transparent" },
          hover: { backgroundColor: "var(--muted)" },
          tap: { backgroundColor: "var(--muted)" },
        }}
        className="absolute inset-0 -z-10 rounded-xl"
      />
      <motion.span
        variants={{
          rest: { rotate: 0, scale: 1 },
          hover: { rotate: -10, scale: 1.15 },
          tap: { rotate: -10, scale: 0.85 },
        }}
        transition={SPRING_PRESS}
        className="flex items-center justify-center text-muted-foreground"
      >
        <row.icon className="h-4 w-4" />
      </motion.span>
      <motion.span
        variants={{
          rest: { x: 0 },
          hover: { x: 2 },
          tap: { x: 2 },
        }}
        transition={SPRING_PRESS}
        className="flex-1"
      >
        {row.label}
      </motion.span>
      <motion.span
        variants={{
          rest: { x: 0, opacity: 0.6 },
          hover: { x: 4, opacity: 1 },
          tap: { x: 4, opacity: 1 },
        }}
        transition={SPRING_PRESS}
        className="text-muted-foreground"
      >
        <IconChevronRight className="h-4 w-4" />
      </motion.span>
    </motion.button>
  );
}

function Detail({ row, onBack }: { row: MenuRow; onBack: () => void }) {
  return (
    <div className="flex w-[17.125rem] flex-col gap-3 p-1">
      <motion.button
        type="button"
        onClick={onBack}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={SPRING_PRESS}
        className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <IconArrowLeft className="h-3.5 w-3.5" />
        Back
      </motion.button>

      <div className="flex items-center gap-2 px-2">
        <row.icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {row.label}
        </span>
      </div>

      {row.code ? (
        <pre className="overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground">
          {row.code}
        </pre>
      ) : null}

      <p className="px-2 pb-1 text-xs leading-relaxed text-muted-foreground">
        {row.text}
      </p>
    </div>
  );
}

function Menu({ rows }: { rows: MenuRow[] }) {
  const [selected, setSelected] = useState<MenuRow | null>(null);

  return (
    <div className="relative w-[17.125rem] overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        {selected ? (
          <motion.div
            key="detail"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={SPRING_PANEL}
          >
            <Detail row={selected} onBack={() => setSelected(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={SPRING_PANEL}
            className="flex flex-col gap-0.5"
          >
            {rows.map((r) => (
              <Row key={r.label} row={r} onSelect={setSelected} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NavFooter() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-10 z-10 w-full">
      <div className="pointer-events-auto mx-auto flex w-full max-w-5xl justify-end px-6 sm:px-12">
        <ExpandableTabs
          className="bg-background/30 backdrop-blur-md"
          items={[
          {
            id: "deploy",
            label: "Deploy",
            icon: <IconRocket className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  {
                    icon: IconGitBranch,
                    label: "Push to main",
                    code: "git push origin main",
                    text: "Every deploy starts on main, no long-lived branches to babysit or reconcile later.",
                  },
                  {
                    icon: IconRefresh,
                    label: "CI build & tests",
                    code: "bun run build && bun test",
                    text: "GitHub Actions runs the full build and test suite before anything is allowed to ship.",
                  },
                  {
                    icon: IconServer,
                    label: "Provision infra",
                    code: "bun ./alchemy.run.ts",
                    text: "Cloudflare infra is declared in plain TypeScript with Alchemy and reused, not clicked together in a dashboard.",
                  },
                  {
                    icon: IconCloudUpload,
                    label: "Ship to production",
                    code: "alchemy deploy",
                    text: "One command promotes the stack straight to Cloudflare once checks are green.",
                  },
                ]}
              />
            ),
          },
          {
            id: "contact",
            label: "Contact",
            icon: <IconInbox className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  {
                    icon: IconMail,
                    label: "Email",
                    code: "tenukaomaljith2009@gmail.com",
                    text: "Best for anything that needs a paper trail or isn't time-sensitive.",
                  },
                  {
                    icon: IconBrandLinkedin,
                    label: "LinkedIn DM",
                    text: "Quick professional intros and networking land fastest here.",
                  },
                  {
                    icon: IconMessageCircle,
                    label: "Quick chat",
                    text: "For fast back-and-forth while a project is actively moving.",
                  },
                  {
                    icon: IconVideo,
                    label: "Schedule a call",
                    text: "When a conversation beats a thread of messages, book a slot.",
                  },
                ]}
              />
            ),
          },
          {
            id: "workflow",
            label: "Workflow",
            icon: <IconArrowsSplit className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  {
                    icon: IconGitPullRequest,
                    label: "Branch per feature",
                    code: "git checkout -b feature/<name>",
                    text: "Every change gets its own branch, cut straight from main.",
                  },
                  {
                    icon: IconBug,
                    label: "Fix, then test",
                    code: "bun test --watch",
                    text: "Reproduce the bug in a test first, then make the test pass.",
                  },
                  {
                    icon: IconGitBranch,
                    label: "Small, reviewed PRs",
                    text: "Every change gets a second pair of eyes before it merges.",
                  },
                  {
                    icon: IconRefresh,
                    label: "Automate the repeats",
                    code: "gh workflow run ci.yml",
                    text: "Anything done more than twice becomes a script or a workflow.",
                  },
                ]}
              />
            ),
          },
          {
            id: "stack",
            label: "Stack",
            icon: <IconPackage className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  {
                    icon: ZedIcon,
                    label: "Editor",
                    text: "Zed for everyday work, fast, minimal, and keyboard-first.",
                  },
                  {
                    icon: IconBrandGithub,
                    label: "Version control",
                    code: "git + GitHub",
                    text: "History, review, and CI all live in one place.",
                  },
                  {
                    icon: IconPalette,
                    label: "Design tools",
                    text: "Figma for mockups before a single line of code gets written.",
                  },
                  {
                    icon: IconCloudUpload,
                    label: "Hosting",
                    text: "Cloudflare Workers, provisioned with Alchemy.",
                  },
                ]}
              />
            ),
          },
          {
            id: "status",
            label: "Status",
            icon: <IconChartLine className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  {
                    icon: IconPlaneTilt,
                    label: "Open to work",
                    text: "Currently taking on new freelance and full-time opportunities.",
                  },
                  {
                    icon: IconClock,
                    label: "Replies within a day",
                    text: "Messages are checked daily, usually answered same day.",
                  },
                  {
                    icon: IconWorld,
                    label: "Sri Lanka (UTC+5:30)",
                    text: "Based in Sri Lanka, happy to overlap with most timezones.",
                  },
                ]}
              />
            ),
          },
        ]}
      />
      </div>
    </div>
  );
}
