/**
 * Canvas geometry for the shape grid background.
 *
 * Kept out of the component so the drawing and hit-testing maths can be read
 * and changed on their own: the component is left with only the effect
 * wiring (resize, pointer, visibility, animation frame).
 */

export type ShapeGridShape = "square" | "hexagon" | "circle" | "triangle";

export type ShapeGridDirection = "diagonal" | "up" | "right" | "down" | "left";

export interface GridCell {
  x: number;
  y: number;
}

export interface ShapeGridConfig {
  shape: ShapeGridShape;
  direction: ShapeGridDirection;
  speed: number;
  borderColor: string;
  squareSize: number;
  hoverFillColor: string;
  hoverTrailAmount: number;
}

export interface ShapeGridState {
  /** Scroll offset of the whole lattice, in pixels. */
  offset: { x: number; y: number };
  hovered: GridCell | null;
  trail: GridCell[];
  /** Current fill alpha per hovered/trailing cell, eased toward its target. */
  opacities: Map<string, number>;
}

const TAU = Math.PI * 2;
const HEX_SIDES = 6;
/** Cells are drawn two outside the viewport so scrolling never shows a gap. */
const CELL_OVERSCAN = 2;
const HEX_COL_OVERSCAN = 3;
const TRI_COL_OVERSCAN = 4;
const TRI_ROW_OVERSCAN = 4;
/** Frame-to-frame easing for the hover fill. */
const OPACITY_EASE = 0.15;
/** Below this the cell is indistinguishable from unfilled, so drop it. */
const OPACITY_FLOOR = 0.005;

export const createGridState = (): ShapeGridState => ({
  offset: { x: 0, y: 0 },
  hovered: null,
  trail: [],
  opacities: new Map<string, number>(),
});

/** Positive modulo, so a negative drift still wraps into range. */
const wrap = (value: number, limit: number) =>
  ((value % limit) + limit) % limit;

const cellKey = (cell: GridCell) => `${cell.x},${cell.y}`;

/* ------------------------------------------------------------------ *
 * Cell shapes
 * ------------------------------------------------------------------ */

const drawHex = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) => {
  ctx.beginPath();
  for (let index = 0; index < HEX_SIDES; index += 1) {
    const angle = (Math.PI / 3) * index;
    const vx = cx + size * Math.cos(angle);
    const vy = cy + size * Math.sin(angle);
    if (index === 0) {
      ctx.moveTo(vx, vy);
    } else {
      ctx.lineTo(vx, vy);
    }
  }
  ctx.closePath();
};

const drawCircle = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) => {
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, TAU);
  ctx.closePath();
};

const drawTriangle = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  flip: boolean
) => {
  const half = size / 2;
  ctx.beginPath();
  if (flip) {
    ctx.moveTo(cx, cy + half);
    ctx.lineTo(cx + half, cy - half);
    ctx.lineTo(cx - half, cy - half);
  } else {
    ctx.moveTo(cx, cy - half);
    ctx.lineTo(cx + half, cy + half);
    ctx.lineTo(cx - half, cy + half);
  }
  ctx.closePath();
};

/** Traces the cell outline for the configured shape. */
const traceCell = (
  ctx: CanvasRenderingContext2D,
  shape: ShapeGridShape,
  cx: number,
  cy: number,
  size: number,
  flip: boolean
) => {
  if (shape === "hexagon") {
    drawHex(ctx, cx, cy, size);
    return;
  }
  if (shape === "circle") {
    drawCircle(ctx, cx, cy, size);
    return;
  }
  if (shape === "triangle") {
    drawTriangle(ctx, cx, cy, size, flip);
    return;
  }
  ctx.beginPath();
  ctx.rect(cx - size / 2, cy - size / 2, size, size);
  ctx.closePath();
};

/* ------------------------------------------------------------------ *
 * Lattice metrics
 * ------------------------------------------------------------------ */

const hexHoriz = (size: number) => size * 1.5;
const hexVert = (size: number) => size * Math.sqrt(3);

/** Horizontal and vertical repeat distance, so scrolling can wrap seamlessly. */
const wrapSpan = (config: ShapeGridConfig) => {
  const size = config.squareSize;
  const wrapX = config.shape === "hexagon" ? hexHoriz(size) * 2 : size;
  let wrapY = size;
  if (config.shape === "hexagon") {
    wrapY = hexVert(size);
  } else if (config.shape === "triangle") {
    wrapY = size * 2;
  }
  return { wrapX, wrapY };
};

