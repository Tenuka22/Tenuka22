"use client";

import {
  IconIdBadge,
  IconBrush,
  IconCalendarClock,
  IconChartLine,
  IconChevronRight,
  IconClipboardCheck,
  IconCloudUpload,
  IconFileText,
  IconGauge,
  IconGitBranch,
  IconPhoto,
  IconInbox,
  IconSpeakerphone,
  IconMessageCircle,
  IconPackage,
  IconRefresh,
  IconRocket,
  IconAlarm,
  IconPalette,
  IconUpload,
  IconUsers,
  IconWebhook,
  IconArrowsSplit,
} from "@tabler/icons-react";
import { ExpandableTabs } from "@/components/motion/expandable-tabs";

type TablerIcon = React.ComponentType<{ className?: string }>;

function Row({ icon: Icon, label }: { icon: TablerIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <IconChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function Menu({ rows }: { rows: { icon: TablerIcon; label: string }[] }) {
  return (
    <div className="flex w-[17.125rem] flex-col gap-0.5">
      {rows.map((r) => (
        <Row key={r.label} icon={r.icon} label={r.label} />
      ))}
    </div>
  );
}

export function NavFooter() {
  return (
    <div className="flex w-fit items-end justify-center fixed left-1/2 -translate-x-1/2 bottom-4 z-10 ">
      <ExpandableTabs
        className=
        "bg-background/30 backdrop-blur-md"
        items={[
          {
            id: "launch",
            label: "Launch",
            icon: <IconRocket className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: IconFileText, label: "Release Brief" },
                  { icon: IconClipboardCheck, label: "Launch Checklist" },
                  { icon: IconSpeakerphone, label: "Campaign Notes" },
                  { icon: IconCalendarClock, label: "Rollout Calendar" },
                  { icon: IconCloudUpload, label: "Ship Build" },
                ]}
              />
            ),
          },
          {
            id: "inbox",
            label: "Inbox",
            icon: <IconInbox className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: IconMessageCircle, label: "Client Feedback" },
                  { icon: IconUsers, label: "Team Requests" },
                  { icon: IconIdBadge, label: "Approval Notes" },
                ]}
              />
            ),
          },
          {
            id: "flows",
            label: "Flows",
            icon: <IconArrowsSplit className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: IconGitBranch, label: "Trigger Map" },
                  { icon: IconWebhook, label: "Webhook Runs" },
                  { icon: IconRefresh, label: "Retry Queue" },
                ]}
              />
            ),
          },
          {
            id: "assets",
            label: "Assets",
            icon: <IconPackage className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: IconPalette, label: "Brand Kit" },
                  { icon: IconPhoto, label: "Mockup Library" },
                  { icon: IconBrush, label: "Design Tokens" },
                  { icon: IconUpload, label: "Export Queue" },
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
                  { icon: IconGauge, label: "Activation" },
                  { icon: IconChartLine, label: "Conversion" },
                  { icon: IconAlarm, label: "Incidents" },
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
