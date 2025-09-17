#!/usr/bin/env node
import { program } from 'commander';
import { recordCommand } from '../src/record.js';
import { compareCommand } from '../src/compare.js';
import { dashboardCommand } from '../src/dashboard.js';
import fs from 'fs';
import path from 'path';

program.name('pixel-diff-ui').version('0.0.5');

// Helper to auto-detect config
function resolveConfig(optionPath) {
  let configPath = optionPath || path.resolve(process.cwd(), 'pixel-diff.json');
  if (!fs.existsSync(configPath)) {
    console.warn("⚠️ No config file found. Using defaults.");
    return null;
  }
  return configPath;
}

program
  .command('dashboard')
  .description('Launch dashboard to review visual diffs')
  .option('-c, --config <path>', 'path to config file (JSON)')
  .option('-p, --port <port>', 'port for dashboard server')
  .action((opts) => {
    const configPath = resolveConfig(opts.config);
    dashboardCommand({ ...opts, config: configPath });
  });

program
  .command('record')
  .description('Record baseline screenshots')
  .option('-c, --config <path>', 'path to config file (JSON)')
  .option('-n, --name <name>', 'scenario name')
  .option('-u, --url <url>', 'url to capture')
  .option('-v, --viewport <viewport>', 'viewport WxH')
  .option('-s, --selector <selector>', 'css selector to capture element only')
  .action((opts) => {
    opts.config = resolveConfig(opts.config);
    recordCommand(opts);
  });

program
  .command('compare')
  .description('Compare current screenshots with baselines')
  .option('-c, --config <path>', 'path to config file (JSON)')
  .option('-n, --name <name>', 'scenario name')
  .option('-u, --url <url>', 'url to capture')
  .option('-v, --viewport <viewport>', 'viewport WxH')
  .option('-s, --selector <selector>', 'css selector to capture element only')
  .option('-t, --threshold <threshold>', 'pixelmatch threshold', '0.1')
  .action((opts) => {
    opts.config = resolveConfig(opts.config);
    compareCommand(opts);
  });

program.parse();
