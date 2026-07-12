#!/usr/bin/env node
/**
 * build-icons.mjs
 * Generates a unified V2exIcons TTF font and JSON glyphmap from all SVGs
 * in src/assets/icons/svgs/
 */

import { generateFonts, FontAssetType, OtherAssetType } from 'fantasticon';
import SvgFixer from 'oslllo-svg-fixer';
import { mkdir, rename, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const inputDir = join(ROOT, 'src', 'assets', 'icons', 'svgs');
const fixedDir = join(ROOT, 'src', 'assets', 'icons', 'svgs-fixed');
const fontsDir = join(ROOT, 'src', 'assets', 'fonts');
const glyphmapsDir = join(ROOT, 'src', 'components', 'icons', 'glyphmaps');

const name = 'V2exIcons';

async function buildIcons() {
  if (!existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  // 1. Fix SVGs (stroke to fill, correct winding rules)
  console.log(`\nFixing SVGs in ${inputDir}...`);
  await mkdir(fixedDir, { recursive: true });
  
  try {
    await SvgFixer(inputDir, fixedDir, { showProgressBar: true }).fix();
    console.log('  ✓ SVGs fixed successfully');
  } catch (err) {
    console.error('  ✗ SVG fixing failed:', err.message);
    throw err;
  }

  // 2. Generate Font
  await mkdir(fontsDir, { recursive: true });
  await mkdir(glyphmapsDir, { recursive: true });

  const tmpDir = join(ROOT, '.fantasticon-tmp');
  await mkdir(tmpDir, { recursive: true });

  console.log(`\nBuilding font: ${name}`);
  const result = await generateFonts({
    name,
    inputDir: fixedDir,
    outputDir: tmpDir,
    fontTypes: [FontAssetType.TTF],
    assetTypes: [OtherAssetType.JSON],
    normalize: true,
    round: 10e12,
    descent: 0,
    fontHeight: 1000,
    getIconId: ({ basename }) => basename,
  });

  // 3. Move TTF
  const ttfSrc = join(tmpDir, `${name}.ttf`);
  const ttfDest = join(fontsDir, `${name}.ttf`);
  await rename(ttfSrc, ttfDest);
  console.log(`  ✓ TTF: ${ttfDest}`);

  // 4. Move JSON Glyphmap
  const jsonSrc = join(tmpDir, `${name}.json`);
  const rawJson = JSON.parse(await readFile(jsonSrc, 'utf8'));

  const glyphMapDest = join(glyphmapsDir, `${name}.json`);
  await writeFile(glyphMapDest, JSON.stringify(rawJson, null, 2) + '\n', 'utf8');
  console.log(`  ✓ Glyphmap: ${glyphMapDest}`);
  console.log(`  ✓ Total icons: ${Object.keys(rawJson).length}`);

  console.log('\n✅ Font built successfully!');
}

buildIcons().catch(console.error);
