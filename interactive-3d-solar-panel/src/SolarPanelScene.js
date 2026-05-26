import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#solarCanvas');
const playBtn = document.querySelector('#playBtn');
const resetBtn = document.querySelector('#resetBtn');
const autoRotateInput = document.querySelector('#autoRotate');
const sceneLabel = document.querySelector('#sceneLabel');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020404, 0.024);

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 160);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const root = new THREE.Group();
root.name = 'SolarEX-reference-faithful-3d-model';
root.rotation.set(-0.08, -0.3, 0.02);
scene.add(root);

const palette = {
  wire: 0xddeeff,
  glass: 0x1b252a,
  cell: 0x050607,
  redCell: 0x9a1111,
  darkMetal: 0x252b2f,
  grid: 0x45606a
};

const material = {
  wire: new THREE.MeshPhysicalMaterial({
    color: palette.wire,
    metalness: 0.18,
    roughness: 0.24,
    transparent: true,
    opacity: 0.34,
    emissive: 0x8ea9b7,
    emissiveIntensity: 0.045
  }),
  frame: new THREE.MeshPhysicalMaterial({
    color: palette.wire,
    metalness: 0.5,
    roughness: 0.17,
    transparent: true,
    opacity: 0.46,
    emissive: 0x9cb7c2,
    emissiveIntensity: 0.038,
    clearcoat: 0.6,
    clearcoatRoughness: 0.08
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x0c1316,
    metalness: 0.02,
    roughness: 0.08,
    transmission: 0.24,
    transparent: true,
    opacity: 0.22,
    emissive: 0x050a0d,
    emissiveIntensity: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.04
  }),
  cell: new THREE.MeshPhysicalMaterial({
    color: palette.cell,
    metalness: 0.12,
    roughness: 0.48,
    emissive: 0x000000,
    emissiveIntensity: 0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.28
  }),
  red: new THREE.MeshPhysicalMaterial({
    color: palette.redCell,
    metalness: 0.1,
    roughness: 0.46,
    transparent: true,
    opacity: 0.84,
    emissive: 0x000000,
    emissiveIntensity: 0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.2
  }),
  metal: new THREE.MeshPhysicalMaterial({
    color: palette.darkMetal,
    metalness: 0.74,
    roughness: 0.28,
    transparent: true,
    opacity: 0.5,
    emissive: 0x5b6970,
    emissiveIntensity: 0.025
  }),
  darkMetal: new THREE.MeshPhysicalMaterial({
    color: 0x111416,
    metalness: 0.8,
    roughness: 0.32,
    transparent: true,
    opacity: 0.72
  }),
  cable: new THREE.MeshStandardMaterial({ color: 0x0b0d0e, metalness: 0.36, roughness: 0.44 }),
  bolt: new THREE.MeshPhysicalMaterial({
    color: 0xe4f0f4,
    metalness: 0.7,
    roughness: 0.22,
    transparent: true,
    opacity: 0.64,
    emissive: 0x77858c,
    emissiveIntensity: 0.025
  })
};

function addBox(parent, name, w, h, d, x, y, z, mat, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCylinder(parent, name, radius, depth, x, y, z, mat, rotation = [0, 0, 0], segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addLine(parent, points, color = 0xddeeff, opacity = 0.32) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const line = new THREE.Line(geo, mat);
  parent.add(line);
  return line;
}

function addScrewGroup(parent, x, y, z, label) {
  addCylinder(parent, `${label}-screw-a`, 0.045, 0.045, x - 0.08, y, z, material.bolt, [Math.PI / 2, 0, 0], 20);
  addCylinder(parent, `${label}-screw-b`, 0.045, 0.045, x + 0.08, y, z, material.bolt, [Math.PI / 2, 0, 0], 20);
}

function addTriangularCorner(parent, name, x, y, z, rotZ) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.12);
  shape.lineTo(-0.13, -0.1);
  shape.lineTo(0.13, -0.1);
  shape.lineTo(0, 0.12);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: false });
  const mesh = new THREE.Mesh(geo, material.bolt);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.rotation.set(0, 0, rotZ);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

