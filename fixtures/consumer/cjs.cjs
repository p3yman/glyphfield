const React = require('react');
const { renderToString } = require('react-dom/server');
const { Glyphfield, PatternField } = require('@p3yman/glyphfield');

if (Glyphfield !== PatternField) throw new Error('Glyphfield alias mismatch');
const html = renderToString(React.createElement(PatternField, { seed: 7 }));
if (!html.includes('pattern-field')) throw new Error('CommonJS render failed');
