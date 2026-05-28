// Migrate every <InlineText .../> to <InlineRichText .../> across the codebase.
// Rule:
//   - has `multiline` → drop it, leave inline=false (block mode, full toolbar)
//   - no `multiline`  → add `inline` prop (compact toolbar, no block nodes)
// Also rewrites the import line.
//
// Idempotent: re-running on already-migrated files is a no-op.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = ['app', 'components'];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) out.push(p);
  }
  return out;
}

let changed = 0;
let usagesConverted = 0;

for (const dir of TARGET_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    let src = fs.readFileSync(file, 'utf8');
    const orig = src;

    // 1. Rewrite the import. Preserve other named imports if any (none in practice).
    src = src.replace(
      /import\s*\{\s*InlineText\s*\}\s*from\s*['"]@\/components\/edit-mode\/InlineText['"]\s*;?/g,
      `import { InlineRichText } from '@/components/edit-mode/InlineRichText';`,
    );

    // 2. Rewrite every <InlineText ... /> (self-closing, may span multiple lines).
    src = src.replace(/<InlineText\b([\s\S]*?)\/>/g, (match, attrs) => {
      usagesConverted++;
      const hasMultiline = /\bmultiline\b(?!\s*=)/.test(attrs);
      // Drop the multiline attribute if present.
      let newAttrs = attrs.replace(/\s+multiline(?=\s|\/)/g, '');
      // Add `inline` prop in the no-multiline case (compact mode).
      if (!hasMultiline) newAttrs = ` inline${newAttrs}`;
      return `<InlineRichText${newAttrs}/>`;
    });

    if (src !== orig) {
      fs.writeFileSync(file, src);
      changed++;
      console.log(`✓ ${path.relative(ROOT, file)}`);
    }
  }
}

console.log(`\nMigrated ${usagesConverted} <InlineText/> usage(s) across ${changed} file(s).`);
