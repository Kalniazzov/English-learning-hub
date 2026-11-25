/**
 * Building blocks for the soft, rounded "animated film" look.
 * Every shape stands on its origin, so it can pop up from the page.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

type Point = [number, number];

export function mat(color: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: 0, ...extra });
}

export function mesh(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, extra?: THREE.MeshStandardMaterialParameters) {
  const m = new THREE.Mesh(geometry, mat(color, extra));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function group(x = 0, y = 0, z = 0, ...children: THREE.Object3D[]) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (children.length) g.add(...children);
  return g;
}

/** A box with soft, rounded edges; its origin is the middle of its base. */
export function roundedBoxGeometry(w: number, h: number, d: number, radius = Math.min(0.14, Math.min(w, h, d) * 0.22)) {
  const small = Math.min(w, h, d) < 0.3;
  const geo = new RoundedBoxGeometry(w, h, d, small ? 2 : 3, Math.max(0.005, radius));
  geo.translate(0, h / 2, 0);
  return geo;
}

export function box(w: number, h: number, d: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0) {
  return mesh(roundedBoxGeometry(w, h, d), color, x, y, z);
}

/** A turned shape with rounded rims, like a toy made on a lathe. */
function roundedLathe(bottom: number, top: number, h: number, sides: number) {
  const bevel = Math.min(0.08, h * 0.22, Math.max(bottom, top) * 0.3);
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
  const corner = (cx: number, cy: number, from: number, to: number) => {
    for (let i = 0; i <= 4; i++) {
      const a = from + ((to - from) * i) / 4;
      pts.push(new THREE.Vector2(Math.max(0, cx + Math.cos(a) * bevel), cy + Math.sin(a) * bevel));
    }
  };
  corner(Math.max(bottom - bevel, 0), bevel, -Math.PI / 2, 0);
  if (top > bevel * 1.2) corner(top - bevel, h - bevel, 0, Math.PI / 2);
  else pts.push(new THREE.Vector2(Math.max(top, 0.012), h * 0.985));
  pts.push(new THREE.Vector2(0, h));
  return new THREE.LatheGeometry(pts, Math.max(sides, 24));
}

export function cylinder(top: number, bottom: number, h: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, sides = 24) {
  return mesh(roundedLathe(bottom, top, h, sides), color, x, y, z);
}

export function cone(r: number, h: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, sides = 24) {
  return cylinder(0, r, h, color, x, y, z, sides);
}

export function ball(r: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, _detail = 1) {
  return mesh(new THREE.SphereGeometry(r, 32, 20), color, x, y, z);
}

function shapeOf(points: Point[]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  return shape;
}

/** An upright cut shape with soft bevelled edges, drawn in the x (across) and y (up) directions. */
export function cutout(points: Point[], thickness: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0) {
  const bevel = Math.min(0.05, thickness * 0.3);
  const depth = Math.max(0.005, thickness - bevel * 2);
  const geo = new THREE.ExtrudeGeometry(shapeOf(points), {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 3, curveSegments: 8,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return mesh(geo, color, x, y, z);
}

/** A flat shape lying on the ground; points are [x, z]. */
export function slab(points: Point[], height: number, color: THREE.ColorRepresentation, y = 0, soft = height >= 0.12, extra?: THREE.MeshStandardMaterialParameters) {
  const bevel = soft ? Math.min(0.12, height * 0.35) : 0;
  const geo = new THREE.ExtrudeGeometry(shapeOf(points.map(([x, z]) => [x, -z])), {
    depth: Math.max(0.005, height - bevel * 2), bevelEnabled: soft, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);
  return mesh(geo, color, 0, y, 0, extra);
}

export function roundedRect(w: number, d: number, r: number, cx = 0, cz = 0): Point[] {
  const out: Point[] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 90], [-w / 2 + r, -d / 2 + r, 180], [w / 2 - r, -d / 2 + r, 270],
  ];
  for (const [x, z, start] of corners) {
    for (let a = start; a <= start + 90; a += 10) {
      const rad = (a * Math.PI) / 180;
      out.push([cx + x + Math.cos(rad) * r, cz + z + Math.sin(rad) * r]);
    }
  }
  return out;
}

/** The little island every model stands on, like a set on a film stage. Its top is at y = 0. */
export function base(w: number, d: number, top: THREE.ColorRepresentation) {
  const soil = slab(roundedRect(w + 0.25, d + 0.25, 1.3), 0.62, '#b9825a', -0.68);
  const lawn = slab(roundedRect(w + 0.05, d + 0.05, 1.1), 0.24, top, -0.24);
  return group(0, 0, 0, soil, lawn);
}

/** A flat ribbon following a path, for rivers, roads and trails. */
export function strip(points: Point[], width: number, color: THREE.ColorRepresentation, y = 0.02) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)));
  const samples = curve.getSpacedPoints(60);
  const left: Point[] = [];
  const right: Point[] = [];
  samples.forEach((p, i) => {
    const t = curve.getTangentAt(i / 60);
    left.push([p.x - (t.z * width) / 2, p.z + (t.x * width) / 2]);
    right.push([p.x + (t.z * width) / 2, p.z - (t.x * width) / 2]);
  });
  const water = new THREE.Color(color).b > new THREE.Color(color).r + 0.15;
  const m = slab([...left, ...right.reverse()], 0.03, color, y, false, water ? { roughness: 0.18 } : undefined);
  m.castShadow = false;
  return m;
}

