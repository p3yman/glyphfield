import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PatternField } from '../src';
import {
  IntersectionObserverStub,
  MutationObserverStub,
  ResizeObserverStub,
} from './setup';

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

describe('PatternField browser lifecycle', () => {
  const mediaListeners = new Set<() => void>();
  let reducedMotion = false;
  let context: CanvasRenderingContext2D;
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    ResizeObserverStub.instances.length = 0;
    IntersectionObserverStub.instances.length = 0;
    MutationObserverStub.instances.length = 0;
    mediaListeners.clear();
    reducedMotion = false;
    context = contextStub();
    rafCallbacks = [];
    const nativeGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context,
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(60);
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        rafCallbacks.push(callback);
        return rafCallbacks.length;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
      'getComputedStyle',
      vi.fn((element: Element) => {
        const declaration = nativeGetComputedStyle(element);
        declaration.color = 'rgb(1, 2, 3)';
        return declaration;
      }),
    );
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 2,
    });
    window.matchMedia = vi.fn(
      () =>
        ({
          matches: reducedMotion,
          media: '(prefers-reduced-motion: reduce)',
          onchange: null,
          addEventListener: (_type: string, listener: () => void) => {
            mediaListeners.add(listener);
          },
          removeEventListener: (_type: string, listener: () => void) => {
            mediaListeners.delete(listener);
          },
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders as decorative, uses currentColor, and applies fade configuration', () => {
    const { container } = render(
      <PatternField fade="top-left" color="tomato" data-testid="field" />,
    );
    const root = container.firstElementChild;
    const mask = root?.querySelector('[data-slot="pattern-field-mask"]');
    const canvas = root?.querySelector('canvas');
    if (!canvas) throw new Error('Expected PatternField canvas');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveStyle({ '--glyphfield-color': 'tomato' });
    expect(mask).toHaveStyle({
      maskImage: expect.stringContaining('top left'),
    });
    expect(canvas.style.color).toBe('var(--glyphfield-color, currentColor)');
  });

  it('redraws for resize and theme/color mutations while static', () => {
    render(<PatternField />);
    const initial = vi.mocked(context.clearRect).mock.calls.length;
    act(() =>
      ResizeObserverStub.instances[0]?.callback(
        [],
        ResizeObserverStub.instances[0],
      ),
    );
    act(() =>
      MutationObserverStub.instances[0]?.callback(
        [],
        MutationObserverStub.instances[0],
      ),
    );
    expect(context.clearRect).toHaveBeenCalledTimes(initial + 2);
  });

  it('uses a reduced-motion static fallback', () => {
    reducedMotion = true;
    render(<PatternField animation="random-blink" />);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(context.fill).toHaveBeenCalled();
  });

  it('pauses and resumes animation when offscreen or document-hidden', () => {
    render(<PatternField animation="shimmer" />);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() =>
      IntersectionObserverStub.instances[0]?.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        IntersectionObserverStub.instances[0],
      ),
    );
    expect(cancelAnimationFrame).toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const countWhileHidden = vi.mocked(requestAnimationFrame).mock.calls.length;

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    act(() =>
      IntersectionObserverStub.instances[0]?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        IntersectionObserverStub.instances[0],
      ),
    );
    expect(requestAnimationFrame).toHaveBeenCalledTimes(countWhileHidden + 1);
  });

  it('runs frames and cleans up observers, listeners, and animation frames', () => {
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<PatternField animation="shimmer" />);
    act(() => rafCallbacks[0]?.(100));
    expect(context.clearRect).toHaveBeenCalled();
    unmount();
    expect(ResizeObserverStub.instances[0]?.disconnect).toHaveBeenCalled();
    expect(
      IntersectionObserverStub.instances[0]?.disconnect,
    ).toHaveBeenCalled();
    expect(MutationObserverStub.instances[0]?.disconnect).toHaveBeenCalled();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(removeDocumentListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
    expect(mediaListeners.size).toBe(0);
  });
});
