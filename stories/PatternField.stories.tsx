import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternField, type PatternFieldProps } from '../src';

const colors = {
  background: '#ffffff',
  border: '#e5e5e5',
  darkBackground: '#0a0a0a',
  darkBorder: '#262626',
  darkForeground: '#fafafa',
  foreground: '#0a0a0a',
  muted: '#737373',
} as const;

function StorySurface({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: colors.background,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        minHeight: 420,
        padding: 'clamp(20px, 4vw, 48px)',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

function DemoHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <h2
        style={{
          color: colors.foreground,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          lineHeight: 1.25,
          margin: 0,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: colors.muted,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 13,
          lineHeight: 1.5,
          margin: 0,
          maxWidth: 640,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function Frame({
  children,
  dark = false,
  height = 280,
  label,
}: {
  children: ReactNode;
  dark?: boolean;
  height?: number;
  label?: string;
}) {
  return (
    <div
      style={{
        background: dark ? colors.darkBackground : colors.background,
        border: `1px solid ${dark ? colors.darkBorder : colors.border}`,
        borderRadius: 10,
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        boxSizing: 'border-box',
        color: dark ? colors.darkForeground : colors.foreground,
        display: 'grid',
        minHeight: height,
        overflow: 'hidden',
        placeItems: 'center',
        position: 'relative',
      }}
    >
      {children}
      {label ? (
        <span
          style={{
            background: dark ? colors.darkForeground : colors.foreground,
            borderRadius: 6,
            bottom: 16,
            color: dark ? colors.darkBackground : colors.darkForeground,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            left: 16,
            letterSpacing: '0.06em',
            lineHeight: 1,
            padding: '7px 9px',
            position: 'absolute',
            textTransform: 'uppercase',
            zIndex: 1,
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function Comparison({
  description,
  items,
  title,
}: {
  description: string;
  items: { dark?: boolean; label: string; props: PatternFieldProps }[];
  title: string;
}) {
  return (
    <StorySurface>
      <DemoHeader description={description} title={title} />
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: `repeat(auto-fit, minmax(${items.length > 3 ? '220px' : '260px'}, 1fr))`,
          width: '100%',
        }}
      >
        {items.map(({ dark, label, props }) => (
          <Frame
            {...(dark === undefined ? {} : { dark })}
            key={label}
            label={label}
          >
            <PatternField {...props} />
          </Frame>
        ))}
      </div>
    </StorySurface>
  );
}

const meta = {
  title: 'Glyphfield/PatternField',
  component: PatternField,
  tags: ['autodocs'],
  render: (args) => (
    <StorySurface>
      <Frame height={324}>
        <PatternField {...args} />
      </Frame>
    </StorySurface>
  ),
  args: {
    animation: 'none',
    animationAngle: 20,
    animationDuration: 1800,
    animationStrength: 0.35,
    animationWidth: 0.3,
    cellSize: 14,
    density: 0.5,
    densityVariation: 0,
    fade: 'none',
    fieldScale: 0.075,
    layout: 'offset',
    opacity: 0.35,
    rotation: 0,
    rotationRandomness: 0,
    seed: 48291,
    shadeScale: 0.04,
    shadeVariation: 0.35,
    shape: 'dot',
    size: 3,
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['grid', 'offset', 'random'] },
    shape: { control: 'inline-radio', options: ['dot', 'cross'] },
    fade: {
      control: 'select',
      options: ['none', 'center', 'top', 'top-center', 'top-left'],
    },
    animation: {
      control: 'inline-radio',
      options: ['none', 'shimmer', 'random-blink'],
    },
    color: { control: 'color' },
  },
} satisfies Meta<typeof PatternField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const LayoutComparison: Story = {
  render: () => (
    <Comparison
      description="Compare the same seeded field across the three placement algorithms."
      items={[
        { label: 'Grid', props: { layout: 'grid' } },
        { label: 'Offset', props: { layout: 'offset' } },
        {
          label: 'Seeded random',
          props: { layout: 'random', density: 0.5, densityVariation: 0.7 },
        },
      ]}
      title="Layout algorithms"
    />
  ),
};

export const ShapeComparison: Story = {
  render: () => (
    <Comparison
      description="Dots and crosses share the same layout, density, and color behavior."
      items={[
        { label: 'Dot', props: { shape: 'dot', size: 6, opacity: 0.4 } },
        {
          label: 'Cross',
          props: { shape: 'cross', size: 9, crossThickness: 2, opacity: 0.4 },
        },
      ]}
      title="Shape primitives"
    />
  ),
};

export const RotationComparison: Story = {
  render: () => (
    <Comparison
      description="Use a fixed angle for uniformity or seeded randomness for texture."
      items={[
        {
          label: 'Fixed 45°',
          props: { shape: 'cross', size: 8, rotation: 45 },
        },
        {
          label: 'Seeded random',
          props: { shape: 'cross', size: 8, rotationRandomness: 1 },
        },
      ]}
      title="Rotation behavior"
    />
  ),
};

export const FadeComparison: Story = {
  render: () => (
    <Comparison
      description="Fade masks soften the pattern toward a chosen edge or focal point."
      items={(['none', 'center', 'top', 'top-left'] as const).map((fade) => ({
        label: fade,
        props: { fade, opacity: 0.45 },
      }))}
      title="Fade origins"
    />
  ),
};

export const ShimmerLoading: Story = {
  args: {
    animation: 'shimmer',
    animationStrength: 0.8,
    fade: 'center',
    opacity: 0.3,
  },
};

export const RandomBlinking: Story = {
  args: {
    animation: 'random-blink',
    animationStrength: 0.75,
    animationWidth: 0.35,
    layout: 'random',
    density: 0.7,
  },
};

export const LightAndDarkCurrentColor: Story = {
  render: () => (
    <Comparison
      description="Glyphfield inherits currentColor, so the same component adapts to light and dark surfaces."
      items={[
        { label: 'Light', props: { opacity: 0.4 } },
        { dark: true, label: 'Dark', props: { opacity: 0.4 } },
      ]}
      title="Theme inheritance"
    />
  ),
};

export const CssCustomProperty: Story = {
  args: {
    style: { '--glyphfield-color': '#d24b3f' },
  },
};

export const ReducedMotion: Story = {
  args: { animation: 'shimmer' },
  parameters: {
    docs: {
      description: {
        story:
          'Enable “Reduce motion” in the operating system. Glyphfield stops requesting animation frames and renders the complete static pattern.',
      },
    },
  },
};
