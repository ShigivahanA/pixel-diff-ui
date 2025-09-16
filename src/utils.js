// src/utils.js
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/**
 * Ensure a directory exists
 */
export async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

/**
 * Sanitize a scenario name to create a safe filename
 */
export function sanitizeName(name) {
  return String(name)
    .trim()
    .replace(/[\/\s:]+/g, '-')
    .replace(/[^\w.-]/g, '_');
}

/**
 * filename convention: <safeName>_<width>x<height>.png
 */
export function filenameForScenario(name, width, height) {
  const safe = sanitizeName(name);
  return `${safe}_${width}x${height}.png`;
}

/**
 * Parse viewport input:
 * - string like "1366x768"
 * - object {width,height,deviceScaleFactor}
 */
export function parseViewport(input = '1366x768') {
  if (typeof input === 'string') {
    const [w, h] = input.split('x').map(Number);
    if (!w || !h) throw new Error(`Invalid viewport "${input}". Use WIDTHxHEIGHT e.g. "1366x768".`);
    return { width: w, height: h, deviceScaleFactor: 1 };
  }
  return {
    width: Number(input.width) || 1366,
    height: Number(input.height) || 768,
    deviceScaleFactor: Number(input.deviceScaleFactor) || 1
  };
}

/**
 * Launch puppeteer with sane default args for CI
 */
export async function launchBrowser({ headless = true, args = ['--no-sandbox', '--disable-setuid-sandbox'] } = {}) {
  return puppeteer.launch({ headless, args });
}

/**
 * Capture screenshot:
 * - url: page url
 * - outPath: where to save png
 * - selector: optional element selector (captures that element only)
 * - viewport: {width,height,deviceScaleFactor}
 * - hideSelectors: array of selectors to hide before screenshot (useful for timestamps/ads)
 * - waitFor: ms to wait before screenshot to let fonts/animations settle
 * - browser: optional puppeteer Browser instance to reuse
 */
export async function captureScreenshot({
  url,
  outPath,
  selector,
  viewport = { width: 1366, height: 768, deviceScaleFactor: 1 },
  hideSelectors = [],
  waitFor = 500,
  browser // optional
}) {
  let localBrowser = browser;
  let created = false;
  try {
    if (!localBrowser) {
      localBrowser = await launchBrowser();
      created = true;
    }

    const page = await localBrowser.newPage();
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    // ⬇️ updated wait logic
    if (waitFor && Number(waitFor) > 0) {
      await new Promise(resolve => setTimeout(resolve, Number(waitFor)));
    }

    if (hideSelectors && hideSelectors.length > 0) {
      const css = hideSelectors.map(s => `${s}{ visibility:hidden !important; }`).join(' ');
      await page.addStyleTag({ content: css });
    }

    await ensureDir(path.dirname(outPath));
    if (selector) {
      const el = await page.$(selector);
      if (!el) throw new Error(`Selector "${selector}" not found on ${url}`);
      await el.screenshot({ path: outPath });
    } else {
      await page.screenshot({ path: outPath, fullPage: true });
    }

    return outPath;
  } finally {
    if (created && localBrowser) await localBrowser.close();
  }
}



/**
 * Read PNG sync helper
 */
export function readPNGSync(filepath) {
  const buf = fs.readFileSync(filepath);
  return PNG.sync.read(buf);
}

/**
 * Write PNG sync helper
 */
export function writePNGSync(png, filepath) {
  fs.writeFileSync(filepath, PNG.sync.write(png));
}

/**
 * Compare two PNGs using pixelmatch, write diff to diffPath.
 * Returns mismatched pixel count.
 */
export function compareImagesSync(baselinePath, currentPath, diffPath, { threshold = 0.1 } = {}) {
  const baseline = readPNGSync(baselinePath);
  const current = readPNGSync(currentPath);

  if (baseline.width !== current.width || baseline.height !== current.height) {
    throw new Error('Baseline and current image dimensions do not match.');
  }

  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const mismatched = pixelmatch(baseline.data, current.data, diff.data, width, height, {
    threshold
  });

  writePNGSync(diff, diffPath);
  return mismatched;
}
