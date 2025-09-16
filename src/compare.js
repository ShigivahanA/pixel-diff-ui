// src/compare.js
import fs from 'fs';
import path from 'path';
import { ensureDir, filenameForScenario, parseViewport, captureScreenshot, compareImagesSync } from './utils.js';

export async function compareCommand(opts = {}) {
  if (opts.config) {
    // ✅ Config file mode
    const configPath = path.resolve(process.cwd(), opts.config);
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Config file not found: ${configPath}`);
      process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    for (const scenario of config.scenarios) {
      await runScenario(scenario, config);
    }
  } else {
    // ✅ Single-scenario mode
    await runScenario(opts, {
      baselineDir: opts.baselineDir || './__pixel_baseline__',
      outputDir: opts.outputDir || './__pixel_output__',
      threshold: Number(opts.threshold) || 0.1
    });
  }
}

async function runScenario(scenario, config) {
  const name = scenario.name || 'homepage';
  const url = scenario.url || 'http://localhost:3000';
  const viewport = parseViewport(scenario.viewport || '1366x768');
  const selector = scenario.selector;

  const baselineDir = config.baselineDir || './__pixel_baseline__';
  const outputDir = config.outputDir || './__pixel_output__';
  const threshold = Number(config.threshold) || 0.1;

  await ensureDir(outputDir);

  const baseFilename = filenameForScenario(name, viewport.width, viewport.height);
  const baselinePath = path.join(baselineDir, baseFilename);
  const currentPath = path.join(outputDir, baseFilename.replace('.png', '_current.png'));
  const diffPath = path.join(outputDir, baseFilename.replace('.png', '_diff.png'));

  if (!fs.existsSync(baselinePath)) {
    console.error(`❌ Baseline not found for "${name}" at ${baselinePath}`);
    return;
  }

  await captureScreenshot({ url, outPath: currentPath, selector, viewport });

  try {
    const mismatched = compareImagesSync(baselinePath, currentPath, diffPath, { threshold });
    console.log(`🔍 [${name}] mismatched pixels: ${mismatched}`);
  } catch (err) {
    console.error(`✖ Comparison failed for "${name}":`, err.message);
  }
}
