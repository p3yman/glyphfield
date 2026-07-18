import { execFileSync } from 'node:child_process';

const tree = JSON.parse(
  execFileSync('npm', ['ls', 'react', '--all', '--json'], { encoding: 'utf8' }),
);
const versions = new Set();

function visit(node) {
  if (!node || typeof node !== 'object') return;
  if (node.name === 'react' && typeof node.version === 'string') {
    versions.add(node.version);
  }
  for (const [name, dependency] of Object.entries(node.dependencies ?? {})) {
    if (name === 'react' && dependency && typeof dependency === 'object') {
      versions.add(dependency.version);
    }
    visit(dependency);
  }
}

visit(tree);
if (versions.size !== 1) {
  throw new Error(
    `Expected one React version, found: ${[...versions].join(', ')}`,
  );
}

execFileSync('npm', ['ls', '--omit=dev'], { stdio: 'inherit' });
