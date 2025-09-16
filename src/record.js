// src/record.js
import fs from 'fs';
import path from 'path';
import { ensureDir, filenameForScenario, parseViewport, captureScreenshot } from './utils.js';

export async function recordCommand(opts = {}) {
  if (opts.config) {
    // ✅ Config file mode
    const configPath = path.resolve(process.cwd(), opts.config);
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Config file not found: ${configPath}`);
      process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    for (const scenario of config.scenarios) {
      await runScenario(scenario, config.baselineDir || './__pixel_baseline__');
    }
  } else {
    // ✅ Single-scenario mode
    await runScenario(opts, opts.baselineDir || './__pixel_baseline__');
  }
}

async function runScenario(scenario, baselineDir) {
  const name = scenario.name || 'homepage';
  const url = scenario.url || 'http://localhost:3000';
  const viewport = parseViewport(scenario.viewport || '1366x768');
  const selector = scenario.selector;

  await ensureDir(baselineDir);

  const filename = filenameForScenario(name, viewport.width, viewport.height);
  const outPath = path.join(baselineDir, filename);

  await captureScreenshot({ url, outPath, selector, viewport });
  console.log(`✅ Baseline saved: ${outPath}`);
}