const panel = new THREE.Group();
panel.name = 'detailed-pv-module-with-red-3x3-non-emissive-cells';
panel.rotation.x = -THREE.MathUtils.degToRad(13.5);
panel.position.y = 1.32;
root.add(panel);

const W = 9.0;
const H = 5.55;
const T = 0.22;
const cols = 6;
const rows = 6;
const gap = 0.072;
const cw = (W - gap * (cols + 1)) / cols;
const ch = (H - gap * (rows + 1)) / rows;

// Layered module stack and transparent technical frame, closer to the provided wireframe images.
addBox(panel, 'transparent-front-glass-sheet', W, H, 0.036, 0, 0, 0.14, material.glass);
addBox(panel, 'rear-backsheet-plane', W * 0.986, H * 0.985, 0.034, 0, 0, -0.16, material.cell);
addBox(panel, 'glass-laminate-edge-top', W + 0.34, 0.075, T, 0, H / 2 + 0.045, 0.035, material.wire);
addBox(panel, 'glass-laminate-edge-bottom', W + 0.34, 0.075, T, 0, -H / 2 - 0.045, 0.035, material.wire);
addBox(panel, 'glass-laminate-edge-left', 0.075, H + 0.34, T, -W / 2 - 0.045, 0, 0.035, material.wire);
addBox(panel, 'glass-laminate-edge-right', 0.075, H + 0.34, T, W / 2 + 0.045, 0, 0.035, material.wire);
addBox(panel, 'outer-aluminium-frame-top', W + 0.46, 0.14, T, 0, H / 2 + 0.13, -0.005, material.frame);
addBox(panel, 'outer-aluminium-frame-bottom', W + 0.46, 0.14, T, 0, -H / 2 - 0.13, -0.005, material.frame);
addBox(panel, 'outer-aluminium-frame-left', 0.14, H + 0.46, T, -W / 2 - 0.13, 0, -0.005, material.frame);
addBox(panel, 'outer-aluminium-frame-right', 0.14, H + 0.46, T, W / 2 + 0.13, 0, -0.005, material.frame);
addBox(panel, 'rear-offset-frame-shadow', W + 0.28, 0.09, 0.08, 0.16, H / 2 + 0.26, -0.34, material.darkMetal);
addBox(panel, 'rear-offset-frame-shadow-lower', W + 0.18, 0.09, 0.08, -0.12, -H / 2 - 0.26, -0.34, material.darkMetal);

// Photovoltaic cell matrix, micro-busbars, diamond interconnects and non-emissive red center group.
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const x = -W / 2 + gap + cw / 2 + c * (cw + gap);
    const y = H / 2 - gap - ch / 2 - r * (ch + gap);
    const isRed = c >= 2 && c <= 4 && r >= 2 && r <= 4;
    const cell = addBox(panel, `pv-cell-${r + 1}-${c + 1}${isRed ? '-red-non-emissive' : ''}`, cw, ch, 0.03, x, y, 0.176, isRed ? material.red : material.cell);
    cell.userData.nonEmissiveHighlight = isRed;

    addBox(panel, `cell-top-lip-${r + 1}-${c + 1}`, cw * 0.92, 0.012, 0.018, x, y + ch * 0.47, 0.198, material.wire);
    addBox(panel, `cell-bottom-lip-${r + 1}-${c + 1}`, cw * 0.92, 0.012, 0.018, x, y - ch * 0.47, 0.198, material.wire);

    for (let i = 1; i < 9; i++) {
      const lx = x - cw / 2 + (i * cw) / 9;
      addBox(panel, `fine-vertical-busbar-${r + 1}-${c + 1}-${i}`, 0.0048, ch * 0.88, 0.01, lx, y, 0.206, isRed ? material.darkMetal : material.wire);
    }
    for (let i = 1; i < 4; i++) {
      const ly = y - ch / 2 + (i * ch) / 4;
      addBox(panel, `fine-horizontal-busbar-${r + 1}-${c + 1}-${i}`, cw * 0.86, 0.0048, 0.009, x, ly, 0.209, isRed ? material.darkMetal : material.wire);
    }

    if (r < rows - 1 && c < cols - 1) {
      const nodeX = x + cw / 2 + gap / 2;
      const nodeY = y - ch / 2 - gap / 2;
      const node = addBox(panel, `diamond-interconnect-${r + 1}-${c + 1}`, 0.145, 0.145, 0.043, nodeX, nodeY, 0.218, material.bolt);
      node.rotation.z = Math.PI / 4;
    }
  }
}

