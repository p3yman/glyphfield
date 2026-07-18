import type {
  PatternFieldAnimation,
  PatternFieldFade,
  PatternFieldLayout,
  PatternFieldShape,
} from './types';

export interface PatternOptions {
  layout: PatternFieldLayout;
  shape: PatternFieldShape;
  seed: number;
  cellSize: number;
  size: number;
  cornerRadius: number;
  crossThickness: number;
  rotation: number;
  rotationRandomness: number;
  density: number;
  densityVariation: number;
  fieldScale: number;
  shadeScale: number;
  shadeVariation: number;
  opacity: number;
  animation: PatternFieldAnimation;
  animationDuration: number;
  animationAngle: number;
  animationWidth: number;
  animationStrength: number;
}

export interface PatternCell {
  column: number;
  row: number;
  x: number;
  y: number;
  rotation: number;
  shade: -1 | 0 | 1;
  opacity: number;
  visible: boolean;
}

export interface ShimmerFrame {
  unitX: number;
  unitY: number;
  minimumProjection: number;
  projectionRange: number;
  center: number;
  halfWidth: number;
  strength: number;
}

export const internalDefaults = {
  layout: 'offset',
  shape: 'dot',
  seed: 48291,
  cellSize: 14,
  size: 2,
  rotation: 0,
  rotationRandomness: 0,
  density: 0.5,
  densityVariation: 0,
  fieldScale: 0.075,
  shadeScale: 0.04,
  shadeVariation: 0,
  opacity: 0.15,
  animation: 'none',
  animationDuration: 1800,
  animationAngle: 20,
  animationWidth: 0.3,
  animationStrength: 0.35,
} as const;

type PatternInput = Partial<PatternOptions>;

export function normalizePatternOptions(input: PatternInput): PatternOptions {
  const cellSize = clampNumber(
    input.cellSize,
    1,
    512,
    internalDefaults.cellSize,
  );
  const size = clampNumber(input.size, 0, cellSize, internalDefaults.size);
  const cornerRadius = clampNumber(input.cornerRadius, 0, size / 2, size / 2);
  const crossThickness = clampNumber(
    input.crossThickness,
    0,
    size,
    Math.min(size, Math.max(1, size * 0.22)),
  );

  return {
    layout: input.layout ?? internalDefaults.layout,
    shape: input.shape ?? internalDefaults.shape,
    seed: Math.trunc(
      clampNumber(
        input.seed,
        Number.MIN_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        internalDefaults.seed,
      ),
    ),
    cellSize,
    size,
    cornerRadius,
    crossThickness,
    rotation: clampNumber(input.rotation, -3600, 3600, 0),
    rotationRandomness: clampNumber(input.rotationRandomness, 0, 1, 0),
    density: clampNumber(input.density, 0, 1, internalDefaults.density),
    densityVariation: clampNumber(input.densityVariation, 0, 1, 0),
    fieldScale: clampNumber(
      input.fieldScale,
      0.0001,
      1,
      internalDefaults.fieldScale,
    ),
    shadeScale: clampNumber(
      input.shadeScale,
      0.0001,
      1,
      internalDefaults.shadeScale,
    ),
    shadeVariation: clampNumber(input.shadeVariation, 0, 1, 0),
    opacity: clampNumber(input.opacity, 0, 1, internalDefaults.opacity),
    animation: input.animation ?? internalDefaults.animation,
    animationDuration: clampNumber(
      input.animationDuration,
      1,
      600_000,
      internalDefaults.animationDuration,
    ),
    animationAngle: clampNumber(
      input.animationAngle,
      -3600,
      3600,
      internalDefaults.animationAngle,
    ),
    animationWidth: clampNumber(
      input.animationWidth,
      0.001,
      1,
      internalDefaults.animationWidth,
    ),
    animationStrength: clampNumber(
      input.animationStrength,
      0,
      1,
      internalDefaults.animationStrength,
    ),
  };
}

