#!/usr/bin/env node
/**
 * Télécharge uniquement les bibliothèques Android pré-compilées de llama.rn
 * (le postinstall officiel télécharge aussi iOS, inutile ici et lourd sur une connexion lente).
 *
 * Usage :
 *   1. npm install avec RNLLAMA_SKIP_POSTINSTALL=1
 *   2. node tools/llama-android-artifacts.js
 *
 * Téléchargement reprenable (curl -C -), vérification SHA-256, extraction dans node_modules/llama.rn.
 */
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const pkgRoot = path.dirname(require.resolve('llama.rn/package.json'));
const pkg = require(path.join(pkgRoot, 'package.json'));
const manifest = require(path.join(pkgRoot, 'install', 'native-artifacts.json'));
const repo = (typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url)
  .replace(/^git\+/, '')
  .replace(/\.git$/, '')
  .replace(/\/$/, '');
const base = `${repo}/releases/download/v${pkg.version}`;

const cacheDir = path.join(os.homedir(), '.cache', 'sanimo-llama-rn');
fs.mkdirSync(cacheDir, { recursive: true });

const sha256 = (file) =>
  new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    fs.createReadStream(file)
      .on('data', (d) => h.update(d))
      .on('end', () => resolve(h.digest('hex')))
      .on('error', reject);
  });

async function main() {
  const android = (manifest.artifacts || []).filter((a) => /android/i.test(a.assetName + a.relativePath));
  if (android.length === 0) throw new Error('Aucun artefact Android dans le manifeste llama.rn.');

  for (const a of android) {
    const marker = a.markerPath && path.join(pkgRoot, a.markerPath);
    if (marker && fs.existsSync(marker) && fs.readFileSync(marker, 'utf8').trim() === a.sha256) {
      console.log(`déjà installé : ${a.relativePath}`);
      continue;
    }
    const archive = path.join(cacheDir, a.assetName);
    console.log(`téléchargement : ${a.assetName}`);
    for (let attempt = 1; attempt <= 10; attempt++) {
      const r = spawnSync(
        'curl',
        ['-L', '--fail', '-C', '-', '--retry', '5', '--retry-delay', '5', '-o', archive, `${base}/${a.assetName}`],
        { stdio: 'inherit' },
      );
      if (r.status === 0) break;
      console.log(`coupure (essai ${attempt}/10), reprise…`);
    }
    const sum = await sha256(archive);
    if (sum !== a.sha256) {
      fs.rmSync(archive, { force: true });
      throw new Error(`SHA-256 incorrect pour ${a.assetName} (fichier supprimé, relancer le script).`);
    }
    fs.rmSync(path.join(pkgRoot, a.relativePath), { recursive: true, force: true });
    const x = spawnSync('tar', ['-xzf', archive, '-C', pkgRoot], { stdio: 'inherit' });
    if (x.status !== 0) throw new Error(`extraction impossible : ${a.assetName}`);
    if (marker) {
      fs.mkdirSync(path.dirname(marker), { recursive: true });
      fs.writeFileSync(marker, `${a.sha256}\n`);
    }
    console.log(`installé : ${a.relativePath}`);
  }
}

main().catch((e) => {
  console.error(`llama-android-artifacts : ${e.message}`);
  process.exit(1);
});
