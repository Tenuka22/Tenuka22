#!/usr/bin/env bun
/**
 * Generates every brand asset from the source logo bitmap:
 *
 *   public/logo.png            raster copy of the source (nav / og fallback)
 *   public/logo.svg            vector trace, currentColor strokes
 *   public/favicon.svg         vector trace on a filled tile
 *   public/favicon.ico         16/32/48/64 multi-resolution ICO
 *   public/icon-192.png        PWA / manifest icon
 *   public/icon-512.png        PWA / manifest icon
 *   public/icon-maskable.png   manifest icon with the safe-zone padding
 *   public/apple-touch-icon.png
 *   public/og-image.png        1200x630 social card
 *
 * The vector is a real trace of the bitmap (marching squares over the
 * luminance field, then Douglas-Peucker simplification), not a hand-drawn
 * approximation, so the favicon and the nav logo are the same artwork.
 *
 * Usage:
 *   bun run brand                  # regenerate from public/logo.png
 *   bun run brand <source.png>    # re-trace from a different source image
 *
 * Requires a local Chrome/Chromium install (see scripts/lib/chrome.ts).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Browser } from "puppeteer-core";

import { delay, launchChrome } from "./lib/chrome";

const ROOT_DIR = path.join(import.meta.dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

/** Where the raster lives, and what the nav should reference. */
const LOGO_PNG = "logo.png";
const LOGO_SVG = "logo.svg";

/** Icon sizes to raster, and the ones that go into the .ico container. */
const ICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 512] as const;
const ICO_SIZES = [16, 32, 48, 64] as const;
const MANIFEST_ICON = "icon-512.png";
const FAVICON_SVG = "favicon.svg";

/**
 * Trace resolution. Marching squares costs O(w*h) and the polygon count grows
 * with it, so this is a balance: high enough that curves stay smooth after
 * simplification, low enough that the emitted path stays small.
 */
const TRACE_SIZE = 512;

/** Douglas-Peucker tolerance in trace pixels. Larger = fewer points. */
const SIMPLIFY_TOLERANCE = 0.9;

/** Luminance cut between the mark's strokes and its background. */
const THRESHOLD = 128;

const OG_SIZE = { width: 1200, height: 630 } as const;

/** Tile colours. Matches the near-black source background. */
const TILE_COLOR = "#0b0b0d";
const STROKE_COLOR = "#f4f4f5";

/**
 * Android/iOS mask icons are cropped to a circle inscribed in the middle 80%,
 * so the mark has to be inset before it lands in one.
 */
const MASKABLE_INSET = 0.62;

interface Point {
  x: number;
  y: number;
}

/** One cell-local piece of contour, tagged with the grid edges it joins. */
interface Segment {
  a: Point;
  b: Point;
  aKey: string;
  bKey: string;
}

interface Trace {
  /** Contours in trace-space pixels, outer rings first. */
  contours: Point[][];
  /** Tight bounding box of every contour. */
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
}

/* ------------------------------------------------------------------ *
 * Bitmap access
 * ------------------------------------------------------------------ */

interface Bitmap {
  width: number;
  height: number;
  /** Luminance per pixel, row-major, 0-255. */
  luminance: Float64Array;
}

/**
 * Runs inside the page: decodes the image and reduces it to luminance, which is
 * all the tracer needs and keeps the payload to one float per pixel.
 */
const decodeInPage = async (
  dataUrl: string,
  width: number,
  height: number
): Promise<{ luminance: number[] }> => {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Could not get a 2D context to decode the source image.");
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  const luminance: number[] = [];
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    luminance.push(
      0.2126 * (data[offset] as number) +
        0.7152 * (data[offset + 1] as number) +
        0.0722 * (data[offset + 2] as number)
    );
  }
  return { luminance };
};