// Front glass grid and perimeter lines.
for (let i = 0; i <= cols; i++) {
  const x = -W / 2 + i * (W / cols);
  addLine(panel, [[x, -H / 2, 0.238], [x, H / 2, 0.238]], 0xe6f5ff, 0.18);
}
for (let i = 0; i <= rows; i++) {
  const y = -H / 2 + i * (H / rows);
  addLine(panel, [[-W / 2, y, 0.238], [W / 2, y, 0.238]], 0xe6f5ff, 0.18);
}
addLine(panel, [[-W / 2, -H / 2, 0.255], [W / 2, -H / 2, 0.255], [W / 2, H / 2, 0.255], [-W / 2, H / 2, 0.255], [-W / 2, -H / 2, 0.255]], 0xf0fbff, 0.34);
addLine(panel, [[-W / 2 - 0.19, -H / 2 - 0.19, -0.04], [W / 2 + 0.19, -H / 2 - 0.19, -0.04], [W / 2 + 0.19, H / 2 + 0.19, -0.04], [-W / 2 - 0.19, H / 2 + 0.19, -0.04], [-W / 2 - 0.19, -H / 2 - 0.19, -0.04]], 0xffffff, 0.32);

// Corner and edge tabs visible in the source images.
addTriangularCorner(panel, 'front-corner-tab-top-left', -W / 2 - 0.04, H / 2 + 0.04, 0.27, -0.78);
addTriangularCorner(panel, 'front-corner-tab-top-right', W / 2 + 0.04, H / 2 + 0.04, 0.27, 0.78);
addTriangularCorner(panel, 'front-corner-tab-bottom-left', -W / 2 - 0.04, -H / 2 - 0.04, 0.27, -2.35);
addTriangularCorner(panel, 'front-corner-tab-bottom-right', W / 2 + 0.04, -H / 2 - 0.04, 0.27, 2.35);
[-3.1, -1.55, 0, 1.55, 3.1].forEach((x, i) => {
  addTriangularCorner(panel, `top-edge-small-tab-${i + 1}`, x, H / 2 + 0.05, 0.25, Math.PI);
  addTriangularCorner(panel, `bottom-edge-small-tab-${i + 1}`, x, -H / 2 - 0.05, 0.25, 0);
});

