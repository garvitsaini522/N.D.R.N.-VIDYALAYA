import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extensions = ['.js', '.jsx', '.json', '.css'];

let brokenImports = 0;
let filesScanned = 0;

function checkFileImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /(?:import|export)\s+(?:(?:(?:\w+|\{[^}]*\}|\*\s+as\s+\w+)\s+from\s+)|)['"](\.[^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const baseDir = path.dirname(filePath);
    let resolved = path.resolve(baseDir, importPath);

    let exists = false;
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      exists = true;
    } else {
      for (const ext of extensions) {
        if (fs.existsSync(resolved + ext) && fs.statSync(resolved + ext).isFile()) {
          exists = true;
          break;
        }
        const indexFile = path.join(resolved, `index${ext}`);
        if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
          exists = true;
          break;
        }
      }
    }

    if (!exists) {
      console.error(`❌ Broken import in ${path.relative(rootDir, filePath)}: "${importPath}" not found`);
      brokenImports++;
    }
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      filesScanned++;
      checkFileImports(fullPath);
    }
  }
}

console.log('🔍 Scanning repository for broken imports...');
scanDir(path.join(rootDir, 'src'));
scanDir(path.join(rootDir, 'backend'));

if (brokenImports > 0) {
  console.error(`\n❌ Failed: ${brokenImports} broken import(s) detected across ${filesScanned} files.`);
  process.exit(1);
} else {
  console.log(`✅ All imports verified: ${filesScanned} files examined, 0 broken imports.`);
}