export function generatePatternCells(
  width: number,
  height: number,
  options: PatternOptions,
  animationTime: number | null = null,
): PatternCell[] {
  if (width <= 0 || height <= 0) return [];

  const rowSpacing =
    options.layout === 'offset' ? options.cellSize / 2 : options.cellSize;
  const columns = Math.ceil(width / options.cellSize) + 2;
  const rows = Math.ceil(height / rowSpacing) + 2;
  const shimmer =
    animationTime !== null && options.animation === 'shimmer'
      ? createShimmerFrame(width, height, animationTime, options)
      : null;
  const cells: PatternCell[] = [];

  for (let row = -1; row < rows; row += 1) {
    for (let column = -1; column < columns; column += 1) {
      const probability = occupancyProbability(column, row, options);
      if (
        options.layout === 'random' &&
        hash2D(column, row, options.seed + 101) >= probability
      ) {
        continue;
      }

      const position = cellPosition(
        column,
        row,
        options.cellSize,
        rowSpacing,
        options.layout,
      );
      const shade = shadeForCell(column, row, options);
      const shimmerMultiplier = shimmer
        ? 1 + shimmerAmount(position.x, position.y, shimmer) * shimmer.strength
        : 1;
      const visible =
        animationTime === null || options.animation !== 'random-blink'
          ? true
          : randomBlinkVisible(column, row, animationTime, options);

      cells.push({
        column,
        row,
        ...position,
        rotation: rotationForCell(column, row, options),
        shade,
        opacity: clamp(
          options.opacity *
            (1 + shade * options.shadeVariation) *
            shimmerMultiplier,
          0,
          1,
        ),
        visible,
      });
    }
  }

  return cells;
}

export function drawPattern(
  canvas: HTMLCanvasElement,
  options: PatternOptions,
  pixelRatio: number,
  color: string,
  animationTime: number | null = null,
): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (width <= 0 || height <= 0) {
    canvas.dataset.renderStatus = 'empty';
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    canvas.dataset.renderStatus = 'unavailable';
    return;
  }

  const ratio = clampNumber(pixelRatio, 1, 2, 1);
  const renderWidth = Math.round(width * ratio);
  const renderHeight = Math.round(height * ratio);
  if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
    canvas.width = renderWidth;
    canvas.height = renderHeight;
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = color;

  for (const cell of generatePatternCells(
    width,
    height,
    options,
    animationTime,
  )) {
    if (!cell.visible) continue;
    context.globalAlpha = cell.opacity;
    drawShape(context, cell.x, cell.y, cell.rotation, options);
  }

  context.globalAlpha = 1;
  canvas.dataset.renderStatus = 'ready';
}

export function drawShape(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number,
  options: PatternOptions,
): void {
  context.save();
  context.translate(x, y);
  context.rotate((rotation * Math.PI) / 180);
  context.beginPath();

  if (options.shape === 'cross') {
    const radius = Math.min(options.cornerRadius, options.crossThickness / 2);
    context.roundRect(
      -options.size / 2,
      -options.crossThickness / 2,
      options.size,
      options.crossThickness,
      radius,
    );
    context.roundRect(
      -options.crossThickness / 2,
      -options.size / 2,
      options.crossThickness,
      options.size,
      radius,
    );
  } else {
    context.roundRect(
      -options.size / 2,
      -options.size / 2,
      options.size,
      options.size,
      options.cornerRadius,
    );
  }

  context.fill();
  context.restore();
}

export function fadeMask(fade: Exclude<PatternFieldFade, 'none'>): string {
  const masks = {
    center:
      'radial-gradient(ellipse at center, black 0%, black 30%, transparent 75%)',
    top: 'linear-gradient(to bottom, black 0%, black 35%, transparent 100%)',
    'top-center':
      'radial-gradient(ellipse 70% 110% at top center, black 0%, black 32%, transparent 78%)',
    'top-left':
      'radial-gradient(ellipse 100% 120% at top left, black 0%, black 32%, transparent 78%)',
  } as const;
  return masks[fade];
}

export function createShimmerFrame(
  width: number,
  height: number,
  animationTime: number,
  options: PatternOptions,
): ShimmerFrame {
  const angle = (options.animationAngle * Math.PI) / 180;
  const unitX = Math.cos(angle);
  const unitY = Math.sin(angle);
  const projections = [
    0,
    width * unitX,
    height * unitY,
    width * unitX + height * unitY,
  ];
  const minimumProjection = Math.min(...projections);
  const maximumProjection = Math.max(...projections);
  const halfWidth = options.animationWidth / 2;

  return {
    unitX,
    unitY,
    minimumProjection,
    projectionRange: Math.max(1, maximumProjection - minimumProjection),
    center:
      -halfWidth + positiveRemainder(animationTime, 1) * (1 + halfWidth * 2),
    halfWidth,
    strength: options.animationStrength,
  };
}

