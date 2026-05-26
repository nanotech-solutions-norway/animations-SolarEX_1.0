import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#solarCanvas');
const playBtn = document.querySelector('#playBtn');
const resetBtn = document.querySelector('#resetBtn');
const autoRotateInput = document.querySelector('#autoRotate');
const sceneLabel = document.querySelector('#sceneLabel');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020404, 0.032);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const root = new THREE.Group();
root.rotation.set(-0.08, -0.32, 0.02);
scene.add(root);

const palette = {
  wire: 0xddeeff,
  glass: 0x263238,
  cell: 0x050708,
  red: 0xff1111,
  darkMetal: 0x23282b,
  grid: 0x45606a
};

const material = {
  wire: new THREE.MeshPhysicalMaterial({ color: palette.wire, metalness: 0.15, roughness: 0.22, transparent: true, opacity: 0.36, emissive: 0xbfdfff, emissiveIntensity: 0.14 }),
  frame: new THREE.MeshPhysicalMaterial({ color: palette.wire, metalness: 0.4, roughness: 0.18, transparent: true, opacity: 0.43, emissive: 0xcfefff, emissiveIntensity: 0.1 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x0c1417, metalness: 0.02, roughness: 0.07, transmission: 0.28, transparent: true, opacity: 0.23, emissive: 0x061014, emissiveIntensity: 0.35, clearcoat: 1, clearcoatRoughness: 0.04 }),
  cell: new THREE.MeshPhysicalMaterial({ color: palette.cell, metalness: 0.18, roughness: 0.36, emissive: 0x020305, emissiveIntensity: 0.28 }),
  red: new THREE.MeshPhysicalMaterial({ color: palette.red, metalness: 0.2, roughness: 0.22, transparent: true, opacity: 0.62, emissive: palette.red, emissiveIntensity: 1.18, clearcoat: 0.5 }),
  metal: new THREE.MeshPhysicalMaterial({ color: palette.darkMetal, metalness: 0.72, roughness: 0.28, transparent: true, opacity: 0.48, emissive: 0xbfdfff, emissiveIntensity: 0.05 }),
  cable: new THREE.MeshStandardMaterial({ color: 0x101214, metalness: 0.35, roughness: 0.42 }),
  bolt: new THREE.MeshPhysicalMaterial({ color: 0xe5f2f6, metalness: 0.65, roughness: 0.2, transparent: true, opacity: 0.62 })
};

function roundedBox(w, h, d, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addBox(parent, name, w, h, d, x, y, z, mat) {
  const mesh = roundedBox(w, h, d, mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
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

function addLine(parent, points, color = 0xddeeff, opacity = 0.35) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const line = new THREE.Line(geo, mat);
  parent.add(line);
  return line;
}

const panel = new THREE.Group();
panel.name = 'detailed-pv-module-assembly';
panel.rotation.x = -THREE.MathUtils.degToRad(14);
panel.position.y = 1.2;
root.add(panel);

const W = 8.4;
const H = 5.2;
const T = 0.18;

addBox(panel, 'transparent-front-glass', W, H, 0.035, 0, 0, 0.09, material.glass);
addBox(panel, 'rear-backsheet-shadow', W * 0.98, H * 0.98, 0.035, 0, 0, -0.12, material.cell);
addBox(panel, 'top-frame-rail', W + 0.28, 0.13, T, 0, H / 2 + 0.09, 0, material.frame);
addBox(panel, 'bottom-frame-rail', W + 0.28, 0.13, T, 0, -H / 2 - 0.09, 0, material.frame);
addBox(panel, 'left-frame-rail', 0.13, H + 0.28, T, -W / 2 - 0.09, 0, 0, material.frame);
addBox(panel, 'right-frame-rail', 0.13, H + 0.28, T, W / 2 + 0.09, 0, 0, material.frame);

// PV cell matrix with fine striations and red 3 x 3 highlighted group.
const cols = 6;
const rows = 6;
const gap = 0.06;
const cw = (W - gap * (cols + 1)) / cols;
const ch = (H - gap * (rows + 1)) / rows;
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const x = -W / 2 + gap + cw / 2 + c * (cw + gap);
    const y = H / 2 - gap - ch / 2 - r * (ch + gap);
    const isRed = c >= 2 && c <= 4 && r >= 2 && r <= 4;
    addBox(panel, `pv-cell-${r + 1}-${c + 1}${isRed ? '-red-highlighted' : ''}`, cw, ch, 0.032, x, y, 0.13, isRed ? material.red : material.cell);

    // Busbar / micro-line finish.
    for (let i = 1; i < 8; i++) {
      const lx = x - cw / 2 + (i * cw) / 8;
      addBox(panel, `cell-striation-${r + 1}-${c + 1}-${i}`, 0.006, ch * 0.88, 0.011, lx, y, 0.152, isRed ? material.cell : material.wire);
    }
    // Diamond-like connector points in the corners.
    if (r < rows - 1 && c < cols - 1) {
      const node = addBox(panel, `cell-connector-node-${r + 1}-${c + 1}`, 0.13, 0.13, 0.04, x + cw / 2 + gap / 2, y - ch / 2 - gap / 2, 0.17, material.bolt);
      node.rotation.z = Math.PI / 4;
    }
  }
}

