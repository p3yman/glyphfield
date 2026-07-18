import type { CSSProperties, HTMLAttributes } from 'react';

export type PatternFieldLayout = 'grid' | 'offset' | 'random';
export type PatternFieldShape = 'dot' | 'cross';
export type PatternFieldFade =
  'none' | 'center' | 'top' | 'top-center' | 'top-left';
export type PatternFieldAnimation = 'none' | 'shimmer' | 'random-blink';

export interface PatternFieldProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-hidden' | 'children' | 'color'
> {
  /** Occupancy arrangement. `grid` and `offset` are always full; `random` uses `density`. @default 'offset' */
  layout?: PatternFieldLayout;
  /** Mark geometry. @default 'dot' */
  shape?: PatternFieldShape;
  /** Deterministic signed integer used for occupancy, shade, rotation, and blinking. @default 48291 */
  seed?: number;
  /** Cell width in CSS pixels, clamped to 1–512. @default 14 */
  cellSize?: number;
  /** Shape width and height in CSS pixels, clamped to 0–`cellSize`. @default 2 */
  size?: number;
  /** Dot/cross corner radius in CSS pixels, clamped to 0–`size / 2`. Defaults to `size / 2`. */
  cornerRadius?: number;
  /** Cross arm thickness in CSS pixels, clamped to 0–`size`. Defaults to `max(1, size * 0.22)`. */
  crossThickness?: number;
  /** Base clockwise rotation in degrees, clamped to −3600–3600. @default 0 */
  rotation?: number;
  /** Per-cell seeded rotation amount from 0 (fixed) to 1 (±180°). @default 0 */
  rotationRandomness?: number;
  /** Mean random-layout occupancy from 0–1; ignored by `grid` and `offset`. @default 0.5 */
  density?: number;
  /** Coherent occupancy-field amplitude from 0–1; only affects `random`. @default 0 */
  densityVariation?: number;
  /** Occupancy noise frequency from 0.0001–1; only affects `random`. @default 0.075 */
  fieldScale?: number;
  /** Shade noise frequency from 0.0001–1. @default 0.04 */
  shadeScale?: number;
  /** Opacity difference between the three shade bands from 0–1. @default 0 */
  shadeVariation?: number;
  /** Base shape opacity from 0–1. @default 0.15 */
  opacity?: number;
  /** Composition mask. `none` draws the full field. @default 'none' */
  fade?: PatternFieldFade;
  /** Canvas color. Defaults to inherited `currentColor`; `--glyphfield-color` can also override it. */
  color?: string;
  /** Motion mode. Reduced-motion users receive the static, fully visible field. @default 'none' */
  animation?: PatternFieldAnimation;
  /** Animation loop duration in milliseconds, clamped to 1–600000. @default 1800 */
  animationDuration?: number;
  /** Shimmer direction in degrees, clamped to −3600–3600; ignored by blinking. @default 20 */
  animationAngle?: number;
  /** Shimmer band width or blink visible-window fraction from 0.001–1. @default 0.3 */
  animationWidth?: number;
  /** Shimmer intensity or fraction of cells that blink, from 0–1. @default 0.35 */
  animationStrength?: number;
  /** Inline styles. Positioning defaults to an absolute fill and can be overridden here. */
  style?: CSSProperties & { '--glyphfield-color'?: string };
}