// Rear assembly details: rails, brackets, junction box, cable routing and underside standoffs.
addBox(panel, 'rear-primary-horizontal-rail', W * 0.88, 0.13, 0.13, 0, -0.35, -0.58, material.metal);
addBox(panel, 'rear-secondary-lower-rail', W * 0.78, 0.105, 0.11, 0, -2.02, -0.51, material.metal);
addBox(panel, 'rear-upper-service-rail', W * 0.38, 0.08, 0.1, 0, 1.78, -0.5, material.metal);
[-3.15, 0, 3.15].forEach((x, idx) => {
  addBox(panel, `rear-vertical-rail-${idx + 1}`, 0.14, H * 0.76, 0.17, x, -0.04, -0.54, material.metal);
  addBox(panel, `upper-clamp-block-${idx + 1}`, 0.36, 0.18, 0.22, x, 1.94, -0.76, material.bolt);
  addBox(panel, `lower-clamp-block-${idx + 1}`, 0.36, 0.18, 0.22, x, -2.03, -0.76, material.bolt);
  addScrewGroup(panel, x, 1.94, -0.64, `upper-clamp-${idx + 1}`);
  addScrewGroup(panel, x, -2.03, -0.64, `lower-clamp-${idx + 1}`);
});
addBox(panel, 'rear-diagonal-left-support-brace', 0.105, 1.72, 0.12, -3.62, -0.58, -0.75, material.metal, [0, 0, -0.52]);
addBox(panel, 'rear-diagonal-right-support-brace', 0.105, 1.72, 0.12, 3.62, -0.58, -0.75, material.metal, [0, 0, 0.52]);
addBox(panel, 'rear-centre-mounting-plate', 0.95, 0.72, 0.18, 0, -1.15, -0.78, material.metal);
addScrewGroup(panel, -0.26, -0.94, -0.64, 'centre-mounting-upper-left');
addScrewGroup(panel, 0.26, -1.36, -0.64, 'centre-mounting-lower-right');

addBox(panel, 'junction-box-main-body', 0.82, 0.48, 0.24, 0, 1.05, -0.78, material.darkMetal);
addBox(panel, 'junction-box-cover-lip-top', 0.9, 0.05, 0.25, 0, 1.27, -0.92, material.wire);
addBox(panel, 'junction-box-cover-lip-mid', 0.88, 0.04, 0.25, 0, 1.05, -0.92, material.wire);
addBox(panel, 'junction-box-cover-lip-bottom', 0.9, 0.05, 0.25, 0, 0.83, -0.92, material.wire);
addCylinder(panel, 'junction-left-cable-gland', 0.055, 0.2, -0.18, 0.76, -0.88, material.metal, [Math.PI / 2, 0, 0], 18);
addCylinder(panel, 'junction-right-cable-gland', 0.055, 0.2, 0.18, 0.76, -0.88, material.metal, [Math.PI / 2, 0, 0], 18);

function makeCable(name, xOffset, side = 1) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(xOffset, 0.8, -0.92),
    new THREE.Vector3(xOffset + side * 0.18, 0.5, -1.0),
    new THREE.Vector3(xOffset + side * 0.78, 0.02, -1.08),
    new THREE.Vector3(xOffset + side * 1.56, -0.58, -0.98),
    new THREE.Vector3(xOffset + side * 2.55, -1.02, -0.82)
  ]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 54, 0.026, 8, false), material.cable);
  tube.name = name;
  tube.castShadow = true;
  panel.add(tube);
  addCylinder(panel, `${name}-connector`, 0.047, 0.18, xOffset + side * 2.55, -1.02, -0.82, material.darkMetal, [Math.PI / 2, 0, 0], 16);
}
makeCable('left-output-cable', -0.18, -1);
makeCable('right-output-cable', 0.18, 1);

[-3.6, -2.0, -0.72, 0.72, 2.0, 3.6].forEach((x, idx) => {
  addBox(panel, `underside-standoff-tab-${idx + 1}`, 0.22, 0.18, 0.18, x, -H / 2 - 0.23, -0.42, material.metal, [0.12, 0, 0]);
});
addBox(panel, 'inner-frame-rib-left', 0.05, H * 0.94, 0.08, -W / 2 + 0.17, 0, -0.04, material.wire);
addBox(panel, 'inner-frame-rib-right', 0.05, H * 0.94, 0.08, W / 2 - 0.17, 0, -0.04, material.wire);
addBox(panel, 'inner-frame-rib-top', W * 0.95, 0.05, 0.08, 0, H / 2 - 0.17, -0.04, material.wire);
addBox(panel, 'inner-frame-rib-bottom', W * 0.95, 0.05, 0.08, 0, -H / 2 + 0.17, -0.04, material.wire);