export function pine(x: number, z: number, s = 1, color = '#3fa35a') {
  const light = new THREE.Color(color).offsetHSL(0.01, 0.05, 0.08);
  return group(x, 0, z,
    cylinder(0.1 * s, 0.13 * s, 0.4 * s, '#8a5a3c', 0, 0, 0),
    cone(0.62 * s, 0.72 * s, color, 0, 0.3 * s, 0),
    cone(0.5 * s, 0.62 * s, light, 0, 0.66 * s, 0),
    cone(0.36 * s, 0.55 * s, color, 0, 1.0 * s, 0),
  );
}

export function roof(w: number, h: number, d: number, color: THREE.ColorRepresentation, y = 0) {
  return cutout([[-w / 2, 0], [w / 2, 0], [0, h]], d, color, 0, y, 0);
}

export function house(x: number, z: number, wall = '#ffe2b8', top = '#e85d4a', s = 1) {
  const g = group(x, 0, z,
    box(1.2, 0.85, 0.95, wall),
    roof(1.45, 0.62, 1.12, top, 0.83),
    box(0.28, 0.48, 0.08, '#8a5a3c', -0.2, 0, 0.47),
    box(0.3, 0.28, 0.08, '#ffffff', 0.28, 0.34, 0.47),
    box(0.22, 0.2, 0.1, '#8fd0ff', 0.28, 0.38, 0.48),
  );
  g.scale.setScalar(s);
  return g;
}

/** Big friendly eyes. The stage blinks every group marked `eye`. */
export function eyes(spread: number, r: number, y: number, z: number) {
  const eye = (x: number) => {
    const g = group(x, y, z, ball(r, '#ffffff'), ball(r * 0.55, '#2b2118', 0, 0, r * 0.62), ball(r * 0.18, '#ffffff', r * 0.2, r * 0.22, r * 0.98));
    g.userData.eye = true;
    return g;
  };
  return group(0, 0, 0, eye(-spread), eye(spread));
}

const skins = ['#f2c29b', '#d99c73', '#b8784f', '#f6d2b4'];
const hairs = ['#3b2a20', '#1f1a17', '#7a4a2a', '#c8843d'];
let character = 0;

/** A small animated-film kid: round head, big eyes, soft body. Faces +z. */
export function person(x: number, z: number, coat: THREE.ColorRepresentation, s = 1) {
  const k = character++;
  const skin = skins[k % skins.length];
  const head = group(0, 0.78, 0,
    ball(0.25, skin),
    mesh(new THREE.SphereGeometry(0.265, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48), hairs[k % hairs.length], 0, 0.02, -0.02),
    eyes(0.095, 0.075, 0.03, 0.19),
    ball(0.035, '#e8907a', 0, -0.05, 0.245),
  );
  head.rotation.x = 0.08;
  const body = mesh(new THREE.CapsuleGeometry(0.2, 0.3, 8, 20), coat, 0, 0.38, 0);
  const g = group(x, 0, z,
    body, head,
    ball(0.075, skin, -0.23, 0.42, 0.03), ball(0.075, skin, 0.23, 0.42, 0.03),
    box(0.13, 0.12, 0.2, '#3a3a48', -0.09, 0, 0.03), box(0.13, 0.12, 0.2, '#3a3a48', 0.09, 0, 0.03),
  );
  g.userData.bob = { head, phase: k * 1.7 };
  g.scale.setScalar(s);
  return g;
}

export function cloud(x: number, y: number, z: number, s = 1) {
  const g = group(x, y, z,
    ball(0.45, '#ffffff', -0.48, 0, 0), ball(0.66, '#ffffff', 0.05, 0.16, 0), ball(0.42, '#ffffff', 0.6, -0.02, 0), ball(0.36, '#ffffff', 0.1, -0.12, 0.25),
  );
  g.traverse((o) => { if (o instanceof THREE.Mesh) { o.castShadow = false; (o.material as THREE.MeshStandardMaterial).roughness = 0.9; } });
  g.scale.set(s, s * 0.72, s * 0.5);
  return g;
}

/** A soft rounded mountain with a snow cap. */
export function mountain(x: number, z: number, w: number, h: number, color: string, depth = 0.3) {
  const profile = (r: number, height: number) => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      // Wide base, gently rounded top.
      pts.push(new THREE.Vector2(r * Math.pow(1 - t, 0.85) + (i === 12 ? 0 : 0.02), height * t));
    }
    return new THREE.LatheGeometry(pts, 28);
  };
  const body = mesh(profile(w / 2, h), color);
  const snow = mesh(profile(w * 0.17, h * 0.3), '#ffffff', 0, h * 0.72, 0);
  snow.scale.set(1.08, 1, 1.08);
  const g = group(x, 0, z, body, snow);
  g.scale.z = Math.min(0.62, Math.max(0.32, depth * 0.95));
  return g;
}
