import { useEffect, useMemo, useRef } from 'react';

import { drawPattern, fadeMask, normalizePatternOptions } from './pattern';
import type { PatternFieldProps } from './types';

const fillStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
} as const;

export function PatternField({
  layout,
  shape,
  seed,
  cellSize,
  size,
  cornerRadius,
  crossThickness,
  rotation,
  rotationRandomness,
  density,
  densityVariation,
  fieldScale,
  shadeScale,
  shadeVariation,
  opacity,
  fade = 'none',
  color,
  animation,
  animationDuration,
  animationAngle,
  animationWidth,
  animationStrength,
  style,
  ...divProps
}: PatternFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const options = useMemo(
    () =>
      normalizePatternOptions({
        ...(layout === undefined ? {} : { layout }),
        ...(shape === undefined ? {} : { shape }),
        ...(seed === undefined ? {} : { seed }),
        ...(cellSize === undefined ? {} : { cellSize }),
        ...(size === undefined ? {} : { size }),
        ...(cornerRadius === undefined ? {} : { cornerRadius }),
        ...(crossThickness === undefined ? {} : { crossThickness }),
        ...(rotation === undefined ? {} : { rotation }),
        ...(rotationRandomness === undefined ? {} : { rotationRandomness }),
        ...(density === undefined ? {} : { density }),
        ...(densityVariation === undefined ? {} : { densityVariation }),
        ...(fieldScale === undefined ? {} : { fieldScale }),
        ...(shadeScale === undefined ? {} : { shadeScale }),
        ...(shadeVariation === undefined ? {} : { shadeVariation }),
        ...(opacity === undefined ? {} : { opacity }),
        ...(animation === undefined ? {} : { animation }),
        ...(animationDuration === undefined ? {} : { animationDuration }),
        ...(animationAngle === undefined ? {} : { animationAngle }),
        ...(animationWidth === undefined ? {} : { animationWidth }),
        ...(animationStrength === undefined ? {} : { animationStrength }),
      }),
    [
      animation,
      animationAngle,
      animationDuration,
      animationStrength,
      animationWidth,
      cellSize,
      cornerRadius,
      crossThickness,
      density,
      densityVariation,
      fieldScale,
      layout,
      opacity,
      rotation,
      rotationRandomness,
      seed,
      shadeScale,
      shadeVariation,
      shape,
      size,
    ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.dataset.renderStatus = 'initializing';
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame: number | null = null;
    let startedAt: number | null = null;
    let isOnscreen = true;

    const render = (animationTime: number | null = null) => {
      const computedColor = getComputedStyle(canvas).color;
      drawPattern(
        canvas,
        options,
        window.devicePixelRatio || 1,
        computedColor,
        animationTime,
      );
    };
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      startedAt = null;
    };
    const animate = (timestamp: number) => {
      startedAt ??= timestamp;
      render((timestamp - startedAt) / options.animationDuration);
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      stop();
      const shouldAnimate =
        options.animation !== 'none' &&
        !motionQuery.matches &&
        !document.hidden &&
        isOnscreen;
      if (shouldAnimate) frame = requestAnimationFrame(animate);
      else render();
    };
    const redrawWhenStatic = () => {
      if (frame === null) render();
    };

    const ResizeObserverConstructor = Reflect.get(window, 'ResizeObserver') as
      typeof ResizeObserver | undefined;
    const resizeObserver = ResizeObserverConstructor
      ? new ResizeObserverConstructor(redrawWhenStatic)
      : null;
    const themeObserver = new MutationObserver(redrawWhenStatic);
    const IntersectionObserverConstructor = Reflect.get(
      window,
      'IntersectionObserver',
    ) as typeof IntersectionObserver | undefined;
    const visibilityObserver = IntersectionObserverConstructor
      ? new IntersectionObserverConstructor(([entry]) => {
          isOnscreen = entry?.isIntersecting ?? true;
          sync();
        })
      : null;

    resizeObserver?.observe(canvas);
    if (!resizeObserver) window.addEventListener('resize', redrawWhenStatic);
    visibilityObserver?.observe(canvas);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
      subtree: true,
    });
    document.addEventListener('visibilitychange', sync);
    motionQuery.addEventListener('change', sync);
    sync();

    return () => {
      stop();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', redrawWhenStatic);
      document.removeEventListener('visibilitychange', sync);
      motionQuery.removeEventListener('change', sync);
    };
  }, [options]);

  const mask = fade === 'none' ? undefined : fadeMask(fade);
  const rootStyle = {
    ...fillStyle,
    pointerEvents: 'none',
    ...(color === undefined ? {} : { '--glyphfield-color': color }),
    ...style,
  } as PatternFieldProps['style'];

  return (
    <div
      {...divProps}
      aria-hidden="true"
      data-animation={options.animation}
      data-fade={fade}
      data-layout={options.layout}
      data-shape={options.shape}
      data-slot="pattern-field"
      style={rootStyle}
    >
      <div
        data-slot="pattern-field-mask"
        style={{
          ...fillStyle,
          ...(mask === undefined
            ? {}
            : { maskImage: mask, WebkitMaskImage: mask }),
        }}
      >
        <canvas
          ref={canvasRef}
          data-slot="pattern-field-canvas"
          style={{
            ...fillStyle,
            color: 'var(--glyphfield-color, currentColor)',
          }}
        />
      </div>
    </div>
  );
}
