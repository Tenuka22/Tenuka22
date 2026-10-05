#!/usr/bin/env bun
/**
 * Captures a 1280x720 WebP screenshot of each project's live home page and
 * writes it to `public/projects/<slug>.webp`.
 *
 * Adding a new site is just adding an entry to `PROJECTS` in
 * `src/data/projects.ts` (slug, url, image path) and re-running this script.
 *
 * Usage:
 *   bun run screenshots                # capture every project
 *   bun run screenshots playtechstore  # capture one or more slugs only
 *
 * Requires a local Chrome/Chromium install. Resolved in this order:
 *   1. CHROME_PATH env var
 *   2. Common per-OS install locations
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";

import { launch } from "puppeteer-core";
import type { Browser } from "puppeteer-core";

import { PROJECTS } from "../src/data/projects";

const VIEWPORT = { width: 1280, height: 720 } as const;
const DEFAULT_CAPTURE_DELAY_MS = 1500;
const NAVIGATION_TIMEOUT_MS = 45_000;

const ROOT_DIR = path.join(import.meta.dirname, "..");
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "projects");

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

const resolveChromePath = (): string => {
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

const delay = (ms: number) => {
  // oxlint-disable-next-line no-invalid-void-type -- `void` here is a valid generic type argument to Promise.withResolvers.
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
};

const captureProject = async (
  browser: Browser,
  project: (typeof PROJECTS)[number]
): Promise<void> => {
  const page = await browser.newPage();
  try {
    await page.setViewport(VIEWPORT);
    // `load` stalls on sites that hold long-lived connections open (GitHub's
    // live-update sockets, for one), so fall back to `domcontentloaded` plus a
    // short settle rather than failing the capture outright.
    try {
      await page.goto(project.url, {
        waitUntil: "load",
        timeout: NAVIGATION_TIMEOUT_MS,
      });
    } catch (error) {
      console.warn(`  (load timed out for ${project.url}, retrying)`, error);
      await page.goto(project.url, {
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT_MS,
      });
    }
    await delay(project.captureDelayMs ?? DEFAULT_CAPTURE_DELAY_MS);
    const buffer = await page.screenshot({ type: "webp", quality: 90 });
    const outPath = path.join(OUTPUT_DIR, `${project.slug}.webp`);
    await writeFile(outPath, buffer);
    console.log(`✓ ${project.slug} -> ${outPath} (${buffer.length} bytes)`);
  } finally {
    await page.close();
  }
};

const main = async () => {
  const requestedSlugs = new Set(process.argv.slice(2));
  const targets =
    requestedSlugs.size > 0
      ? PROJECTS.filter((project) => requestedSlugs.has(project.slug))
      : PROJECTS;

  if (targets.length === 0) {
    console.error(
      `No matching projects for: ${[...requestedSlugs].join(", ")}`
    );
    process.exitCode = 1;
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const executablePath = resolveChromePath();
  const browser = await launch({
    executablePath,
    headless: true,
  });

  try {
    for (const project of targets) {
      try {
        // Sequential on purpose: keeps memory/network usage predictable and
        // output ordering deterministic across runs.
        // oxlint-disable-next-line no-await-in-loop
        await captureProject(browser, project);
      } catch (error) {
        console.error(`✗ ${project.slug}:`, error);
        process.exitCode = 1;
      }
    }
  } finally {
    await browser.close();
  }
};

await main();