// Glass edge lines / wireframe finish.
for (let i = 0; i <= cols; i++) {
  const x = -W / 2 + i * (W / cols);
  addLine(panel, [[x, -H / 2, 0.19], [x, H / 2, 0.19]], 0xddeeff, 0.18);
}
for (let i = 0; i <= rows; i++) {
  const y = -H / 2 + i * (H / rows);
  addLine(panel, [[-W / 2, y, 0.19], [W / 2, y, 0.19]], 0xddeeff, 0.18);
}

// Rear engineering details.
addBox(panel, 'rear-horizontal-support-rail', W * 0.86, 0.12, 0.12, 0, -0.35, -0.52, material.metal);
addBox(panel, 'rear-lower-support-rail', W * 0.78, 0.1, 0.1, 0, -1.95, -0.46, material.metal);
[-2.9, 0, 2.9].forEach((x, idx) => {
  addBox(panel, `rear-vertical-rail-${idx + 1}`, 0.13, H * 0.74, 0.16, x, -0.05, -0.5, material.metal);
  addBox(panel, `upper-clamp-${idx + 1}`, 0.32, 0.18, 0.2, x, 1.84, -0.72, material.bolt);
  addBox(panel, `lower-clamp-${idx + 1}`, 0.32, 0.18, 0.2, x, -1.95, -0.72, material.bolt);
});
addBox(panel, 'junction-box', 0.75, 0.45, 0.22, 0, 1.02, -0.72, material.metal);
addBox(panel, 'junction-box-rib-1', 0.82, 0.04, 0.23, 0, 1.18, -0.86, material.wire);
addBox(panel, 'junction-box-rib-2', 0.82, 0.04, 0.23, 0, 1.02, -0.86, material.wire);
addBox(panel, 'junction-box-rib-3', 0.82, 0.04, 0.23, 0, 0.86, -0.86, material.wire);

function makeCable(name, xOffset, side = 1) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(xOffset, 0.78, -0.82),
    new THREE.Vector3(xOffset + side * 0.55, 0.2, -1.05),
    new THREE.Vector3(xOffset + side * 1.6, -0.62, -0.92),
    new THREE.Vector3(xOffset + side * 2.6, -1.05, -0.78)
  ]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 44, 0.025, 8, false), material.cable);
  tube.name = name;
  tube.castShadow = true;
  panel.add(tube);
}
makeCable('left-output-cable', -0.18, -1);
makeCable('right-output-cable', 0.18, 1);

// Support post, bracket, and base.
const support = new THREE.Group();
support.name = 'central-pedestal-and-base';
root.add(support);
addBox(support, 'base-plate-lower', 2.4, 0.18, 1.55, 0, -1.88, 0, material.metal);
addBox(support, 'base-plate-upper', 1.85, 0.14, 1.12, 0, -1.68, 0, material.frame);
addBox(support, 'central-post', 0.55, 2.78, 0.55, 0, -0.25, -0.1, material.metal);
addBox(support, 'top-mounting-head', 1.05, 0.46, 0.42, 0, 1.1, -0.25, material.metal);
addBox(support, 'tilt-bracket-left', 0.1, 1.42, 0.13, -0.64, 0.54, -0.6, material.metal).rotation.z = -0.4;
addBox(support, 'tilt-bracket-right', 0.1, 1.42, 0.13, 0.64, 0.54, -0.6, material.metal).rotation.z = 0.4;
[-0.82, 0.82].forEach(x => [-0.48, 0.48].forEach(z => addCylinder(support, 'base-bolt', 0.055, 0.05, x, -1.55, z, material.bolt, [Math.PI / 2, 0, 0], 24)));