export function shimmerAmount(
  x: number,
  y: number,
  frame: ShimmerFrame,
): number {
  const projection =
    (x * frame.unitX + y * frame.unitY - frame.minimumProjection) /
    frame.projectionRange;
  const distance = Math.abs(projection - frame.center);
  const amount = clamp(1 - distance / frame.halfWidth, 0, 1);
  return amount * amount * (3 - amount * 2);
}

export function randomBlinkVisible(
  column: number,
  row: number,
  animationTime: number,
  options: PatternOptions,
): boolean {
  const participates =
    hash2D(column, row, options.seed + 809) < options.animationStrength;
  if (!participates) return true;

  const phaseOffset = hash2D(column, row, options.seed + 607);
  const speed = mix(0.7, 1.3, hash2D(column, row, options.seed + 701));
  const phase = positiveRemainder(animationTime * speed + phaseOffset, 1);
  const distance = Math.min(phase, 1 - phase);
  return distance <= options.animationWidth / 2;
}

export function rotationForCell(
  column: number,
  row: number,
  options: PatternOptions,
): number {
  const offset =
    (hash2D(column, row, options.seed + 503) * 2 - 1) *
    180 *
    options.rotationRandomness;
  return options.rotation + offset;
}

export function shadeForCell(
  column: number,
  row: number,
  options: PatternOptions,
): -1 | 0 | 1 {
  const noise = valueNoise(
    column * options.shadeScale,
    row * options.shadeScale,
    options.seed + 211,
  );
  return (Math.min(2, Math.floor(noise * 3)) - 1) as -1 | 0 | 1;
}

export function cellPosition(
  column: number,
  row: number,
  cellSize: number,
  rowSpacing: number,
  layout: PatternFieldLayout,
): { x: number; y: number } {
  const offset =
    layout === 'offset' && Math.abs(row % 2) === 1 ? cellSize / 2 : 0;
  return {
    x: column * cellSize + cellSize / 2 + offset,
    y: row * rowSpacing + rowSpacing / 2,
  };
}

export function hash2D(x: number, y: number, seed: number): number {
  let value =
    Math.imul(x, 374_761_393) +
    Math.imul(y, 668_265_263) +
    Math.imul(seed, 1_442_695_041);
  value = Math.imul(value ^ (value >>> 13), 1_274_126_177);
  value ^= value >>> 16;
  return (value >>> 0) / 4_294_967_296;
}

function occupancyProbability(
  column: number,
  row: number,
  options: PatternOptions,
): number {
  if (options.layout !== 'random') return 1;
  const field = fbm(
    column * options.fieldScale,
    row * options.fieldScale,
    options.seed + 17,
  );
  return clamp(
    options.density + (field - 0.5) * options.densityVariation,
    0,
    1,
  );
}

function valueNoise(x: number, y: number, seed: number): number {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  const localX = x - cellX;
  const localY = y - cellY;
  const blendX = localX * localX * (3 - 2 * localX);
  const blendY = localY * localY * (3 - 2 * localY);
  const top = mix(
    hash2D(cellX, cellY, seed),
    hash2D(cellX + 1, cellY, seed),
    blendX,
  );
  const bottom = mix(
    hash2D(cellX, cellY + 1, seed),
    hash2D(cellX + 1, cellY + 1, seed),
    blendX,
  );
  return mix(top, bottom, blendY);
}

function fbm(x: number, y: number, seed: number): number {
  let value = 0;
  let amplitude = 4 / 7;
  for (let octave = 0; octave < 3; octave += 1) {
    value += valueNoise(x, y, seed + octave * 14) * amplitude;
    x = x * 2.03 + 13.1;
    y = y * 2.03 + 7.7;
    amplitude *= 0.5;
  }
  return value;
}

function mix(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function positiveRemainder(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function clampNumber(
  value: number | undefined,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return clamp(value, minimum, maximum);
}