/* ------------------------------------------------------------------ *
 * Hover state
 * ------------------------------------------------------------------ */

/** Eases every tracked cell toward its target alpha and prunes dead ones. */
export const updateCellOpacities = (state: ShapeGridState) => {
  const targets = new Map<string, number>();

  if (state.hovered) {
    targets.set(cellKey(state.hovered), 1);
  }

  for (let index = 0; index < state.trail.length; index += 1) {
    const key = cellKey(state.trail[index] as GridCell);
    if (!targets.has(key)) {
      targets.set(key, (state.trail.length - index) / (state.trail.length + 1));
    }
  }

  for (const key of targets.keys()) {
    if (!state.opacities.has(key)) {
      state.opacities.set(key, 0);
    }
  }

  for (const [key, opacity] of state.opacities) {
    const target = targets.get(key) || 0;
    const next = opacity + (target - opacity) * OPACITY_EASE;
    if (next < OPACITY_FLOOR) {
      state.opacities.delete(key);
    } else {
      state.opacities.set(key, next);
    }
  }
};

const rememberHover = (
  state: ShapeGridState,
  cell: GridCell,
  hoverTrailAmount: number
) => {
  const previous = state.hovered;
  if (previous && hoverTrailAmount > 0) {
    state.trail.unshift({ ...previous });
    if (state.trail.length > hoverTrailAmount) {
      state.trail.length = hoverTrailAmount;
    }
  }
  state.hovered = cell;
};

/** Pointer position to lattice cell, per shape. */
export const cellFromPointer = (
  mouseX: number,
  mouseY: number,
  state: ShapeGridState,
  config: ShapeGridConfig
): GridCell => {
  const size = config.squareSize;
  const offsetX = wrap(state.offset.x, size);
  const offsetY = wrap(state.offset.y, size);

  if (config.shape === "hexagon") {
    const horiz = hexHoriz(size);
    const vert = hexVert(size);
    const colShift = Math.floor(state.offset.x / horiz);
    const adjustedX = mouseX - wrap(state.offset.x, horiz);
    const adjustedY = mouseY - wrap(state.offset.y, vert);
    const col = Math.round(adjustedX / horiz);
    const rowOffset = (col + colShift) % 2 === 0 ? 0 : vert / 2;
    return { x: col, y: Math.round((adjustedY - rowOffset) / vert) };
  }

  if (config.shape === "triangle") {
    const halfW = size / 2;
    const adjustedX = mouseX - wrap(state.offset.x, halfW);
    const adjustedY = mouseY - wrap(state.offset.y, size);
    return {
      x: Math.round(adjustedX / halfW),
      y: Math.floor(adjustedY / size),
    };
  }

  // Circle and square share an axis-aligned lattice; only the rounding differs,
  // because a circle is centred in its cell rather than filling it.
  const round = config.shape === "circle";
  return {
    x: round
      ? Math.round((mouseX - offsetX) / size)
      : Math.floor((mouseX - offsetX) / size),
    y: round
      ? Math.round((mouseY - offsetY) / size)
      : Math.floor((mouseY - offsetY) / size),
  };
};

/** Called on pointer move; pushes the previous cell onto the trail. */
export const trackHover = (
  state: ShapeGridState,
  mouseX: number,
  mouseY: number,
  config: ShapeGridConfig
) => {
  const cell = cellFromPointer(mouseX, mouseY, state, config);
  const changed =
    !state.hovered || state.hovered.x !== cell.x || state.hovered.y !== cell.y;
  if (changed) {
    rememberHover(state, cell, config.hoverTrailAmount);
  }
};

/** Called on pointer leave; keeps the trail but clears the live cell. */
export const clearHover = (state: ShapeGridState, hoverTrailAmount: number) => {
  if (state.hovered && hoverTrailAmount > 0) {
    state.trail.unshift({ ...state.hovered });
    if (state.trail.length > hoverTrailAmount) {
      state.trail.length = hoverTrailAmount;
    }
  }
  state.hovered = null;
};

/* ------------------------------------------------------------------ *
 * Frame
 * ------------------------------------------------------------------ */

/** Advances the lattice by one frame's worth of drift, wrapping at the edges. */
export const advanceOffset = (
  state: ShapeGridState,
  config: ShapeGridConfig
) => {
  const step = Math.max(config.speed, 0.1);
  const { wrapX, wrapY } = wrapSpan(config);
  const { offset } = state;

  // Negative drift on x and y moves the lattice up-left, which is what the
  // original shader-backed grid did for every direction.
  if (config.direction === "right" || config.direction === "diagonal") {
    offset.x = wrap(offset.x - step, wrapX);
  }
  if (config.direction === "left") {
    offset.x = wrap(offset.x + step, wrapX);
  }
  if (config.direction === "up") {
    offset.y = wrap(offset.y + step, wrapY);
  }
  if (config.direction === "down" || config.direction === "diagonal") {
    offset.y = wrap(offset.y - step, wrapY);
  }
};

