import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const temporaryRoot = resolve(root, '.tmp/package-check');
const packDirectory = resolve(temporaryRoot, 'pack');
const consumerDirectory = resolve(temporaryRoot, 'consumer');

rmSync(temporaryRoot, { force: true, recursive: true });
mkdirSync(packDirectory, { recursive: true });

execFileSync('npm', ['run', 'prepack'], { cwd: root, stdio: 'inherit' });
const packOutput = execFileSync(
  'npm',
  ['pack', '--ignore-scripts', '--json', '--pack-destination', packDirectory],
  { cwd: root, encoding: 'utf8' },
);
const packResult = JSON.parse(packOutput);
const artifact = packResult[0];
if (!artifact) throw new Error('npm pack did not produce an artifact');

const allowedFiles = [
  'LICENSE',
  'README.md',
  'package.json',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.cts',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/index.js.map',
].sort();
const files = artifact.files.map(({ path }) => path).sort();
if (JSON.stringify(files) !== JSON.stringify(allowedFiles)) {
  throw new Error(`Unexpected package files:\n${files.join('\n')}`);
}

for (const mapName of ['index.cjs.map', 'index.js.map']) {
  const map = JSON.parse(readFileSync(resolve(root, 'dist', mapName), 'utf8'));
  const serialized = JSON.stringify(map);
  if (serialized.includes('/Users/') || serialized.includes('node_modules')) {
    throw new Error(`${mapName} contains a machine path or dependency source`);
  }
}

cpSync(resolve(root, 'fixtures/consumer'), consumerDirectory, {
  recursive: true,
});
const tarball = resolve(packDirectory, artifact.filename);
if (!existsSync(tarball)) throw new Error(`Missing tarball: ${tarball}`);

execFileSync(
  'npm',
  ['install', '--ignore-scripts', '--no-audit', '--no-fund'],
  {
    cwd: consumerDirectory,
    stdio: 'inherit',
  },
);
execFileSync(
  'npm',
  ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball],
  { cwd: consumerDirectory, stdio: 'inherit' },
);
execFileSync('npm', ['run', 'verify'], {
  cwd: consumerDirectory,
  stdio: 'inherit',
});

console.log(
  JSON.stringify(
    {
      filename: artifact.filename,
      files: artifact.files,
      compressedSize: artifact.size,
      unpackedSize: artifact.unpackedSize,
      integrity: artifact.integrity,
    },
    null,
    2,
  ),
);