/** Decodes an image file to a luminance bitmap using Chrome's image decoder. */
const decodeBitmap = async (
  browser: Browser,
  sourcePath: string,
  size: number
): Promise<Bitmap> => {
  const page = await browser.newPage();
  try {
    await page.goto("about:blank");
    const bytes = await readFile(sourcePath);
    const base64 = bytes.toString("base64");
    const extension = path.extname(sourcePath).slice(1).toLowerCase();
    const mime = extension === "png" ? "image/png" : "image/jpeg";
    const result = await page.evaluate(
      decodeInPage,
      `data:${mime};base64,${base64}`,
      size,
      size
    );
    return {
      width: size,
      height: size,
      luminance: Float64Array.from(result.luminance),
    };
  } finally {
    await page.close();
  }
};

/* ------------------------------------------------------------------ *
 * Marching squares
 * ------------------------------------------------------------------ */

/**
 * Cell edge numbering, and for each edge the two sample offsets it joins.
 * Corners are tl=(0,0), tr=(1,0), br=(1,1), bl=(0,1); edges are 0=top,
 * 1=right, 2=bottom, 3=left.
 */
const EDGE_ENDS: Record<number, [number, number, number, number]> = {
  0: [0, 0, 1, 0],
  1: [1, 0, 1, 1],
  2: [0, 1, 1, 1],
  3: [0, 0, 0, 1],
};

/**
 * Stable identity for the grid edge a crossing sits on, independent of which
 * cell emitted it. Chaining keys off this rather than off the crossing's
 * coordinates: two adjacent cells that both cross a shared edge must agree, and
 * at an ambiguous lattice vertex coordinate matching silently links contours
 * belonging to different regions.
 */
const edgeKey = (edge: number, x: number, y: number): string => {
  const [ax, ay, bx, by] = EDGE_ENDS[edge] as [number, number, number, number];
  const fromX = x + ax;
  const fromY = y + ay;
  const toX = x + bx;
  const toY = y + by;
  // Orient the key by the lower endpoint so both cells agree on it.
  const first = `${fromX},${fromY}`;
  const second = `${toX},${toY}`;
  return first < second ? `${first}|${second}` : `${second}|${first}`;
};

/**
 * Segment pairs per corner configuration, oriented so the inside (above the
 * threshold) is always on the left of the direction of travel. That shared
 * orientation is what lets neighbouring cells be stitched without guessing.
 */
const CASES: Record<number, number[][]> = {
  0: [],
  1: [[2, 3]],
  2: [[1, 2]],
  3: [[1, 3]],
  4: [[0, 1]],
  6: [[0, 2]],
  7: [[0, 3]],
  8: [[3, 0]],
  9: [[2, 0]],
  11: [[1, 0]],
  12: [[3, 1]],
  13: [[2, 1]],
  14: [[3, 2]],
  15: [],
};

/** Reads the sample at (x, y), treating anything outside the bitmap as dark. */
const sampleAt = (bitmap: Bitmap, x: number, y: number): number => {
  if (x < 0 || y < 0 || x >= bitmap.width || y >= bitmap.height) {
    return 0;
  }
  return bitmap.luminance[y * bitmap.width + x] as number;
};

/**
 * Saddles (cases 5 and 10) are the two configurations where four edges are
 * crossed and the pairing is genuinely ambiguous. The centre sample resolves
 * it, and the centre lies inside the cell, so every cell reaches the same
 * verdict.
 */
const saddleSegments = (
  bitmap: Bitmap,
  x: number,
  y: number,
  key: number
): number[][] => {
  const centre =
    (sampleAt(bitmap, x, y) +
      sampleAt(bitmap, x + 1, y) +
      sampleAt(bitmap, x, y + 1) +
      sampleAt(bitmap, x + 1, y + 1)) /
    4;
  const joined = centre > THRESHOLD;
  if (key === 5) {
    return joined
      ? [
          [0, 3],
          [2, 1],
        ]
      : [
          [0, 1],
          [2, 3],
        ];
  }
  return joined
    ? [
        [1, 0],
        [3, 2],
      ]
    : [
        [3, 0],
        [1, 2],
      ];
};

/**
 * Interpolated crossing point on one cell edge. Linear interpolation against
 * the luminance field is what keeps curves round instead of stair-stepped.
 */
