import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
copyFileSync(
  resolve(root, 'dist/index.d.ts'),
  resolve(root, 'dist/index.d.cts'),
);
