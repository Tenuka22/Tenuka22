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
    tagline: "College-wide digital programme for a Galle school",
    description:
      "Umbrella programme of work for a 130-year-old school in Galle: the public college site, the Grade 1 admissions portal and the internal systems sitting behind them, built as one coherent platform rather than three unrelated builds.",
    role: "Systems Engineer",
    year: "2025",
    tech: ["TypeScript", "React", "PostgreSQL"],
    url: "http://aloysiuscollege.lk/",
    image: "/projects/aloysiuscollege.webp",
    requirements: [
      "Admissions intake was running through paper forms and needed to move online",
      "Each system had to be usable by non-technical administrative staff without training",
      "Admissions content changes every cycle, so it could not be baked into school-wide pages",
    ],
    story:
      "The work grew out of one observation: the college was paying for the same problem three times over. Fixing it meant agreeing on a single data model and a shared set of roles first, then splitting the delivery into a public site, an admissions portal and an internal system, each simple enough that the people actually operating it never need a developer.",
  },
  {
    slug: "aloysiusmgmt",
    title: "School Management System",
    tagline: "Attendance, exams, timetables and fees for staff and parents",
    description:
      "Authenticated internal platform for St. Aloysius' College, Galle, covering attendance, examinations, results, timetables, leave and fees in one place for staff, students and parents.",
    role: "Systems Engineer",
    year: "2025",
    tech: ["TypeScript", "Next.js", "PostgreSQL"],
    url: "https://mgmt.aloysiuscollege.lk/",
    image: "/projects/aloysiusmgmt.webp",
    requirements: [
      "Every module had to be role-gated, since staff, students and parents each see a different slice of the same data",
      "Self-registration could not grant access outright — an administrator or the Principal verifies establishment before a role is issued",
      "Attendance and results are the two things a school is judged on, so both had to be single-source and auditable",
    ],
    story:
      "A school runs on the same handful of records all year, so the work was in the model rather than the screens: one student, one staff record, one timetable, with attendance and results derived rather than re-entered. Registration is deliberately open but useless on its own — access is granted afterwards by someone who can confirm the person is on the College establishment, and every action is logged.",
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
    slug: "bytequest",
    title: "BYTE QUEST",
    tagline: "Site for a three-month inter-school coding programme",
    description:
      "Programme site for BYTE QUEST, a three-month inter-school innovation and coding programme run by the St. Aloysius' College Old Boys' Association, covering the twelve-week journey, the junior and senior divisions, milestones, mentors, partners and volunteer sign-ups.",
    role: "Website Developer",
    year: "2026",
    tech: ["TypeScript", "Next.js", "Tailwind CSS"],
    url: "https://bytequest.aloysiuscollege.lk/",
    image: "/projects/bytequest.webp",
    requirements: [
      "The programme changes week by week, so the journey timeline needed to be readable and updatable without a redesign",
      "Two age divisions with different briefs, platforms and judging criteria had to be scannable side by side",
      "Recruitment runs through volunteers, mentors and partners, so each audience needed its own clear path in",
    ],
    story:
      "The brief was to make twelve weeks of structure feel like one journey rather than a pile of announcements. The week-by-week timeline anchors the page and everything else hangs off it — phases, the two hackathons and the grand final, plus separate junior and senior tracks so a Grade 6 parent and a Grade 12 student both find the challenge meant for them without wading through the other's.",
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
