// src/dashboard.js
import fs from 'fs';
import path from 'path';
import express from 'express';
import open from 'open';

export async function dashboardCommand(opts = {}) {
  const configPath = path.resolve(process.cwd(), opts.config || 'pixel-diff.json');
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const app = express();
  const port = Number(opts.port) || 5000;

  // static serving of baseline/output folders
  const baselineDir = path.resolve(config.baselineDir || './__pixel_baseline__');
  const outputDir = path.resolve(config.outputDir || './__pixel_output__');

  app.use('/baseline', express.static(baselineDir));
  app.use('/output', express.static(outputDir));

  // simple HTML dashboard
  app.get('/', (req, res) => {
    const html = renderDashboard(config);
    res.send(html);
  });

  // Approve route: replace baseline with current
  app.post('/approve/:scenario', express.json(), (req, res) => {
    const scenarioName = req.params.scenario;
    const viewport = req.body.viewport;

    const filename = `${scenarioName}_${viewport}.png`;
    const baselinePath = path.join(baselineDir, filename);
    const currentPath = path.join(outputDir, filename.replace('.png', '_current.png'));

    if (!fs.existsSync(currentPath)) {
      return res.status(404).json({ error: 'Current screenshot not found' });
    }

    fs.copyFileSync(currentPath, baselinePath);
    return res.json({ success: true, message: `✅ Approved: ${scenarioName}` });
  });

  app.listen(port, () => {
    console.log(`🚀 Dashboard running at http://localhost:${port}`);
    open(`http://localhost:${port}`);
  });
}

// helper to render dashboard HTML
function renderDashboard(config) {
  const scenarios = config.scenarios;
  return `
  <html>
    <head>
      <title>Pixel Diff Dashboard</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #f4f6f8; }
        h1 { font-size: 1.8rem; padding: 1rem 2rem; margin: 0; background: #0070f3; color: white; }
        .scenario { margin: 2rem auto; padding: 1.5rem; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 1400px; }
        .images { display: flex; gap: 2rem; justify-content: space-between; }
        .images div { flex: 1; text-align: center; }
        img { width: 100%; max-width: 420px; border: 2px solid #ccc; border-radius: 6px; background: white; }
        button { margin-top: 1rem; padding: 0.6rem 1.2rem; border: none; border-radius: 6px; cursor: pointer; background: #0070f3; color: white; font-size: 1rem; transition: background 0.2s ease; }
        button:hover { background: #0059c1; }
      </style>
    </head>
    <body>
      <h1>📸 Pixel Diff Dashboard</h1>
      ${scenarios.map(s => renderScenario(s, config)).join('')}
      <script>
        async function approve(name, viewport) {
          const res = await fetch('/approve/' + encodeURIComponent(name), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ viewport })
          });
          const json = await res.json();
          alert(json.message || 'Error');
          location.reload();
        }
      </script>
    </body>
  </html>
  `;
}

function renderScenario(scenario, config) {
  const viewport = scenario.viewport || '1366x768';
  const safeName = scenario.name.replace(/\s+/g, '_');
  const filename = `${safeName}_${viewport}.png`;
  const baseline = `/baseline/${filename}`;
  const current = `/output/${filename.replace('.png', '_current.png')}`;
  const diff = `/output/${filename.replace('.png', '_diff.png')}`;

  return `
    <div class="scenario">
      <h2>${scenario.name} (${viewport})</h2>
      <div class="images">
        <div><strong>Baseline</strong><br><img src="${baseline}" onerror="this.style.display='none'"></div>
        <div><strong>Current</strong><br><img src="${current}" onerror="this.style.display='none'"></div>
        <div><strong>Diff</strong><br><img src="${diff}" onerror="this.style.display='none'"></div>
      </div>
      <div style="text-align:center">
        <button onclick="approve('${safeName}','${viewport}')">✅ Approve</button>
      </div>
    </div>
  `;
}
