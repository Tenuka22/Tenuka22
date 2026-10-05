import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { ReactLenis } from "lenis/react";

import { NavFooter } from "@/components/navigation-footer";
import { SiteNav } from "@/components/site-nav";

import appCss from "../styles.css?url";

const SITE_URL = "https://tenukaomaljith.dev";
const SITE_TITLE = "Tenuka Omaljith — Website Developer & Systems Engineer";
const SITE_DESCRIPTION =
  "Portfolio of Tenuka Omaljith: website development, systems engineering and backend architecture. Storefronts, admissions platforms and a statically typed language compiler.";

const RootDocument = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      <ReactLenis root options={{ duration: 1.2 }}>
        <SiteNav />
        {children}
        {/*<TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />*/}
        <NavFooter />
      </ReactLenis>
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "author", content: "Tenuka Omaljith" },
      { name: "theme-color", content: "#0b0b0d" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      {
        rel: "alternate icon",
        href: "/favicon.ico",
        sizes: "64x64 48x48 32x32 16x16",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
      },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: SITE_URL },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
});
