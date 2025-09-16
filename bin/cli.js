#!/usr/bin/env node
import { program } from 'commander';
import { recordCommand } from '../src/record.js';
import { compareCommand } from '../src/compare.js';
import { dashboardCommand } from '../src/dashboard.js';

program.name('pixel-diff-ui').version('0.1.0');

program
  .command('dashboard')
  .description('Launch local dashboard to review visual diffs')
  .option('-c, --config <path>', 'path to config file (JSON)')
  .option('-p, --port <number>', 'port for dashboard', '5000')
  .action((opts) => dashboardCommand(opts));


program
  .command('record')
  .description('Record baseline screenshots')
  .option('-c, --config <path>', 'path to config file (JSON)')
  .option('-n, --name <name>', 'scenario name')
  .option('-u, --url <url>', 'url to capture')
  .option('-v, --viewport <viewport>', 'viewport WxH')
  .option('-s, --selector <selector>', 'css selector to capture element only')
  .action((opts) => recordCommand(opts));

program
  .command('compare')
  .description('Compare current screenshots with baselines')
  .option('-c, --config <path>', 'path to config file (JSON)')
  .option('-n, --name <name>', 'scenario name')
  .option('-u, --url <url>', 'url to capture')
  .option('-v, --viewport <viewport>', 'viewport WxH')
  .option('-s, --selector <selector>', 'css selector to capture element only')
  .option('-t, --threshold <threshold>', 'pixelmatch threshold', '0.1')
  .action((opts) => compareCommand(opts));

program.parse();
