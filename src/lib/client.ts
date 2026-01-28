export const getClientInfo = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const nav = navigator
  const screen = window.screen

  return {
    // OS / Browser
    os: nav.platform || 'Unknown',
    userAgent: nav.userAgent,
    browserLanguage: nav.language,
    languages: nav.languages ?? [],

    // Hardware
    cpuCores: nav.hardwareConcurrency ?? null,
    deviceMemoryGB: (nav as any).deviceMemory ?? null,
    maxTouchPoints: nav.maxTouchPoints ?? 0,

    // Screen
    screenResolution: `${screen.width}x${screen.height}`,
    availableResolution: `${screen.availWidth}x${screen.availHeight}`,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,

    // Time / Locale
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,

    // Preferences
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'True'
      : 'False',
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 'True'
      : 'False',

    viewport: `${window.innerWidth}x${window.innerHeight}`,
  }
}