// Central pedestal and base, intentionally centered under the panel as in Animation_scenen_001.
const support = new THREE.Group();
support.name = 'centered-post-base-and-rear-tilt-brackets';
root.add(support);
addBox(support, 'base-plate-lower-transparent', 2.65, 0.18, 1.72, 0, -1.96, 0, material.metal);
addBox(support, 'base-plate-upper-transparent', 2.05, 0.14, 1.24, 0, -1.76, 0, material.frame);
addBox(support, 'base-inner-riser', 1.22, 0.16, 0.72, 0, -1.57, 0, material.darkMetal);
addBox(support, 'central-rectangular-post', 0.62, 2.86, 0.62, 0, -0.28, -0.08, material.metal);
addBox(support, 'post-inner-front-line', 0.015, 2.86, 0.64, -0.22, -0.28, 0.24, material.wire);
addBox(support, 'post-inner-rear-line', 0.015, 2.86, 0.64, 0.22, -0.28, -0.4, material.wire);
addBox(support, 'top-mounting-head', 1.08, 0.46, 0.42, 0, 1.13, -0.28, material.metal);
addBox(support, 'tilt-bracket-left-forward', 0.1, 1.55, 0.13, -0.72, 0.55, -0.62, material.metal, [0, 0, -0.42]);
addBox(support, 'tilt-bracket-right-forward', 0.1, 1.55, 0.13, 0.72, 0.55, -0.62, material.metal, [0, 0, 0.42]);
addBox(support, 'rear-triangle-side-strut-left', 0.08, 1.8, 0.1, -0.88, 0.78, -0.95, material.wire, [0.4, 0.1, -0.32]);
addBox(support, 'rear-triangle-side-strut-right', 0.08, 1.8, 0.1, 0.88, 0.78, -0.95, material.wire, [0.4, -0.1, 0.32]);
[-0.92, 0.92].forEach(x => [-0.54, 0.54].forEach((z, i) => {
  addCylinder(support, `base-corner-bolt-${x}-${i}`, 0.058, 0.06, x, -1.54, z, material.bolt, [Math.PI / 2, 0, 0], 24);
  addCylinder(support, `base-corner-washer-${x}-${i}`, 0.095, 0.018, x, -1.525, z, material.wire, [Math.PI / 2, 0, 0], 24);
}));

// Technical grid floor, kept darker and zoomed out so the model composition matches the source image framing.
const grid = new THREE.GridHelper(30, 60, 0x3d5360, 0x11181d);
grid.position.y = -2.06;
grid.material.transparent = true;
grid.material.opacity = 0.48;
scene.add(grid);

// Lighting: neutral/white-blue technical lighting only. No red point light; red cells are material color only.
scene.add(new THREE.AmbientLight(0xaad9ff, 0.84));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(4.2, 7.4, 6.8);
key.castShadow = true;
scene.add(key);
const rim = new THREE.PointLight(0xaedfff, 2.1, 16, 1.8);
rim.position.set(-5.7, 3.2, -4.8);
scene.add(rim);
const soft = new THREE.PointLight(0xffffff, 0.65, 18, 2.2);
soft.position.set(2.8, 2.4, 5.2);
scene.add(soft);

