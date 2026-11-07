const fs = require('fs');
const path = require('path');

const MAX_LINES = 600;
let hasViolation = false;

function inspect(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      inspect(fullPath);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').length; // Blank lines and comments count toward the limit

      if (lines > MAX_LINES) {
        console.error(`VIOLATION: ${fullPath} has ${lines} lines (max limit: ${MAX_LINES})`);
        hasViolation = true;
      }
    }
  }
}

inspect('src');

if (hasViolation) {
  console.error('\nQuality Gate Failed: Source file(s) exceed 600 lines.');
  process.exit(1);
} else {
  console.log(
    `\nQuality Gate Passed: All source files in src/ are strictly under ${MAX_LINES} lines.`,
  );
}