const edgePoint = (
  bitmap: Bitmap,
  edge: number,
  x: number,
  y: number
): Point => {
  const [ax, ay, bx, by] = EDGE_ENDS[edge] as [number, number, number, number];
  const start = sampleAt(bitmap, x + ax, y + ay);
  const end = sampleAt(bitmap, x + bx, y + by);
  // A flat edge has no gradient to interpolate along; sit at its midpoint.
  const span = end - start;
  const t = span === 0 ? 0.5 : (THRESHOLD - start) / span;
  return {
    x: x + ax + (bx - ax) * t,
    y: y + ay + (by - ay) * t,
  };
};

/**
 * Traces every contour above the threshold.
 *
 * Segments are emitted per cell then chained by the grid edge they cross, which
 * is what turns a soup of cell-local line pieces into closed rings.
 */
/**
 * Groups segments into closed rings by walking edge to edge.
 *
 * Every crossing sits on a grid edge shared by exactly two cells, so the edge
 * key has exactly one unconsumed partner to continue with. That invariant is
 * why no region can leak into another: the walk only ever follows a neighbour
 * that agreed about the same edge.
 */
const chainSegments = (segments: Segment[]): { contours: Point[][] } => {
  const incident = new Map<string, number[]>();
  for (const [index, segment] of segments.entries()) {
    for (const key of [segment.aKey, segment.bKey]) {
      const bucket = incident.get(key);
      if (bucket) {
        bucket.push(index);
      } else {
        incident.set(key, [index]);
      }
    }
  }

  const consumed = new Set<number>();
  const contours: Point[][] = [];

  const walk = (startIndex: number, firstKey: string) => {
    const start = segments[startIndex] as Segment;
    const ring: Point[] = [start.a, start.b];
    consumed.add(startIndex);
    let cursor = start.bKey;

    while (cursor !== firstKey) {
      const candidates = incident.get(cursor);
      const next = candidates?.find((candidate) => !consumed.has(candidate));
      if (next === undefined) {
        return null;
      }
      consumed.add(next);
      const segment = segments[next] as Segment;
      // Step to whichever end of the segment we did not arrive at.
      if (segment.aKey === cursor) {
        ring.push(segment.b);
        cursor = segment.bKey;
      } else {
        ring.push(segment.a);
        cursor = segment.aKey;
      }
    }

    return ring;
  };

  for (const [index, segment] of segments.entries()) {
    if (consumed.has(index)) {
      continue;
    }
    const ring = walk(index, segment.aKey);
    if (ring && ring.length > 3) {
      contours.push(ring);
    }
  }

  return { contours };
};

/**
 * Traces every contour above the threshold.
 *
 * Segments are emitted per cell then chained by the grid edge they cross, which
 * is what turns a soup of cell-local line pieces into closed rings.
 */
const traceContours = (bitmap: Bitmap): { contours: Point[][] } => {
  const segments: Segment[] = [];

  for (let y = 0; y < bitmap.height - 1; y += 1) {
    for (let x = 0; x < bitmap.width - 1; x += 1) {
      const tl = sampleAt(bitmap, x, y) > THRESHOLD;
      const tr = sampleAt(bitmap, x + 1, y) > THRESHOLD;
      const br = sampleAt(bitmap, x + 1, y + 1) > THRESHOLD;
      const bl = sampleAt(bitmap, x, y + 1) > THRESHOLD;
      const key = (tl ? 8 : 0) + (tr ? 4 : 0) + (br ? 2 : 0) + (bl ? 1 : 0);

      const pairs =
        key === 5 || key === 10
          ? saddleSegments(bitmap, x, y, key)
          : CASES[key];
      if (!pairs) {
        continue;
      }
      for (const [from, to] of pairs) {
        segments.push({
          a: edgePoint(bitmap, from as number, x, y),
          b: edgePoint(bitmap, to as number, x, y),
          aKey: edgeKey(from as number, x, y),
          bKey: edgeKey(to as number, x, y),
        });
      }
    }
  }

  return chainSegments(segments);
};

/* ------------------------------------------------------------------ *
 * Simplification
 * ------------------------------------------------------------------ */