interface DrawOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  state: ShapeGridState;
  config: ShapeGridConfig;
}

/**
 * One cell: the eased hover fill underneath, the outline on top. Squares fill
 * with fillRect, which is why they never go through traceCell.
 */
const fillCell = (
  ctx: CanvasRenderingContext2D,
  key: string,
  cx: number,
  cy: number,
  state: ShapeGridState,
  config: ShapeGridConfig,
  flip: boolean
) => {
  const { squareSize: size, shape, borderColor, hoverFillColor } = config;
  const alpha = state.opacities.get(key);

  if (shape === "square") {
    const x = cx - size / 2;
    const y = cy - size / 2;
    if (alpha) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = hoverFillColor;
      ctx.fillRect(x, y, size, size);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(x, y, size, size);
    return;
  }

  if (alpha) {
    ctx.globalAlpha = alpha;
    traceCell(ctx, shape, cx, cy, size, flip);
    ctx.fillStyle = hoverFillColor;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  traceCell(ctx, shape, cx, cy, size, flip);
  ctx.strokeStyle = borderColor;
  ctx.stroke();
};

/** Paints every visible cell: hover fill first, then the outline on top. */
export const drawGrid = ({
  ctx,
  width,
  height,
  state,
  config,
}: DrawOptions) => {
  ctx.clearRect(0, 0, width, height);

  const { squareSize: size, shape } = config;

  if (shape === "hexagon") {
    const horiz = hexHoriz(size);
    const vert = hexVert(size);
    const colShift = Math.floor(state.offset.x / horiz);
    const offsetX = wrap(state.offset.x, horiz);
    const offsetY = wrap(state.offset.y, vert);
    const cols = Math.ceil(width / horiz) + HEX_COL_OVERSCAN;
    const rows = Math.ceil(height / vert) + HEX_COL_OVERSCAN;

    for (let col = -CELL_OVERSCAN; col < cols; col += 1) {
      for (let row = -CELL_OVERSCAN; row < rows; row += 1) {
        const cx = col * horiz + offsetX;
        const cy =
          row * vert + ((col + colShift) % 2 === 0 ? 0 : vert / 2) + offsetY;
        fillCell(ctx, `${col},${row}`, cx, cy, state, config, false);
      }
    }
    return;
  }

  if (shape === "triangle") {
    const halfW = size / 2;
    const colShift = Math.floor(state.offset.x / halfW);
    const rowShift = Math.floor(state.offset.y / size);
    const offsetX = wrap(state.offset.x, halfW);
    const offsetY = wrap(state.offset.y, size);
    const cols = Math.ceil(width / halfW) + TRI_COL_OVERSCAN;
    const rows = Math.ceil(height / size) + TRI_ROW_OVERSCAN;

    for (let col = -CELL_OVERSCAN; col < cols; col += 1) {
      for (let row = -CELL_OVERSCAN; row < rows; row += 1) {
        const cx = col * halfW + offsetX;
        const cy = row * size + size / 2 + offsetY;
        const flip = (((col + colShift + row + rowShift) % 2) + 2) % 2 !== 0;
        fillCell(ctx, `${col},${row}`, cx, cy, state, config, flip);
      }
    }
    return;
  }

  const offsetX = wrap(state.offset.x, size);
  const offsetY = wrap(state.offset.y, size);
  const cols = Math.ceil(width / size) + HEX_COL_OVERSCAN;
  const rows = Math.ceil(height / size) + HEX_COL_OVERSCAN;

  // Squares and circles both fill their whole cell, so both are centred in it;
  // only the drawing primitive differs.
  const inset = size / 2;
  for (let col = -CELL_OVERSCAN; col < cols; col += 1) {
    for (let row = -CELL_OVERSCAN; row < rows; row += 1) {
      const cx = col * size + offsetX + inset;
      const cy = row * size + offsetY + inset;
      fillCell(ctx, `${col},${row}`, cx, cy, state, config, false);
    }
  }
};

/**
 * Darkens the outer edge so the lattice fades out instead of ending abruptly
 * at the canvas bounds.
 */
export const drawVignette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.hypot(width, height) / 2
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};
