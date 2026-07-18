# Glyphfield

Seeded, animated canvas patterns for React.

Glyphfield renders deterministic dot and cross fields for decorative surfaces and loading states. It has no runtime dependencies; React is a peer dependency and is never bundled.

## Installation

```sh
npm install @p3yman/glyphfield
```

The `@p3yman` scope must be controlled by the publisher. Scope ownership could not be verified during repository setup because the local npm client was not authenticated.

## Minimal example

```tsx
import { Glyphfield } from '@p3yman/glyphfield';

export function Surface() {
  return (
    <div style={{ position: 'relative', minHeight: 240, color: '#173b32' }}>
      <Glyphfield seed={42} />
    </div>
  );
}
```

`Glyphfield` is an intentional alias of `PatternField`. Both are named exports; there is no default export.

## Loading patterns

```tsx
import { PatternField } from '@p3yman/glyphfield';

export function LoadingPanel() {
  return (
    <section aria-busy="true" style={{ position: 'relative', minHeight: 180 }}>
      <PatternField
        animation="shimmer"
        animationStrength={0.7}
        fade="center"
        opacity={0.25}
      />
      <span className="sr-only">Loading results…</span>
    </section>
  );
}

export function ReconnectingPanel() {
  return (
    <section aria-busy="true" style={{ position: 'relative', minHeight: 180 }}>
      <PatternField
        animation="random-blink"
        animationStrength={0.75}
        animationWidth={0.35}
        layout="random"
        density={0.7}
        seed={9842}
      />
      <span role="status">Reconnecting…</span>
    </section>
  );
}
```

## Color

The canvas inherits `currentColor`. Set `color` on a parent, pass the `color` prop, or define `--glyphfield-color`:

```tsx
<div style={{ color: '#f4b942', position: 'relative' }}>
  <PatternField />
</div>

<PatternField color="oklch(65% 0.18 35)" />

<PatternField style={{ '--glyphfield-color': '#d24b3f' }} />
```

The custom property wins over inherited `currentColor`; the `style` custom property wins over the `color` prop.

## API

`PatternFieldProps` extends `HTMLAttributes<HTMLDivElement>` except `children`, `color`, and `aria-hidden`. The wrapper defaults to an absolute fill (`position: absolute; inset: 0`) with pointer events disabled. Override positioning through `style` when needed. Unsafe numbers and non-finite values are clamped or replaced consistently before drawing.

| Prop                 | Type                                                        | Default               | Range/unit and interaction                                                                  |
| -------------------- | ----------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `layout`             | `'grid' \| 'offset' \| 'random'`                            | `'offset'`            | Grid and offset are fully occupied. Only random uses density controls.                      |
| `shape`              | `'dot' \| 'cross'`                                          | `'dot'`               | Selects mark geometry.                                                                      |
| `seed`               | `number`                                                    | `48291`               | Truncated safe integer. Drives every randomized decision.                                   |
| `cellSize`           | `number`                                                    | `14`                  | 1–512 CSS px. Offset rows use half this vertical spacing.                                   |
| `size`               | `number`                                                    | `2`                   | 0–`cellSize` CSS px.                                                                        |
| `cornerRadius`       | `number`                                                    | `size / 2`            | 0–`size / 2` CSS px. A dot changes from square at 0 to circle at the maximum.               |
| `crossThickness`     | `number`                                                    | `max(1, size × 0.22)` | 0–`size` CSS px; only affects crosses.                                                      |
| `rotation`           | `number`                                                    | `0`                   | −3600–3600 degrees clockwise.                                                               |
| `rotationRandomness` | `number`                                                    | `0`                   | 0–1; adds a seeded per-cell offset up to ±180°.                                             |
| `density`            | `number`                                                    | `0.5`                 | 0–1 mean occupancy; random layout only.                                                     |
| `densityVariation`   | `number`                                                    | `0`                   | 0–1 amplitude of the coherent occupancy field; random layout only.                          |
| `fieldScale`         | `number`                                                    | `0.075`               | 0.0001–1 noise frequency; larger values change density more quickly in space.               |
| `shadeScale`         | `number`                                                    | `0.04`                | 0.0001–1 frequency for the three-level shade field.                                         |
| `shadeVariation`     | `number`                                                    | `0`                   | 0–1 opacity difference between low, middle, and high shade bands.                           |
| `opacity`            | `number`                                                    | `0.15`                | 0–1 base shape opacity before shade and shimmer adjustments.                                |
| `fade`               | `'none' \| 'center' \| 'top' \| 'top-center' \| 'top-left'` | `'none'`              | Applies a CSS mask to the complete composition.                                             |
| `color`              | `string`                                                    | inherited             | Any CSS color. Sets `--glyphfield-color` unless the same custom property is set in `style`. |
| `animation`          | `'none' \| 'shimmer' \| 'random-blink'`                     | `'none'`              | Reduced motion disables motion and renders the complete static field.                       |
| `animationDuration`  | `number`                                                    | `1800`                | 1–600000 ms per loop.                                                                       |
| `animationAngle`     | `number`                                                    | `20`                  | −3600–3600 degrees; shimmer only.                                                           |
| `animationWidth`     | `number`                                                    | `0.3`                 | 0.001–1; shimmer band width or blink visible-window fraction.                               |
| `animationStrength`  | `number`                                                    | `0.35`                | 0–1; shimmer intensity or deterministic fraction of cells that blink.                       |
| `style`              | `CSSProperties`                                             | absolute fill         | Inline wrapper styles; supports `--glyphfield-color`.                                       |

Exported types: `PatternFieldProps`, `PatternFieldLayout`, `PatternFieldShape`, `PatternFieldFade`, and `PatternFieldAnimation`.

## Seed reproducibility

Identical dimensions, seeds, and props produce identical occupancy, positions, shades, rotations, and blink participation. Resizing reveals more cells on the same infinite fixed grid; existing coordinates do not jitter. Random layouts affect occupancy only, so shapes never move into each other.

## Accessibility

Patternfield is decorative and always renders with `aria-hidden="true"`. Do not use it as the only loading indicator. Put `aria-busy`, visible or screen-reader status text, or another appropriate loading semantic on the meaningful parent element. Motion pauses for `prefers-reduced-motion: reduce`, hidden documents, and offscreen canvases.

## SSR

Importing and server-rendering are safe. Browser APIs are only read after mount. The server output contains an empty canvas; drawing begins in the client effect. If the component is client-lazy-loaded, reserve dimensions on its parent to avoid layout shift.

## Performance

- Keep `cellSize` proportional to the rendered area; very small cells create many draw calls.
- Device pixel ratio is capped at 2 to limit memory and fill cost while remaining crisp on high-density displays.
- Animation uses one `requestAnimationFrame` loop and stops offscreen, in hidden documents, and for reduced motion.
- Stable props avoid rebuilding the drawing effect unnecessarily.

## Browser support

Glyphfield targets current evergreen browsers with Canvas 2D, CSS masks, `MutationObserver`, and `requestAnimationFrame`. `ResizeObserver` and `IntersectionObserver` improve behavior when available; resize falls back to the window event and animation remains active without intersection observation. React 18.2+ and React 19 are supported. Node.js 24+ is required for package tooling and declared in package metadata.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md). Run `npm ci` followed by `npm run verify` before opening a pull request. Release preparation uses Changesets; publishing is intentionally separate and protected.

## License

MIT © Peyman Eskandari. See [LICENSE](./LICENSE).
