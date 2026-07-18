import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { PatternField } from '../../src';
import {
  presets,
  previewTemplates,
  type PlaygroundConfig,
  type PreviewTemplate,
} from './presets';

const layouts = ['grid', 'offset', 'random'] as const;
const shapes = ['dot', 'cross'] as const;
const fades = ['none', 'center', 'top', 'top-center', 'top-left'] as const;
const animations = ['none', 'shimmer', 'random-blink'] as const;
const templates = ['hero', 'metric', 'empty', 'canvas'] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function numberParam(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
) {
  const rawValue = params.get(key);
  if (rawValue === null) return fallback;
  const value = Number(rawValue);
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function enumParam<T extends string>(
  params: URLSearchParams,
  key: string,
  options: readonly T[],
  fallback: T,
) {
  const value = params.get(key);
  return value !== null && options.includes(value as T)
    ? (value as T)
    : fallback;
}

function colorParam(params: URLSearchParams, key: string, fallback: string) {
  const value = params.get(key);
  return value !== null && /^#[\da-f]{6}$/i.test(value) ? value : fallback;
}

function readUrlState() {
  const fallback = presets[0]?.config;
  if (!fallback)
    throw new Error('The playground requires at least one preset.');

  const params = new URLSearchParams(window.location.search);
  const config: PlaygroundConfig = {
    layout: enumParam(params, 'layout', layouts, fallback.layout),
    shape: enumParam(params, 'shape', shapes, fallback.shape),
    fade: enumParam(params, 'fade', fades, fallback.fade),
    animation: enumParam(params, 'animation', animations, fallback.animation),
    cellSize: numberParam(params, 'cell', fallback.cellSize, 4, 48),
    size: numberParam(params, 'size', fallback.size, 1, 24),
    density: numberParam(params, 'density', fallback.density, 0, 1),
    densityVariation: numberParam(
      params,
      'densityVariation',
      fallback.densityVariation,
      0,
      1,
    ),
    fieldScale: numberParam(
      params,
      'fieldScale',
      fallback.fieldScale,
      0.005,
      0.2,
    ),
    shadeVariation: numberParam(
      params,
      'shadeVariation',
      fallback.shadeVariation,
      0,
      1,
    ),
    opacity: numberParam(params, 'opacity', fallback.opacity, 0, 1),
    rotation: numberParam(params, 'rotation', fallback.rotation, -180, 180),
    rotationRandomness: numberParam(
      params,
      'rotationRandomness',
      fallback.rotationRandomness,
      0,
      1,
    ),
    animationDuration: numberParam(
      params,
      'duration',
      fallback.animationDuration,
      400,
      8000,
    ),
    animationAngle: numberParam(
      params,
      'angle',
      fallback.animationAngle,
      -180,
      180,
    ),
    animationWidth: numberParam(
      params,
      'width',
      fallback.animationWidth,
      0.05,
      1,
    ),
    animationStrength: numberParam(
      params,
      'strength',
      fallback.animationStrength,
      0,
      1,
    ),
    seed: Math.round(numberParam(params, 'seed', fallback.seed, 1, 99999)),
    color: colorParam(params, 'color', fallback.color),
    background: colorParam(params, 'background', fallback.background),
  };

  return {
    config,
    template: enumParam(params, 'template', templates, 'hero'),
  };
}

function writeUrlState(config: PlaygroundConfig, template: PreviewTemplate) {
  const params = new URLSearchParams({
    template,
    layout: config.layout,
    shape: config.shape,
    fade: config.fade,
    animation: config.animation,
    cell: String(config.cellSize),
    size: String(config.size),
    density: String(config.density),
    densityVariation: String(config.densityVariation),
    fieldScale: String(config.fieldScale),
    shadeVariation: String(config.shadeVariation),
    opacity: String(config.opacity),
    rotation: String(config.rotation),
    rotationRandomness: String(config.rotationRandomness),
    duration: String(config.animationDuration),
    angle: String(config.animationAngle),
    width: String(config.animationWidth),
    strength: String(config.animationStrength),
    seed: String(config.seed),
    color: config.color,
    background: config.background,
  });
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?${params}`,
  );
}

function codeFor(config: PlaygroundConfig) {
  return `<PatternField
  layout="${config.layout}"
  shape="${config.shape}"
  fade="${config.fade}"
  cellSize={${String(config.cellSize)}}
  size={${String(config.size)}}
  density={${String(config.density)}}
  densityVariation={${String(config.densityVariation)}}
  fieldScale={${String(config.fieldScale)}}
  shadeVariation={${String(config.shadeVariation)}}
  opacity={${String(config.opacity)}}
  rotation={${String(config.rotation)}}
  rotationRandomness={${String(config.rotationRandomness)}}
  seed={${String(config.seed)}}
  color="${config.color}"
  animation="${config.animation}"
  animationDuration={${String(config.animationDuration)}}
  animationAngle={${String(config.animationAngle)}}
  animationWidth={${String(config.animationWidth)}}
  animationStrength={${String(config.animationStrength)}}
/>`;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function isDarkColor(hex: string) {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(
    (channel) => Number.parseInt(channel, 16) / 255,
  );
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4),
  );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 < 0.32;
}

function Icon({ name }: { name: 'copy' | 'github' | 'shuffle' | 'share' }) {
  if (name === 'copy') {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <rect x="5.5" y="5.5" width="7" height="7" rx="1.5" />
        <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
      </svg>
    );
  }
  if (name === 'shuffle') {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path d="M11.5 2.5h2v2M2.5 11.5h2.25c3.75 0 3.5-8 7.75-8h1" />
        <path d="M11.5 13.5h2v-2M2.5 4.5h2.25c1.3 0 2.05.96 2.65 2.2M9.2 10.1c.77 1.8 1.78 2.4 3.3 2.4h1" />
      </svg>
    );
  }
  if (name === 'share') {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path d="M8 10.5v-8M5 5.5l3-3 3 3" />
        <path d="M4 7.5H3.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H12" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 1.8a6.35 6.35 0 0 0-2 12.37c.32.06.43-.14.43-.3v-1.22c-1.77.38-2.14-.75-2.14-.75-.29-.74-.71-.93-.71-.93-.58-.4.04-.39.04-.39.64.05.98.66.98.66.57.98 1.5.7 1.86.53.06-.42.22-.7.41-.86-1.41-.16-2.9-.7-2.9-3.14 0-.69.25-1.26.66-1.7-.07-.17-.29-.81.06-1.68 0 0 .54-.17 1.75.65A6.1 6.1 0 0 1 8 4.82c.54 0 1.08.07 1.58.21 1.21-.82 1.75-.65 1.75-.65.35.87.13 1.51.06 1.68.41.44.66 1.01.66 1.7 0 2.44-1.49 2.98-2.91 3.14.23.2.43.59.43 1.19v1.78c0 .17.12.37.44.3A6.35 6.35 0 0 0 8 1.8Z" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span aria-hidden="true" className="brand-mark">
      {Array.from({ length: 9 }, (_, index) => (
        <i key={index} />
      ))}
    </span>
  );
}

function Button({
  children,
  icon,
  onClick,
  variant = 'secondary',
}: {
  children: ReactNode;
  icon?: 'copy' | 'shuffle' | 'share';
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
}) {
  return (
    <button
      className={`button button-${variant}`}
      onClick={onClick}
      type="button"
    >
      {icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}

function SegmentedControl<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: readonly T[];
  value: T;
}) {
  return (
    <fieldset className="control-fieldset">
      <legend>{label}</legend>
      <div className="segmented-control">
        {options.map((option) => (
          <button
            aria-pressed={value === option}
            className={value === option ? 'is-active' : undefined}
            key={option}
            onClick={() => {
              onChange(option);
            }}
            type="button"
          >
            {option.replace('-', ' ')}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function RangeControl({
  label,
  max,
  min,
  onChange,
  step,
  suffix,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  suffix?: string;
  value: number;
}) {
  const id = `control-${label.toLowerCase().replaceAll(' ', '-')}`;
  return (
    <div className="range-control">
      <div className="control-label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {value}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        max={max}
        min={min}
        onChange={(event) => {
          onChange(Number(event.currentTarget.value));
        }}
        step={step}
        type="range"
        value={value}
      />
    </div>
  );
}

function ColorControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="color-control">
      <span>{label}</span>
      <span className="color-value">
        <input
          aria-label={`${label}: ${value}`}
          onChange={(event) => {
            onChange(event.currentTarget.value);
          }}
          type="color"
          value={value}
        />
        <code>{value.toUpperCase()}</code>
      </span>
    </label>
  );
}

function TemplateContent({ template }: { template: PreviewTemplate }) {
  if (template === 'hero') {
    return (
      <div className="template-content hero-template">
        <span className="preview-eyebrow">Generative canvas patterns</span>
        <h2>Give empty space a pulse.</h2>
        <p>Seeded, lightweight backgrounds built for React.</p>
        <span className="preview-cta">Explore the field&nbsp; →</span>
      </div>
    );
  }
  if (template === 'metric') {
    return (
      <div className="template-content metric-template">
        <div className="metric-heading">
          <span>Signal strength</span>
          <i />
        </div>
        <strong>84.2%</strong>
        <span className="metric-delta">↗ 12.4% this week</span>
        <div className="metric-chart" aria-hidden="true">
          {[34, 48, 42, 66, 58, 76, 68, 88, 82, 96].map((height, index) => (
            <i key={index} style={{ height: `${String(height)}%` }} />
          ))}
        </div>
      </div>
    );
  }
  if (template === 'empty') {
    return (
      <div className="template-content empty-template">
        <span className="empty-icon">
          <BrandMark />
        </span>
        <h2>Your field is quiet</h2>
        <p>New signals will appear here as they arrive.</p>
        <span className="preview-cta">Create signal</span>
      </div>
    );
  }
  return (
    <div className="canvas-caption">
      <span>Seed {String(new Date().getFullYear()).slice(-2)}</span>
      <span>Live canvas</span>
    </div>
  );
}

function Preview({
  config,
  template,
}: {
  config: PlaygroundConfig;
  template: PreviewTemplate;
}) {
  const dark = isDarkColor(config.background);
  return (
    <div
      className={`preview-stage template-${template} ${dark ? 'is-dark' : ''}`}
      style={{
        background: config.background,
        color: dark ? '#fafafa' : '#111111',
      }}
    >
      <PatternCanvas config={config} />
      <TemplateContent template={template} />
    </div>
  );
}

function PatternCanvas({
  animationOverride,
  config,
}: {
  animationOverride?: PlaygroundConfig['animation'];
  config: PlaygroundConfig;
}) {
  return (
    <PatternField
      animation={animationOverride ?? config.animation}
      animationAngle={config.animationAngle}
      animationDuration={config.animationDuration}
      animationStrength={config.animationStrength}
      animationWidth={config.animationWidth}
      cellSize={config.cellSize}
      color={config.color}
      density={config.density}
      densityVariation={config.densityVariation}
      fade={config.fade}
      fieldScale={config.fieldScale}
      layout={config.layout}
      opacity={config.opacity}
      rotation={config.rotation}
      rotationRandomness={config.rotationRandomness}
      seed={config.seed}
      shadeVariation={config.shadeVariation}
      shape={config.shape}
      size={config.size}
    />
  );
}

export function App() {
  const initialState = useMemo(() => readUrlState(), []);
  const [config, setConfig] = useState(initialState.config);
  const [template, setTemplate] = useState(initialState.template);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    writeUrlState(config, template);
  }, [config, template]);

  useEffect(
    () => () => {
      if (noticeTimer.current !== null)
        window.clearTimeout(noticeTimer.current);
    },
    [],
  );

  const update = <Key extends keyof PlaygroundConfig>(
    key: Key,
    value: PlaygroundConfig[Key],
  ) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => {
      setNotice(null);
    }, 1800);
  };

  const copy = async (value: string, successMessage: string) => {
    const copied = await copyText(value);
    showNotice(copied ? successMessage : 'Copy unavailable');
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Glyphfield playground home">
          <BrandMark />
          <span>Glyphfield</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="https://github.com/p3yman/glyphfield#readme">Docs</a>
          <a
            className="github-link"
            href="https://github.com/p3yman/glyphfield"
            aria-label="Glyphfield on GitHub"
          >
            <Icon name="github" />
            <span>GitHub</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="intro">
          <div>
            <span className="section-kicker">Playground</span>
            <h1>Shape the field.</h1>
          </div>
          <p>
            Tune a seeded pattern, preview it in context, then copy the exact
            React configuration.
          </p>
        </section>

        <div className="workspace">
          <section className="preview-column" aria-label="Pattern preview">
            <div className="preview-toolbar">
              <div
                className="template-tabs"
                role="tablist"
                aria-label="Preview template"
              >
                {previewTemplates.map((item) => (
                  <button
                    aria-selected={template === item.id}
                    className={template === item.id ? 'is-active' : undefined}
                    key={item.id}
                    onClick={() => {
                      setTemplate(item.id);
                    }}
                    role="tab"
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="preview-actions">
                <Button
                  icon="shuffle"
                  onClick={() => {
                    update('seed', Math.floor(Math.random() * 99999) + 1);
                  }}
                  variant="quiet"
                >
                  New seed
                </Button>
                <Button
                  icon="share"
                  onClick={() => void copy(window.location.href, 'Link copied')}
                  variant="quiet"
                >
                  Share
                </Button>
              </div>
            </div>
            <Preview config={config} template={template} />

            <div className="presets-heading">
              <div>
                <h2>Pattern presets</h2>
                <p>Start with a composition, then make it yours.</p>
              </div>
              <span>{presets.length} templates</span>
            </div>
            <div className="preset-grid">
              {presets.map((preset) => (
                <button
                  className="preset-card"
                  key={preset.name}
                  onClick={() => {
                    setConfig(preset.config);
                  }}
                  type="button"
                >
                  <span
                    className="preset-preview"
                    style={{ background: preset.config.background }}
                  >
                    <PatternCanvas
                      animationOverride="none"
                      config={preset.config}
                    />
                  </span>
                  <span className="preset-meta">
                    <strong>{preset.name}</strong>
                    <span>{preset.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <aside className="inspector" aria-label="Pattern controls">
            <div className="inspector-heading">
              <div>
                <span className="section-kicker">Configuration</span>
                <h2>Pattern</h2>
              </div>
              <span className="seed-chip">#{config.seed}</span>
            </div>

            <div className="control-section">
              <SegmentedControl
                label="Layout"
                onChange={(value) => {
                  update('layout', value);
                }}
                options={layouts}
                value={config.layout}
              />
              <SegmentedControl
                label="Mark"
                onChange={(value) => {
                  update('shape', value);
                }}
                options={shapes}
                value={config.shape}
              />
              <RangeControl
                label="Cell size"
                min={4}
                max={48}
                step={1}
                suffix="px"
                value={config.cellSize}
                onChange={(value) => {
                  update('cellSize', value);
                }}
              />
              <RangeControl
                label="Mark size"
                min={1}
                max={24}
                step={1}
                suffix="px"
                value={config.size}
                onChange={(value) => {
                  update('size', value);
                }}
              />
              <RangeControl
                label="Opacity"
                min={0}
                max={1}
                step={0.01}
                value={config.opacity}
                onChange={(value) => {
                  update('opacity', value);
                }}
              />
              <RangeControl
                label="Shade variation"
                min={0}
                max={1}
                step={0.01}
                value={config.shadeVariation}
                onChange={(value) => {
                  update('shadeVariation', value);
                }}
              />
            </div>

            <div className="control-section">
              <h3>Distribution</h3>
              <RangeControl
                label="Density"
                min={0}
                max={1}
                step={0.01}
                value={config.density}
                onChange={(value) => {
                  update('density', value);
                }}
              />
              <RangeControl
                label="Field variation"
                min={0}
                max={1}
                step={0.01}
                value={config.densityVariation}
                onChange={(value) => {
                  update('densityVariation', value);
                }}
              />
              <RangeControl
                label="Field scale"
                min={0.005}
                max={0.2}
                step={0.005}
                value={config.fieldScale}
                onChange={(value) => {
                  update('fieldScale', value);
                }}
              />
              <RangeControl
                label="Rotation"
                min={-180}
                max={180}
                step={1}
                suffix="°"
                value={config.rotation}
                onChange={(value) => {
                  update('rotation', value);
                }}
              />
              <RangeControl
                label="Random rotation"
                min={0}
                max={1}
                step={0.01}
                value={config.rotationRandomness}
                onChange={(value) => {
                  update('rotationRandomness', value);
                }}
              />
              <label className="select-control">
                <span>Fade</span>
                <select
                  value={config.fade}
                  onChange={(event) => {
                    update(
                      'fade',
                      event.currentTarget.value as PlaygroundConfig['fade'],
                    );
                  }}
                >
                  {fades.map((fade) => (
                    <option key={fade}>{fade}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="control-section">
              <h3>Motion</h3>
              <label className="select-control">
                <span>Animation</span>
                <select
                  value={config.animation}
                  onChange={(event) => {
                    update(
                      'animation',
                      event.currentTarget
                        .value as PlaygroundConfig['animation'],
                    );
                  }}
                >
                  {animations.map((animation) => (
                    <option key={animation}>{animation}</option>
                  ))}
                </select>
              </label>
              {config.animation !== 'none' ? (
                <>
                  <RangeControl
                    label="Duration"
                    min={400}
                    max={8000}
                    step={100}
                    suffix="ms"
                    value={config.animationDuration}
                    onChange={(value) => {
                      update('animationDuration', value);
                    }}
                  />
                  <RangeControl
                    label="Strength"
                    min={0}
                    max={1}
                    step={0.01}
                    value={config.animationStrength}
                    onChange={(value) => {
                      update('animationStrength', value);
                    }}
                  />
                  <RangeControl
                    label="Width"
                    min={0.05}
                    max={1}
                    step={0.01}
                    value={config.animationWidth}
                    onChange={(value) => {
                      update('animationWidth', value);
                    }}
                  />
                  {config.animation === 'shimmer' ? (
                    <RangeControl
                      label="Angle"
                      min={-180}
                      max={180}
                      step={1}
                      suffix="°"
                      value={config.animationAngle}
                      onChange={(value) => {
                        update('animationAngle', value);
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="control-section color-section">
              <h3>Surface</h3>
              <ColorControl
                label="Pattern"
                value={config.color}
                onChange={(value) => {
                  update('color', value);
                }}
              />
              <ColorControl
                label="Background"
                value={config.background}
                onChange={(value) => {
                  update('background', value);
                }}
              />
            </div>

            <div className="copy-panel">
              <div>
                <span>Ready to use</span>
                <code>&lt;PatternField /&gt;</code>
              </div>
              <Button
                icon="copy"
                onClick={() => void copy(codeFor(config), 'Code copied')}
                variant="primary"
              >
                Copy code
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <footer>
        <span>Built with Glyphfield</span>
        <span>Seeded canvas patterns for React</span>
      </footer>

      <div aria-live="polite" className={`toast ${notice ? 'is-visible' : ''}`}>
        {notice}
      </div>
    </div>
  );
}
