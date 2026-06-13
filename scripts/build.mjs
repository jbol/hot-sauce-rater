// Smart frontend build.
//
// Locally (and in any normal CI) this runs the real Vite build.
//
// On Hostinger, the build sandbox is mounted `noexec`, so esbuild — which Vite
// uses — cannot execute its native binary and `vite build` dies with EACCES.
// We can't change Hostinger's (locked) build command, so instead we detect that
// environment and skip the build, relying on the prebuilt `dist/` that is
// committed to the repo. The Node server (zero runtime deps) then serves it.
//
// Detection: Hostinger builds inside a path containing `/.builds/`
// (e.g. .../public_html/.builds/source/repository). You can also force a skip
// with SKIP_VITE_BUILD=1, or force a build with FORCE_VITE_BUILD=1.

import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const onHostingerSandbox = process.cwd().includes('/.builds/');
const skip =
  process.env.FORCE_VITE_BUILD !== '1' &&
  (process.env.SKIP_VITE_BUILD === '1' || onHostingerSandbox);

if (skip) {
  console.log(
    'ℹ️  Build skipped on host (noexec sandbox). Serving committed dist/.\n' +
    '   To change the frontend, rebuild locally and commit dist/ (see DEPLOYING.md).'
  );
  if (!existsSync('dist/index.html')) {
    console.error(
      '❌ dist/index.html is missing — the prebuilt frontend was not committed.\n' +
      '   Run `pnpm build` locally (Node 22) and commit the dist/ folder.'
    );
    process.exit(1);
  }
  process.exit(0);
}

// Normal path: run the real Vite build.
execSync('vite build', { stdio: 'inherit' });
