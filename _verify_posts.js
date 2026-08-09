const fs = require('fs');
const content = fs.readFileSync('C:/Users/ThinkPad/reviewping/src/data/seoPages.js', 'utf8');

const slugRegex = /slug:\s*"([a-z0-9-]+)"/g;
let match;
let count = 0;
while ((match = slugRegex.exec(content)) !== null) {
  count++;
  console.log(count + '. ' + match[1]);
}
console.log('---');
console.log('Total posts: ' + count);

const lines = content.split('\n');
let inContent = false;
let bracketDepth = 0;
let legacyFound = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('content: [')) {
    inContent = true;
    bracketDepth = 1;
    continue;
  }
  if (inContent) {
    for (const ch of line) {
      if (ch === '[') bracketDepth++;
      if (ch === ']') bracketDepth--;
    }
    if (bracketDepth <= 0) {
      inContent = false;
      continue;
    }
    const trimmed = line.trim();
    if (trimmed.startsWith('"') && !trimmed.startsWith('"type') && !trimmed.startsWith('"slug') && !trimmed.startsWith('"title')) {
      console.log('WARNING: Legacy string at line ' + (i+1) + ': ' + trimmed.substring(0, 60));
      legacyFound = true;
    }
  }
}

if (!legacyFound) {
  console.log('SUCCESS: No legacy string content found.');
}

try {
  new Function(content.replace('export const BLOG_POSTS', 'const BLOG_POSTS'));
  console.log('SUCCESS: Valid JavaScript syntax.');
} catch (e) {
  console.log('Syntax error: ' + e.message);
  const lineMatch = e.message.match(/line (\d+)/);
  if (lineMatch) {
    const errLine = parseInt(lineMatch[1]);
    console.log('Around line ' + errLine + ':');
    for (let i = Math.max(0, errLine-3); i < Math.min(lines.length, errLine+2); i++) {
      console.log('  ' + (i+1) + ': ' + lines[i]);
    }
  }
}