/** Squared distance from `point` to the segment `start`-`end`. */
const distanceToSegmentSq = (
  point: Point,
  start: Point,
  end: Point
): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    const px = point.x - start.x;
    const py = point.y - start.y;
    return px * px + py * py;
  }
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq
    )
  );
  const px = point.x - (start.x + t * dx);
  const py = point.y - (start.y + t * dy);
  return px * px + py * py;
};

/** Iterative Douglas-Peucker over an open run of points. */
const simplifyRun = (points: Point[], tolerance: number): Point[] => {
  if (points.length < 3) {
    return points;
  }
  const toleranceSq = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  // Explicit stack: recursion here overflows on the long straight runs the
  // mark's frame produces once they've been split at both ends.
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop() as [number, number];
    let worst = 0;
    let worstIndex = -1;
    for (let index = first + 1; index < last; index += 1) {
      const distance = distanceToSegmentSq(
        points[index] as Point,
        points[first] as Point,
        points[last] as Point
      );
      if (distance > worst) {
        worst = distance;
        worstIndex = index;
      }
    }
    if (worst > toleranceSq && worstIndex > 0) {
      keep[worstIndex] = 1;
      stack.push([first, worstIndex], [worstIndex, last]);
    }
  }

  return points.filter((_, index) => keep[index] === 1);
};

/** Squared distance between two points. */
const squaredDistance = (a: Point, b: Point) =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/**
 * Simplifies a closed ring by cutting it at the two points furthest apart,
 * simplifying each half independently, then rejoining. Simplifying a closed
 * ring directly is ill-defined, since there is no obvious start or end.
 */
const simplifyRing = (ring: Point[], tolerance: number): Point[] => {
  const count = ring.length;
  if (count < 4) {
    return ring;
  }

  // Start at the point furthest from ring[0], so the first cut is the ring's
  // longest span and the two halves are each well-conditioned.
  let startIndex = 1;
  let best = -1;
  const anchor = ring[0] as Point;
  for (let index = 1; index < count; index += 1) {
    const distance = squaredDistance(ring[index] as Point, anchor);
    if (distance > best) {
      best = distance;
      startIndex = index;
    }
  }

  // Cut opposite it: the point furthest from the new start.
  let oppositeOffset = 1;
  best = -1;
  const opposite = ring[startIndex] as Point;
  for (let offset = 1; offset < count; offset += 1) {
    const distance = squaredDistance(
      ring[(startIndex + offset) % count] as Point,
      opposite
    );
    if (distance > best) {
      best = distance;
      oppositeOffset = offset;
    }
  }

  // Walk the ring as one open run from `startIndex`, wrapping at the end.
  const open = [...ring.slice(startIndex), ...ring.slice(0, startIndex)];

  const head = simplifyRun(open.slice(0, oppositeOffset + 1), tolerance);
  const tail = simplifyRun(open.slice(oppositeOffset), tolerance);

  // Drop each half's shared endpoint so the join is not duplicated.
  const merged = [...head.slice(0, -1), ...tail.slice(0, -1)];
  return merged.length >= 3 ? merged : ring;
};

/* ------------------------------------------------------------------ *
 * SVG emission
 * ------------------------------------------------------------------ */

const round = (value: number) => Math.round(value * 100) / 100;

/** Tight bounding box across every contour. */
const contoursBbox = (contours: Point[][]): Trace["bbox"] => {
  const bbox = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
  for (const contour of contours) {
    for (const point of contour) {
      bbox.minX = Math.min(bbox.minX, point.x);
      bbox.minY = Math.min(bbox.minY, point.y);
      bbox.maxX = Math.max(bbox.maxX, point.x);
      bbox.maxY = Math.max(bbox.maxY, point.y);
    }
  }
  return bbox;
};

const contourToPath = (
  contour: Point[],
  offsetX: number,
  offsetY: number,
  scale: number
): string => {
  const [first, ...rest] = contour;
  if (!first) {
    return "";
  }
  const commands = rest.map(
    (point) =>
      `L${round((point.x - offsetX) * scale)} ${round((point.y - offsetY) * scale)}`
  );
  return `M${round((first.x - offsetX) * scale)} ${round((first.y - offsetY) * scale)}${commands.join("")}Z`;
};

