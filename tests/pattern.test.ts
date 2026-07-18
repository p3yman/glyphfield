import { describe, expect, it, vi } from 'vitest';

import {
  cellPosition,
  createShimmerFrame,
  drawPattern,
  drawShape,
  fadeMask,
  generatePatternCells,
  normalizePatternOptions,
  randomBlinkVisible,
  rotationForCell,
  shadeForCell,
  shimmerAmount,
} from '../src/pattern';

const defaults = normalizePatternOptions({});

describe('procedural pattern generation', () => {
  it('is deterministic for identical seeds and differs for different seeds', () => {
    const first = generatePatternCells(
      200,
      120,
      normalizePatternOptions({ layout: 'random', seed: 4, density: 0.45 }),
    );
    const repeat = generatePatternCells(
      200,
      120,
      normalizePatternOptions({ layout: 'random', seed: 4, density: 0.45 }),
    );
    const different = generatePatternCells(
      200,
      120,
      normalizePatternOptions({ layout: 'random', seed: 5, density: 0.45 }),
    );

    expect(repeat).toEqual(first);
    expect(different).not.toEqual(first);
  });

  it.each(['grid', 'offset'] as const)(
    'keeps full occupancy for %s regardless of random-density settings',
    (layout) => {
      const emptyDensity = generatePatternCells(
        100,
        80,
        normalizePatternOptions({ layout, density: 0, densityVariation: 1 }),
      );
      const fullDensity = generatePatternCells(
        100,
        80,
        normalizePatternOptions({ layout, density: 1, densityVariation: 0 }),
      );
      expect(emptyDensity).toEqual(fullDensity);
    },
  );

  it('uses seeded occupancy on fixed, non-colliding positions without jitter', () => {
    const options = normalizePatternOptions({
      layout: 'random',
      seed: 99,
      density: 0.5,
      densityVariation: 0.8,
    });
    const cells = generatePatternCells(180, 120, options);
    const positions = cells.map(({ column, row, x, y }) => ({
      actual: [x, y],
      expected: Object.values(
        cellPosition(column, row, options.cellSize, options.cellSize, 'random'),
      ),
    }));
    const unique = new Set(
      cells.map(({ x, y }) => `${String(x)}:${String(y)}`),
    );

    expect(
      positions.every(({ actual, expected }) =>
        actual.every((v, i) => v === expected[i]),
      ),
    ).toBe(true);
    expect(unique.size).toBe(cells.length);
  });

  it('clamps unsafe numeric input and resolves shape defaults', () => {
    const options = normalizePatternOptions({
      cellSize: -4,
      size: 50,
      cornerRadius: 99,
      crossThickness: Number.NaN,
      density: 7,
      opacity: -1,
    });
    expect(options).toMatchObject({
      cellSize: 1,
      size: 1,
      cornerRadius: 0.5,
      crossThickness: 1,
      density: 1,
      opacity: 0,
    });
  });

  it('supports fixed and seeded-random rotation', () => {
    const fixed = normalizePatternOptions({ rotation: 45 });
    const random = normalizePatternOptions({
      rotation: 45,
      rotationRandomness: 1,
      seed: 10,
    });
    expect(rotationForCell(2, 3, fixed)).toBe(45);
    expect(rotationForCell(2, 3, random)).toBe(rotationForCell(2, 3, random));
    expect(rotationForCell(2, 3, random)).not.toBe(45);
    expect(rotationForCell(3, 3, random)).not.toBe(
      rotationForCell(2, 3, random),
    );
  });

  it('quantizes shade into three levels and applies variation to opacity', () => {
    const options = normalizePatternOptions({
      shadeScale: 0.4,
      shadeVariation: 0.5,
      opacity: 0.4,
    });
    const shades = new Set<number>();
    for (let row = 0; row < 30; row += 1) {
      for (let column = 0; column < 30; column += 1) {
        shades.add(shadeForCell(column, row, options));
      }
    }
    const opacities = new Set(
      generatePatternCells(300, 300, options).map((cell) => cell.opacity),
    );
    expect([...shades].sort()).toEqual([-1, 0, 1]);
    expect([...opacities].sort()).toEqual([0.2, 0.4, 0.6000000000000001]);
  });

  it('calculates fade masks and a moving shimmer band', () => {
    expect(fadeMask('top')).toContain('linear-gradient');
    expect(fadeMask('center')).toContain('radial-gradient');
    expect(fadeMask('top-center')).toContain('top center');
    expect(fadeMask('top-left')).toContain('top left');

    const options = normalizePatternOptions({
      animation: 'shimmer',
      animationAngle: 0,
      animationWidth: 0.4,
      animationStrength: 0.8,
    });
    const early = createShimmerFrame(100, 50, 0.25, options);
    const later = createShimmerFrame(100, 50, 0.75, options);
    expect(early.center).not.toBe(later.center);
    expect(shimmerAmount(early.center * 100, 0, early)).toBeCloseTo(1);
    expect(shimmerAmount(1000, 1000, early)).toBe(0);
  });

  it('random blinking toggles seeded shape visibility', () => {
    const options = normalizePatternOptions({
      animation: 'random-blink',
      animationStrength: 1,
      animationWidth: 0.2,
      seed: 14,
    });
    const snapshots = Array.from({ length: 20 }, (_, index) =>
      randomBlinkVisible(2, 3, index / 20, options),
    );
    expect(snapshots).toContain(true);
    expect(snapshots).toContain(false);
    expect(randomBlinkVisible(2, 3, 0.25, options)).toBe(
      randomBlinkVisible(2, 3, 0.25, options),
    );
  });
});

