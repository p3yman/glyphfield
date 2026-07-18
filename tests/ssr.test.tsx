// @vitest-environment node

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import * as publicApi from '../src';
import { Glyphfield, PatternField } from '../src';

describe('server and public API safety', () => {
  it('imports without browser globals and renders on the server', () => {
    expect(renderToString(<PatternField seed={1} />)).toContain(
      'data-slot="pattern-field"',
    );
  });

  it('exposes only the intentional runtime API', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'Glyphfield',
      'PatternField',
    ]);
    expect(Glyphfield).toBe(PatternField);
  });
});
