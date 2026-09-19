"use client";

import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconMail,
} from "@tabler/icons-react";

import { ButtonLink } from "@/components/motion/button/base";
import { Reveal } from "@/components/motion/reveal";

import { SectionHeading } from "./section-heading";

const CONTACT_CHANNELS = [
  {
    icon: IconMail,
    label: "Email",
    detail: "tenukaomaljith2009@gmail.com",
    href: "mailto:tenukaomaljith2009@gmail.com",
  },
  {
    icon: IconBrandLinkedin,
    label: "LinkedIn",
    detail: "Quick professional intros and networking.",
    href: "https://linkedin.com/in/tenuka-omaljith-31b61538a",
  },
  {
    icon: IconBrandWhatsapp,
    label: "WhatsApp",
    detail: "+94 78 4723 654",
    href: "https://wa.me/94784723654",
  },
  {
    icon: IconBrandGithub,
    label: "GitHub",
    detail: "Source for most of what I ship.",
    href: "https://github.com/Tenuka22",
  },
  {
    icon: IconBrandInstagram,
    label: "Instagram",
    detail: "Behind the scenes, less formal.",
    href: "https://www.instagram.com/tenuka22/",
  },
] as const;

export const ContactSection = () => (
  <section
    id="contact"
    className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-24 pb-40 sm:px-12"
  >
    <SectionHeading
      eyebrow="Contact"
      title="Let's build something"
      description="Open to freelance and full-time work. Email is the fastest way to reach me with a real brief."
    />

    <Reveal className="flex flex-wrap items-center gap-4">
      <ButtonLink
        href="mailto:tenukaomaljith2009@gmail.com"
        size="lg"
        variant="primary"
      >
        <IconMail className="size-4" />
        Email me
      </ButtonLink>
      <span className="text-muted-foreground text-sm">
        or reach out on any channel below
      </span>
    </Reveal>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {CONTACT_CHANNELS.map(({ icon: Icon, label, detail, href }, index) => (
        <Reveal delay={index * 0.06} key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="border-border bg-background/60 hover:bg-accent flex items-center gap-4 rounded-2xl border p-5 backdrop-blur-md transition-colors"
          >
            <span className="border-border bg-background/60 text-foreground flex size-10 shrink-0 items-center justify-center rounded-full border">
              <Icon className="size-4" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-foreground text-sm font-medium">
                {label}
              </span>
              <span className="text-muted-foreground text-xs">{detail}</span>
            </span>
          </a>
        </Reveal>
      ))}
    </div>
  </section>
);
