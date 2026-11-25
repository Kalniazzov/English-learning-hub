import * as THREE from 'three';
import type { SceneBuilder } from '../core/stage';
import { lines, readout, segmented, toggle } from '../shared/controls';
import { h } from '../shared/dom';
import { ball, base, box, cone, cutout, cylinder, group, house, mountain, pine, slab, strip } from './toon';

type Mode = 'caravan' | 'ship';

const curve = (points: [number, number][], y: number) => new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, y, z)));

function camel(x: number) {
  const hide = '#b7824f';
  const g = group(x, 0, 0,
    box(0.52, 0.26, 0.24, hide, 0, 0.26, 0), ball(0.16, hide, -0.04, 0.56, 0), box(0.1, 0.38, 0.12, hide, 0.28, 0.4, 0),
    box(0.24, 0.12, 0.13, hide, 0.37, 0.74, 0), box(0.28, 0.18, 0.3, '#d9694f', -0.1, 0.5, 0),
    ...[-0.18, 0.18].flatMap((lx) => [-0.07, 0.07].map((lz) => box(0.06, 0.28, 0.06, hide, lx, 0, lz))),
  );
  return g;
}

export const tradeMap: SceneBuilder = (ctx) => {
  const { root } = ctx;
  root.add(base(13, 8.6, '#b8cf9b'));
  root.add(slab([[-6.2, -3.2], [-3, -3.9], [-1.4, -2], [-1.9, 1], [-0.8, 3.5], [-3.5, 4], [-6.1, 3.2]], 0.04, '#edd49b', 0));
  root.add(slab([[2.9, -4.2], [6.1, -4.2], [6.45, -3.2], [6.45, 3.4], [5.9, 4.2], [2.4, 4.25], [3.3, 2.7], [4.7, 1.2], [4.2, -0.8], [2.8, -2.2]], 0.06, '#7fbbe3', 0));
  root.add(strip([[0.2, -4.1], [1.1, -2.6], [0.9, -1], [2.2, 0.6], [4.8, 0.5]], 0.32, '#8fc9ee', 0.075));

  const range = [
    mountain(-0.2, -3.3, 2.1, 1.7, '#8d93a8', 0.5), mountain(0, -2.2, 2.3, 2.2, '#7f869e', 0.5), mountain(-0.25, -1.2, 1.9, 1.6, '#9aa0b3', 0.5),
    mountain(-0.2, 0.75, 1.9, 1.7, '#9aa0b3', 0.5), mountain(0.05, 1.7, 2.2, 2.1, '#7f869e', 0.5),
  ];
  range.forEach((m, i) => { root.add(m); ctx.pop(m, i); });
  for (const [x, z] of [[-4.9, -1.2], [-3.6, 2.4], [-2.6, -2.7], [-5.1, 1.3]]) {
    root.add(cutout([[-0.75, 0], [-0.1, 0.34], [0.25, 0.22], [0.75, 0]], 0.2, '#e2c07c', x, 0.03, z));
  }
  [[2, -3.5], [2.2, 2.9], [1.5, 3.6], [2.4, -0.9]].forEach(([x, z]) => root.add(pine(x, z, 0.55)));

  const oasis = group(-5, 0, -0.1, house(0, 0, '#f2dfb8', '#c9774a', 0.65), house(0.15, 0.8, '#f8ead0', '#a9764f', 0.5),
    cylinder(0.35, 0.35, 0.08, '#8fc9ee', 0.85, 0.02, 0.2), cylinder(0.04, 0.06, 0.7, '#8a6248', 1.05, 0, -0.25), cone(0.4, 0.22, '#4f8f68', 1.05, 0.65, -0.25, 6));
  const port = (x: number, z: number, top: string) => group(x, 0, z, house(-0.2, 0, '#fbead3', top, 0.65),
    box(1, 0.1, 0.28, '#8a6248', 0.7, 0.08, 0.15), cylinder(0.08, 0.1, 0.9, '#fffaf0', -0.1, 0, -0.55), cone(0.13, 0.22, '#d9694f', -0.1, 0.9, -0.55));
  const northPort = port(2.75, -2.75, '#3f86b5');
  const southPort = port(2.95, 2.1, '#7b68b8');
  [oasis, northPort, southPort].forEach((o, i) => { root.add(o); ctx.pop(o, 5 + i); });

  const routes = {
    pass: curve([[-4.3, 0.35], [-3.2, -0.6], [-1.7, 0], [0, -0.22], [1.3, 0.25], [2.6, 1.55], [3.1, 2.15]], 0.1),
    around: curve([[-4.3, 0.35], [-3.4, 1.8], [-2, 2.9], [-0.6, 3.75], [0.7, 3.55], [1.9, 2.8], [3.1, 2.15]], 0.1),
    sea: curve([[3.9, 2.3], [5.2, 2], [5.55, 0.2], [5, -1.6], [3.9, -2.65]], 0.12),
  };

  const dots = new THREE.Group();
  root.add(dots);
  const drawDots = (route: THREE.CatmullRomCurve3) => {
    dots.children.forEach((d) => d.traverse((o) => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); } }));
    dots.clear();
    const count = Math.round(route.getLength() / 0.38);
    for (let i = 0; i <= count; i++) {
      const p = route.getPointAt(i / count);
      dots.add(cylinder(0.075, 0.075, 0.05, '#c2412f', p.x, p.y - 0.03, p.z, 10));
    }
  };

  const caravan = group(0, 0, 0, camel(0.55), camel(-0.2), camel(-0.95));
  caravan.scale.setScalar(0.8);
  const ship = group(0, 0, 0,
    cutout([[-0.85, 0.32], [0.95, 0.32], [0.68, 0], [-0.65, 0]], 0.55, '#c9483a'),
    box(0.3, 0.55, 0.4, '#fffaf0', -0.55, 0.32, 0),
    ...[['#e5b23c', -0.15], ['#4f9c70', 0.23], ['#4f95c8', 0.6]].map(([c, x]) => box(0.34, 0.26, 0.4, c as string, x as number, 0.32, 0)),
  );
  const boulders = group(0, 0, -0.25, ball(0.42, '#fdfdff', 0, 0.3, -0.25), ball(0.35, '#eef1fb', 0.2, 0.25, 0.3), ball(0.27, '#fff', -0.15, 0.62, 0.05));
  root.add(caravan, ship, boulders);

  const passLabel = ctx.label(new THREE.Vector3(0, 1.1, -0.2), 'Mountain pass');
  ctx.label(new THREE.Vector3(-4.8, 1.2, -0.1), 'Oasis city');
  ctx.label(new THREE.Vector3(2.7, 1.25, -2.8), 'North port');
  ctx.label(new THREE.Vector3(2.9, 1.25, 2.1), 'South port');
  ctx.label(new THREE.Vector3(-3.3, 0.3, -2.2), 'Desert', { kind: 'area' });
  ctx.label(new THREE.Vector3(5.3, 0.3, 0.2), 'Sea', { kind: 'area' });
  ctx.label(new THREE.Vector3(0.9, 0.2, -3.9), 'River', { kind: 'area' });

  let mode: Mode = 'caravan';
  let blocked = false;
  let moving = true;
  let progress = 0.1;
  let route = routes.pass;
  const story = readout('story');
  const refresh = () => {
    route = mode === 'ship' ? routes.sea : blocked ? routes.around : routes.pass;
    drawDots(route);
    caravan.visible = mode === 'caravan';
    ship.visible = mode === 'ship';
    boulders.visible = blocked;
    passLabel.setText(blocked ? 'Pass closed by snow' : 'Mountain pass');
    blockSwitch.querySelector('input')!.disabled = mode === 'ship';
    lines(story,
      mode === 'ship'
        ? 'Today, a cargo ship connects the two ports by sea. Like a caravan, it connects producers with buyers.'
        : blocked
          ? 'The pass is closed, so the caravan goes around the mountains. The route is longer. Geography shapes possible routes.'
          : 'In the past, caravans carried goods across deserts. This one uses the mountain pass to reach the port.',
    );
  };
  const blockSwitch = toggle('Close the mountain pass', false, (on) => { blocked = on; progress = 0; refresh(); });

  ctx.onFrame((dt) => {
    if (moving && !ctx.reducedMotion) progress = (progress + (dt * (mode === 'ship' ? 1 : 0.8)) / route.getLength()) % 1;
    const vehicle = mode === 'ship' ? ship : caravan;
    const p = route.getPointAt(progress);
    const t = route.getTangentAt(progress);
    vehicle.position.set(p.x, p.y, p.z);
    vehicle.rotation.y = Math.atan2(-t.z, t.x);
  });

  const play = h('button', { type: 'button', class: 'btn quiet', onclick: () => { moving = !moving; play.textContent = moving ? 'Pause journey' : 'Continue journey'; } }, 'Pause journey');
  ctx.panel.append(
    h('div', { class: 'control-row' },
      segmented('Transport', [['caravan', 'Caravan'], ['ship', 'Cargo ship']], mode, (m) => { mode = m; progress = 0.05; refresh(); }),
      ctx.reducedMotion ? null : play,
    ),
    h('div', { class: 'control-row' }, blockSwitch),
    story,
    h('p', { class: 'hint' }, 'This is a model landscape, not a real map.'),
  );
  refresh();
  ctx.view([0.4, 10.2, 12.6], [0.2, 0, 0.2], true);
};