interface SvgOptions {
  /** Fill painted behind the mark. Omit for a transparent mark. */
  background?: string;
  /** Extra padding around the mark, as a fraction of its own size. */
  padding?: number;
  /** Corner radius of the background tile, as a fraction of the viewBox. */
  radius?: number;
  /** viewBox edge length in output units. */
  size?: number;
}

const buildSvg = (trace: Trace, options: SvgOptions = {}): string => {
  const padding = options.padding ?? 0;
  const size = options.size ?? 64;

  const markWidth = trace.bbox.maxX - trace.bbox.minX;
  const markHeight = trace.bbox.maxY - trace.bbox.minY;
  const span = Math.max(markWidth, markHeight) * (1 + padding * 2);
  const centreX = (trace.bbox.minX + trace.bbox.maxX) / 2;
  const centreY = (trace.bbox.minY + trace.bbox.maxY) / 2;

  const scale = size / span;
  const offsetX = centreX - size / scale / 2;
  const offsetY = centreY - size / scale / 2;

  const paths = trace.contours
    .map((contour) => contourToPath(contour, offsetX, offsetY, scale))
    .filter(Boolean)
    .join("");

  const radius = (options.radius ?? 0) * size;
  const tile = options.background
    ? `<rect width="${size}" height="${size}" rx="${round(radius)}" fill="${options.background}"/>`
    : "";

  // `evenodd` matters: the mark is outlines, so inner rings must punch through
  // the outer ones rather than stacking up as solid shapes.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`,
    tile,
    `<path fill-rule="evenodd" d="${paths}"/>`,
    "</svg>",
    "",
  ].join("\n");
};

/* ------------------------------------------------------------------ *
 * Rasterisation
 * ------------------------------------------------------------------ */

const renderSvg = async (
  browser: Browser,
  svg: string,
  width: number,
  height: number
): Promise<Buffer> => {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    const html = `<!doctype html><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:transparent}
      svg{display:block;width:${width}px;height:${height}px}
    </style>${svg}`;
    await page.setContent(html, { waitUntil: "load" });
    await delay(60);
    const element = await page.$("svg");
    if (!element) {
      throw new Error("Rendered SVG did not produce an element to screenshot.");
    }
    return Buffer.from(
      await element.screenshot({ omitBackground: true, type: "png" })
    );
  } finally {
    await page.close();
  }
};

/**
 * Packs PNG frames into a classic .ico container. Every Windows version since
 * Vista reads PNG-compressed icon entries, so this avoids a BMP encoder.
 */
