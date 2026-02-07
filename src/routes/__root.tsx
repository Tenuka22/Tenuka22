import * as React from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import appCss from '../styles.css?url'

const TanStackDevtools =
  import.meta.env.PROD || typeof window === 'undefined'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/react-devtools').then((res) => ({
          default: res.TanStackDevtools,
        })),
      )

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: () => (
    <>
      <Outlet />
      <React.Suspense fallback={null}>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </React.Suspense>
    </>
  ),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // TODO: Add dark mode later
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="size-full flex flex-col">
        <main className="flex-1 size-full">{children}</main>
        <Scripts />
      </body>
    </html>
  )
}