describe('canvas drawing', () => {
  function contextStub() {
    return {
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
      globalAlpha: 1,
      restore: vi.fn(),
      rotate: vi.fn(),
      roundRect: vi.fn(),
      save: vi.fn(),
      setTransform: vi.fn(),
      translate: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
  }

  it('rounds dots from square to circle', () => {
    const context = contextStub();
    drawShape(
      context,
      0,
      0,
      0,
      normalizePatternOptions({ size: 8, cornerRadius: 0 }),
    );
    drawShape(
      context,
      0,
      0,
      0,
      normalizePatternOptions({ size: 8, cornerRadius: 4 }),
    );
    expect(vi.mocked(context.roundRect).mock.calls[0]?.[4]).toBe(0);
    expect(vi.mocked(context.roundRect).mock.calls[1]?.[4]).toBe(4);
  });

  it('draws cross arms with the configured thickness', () => {
    const context = contextStub();
    drawShape(
      context,
      0,
      0,
      30,
      normalizePatternOptions({ shape: 'cross', size: 10, crossThickness: 3 }),
    );
    const calls = vi.mocked(context.roundRect).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0]?.slice(2, 4)).toEqual([10, 3]);
    expect(calls[1]?.slice(2, 4)).toEqual([3, 10]);
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 6);
  });

  it('handles high-DPI sizing, zero size, and a missing context', () => {
    const context = contextStub();
    const canvas = document.createElement('canvas');
    Object.defineProperties(canvas, {
      clientWidth: { configurable: true, value: 50 },
      clientHeight: { configurable: true, value: 20 },
    });
    vi.spyOn(canvas, 'getContext').mockReturnValue(context);
    drawPattern(canvas, defaults, 3, 'rgb(1, 2, 3)');
    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(40);
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(canvas.dataset.renderStatus).toBe('ready');

    Object.defineProperty(canvas, 'clientWidth', {
      configurable: true,
      value: 0,
    });
    drawPattern(canvas, defaults, 1, 'black');
    expect(canvas.dataset.renderStatus).toBe('empty');

    Object.defineProperty(canvas, 'clientWidth', {
      configurable: true,
      value: 10,
    });
    vi.spyOn(canvas, 'getContext').mockReturnValue(null);
    drawPattern(canvas, defaults, 1, 'black');
    expect(canvas.dataset.renderStatus).toBe('unavailable');
  });
});
