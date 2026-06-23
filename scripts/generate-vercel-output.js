#!/usr/bin/env node
/**
 * Generates Vercel build output with correct SPA routing config.
 * Run AFTER 
pm run build to prepare the .vercel/output directory.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const vercelOutputDir = path.join(root, '.vercel', 'output');
const staticDir = path.join(vercelOutputDir, 'static');
const configPath = path.join(vercelOutputDir, 'config.json');

// 1. Clean and create vercel output structure
if (fs.existsSync(vercelOutputDir)) {
  fs.rmSync(vercelOutputDir, { recursive: true });
}
fs.mkdirSync(staticDir, { recursive: true });

// 2. Copy dist/ contents to static/
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir(distDir, staticDir);

// 3. Generate config.json with SPA routing
const config = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' },
  ],
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Generated .vercel/output/ with SPA fallback routing');