// Technical grid floor.
const grid = new THREE.GridHelper(26, 52, 0x4e6570, 0x172025);
grid.position.y = -2.02;
scene.add(grid);

// Lights.
scene.add(new THREE.AmbientLight(0xaad9ff, 0.7));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(3.4, 6.8, 5.2);
key.castShadow = true;
scene.add(key);
const redGlow = new THREE.PointLight(0xff1111, 3.2, 9, 1.7);
redGlow.position.set(0.8, 1.8, 1.8);
scene.add(redGlow);
const rim = new THREE.PointLight(0x99ddff, 2.1, 14, 1.8);
rim.position.set(-5, 3, -4);
scene.add(rim);

// Camera path: first and last keyframes intentionally reference Animation_scenen_001.
const keyframes = [
  { name: 'Animation_scenen_001', pos: [0.2, 3.2, 9.2], rot: [-0.08, -0.32, 0.02] },
  { name: 'Animation_scenen_002', pos: [0.0, 2.7, 8.4], rot: [-0.1, -0.04, 0.01] },
  { name: 'Animation_scenen_007', pos: [-0.7, 1.3, 8.8], rot: [-0.02, 0.3, -0.02] },
  { name: 'Animation_scenen_004', pos: [-7.7, 1.25, 3.9], rot: [0.02, 1.24, -0.02] },
  { name: 'Animation_scenen_008', pos: [-5.9, 2.4, -6.4], rot: [0.04, 2.32, -0.02] },
  { name: 'Animation_scenen_003', pos: [0.5, 2.3, -9.5], rot: [0.02, Math.PI, 0.01] },
  { name: 'Animation_scenen_006', pos: [5.8, 2.4, -6.5], rot: [0.03, -2.35, 0.02] },
  { name: 'Animation_scenen_005', pos: [6.1, 3.2, 5.6], rot: [-0.12, -0.82, 0.01] },
  { name: 'Animation_scenen_001', pos: [0.2, 3.2, 9.2], rot: [-0.08, -0.32, 0.02] }
];

let cinematic = false;
let cinematicStart = 0;
const cinematicDuration = reducedMotion ? 1200 : 15000;
let targetRotX = root.rotation.x;
let targetRotY = root.rotation.y;
let drag = false;
let lastX = 0;
let lastY = 0;

function setKeyframe(index) {
  const k = keyframes[index];
  camera.position.set(...k.pos);
  root.rotation.set(...k.rot);
  camera.lookAt(0, 0.2, 0);
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
  camera.lookAt(0, 0.2, 0);
  sceneLabel.textContent = a.name;
}

function onPointerDown(event) {
  cinematic = false;
  drag = true;
  lastX = event.clientX;
  lastY = event.clientY;
  targetRotX = root.rotation.x;
  targetRotY = root.rotation.y;
  canvas.setPointerCapture?.(event.pointerId);
}
function onPointerMove(event) {
  if (!drag) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;
  targetRotY += dx * 0.007;
  targetRotX += dy * 0.004;
  targetRotX = THREE.MathUtils.clamp(targetRotX, -0.72, 0.62);
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
    if (autoRotateInput.checked && !reducedMotion) targetRotY += 0.003;
    root.rotation.x += (targetRotX - root.rotation.x) * 0.08;
    root.rotation.y += (targetRotY - root.rotation.y) * 0.08;
    camera.lookAt(0, 0.2, 0);
  }

  const pulse = 0.75 + Math.sin(time * 0.003) * 0.18;
  material.red.emissiveIntensity = 1.05 + pulse * 0.35;
  redGlow.intensity = 2.6 + pulse * 1.2;
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
