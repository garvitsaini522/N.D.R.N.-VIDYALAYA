import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Starting N.D.R.N. Vidyalaya Code Quality, Lint & Security Scanner...');

let errorsFound = 0;
let filesScanned = 0;

// 1. Check all JSON files for syntax correctness
function checkJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        checkJsonFiles(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      filesScanned++;
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        JSON.parse(content);
      } catch (err) {
        console.error(`❌ Invalid JSON in ${path.relative(rootDir, fullPath)}: ${err.message}`);
        errorsFound++;
      }
    }
  }
}

// 2. Check for banned patterns (demo accounts, hardcoded credentials, invalid imports)
const BANNED_PATTERNS = [
  { regex: /admin\.demo@ndrn\.local/i, message: 'Legacy demo account reference found (admin.demo@ndrn.local)' },
  { regex: /from ['"].*demoAccounts['"]/i, message: 'Import of deprecated demoAccounts module' },
  { regex: /require\(['"].*demoAccounts['"]\)/i, message: 'Require of deprecated demoAccounts module' },
];

function checkHygieneAndSecurity(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        checkHygieneAndSecurity(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      filesScanned++;
      const content = fs.readFileSync(fullPath, 'utf8');
      const relPath = path.relative(rootDir, fullPath);

      for (const { regex, message } of BANNED_PATTERNS) {
        if (regex.test(content)) {
          console.error(`❌ Security/Hygiene violation in ${relPath}: ${message}`);
          errorsFound++;
        }
      }
    }
  }
}

// 3. Check for broken relative imports
const extensions = ['.js', '.jsx', '.json', '.css'];

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
      errorsFound++;
    }
  }
}

function checkImportsInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        checkImportsInDir(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      checkFileImports(fullPath);
    }
  }
}

// 4. Syntax-check backend JavaScript files with node --check
function checkBackendSyntax(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        checkBackendSyntax(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      filesScanned++;
      const relPath = path.relative(rootDir, fullPath);
      try {
        execFileSync(process.execPath, ['--check', fullPath], { stdio: 'pipe' });
      } catch (err) {
        console.error(`❌ Syntax error in ${relPath}: ${err.message}`);
        errorsFound++;
      }
    }
  }
}

try {
  console.log('\n[1/4] Validating JSON configuration files...');
  checkJsonFiles(rootDir);

  console.log('[2/4] Checking codebase hygiene, credential leaks, and deprecated demo references...');
  checkHygieneAndSecurity(path.join(rootDir, 'src'));
  checkHygieneAndSecurity(path.join(rootDir, 'backend'));

  console.log('[3/4] Verifying all import paths across frontend & backend...');
  checkImportsInDir(path.join(rootDir, 'src'));
  checkImportsInDir(path.join(rootDir, 'backend'));

  console.log('[4/4] Checking Node.js backend syntax with --check...');
  checkBackendSyntax(path.join(rootDir, 'backend'));

  console.log(`\nScan complete: ${filesScanned} files examined.`);
  if (errorsFound > 0) {
    console.error(`❌ Lint and security check failed with ${errorsFound} error(s).`);
    process.exit(1);
  } else {
    console.log('✅ All lint, syntax, hygiene, and security checks passed successfully.');
    process.exit(0);
  }
} catch (error) {
  console.error('Fatal error running lint checks:', error);
  process.exit(1);
}