const buildIco = (frames: { size: number; png: Buffer }[]): Buffer => {
  const count = frames.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const directory = Buffer.alloc(16 * count);
  let offset = header.length + directory.length;
  for (const [index, frame] of frames.entries()) {
    const at = index * 16;
    // A dimension byte of 0 means 256; everything below that is literal.
    directory.writeUInt8(frame.size >= 256 ? 0 : frame.size, at);
    directory.writeUInt8(frame.size >= 256 ? 0 : frame.size, at + 1);
    directory.writeUInt8(0, at + 2);
    directory.writeUInt8(0, at + 3);
    directory.writeUInt16LE(1, at + 4);
    directory.writeUInt16LE(32, at + 6);
    directory.writeUInt32LE(frame.png.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += frame.png.length;
  }

  return Buffer.concat([
    header,
    directory,
    ...frames.map((frame) => frame.png),
  ]);
};

/** Draws the social card: mark, name, and the role line. */
const buildOgSvg = (markSvg: string): string => {
  const fontFamily =
    "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace";
  const inner = markSvg.replace(/^<svg[^>]*>/u, "").replace(/<\/svg>\s*$/u, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_SIZE.width}" height="${OG_SIZE.height}" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}">
  <defs>
    <radialGradient id="glow" cx="30%" cy="24%" r="78%">
      <stop offset="0%" stop-color="#1c1c22"/>
      <stop offset="100%" stop-color="${TILE_COLOR}"/>
    </radialGradient>
  </defs>
  <rect width="${OG_SIZE.width}" height="${OG_SIZE.height}" fill="url(#glow)"/>
  <g transform="translate(88 132) scale(3.4)" fill="${STROKE_COLOR}" color="${STROKE_COLOR}">
    ${inner}
  </g>
  <text x="88" y="512" fill="#fafafa" font-family="${fontFamily}" font-size="72" font-weight="500" letter-spacing="-3">Tenuka Omaljith</text>
  <text x="88" y="570" fill="#a1a1aa" font-family="${fontFamily}" font-size="28" letter-spacing="0">Website Developer &#183; Systems Engineer &#183; Backend Architect</text>
  <rect x="88" y="594" width="120" height="4" rx="2" fill="${STROKE_COLOR}"/>
</svg>
`;
};

/* ------------------------------------------------------------------ *
 * Orchestration
 * ------------------------------------------------------------------ */

const main = async () => {
  const requested = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
  const source = path.resolve(requested ?? path.join(PUBLIC_DIR, LOGO_PNG));
  await mkdir(PUBLIC_DIR, { recursive: true });
  const browser = await launchChrome();

  try {
    const bitmap = await decodeBitmap(browser, source, TRACE_SIZE);
    const { contours } = traceContours(bitmap);

    const simplified = contours
      .map((contour) => simplifyRing(contour, SIMPLIFY_TOLERANCE))
      .filter((contour) => contour.length >= 3);

    const bbox = contoursBbox(simplified);
    const trace: Trace = { contours: simplified, bbox };

    const markSvg = buildSvg(trace, { padding: 0.04 });
    const tileSvg = buildSvg(trace, {
      background: TILE_COLOR,
      padding: 0.12,
      radius: 0.22,
    });
    const maskableSvg = buildSvg(trace, {
      background: TILE_COLOR,
      padding: MASKABLE_INSET,
      radius: 0.5,
    });

    // Stroke colour is applied on the root so the nav can recolour the mark via
    // CSS `color`, while the favicon keeps its baked-in colours.
    const colouredMarkSvg = markSvg.replace(
      '<path fill-rule="evenodd"',
      `<path fill="currentColor" fill-rule="evenodd"`
    );
    const colouredTileSvg = tileSvg.replace(
      '<path fill-rule="evenodd"',
      `<path fill="${STROKE_COLOR}" fill-rule="evenodd"`
    );
    const colouredMaskableSvg = maskableSvg.replace(
      '<path fill-rule="evenodd"',
      `<path fill="${STROKE_COLOR}" fill-rule="evenodd"`
    );

    const written: string[] = [];
    const write = async (relative: string, data: string | Buffer) => {
      await writeFile(path.join(PUBLIC_DIR, relative), data);
      written.push(relative);
    };

    await write(LOGO_SVG, colouredMarkSvg);
    await write(FAVICON_SVG, colouredTileSvg);

    const rendered = new Map<number, Buffer>();
    for (const size of ICON_SIZES) {
      // oxlint-disable-next-line no-await-in-loop -- sequential keeps memory flat.
      const png = await renderSvg(browser, colouredTileSvg, size, size);
      rendered.set(size, png);
    }

    await write("icon-192.png", rendered.get(192) as Buffer);
    await write(MANIFEST_ICON, rendered.get(512) as Buffer);
    await write("apple-touch-icon.png", rendered.get(180) as Buffer);

    await write(
      "icon-maskable.png",
      await renderSvg(browser, colouredMaskableSvg, 512, 512)
    );

    await write(
      "favicon.ico",
      buildIco(
        ICO_SIZES.map((size) => ({
          size,
          png: rendered.get(size) as Buffer,
        }))
      )
    );

    await write(
      "og-image.png",
      await renderSvg(
        browser,
        buildOgSvg(markSvg),
        OG_SIZE.width,
        OG_SIZE.height
      )
    );

    const totalPoints = trace.contours.reduce(
      (sum, contour) => sum + contour.length,
      0
    );
    console.log(
      `traced ${trace.contours.length} contours / ${totalPoints} points from ${path.basename(source)}`
    );
    for (const file of written) {
      console.log(`  ${file}`);
    }
  } finally {
    await browser.close();
  }
};

await main();
