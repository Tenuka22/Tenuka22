import { existsSync } from "node:fs";
import { platform } from "node:os";

import { launch } from "puppeteer-core";
import type { Browser } from "puppeteer-core";

const CHROME_CANDIDATES: Record<string, string[]> = {
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ],
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ],
};

/** Absolute path to a local Chrome/Chromium build, or throws with a hint. */
export const resolveChromePath = (): string => {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = CHROME_CANDIDATES[platform()] ?? [];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      "No local Chrome/Chromium install found. Set CHROME_PATH to a browser executable."
    );
  }
  return found;
};

/** Headless browser at the default 1280x720 viewport. */
export const launchChrome = (): Promise<Browser> =>
  launch({ executablePath: resolveChromePath(), headless: true });

/** Promise that settles after `ms` milliseconds. */
export const delay = (ms: number) => {
  // oxlint-disable-next-line no-invalid-void-type -- `void` here is a valid generic type argument to Promise.withResolvers.
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
};
