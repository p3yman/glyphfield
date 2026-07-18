import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

class ResizeObserverStub implements ResizeObserver {
  static instances: ResizeObserverStub[] = [];
  readonly callback: ResizeObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverStub.instances.push(this);
  }
}

class IntersectionObserverStub implements IntersectionObserver {
  static instances: IntersectionObserverStub[] = [];
  readonly root = null;
  readonly rootMargin = '0px';
  readonly scrollMargin = '0px';
  readonly thresholds = [0];
  readonly callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    IntersectionObserverStub.instances.push(this);
  }
}

class MutationObserverStub implements MutationObserver {
  static instances: MutationObserverStub[] = [];
  readonly callback: MutationCallback;
  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  constructor(callback: MutationCallback) {
    this.callback = callback;
    MutationObserverStub.instances.push(this);
  }
}

Object.assign(globalThis, {
  ResizeObserver: ResizeObserverStub,
  IntersectionObserver: IntersectionObserverStub,
  MutationObserver: MutationObserverStub,
});

export { IntersectionObserverStub, MutationObserverStub, ResizeObserverStub };