// Camera path: first and last keyframes remain Animation_scenen_001. Opening view is zoomed out to show full panel and stand.
const keyframes = [
  { name: 'Animation_scenen_001', pos: [0.0, 3.82, 12.8], rot: [-0.08, -0.3, 0.02] },
  { name: 'Animation_scenen_002', pos: [0.18, 3.25, 11.25], rot: [-0.09, -0.02, 0.01] },
  { name: 'Animation_scenen_007', pos: [-0.9, 1.95, 10.95], rot: [-0.03, 0.28, -0.02] },
  { name: 'Animation_scenen_004', pos: [-9.3, 1.92, 5.2], rot: [0.01, 1.2, -0.02] },
  { name: 'Animation_scenen_008', pos: [-7.4, 2.85, -8.0], rot: [0.03, 2.28, -0.02] },
  { name: 'Animation_scenen_003', pos: [0.2, 2.92, -12.1], rot: [0.02, Math.PI, 0.01] },
  { name: 'Animation_scenen_006', pos: [7.4, 2.85, -8.0], rot: [0.03, -2.3, 0.02] },
  { name: 'Animation_scenen_005', pos: [7.35, 3.65, 7.25], rot: [-0.1, -0.8, 0.01] },
  { name: 'Animation_scenen_001', pos: [0.0, 3.82, 12.8], rot: [-0.08, -0.3, 0.02] }
];

let cinematic = false;
let cinematicStart = 0;
const cinematicDuration = reducedMotion ? 1200 : 16000;
let targetRotX = root.rotation.x;
let targetRotY = root.rotation.y;
let targetRotZ = root.rotation.z;
let drag = false;
let lastX = 0;
let lastY = 0;

function setKeyframe(index) {
  const k = keyframes[index];
  camera.position.set(...k.pos);
  root.rotation.set(...k.rot);
  camera.lookAt(0, 0.18, 0);
  sceneLabel.textContent = k.name;
}
setKeyframe(0);

function smoothstep(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

function applyCinematic(time) {
  const elapsed = (time - cinematicStart) % cinematicDuration;
  const progress = elapsed / cinematicDuration;
  const scaled = progress * (keyframes.length - 1);
  const i = Math.min(Math.floor(scaled), keyframes.length - 2);
  const f = smoothstep(scaled - i);
  const a = keyframes[i];
  const b = keyframes[i + 1];

  camera.position.set(
    lerp(a.pos[0], b.pos[0], f),
    lerp(a.pos[1], b.pos[1], f),
    lerp(a.pos[2], b.pos[2], f)
  );
  root.rotation.set(
    lerp(a.rot[0], b.rot[0], f),
    lerp(a.rot[1], b.rot[1], f),
    lerp(a.rot[2], b.rot[2], f)
  );
  camera.lookAt(0, 0.18, 0);
  sceneLabel.textContent = a.name;
}

function onPointerDown(event) {
  cinematic = false;
  drag = true;
  lastX = event.clientX;
  lastY = event.clientY;
  targetRotX = root.rotation.x;
  targetRotY = root.rotation.y;
  targetRotZ = root.rotation.z;
  canvas.setPointerCapture?.(event.pointerId);
}
function onPointerMove(event) {
  if (!drag) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;
  targetRotY += dx * 0.0066;
  targetRotX += dy * 0.0038;
  targetRotX = THREE.MathUtils.clamp(targetRotX, -0.72, 0.6);
}
function onPointerUp(event) {
  drag = false;
  canvas.releasePointerCapture?.(event.pointerId);
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', onPointerUp);

playBtn.addEventListener('click', () => {
  cinematic = true;
  cinematicStart = performance.now();
  sceneLabel.textContent = 'Animation_scenen_001';
});

resetBtn.addEventListener('click', () => {
  cinematic = false;
  autoRotateInput.checked = false;
  setKeyframe(0);
  targetRotX = root.rotation.x;
  targetRotY = root.rotation.y;
  targetRotZ = root.rotation.z;
});

function resize() {
  const rect = canvas.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
}
window.addEventListener('resize', resize);
resize();

function animate(time) {
  requestAnimationFrame(animate);
  if (cinematic) {
    applyCinematic(time);
  } else {
    if (autoRotateInput.checked && !reducedMotion) targetRotY += 0.0024;
    root.rotation.x += (targetRotX - root.rotation.x) * 0.075;
    root.rotation.y += (targetRotY - root.rotation.y) * 0.075;
    root.rotation.z += (targetRotZ - root.rotation.z) * 0.075;
    camera.lookAt(0, 0.18, 0);
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
