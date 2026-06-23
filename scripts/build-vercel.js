#!/usr/bin/env node
/**
 * Custom Vercel build script.
 * 1. Runs vite build
 * 2. Generates .vercel/output/ with correct SPA routing
 * 
 * This bypasses Vercel's Vite builder which has routing bugs.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const vercelOutput = path.join(root, '.vercel', 'output');
const staticDir = path.join(vercelOutput, 'static');
const configPath = path.join(vercelOutput, 'config.json');

// Step 1: Run vite build
console.log('▶ Running vite build...');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

// Step 2: Create vercel output structure
console.log('▶ Generating .vercel/output/...');
if (fs.existsSync(vercelOutput)) {
  fs.rmSync(vercelOutput, { recursive: true });
}
fs.mkdirSync(staticDir, { recursive: true });

// Step 3: Copy dist/ to static/
function copyDir(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}
copyDir(distDir, staticDir);

// Step 4: Generate config.json with proper SPA routing
// Order: filesystem first, then catch-all rewrite
const config = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' },
  ],
};
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✓ Build complete! .vercel/output/ ready for deployment');
