import {
  Glyphfield,
  PatternField,
  type PatternFieldAnimation,
  type PatternFieldFade,
  type PatternFieldLayout,
  type PatternFieldProps,
  type PatternFieldShape,
} from '@p3yman/glyphfield';

const animation: PatternFieldAnimation = 'shimmer';
const fade: PatternFieldFade = 'top-center';
const layout: PatternFieldLayout = 'random';
const shape: PatternFieldShape = 'cross';
const props: PatternFieldProps = { animation, fade, layout, shape, seed: 42 };

export const fixture = (
  <div style={{ position: 'relative' }}>
    <PatternField {...props} />
    <Glyphfield />
  </div>
);
