import type {
  PatternFieldAnimation,
  PatternFieldFade,
  PatternFieldLayout,
  PatternFieldShape,
} from '../../src';

export type PreviewTemplate = 'hero' | 'metric' | 'empty' | 'canvas';

export interface PlaygroundConfig {
  layout: PatternFieldLayout;
  shape: PatternFieldShape;
  fade: PatternFieldFade;
  animation: PatternFieldAnimation;
  cellSize: number;
  size: number;
  density: number;
  densityVariation: number;
  fieldScale: number;
  shadeVariation: number;
  opacity: number;
  rotation: number;
  rotationRandomness: number;
  animationDuration: number;
  animationAngle: number;
  animationWidth: number;
  animationStrength: number;
  seed: number;
  color: string;
  background: string;
}

export interface PatternPreset {
  name: string;
  description: string;
  config: PlaygroundConfig;
}

export const presets: PatternPreset[] = [
  {
    name: 'Quiet grid',
    description: 'Soft offset dots for calm product surfaces.',
    config: {
      layout: 'offset',
      shape: 'dot',
      fade: 'center',
      animation: 'none',
      cellSize: 16,
      size: 3,
      density: 0.56,
      densityVariation: 0,
      fieldScale: 0.075,
      shadeVariation: 0.38,
      opacity: 0.34,
      rotation: 0,
      rotationRandomness: 0,
      animationDuration: 2400,
      animationAngle: 22,
      animationWidth: 0.3,
      animationStrength: 0.35,
      seed: 48291,
      color: '#171717',
      background: '#f5f5f2',
    },
  },
  {
    name: 'Signal',
    description: 'A narrow shimmer moving through dense points.',
    config: {
      layout: 'grid',
      shape: 'dot',
      fade: 'top-center',
      animation: 'shimmer',
      cellSize: 12,
      size: 2,
      density: 0.72,
      densityVariation: 0,
      fieldScale: 0.05,
      shadeVariation: 0.62,
      opacity: 0.48,
      rotation: 0,
      rotationRandomness: 0,
      animationDuration: 3200,
      animationAngle: 26,
      animationWidth: 0.18,
      animationStrength: 0.7,
      seed: 8128,
      color: '#f4f4f5',
      background: '#111113',
    },
  },
  {
    name: 'Cross current',
    description: 'A technical cross field with seeded movement.',
    config: {
      layout: 'random',
      shape: 'cross',
      fade: 'none',
      animation: 'random-blink',
      cellSize: 18,
      size: 7,
      density: 0.62,
      densityVariation: 0.42,
      fieldScale: 0.09,
      shadeVariation: 0.35,
      opacity: 0.58,
      rotation: 0,
      rotationRandomness: 0.5,
      animationDuration: 2100,
      animationAngle: 0,
      animationWidth: 0.32,
      animationStrength: 0.44,
      seed: 13013,
      color: '#164e63',
      background: '#ecfeff',
    },
  },
  {
    name: 'Field notes',
    description: 'Warm paper, sparse marks, editorial texture.',
    config: {
      layout: 'random',
      shape: 'dot',
      fade: 'top-left',
      animation: 'none',
      cellSize: 14,
      size: 2,
      density: 0.48,
      densityVariation: 0.7,
      fieldScale: 0.035,
      shadeVariation: 0.52,
      opacity: 0.44,
      rotation: 0,
      rotationRandomness: 0,
      animationDuration: 2800,
      animationAngle: 20,
      animationWidth: 0.28,
      animationStrength: 0.38,
      seed: 73021,
      color: '#7c2d12',
      background: '#fff7ed',
    },
  },
];

export const previewTemplates: {
  id: PreviewTemplate;
  label: string;
}[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'metric', label: 'Metric' },
  { id: 'empty', label: 'Empty state' },
  { id: 'canvas', label: 'Canvas' },
];
