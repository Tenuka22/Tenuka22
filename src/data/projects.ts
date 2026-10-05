export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  role: string;
  year: string;
  tech: string[];
  url: string;
  image: string;
  /** Requirements the client/brief actually needed solved. */
  requirements: string[];
  /** Short blog-style write-up of the build and key decisions. */
  story: string;
  /**
   * Extra milliseconds to wait after page load before capturing the
   * screenshot, for sites with slow hero video/image transitions.
   * Defaults to 1500ms in the capture script when omitted.
   */
  captureDelayMs?: number;
}

/**
 * Local project case-study data. Each entry pairs a real, shipped site with a
 * 1280x720 WebP screenshot of its live home page (captured directly from the
 * production URL, stored under `public/projects`).
 */
export const PROJECTS: Project[] = [
  {
    slug: "playtechstore",
    title: "Play Tech Store",
    tagline: "Island-wide computer hardware storefront",
    description:
      "E-commerce storefront for a Sri Lankan computer hardware retailer, covering catalog browsing, order tracking and island-wide delivery messaging for day-to-day retail traffic.",
    role: "Website Developer",
    year: "2025",
    tech: ["TypeScript", "React", "Tailwind CSS"],
    url: "https://playtechstore.lk/",
    image: "/projects/playtechstore.webp",
    requirements: [
      "Island-wide delivery coverage needed to be communicated up front, not buried in checkout",
      "Non-technical staff needed to keep the catalog current without touching code",
      "Trust signals (secure packaging, tracked orders, 24/7 support) had to be visible immediately",
    ],
    story:
      "The brief was simple: make islandwide delivery and trust the first thing a visitor sees, not something they have to scroll to find. The hero leads with the delivery map and guarantees, backed by a catalog structure the client's team can update without a developer in the loop.",
  },
  {
    slug: "lunabarro",
    title: "Luna Barro",
    tagline: "Handcrafted ceramics brand & wholesale storefront",
    description:
      "Editorial commerce site for a handmade ceramics studio, built around a calm, slow-living aesthetic with collection browsing, gifting flows and a wholesale enquiry path for hotels and retailers.",
    role: "Website Developer",
    year: "2025",
    tech: ["TypeScript", "React", "Tailwind CSS"],
    url: "https://lunabarro.com/",
    image: "/projects/lunabarro.webp",
    requirements: [
      "Needed to read as a premium ceramics brand, not a generic storefront template",
      "Wholesale buyers (hotels, retailers) needed a distinct path from retail shoppers",
      "Product photography had to be the focal point, with minimal chrome around it",
    ],
    story:
      "Luna Barro's product is tactile and quiet, so the site had to get out of its way. Typography and whitespace carry the 'slow living' positioning, while a separate wholesale enquiry flow keeps bulk buyers from getting funnelled into a retail checkout that doesn't fit their order size.",
  },
  {
    slug: "aloysiuscollege",
    title: "St. Aloysius' College",
    tagline: "School administration & admissions platform",
    description:
      "Administration system for a 130-year-old school in Galle, handling student and teacher records, admissions intake and day-to-day school operations for staff.",
    role: "Systems Engineer",
    year: "2025",
    tech: ["TypeScript", "React", "PostgreSQL"],
    url: "http://aloysiuscollege.lk/",
    image: "/projects/aloysiuscollege.webp",
    requirements: [
      "Admissions intake was running through paper forms and needed to move online",
      "Staff needed one system for student and teacher records instead of scattered spreadsheets",
      "The system had to hold up for a 130-year-old institution with non-technical administrative staff",
    ],
    story:
      "This was less about a flashy front end and more about getting the data model right: students, teachers and admissions intake all needed to live in one consistent system that admin staff could actually operate day to day, with the public site kept deliberately simple.",
  },
  {
    slug: "aloysiusadmissions",
    title: "St. Aloysius' College Admissions",
    tagline: "Grade 1 admissions portal for a Galle school",
    description:
      "Public-facing admissions portal for St. Aloysius' College, handling Grade 1 admissions resources, the admissions schedule and a live interview schedule for parents and guardians.",
    role: "Systems Engineer",
    year: "2025",
    tech: ["TypeScript", "React", "PostgreSQL"],
    url: "https://admissions.aloysiuscollege.lk/",
    image: "/projects/aloysiusadmissions.webp",
    requirements: [
      "Admissions info was scattered across notices and phone calls, and needed one place parents could check",
      "The interview schedule had to stay live and accurate without admin staff editing pages",
      "Parents needed to reach the admissions office easily, including from mobile on WhatsApp",
    ],
    story:
      "This is the public face of the college's admissions system: a small, deliberately focused site where the schedule, resources and contact paths are all one tap away. Keeping it separate from the main college site meant admissions content could change as the cycle progressed without anyone touching school-wide pages.",
  },
  {
    slug: "lithon",
    title: "Lithon",
    tagline: "Statically-typed, Python-syntax language",
    description:
      "Open-source language and compiler that reads like Python but compiles to dependency-free x86-64 native code via a hand-rolled JIT, with a static type-flow verifier and an interpreter tier used as a correctness oracle.",
    role: "Compiler Engineer",
    year: "2026",
    tech: ["C++20", "Python", "x64 Assembly"],
    url: "https://project-lithon.github.io/Lithon/src/index.html",
    image: "/projects/lithon.webp",
    requirements: [
      "Python's readability without paying for boxed integers, refcounting and GC pauses",
      "A binary with no LLVM, no Cranelift and no runtime library dependency behind it",
      "Every optimisation had to be independently switchable so its effect could be measured, not assumed",
    ],
    story:
      "Lithon's whole premise is refusal: if a type flow can't be proven statically safe, the compiler declines to compile it rather than emitting a slow path. The interesting engineering is in keeping the hand-rolled x86-64 emitter and the C++ interpreter tier in exact agreement, so every optimisation can be differentially tested against the tier it replaced.",
  },
  {
    slug: "stephanstyremart",
    title: "Stephan's Tyre Mart",
    tagline: "Tyre & auto service storefront",
    description:
      "Storefront for a tyre and automotive service business, covering the product catalog, service listings and contact/enquiry flow for walk-in and phone customers.",
    role: "Website Developer",
    year: "2025",
    tech: ["TypeScript", "React", "Tailwind CSS"],
    url: "https://stephanstyremart.com/",
    image: "/projects/stephanstyremart.webp",
    requirements: [
      "Phone and walk-in customers needed to find tyre stock and services without calling first",
      "The catalog needed to be simple enough for shop staff to keep accurate",
      "Contact/enquiry had to be one step, not a multi-page form",
    ],
    story:
      "A tyre shop's customers mostly just want to know 'do you have my size, and what do you charge'. The site is built around answering that fast: a straightforward catalog and service list, with a single enquiry path instead of a bloated contact flow.",
  },
];
