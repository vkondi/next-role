#!/usr/bin/env node
/**
 * patch-yarn-lock.mjs
 *
 * Patches vulnerable transitive dependencies in yarn.lock to safe versions.
 * Fetches the correct resolved URL and integrity hash directly from the npm registry.
 *
 * Single patch:
 *   node scripts/patch-yarn-lock.mjs --package <name> --from <old-version> --to <new-version>
 *   node scripts/patch-yarn-lock.mjs --package picomatch --from 2.3.1 --to 2.3.2
 *   node scripts/patch-yarn-lock.mjs -p @scope/pkg -f 1.0.0 -t 1.0.1
 *
 * Apply all patches from scripts/security-patches.json (runs automatically via postinstall):
 *   node scripts/patch-yarn-lock.mjs --all
 */

import { readFileSync, writeFileSync } from 'fs';
import { get } from 'https';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCK_FILE = resolve(__dirname, '../yarn.lock');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--package' || args[i] === '-p') result.package = args[++i];
    else if (args[i] === '--from' || args[i] === '-f') result.from = args[++i];
    else if (args[i] === '--to' || args[i] === '-t') result.to = args[++i];
    else if (args[i] === '--all') result.all = true;
  }
  return result;
}

function fetchPackageInfo(pkg, version) {
  return new Promise((resolvePromise, reject) => {
    const encodedPkg = pkg.startsWith('@') ? pkg.replace('/', '%2F') : pkg;
    const url = `https://registry.npmjs.org/${encodedPkg}/${version}`;

    function handleResponse(res) {
      if (res.statusCode === 301 || res.statusCode === 302) {
        get(res.headers.location, handleResponse).on('error', reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`npm registry returned HTTP ${res.statusCode} for ${pkg}@${version}`));
        return;
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const integrity = json.dist?.integrity;
          const tarball = json.dist?.tarball;
          if (!integrity || !tarball) {
            reject(new Error(`Missing dist info for ${pkg}@${version}. Got: ${JSON.stringify(json.dist)}`));
          } else {
            resolvePromise({ integrity, tarball });
          }
        } catch (e) {
          reject(new Error(`Failed to parse npm registry response: ${e.message}`));
        }
      });
    }

    get(url, handleResponse).on('error', reject);
  });
}

function patchLockFile(content, pkgName, fromVersion, toVersion, tarball, integrity) {
  const lines = content.split('\n');
  const result = [];
  let inTargetBlock = false;
  let shouldPatch = false;
  let patchCount = 0;

  for (const line of lines) {
    // Block headers are non-indented, non-empty, non-comment lines
    if (line.length > 0 && !/^[\s#]/.test(line)) {
      const parts = line
        .replace(/:$/, '')
        .split(', ')
        .map(p => p.replace(/^"|"$/g, ''));
      inTargetBlock = parts.some(p => p.startsWith(`${pkgName}@`));
      shouldPatch = false;
    }

    if (inTargetBlock) {
      // Detect and replace the version line
      const versionMatch = line.match(/^(\s+)version "(.+)"$/);
      if (versionMatch) {
        if (versionMatch[2] === fromVersion) {
          shouldPatch = true;
          patchCount++;
          result.push(`${versionMatch[1]}version "${toVersion}"`);
          continue;
        } else {
          // Different version in this block — don't patch
          shouldPatch = false;
        }
      }

      if (shouldPatch) {
        // Replace the resolved URL
        const resolvedMatch = line.match(/^(\s+)resolved ".+"$/);
        if (resolvedMatch) {
          result.push(`${resolvedMatch[1]}resolved "${tarball}"`);
          continue;
        }

        // Replace the integrity hash
        const integrityMatch = line.match(/^(\s+)integrity .+$/);
        if (integrityMatch) {
          result.push(`${integrityMatch[1]}integrity ${integrity}`);
          continue;
        }
      }
    }

    result.push(line);
  }

  return { content: result.join('\n'), patchCount };
}

async function applyPatch(args) {
  console.log(`\nFetching package info for ${args.package}@${args.to} from npm registry...`);
  const { integrity, tarball } = await fetchPackageInfo(args.package, args.to);
  console.log(`  tarball:   ${tarball}`);
  console.log(`  integrity: ${integrity}`);

  const original = readFileSync(LOCK_FILE, 'utf8');
  const normalized = original.replace(/\r\n/g, '\n');
  const { content, patchCount } = patchLockFile(
    normalized,
    args.package,
    args.from,
    args.to,
    tarball,
    integrity,
  );

  if (patchCount === 0) {
    console.log(`  (already patched or not present — skipped)`);
    return;
  }

  writeFileSync(LOCK_FILE, content, 'utf8');
  console.log(`  ✓ Patched ${patchCount} entry(ies): ${args.package} ${args.from} → ${args.to}`);
}

async function main() {
  const args = parseArgs();

  if (args.all) {
    const configPath = resolve(__dirname, 'security-patches.json');
    const patches = JSON.parse(readFileSync(configPath, 'utf8'));
    console.log(`\nApplying ${patches.length} security patch(es) from security-patches.json...`);
    for (const patch of patches) {
      await applyPatch(patch);
    }
    console.log('\nDone.\n');
    return;
  }

  if (!args.package || !args.from || !args.to) {
    console.error(
      'Usage: node scripts/patch-yarn-lock.mjs --package <name> --from <old-version> --to <new-version>\n' +
        'Aliases: -p, -f, -t\n\n' +
        'Or apply all patches from security-patches.json:\n' +
        '  node scripts/patch-yarn-lock.mjs --all',
    );
    process.exit(1);
  }

  await applyPatch(args);
  console.log(`\n  Run "yarn install --frozen-lockfile" to validate the updated lock file.\n`);
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
