/**
 * Development tool: open /?snapshots on the dev server to save a picture of every
 * model to public/snapshots/. Reading mode shows these pictures.
 */
import { h } from '../shared/dom';
import { modelList } from './pages';
import { Stage } from './stage';

export async function makeSnapshots() {
  document.documentElement.dataset.theme = 'day';
  const stage = new Stage();
  const host = h('div', { class: 'stage', style: 'position:fixed;left:0;top:0;width:1200px;height:800px;border:0;border-radius:0' });
  const panel = h('div', { style: 'position:fixed;left:-9999px' });
  const status = h('p', { style: 'position:fixed;right:12px;bottom:12px;font:16px system-ui;background:#fff;padding:8px' });
  document.body.replaceChildren(host, panel, status);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  for (const model of modelList) {
    status.textContent = `Saving ${model.slug}…`;
    panel.replaceChildren();
    stage.attachInline(host);
    stage.mountModel({ ...model, panel }, 0);
    await wait(800);
    while (stage.settling) await wait(200);
    await wait(1200);
    const picture = stage.capture();
    if (picture) await fetch(`/__snapshot?name=${model.slug}`, { method: 'POST', body: picture });
  }
  status.textContent = `Saved ${modelList.length} pictures.`;
  status.dataset.done = 'true';
}
