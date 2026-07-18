import React from 'react';
import { renderToString } from 'react-dom/server';
import { Glyphfield, PatternField } from '@p3yman/glyphfield';

if (Glyphfield !== PatternField) throw new Error('Glyphfield alias mismatch');
const html = renderToString(React.createElement(PatternField, { seed: 7 }));
if (!html.includes('pattern-field')) throw new Error('ESM render failed');
