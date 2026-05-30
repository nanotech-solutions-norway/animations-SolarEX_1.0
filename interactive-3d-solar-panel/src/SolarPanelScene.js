import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#solarCanvas');
const playBtn = document.querySelector('#playBtn');
const resetBtn = document.querySelector('#resetBtn');
const autoRotateInput = document.querySelector('#autoRotate');
const sceneLabel = document.querySelector('#sceneLabel');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020404, 0.016);
const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 260);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const root = new THREE.Group();
root.name = 'SolarEX-selected-center-four-model-responsive';
root.rotation.set(-0.08, -0.3, 0.02);
scene.add(root);

const mat = {
  frame: new THREE.MeshPhysicalMaterial({ color: 0xf4fbff, metalness: 0.58, roughness: 0.16, transparent: true, opacity: 0.76, emissive: 0xb8d7e5, emissiveIntensity: 0.055, clearcoat: 0.7 }),
  wire: new THREE.MeshPhysicalMaterial({ color: 0xf8fdff, metalness: 0.24, roughness: 0.22, transparent: true, opacity: 0.7, emissive: 0xbdd9e6, emissiveIntensity: 0.052 }),
  cell: new THREE.MeshPhysicalMaterial({ color: 0x030405, metalness: 0.12, roughness: 0.5, emissive: 0x000000, clearcoat: 0.18 }),
  redCell: new THREE.MeshPhysicalMaterial({ color: 0xa51212, metalness: 0.08, roughness: 0.44, emissive: 0x220000, emissiveIntensity: 0.12, clearcoat: 0.2 }),
  redDetail: new THREE.MeshPhysicalMaterial({ color: 0x220202, metalness: 0.05, roughness: 0.56, emissive: 0x2a0000, emissiveIntensity: 0.08 }),
  redGlow: new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0.20, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  redHaloCore: new THREE.MeshBasicMaterial({ color: 0xff1111, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  redOutline: new THREE.MeshPhysicalMaterial({ color: 0xff4040, metalness: 0.06, roughness: 0.32, emissive: 0x6a0000, emissiveIntensity: 0.45, transparent: true, opacity: 0.92 }),
  metal: new THREE.MeshPhysicalMaterial({ color: 0x30373c, metalness: 0.78, roughness: 0.26, transparent: true, opacity: 0.84, emissive: 0x5b6970, emissiveIntensity: 0.028 }),
  darkMetal: new THREE.MeshPhysicalMaterial({ color: 0x0d1114, metalness: 0.82, roughness: 0.34, transparent: true, opacity: 0.88 }),
  cable: new THREE.MeshStandardMaterial({ color: 0x050607, metalness: 0.36, roughness: 0.44 }),
  bolt: new THREE.MeshPhysicalMaterial({ color: 0xf6fcff, metalness: 0.72, roughness: 0.2, transparent: true, opacity: 0.8, emissive: 0xa5b6bf, emissiveIntensity: 0.032 })
};

function box(parent, name, w, h, d, x, y, z, material, rot = [0, 0, 0], shadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.name = name; mesh.position.set(x, y, z); mesh.rotation.set(...rot);
  mesh.castShadow = shadow; mesh.receiveShadow = shadow; parent.add(mesh); return mesh;
}
function cyl(parent, name, r, h, x, y, z, material, rot = [0, 0, 0], seg = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), material);
  mesh.name = name; mesh.position.set(x, y, z); mesh.rotation.set(...rot);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function line(parent, points, color = 0xf7fdff, opacity = 0.55) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  const mesh = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity })); parent.add(mesh); return mesh;
}
function diamond(parent, name, size, x, y, z) { return box(parent, name, size, size, 0.04, x, y, z, mat.bolt, [0, 0, Math.PI / 4], false); }
function selectedGlow(parent, name, w, h, x, y, z) {
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.16, h * 1.16), mat.redGlow);
  outer.name = `${name}-outer-halo`; outer.position.set(x, y, z); outer.renderOrder = 30; parent.add(outer);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.96), mat.redHaloCore);
  inner.name = `${name}-inner-halo`; inner.position.set(x, y, z + 0.003); inner.renderOrder = 31; parent.add(inner);
  box(parent, `${name}-outline-top`, w * 0.94, 0.026, 0.012, x, y + h * 0.47, z + 0.006, mat.redOutline, [0, 0, 0], false).renderOrder = 32;
  box(parent, `${name}-outline-bottom`, w * 0.94, 0.026, 0.012, x, y - h * 0.47, z + 0.006, mat.redOutline, [0, 0, 0], false).renderOrder = 32;
  box(parent, `${name}-outline-left`, 0.026, h * 0.94, 0.012, x - w * 0.47, y, z + 0.006, mat.redOutline, [0, 0, 0], false).renderOrder = 32;
  box(parent, `${name}-outline-right`, 0.026, h * 0.94, 0.012, x + w * 0.47, y, z + 0.006, mat.redOutline, [0, 0, 0], false).renderOrder = 32;
}

const panel = new THREE.Group(); panel.rotation.x = -THREE.MathUtils.degToRad(13.5); panel.position.y = 1.85; root.add(panel);
const W = 9.0, H = 5.55, T = 0.22, cols = 6, rows = 6, gap = 0.072;
const cw = (W - gap * (cols + 1)) / cols, ch = (H - gap * (rows + 1)) / rows;

box(panel, 'rear-backsheet-plane', W * 0.986, H * 0.985, 0.034, 0, 0, -0.16, mat.cell);
box(panel, 'frame-top', W + 0.46, 0.14, T, 0, H / 2 + 0.13, -0.005, mat.frame);
box(panel, 'frame-bottom', W + 0.46, 0.14, T, 0, -H / 2 - 0.13, -0.005, mat.frame);
box(panel, 'frame-left', 0.14, H + 0.46, T, -W / 2 - 0.13, 0, -0.005, mat.frame);
box(panel, 'frame-right', 0.14, H + 0.46, T, W / 2 + 0.13, 0, -0.005, mat.frame);
box(panel, 'glass-edge-top', W + 0.28, 0.07, 0.11, 0, H / 2 + 0.045, 0.065, mat.wire, [0, 0, 0], false);
box(panel, 'glass-edge-bottom', W + 0.28, 0.07, 0.11, 0, -H / 2 - 0.045, 0.065, mat.wire, [0, 0, 0], false);
box(panel, 'glass-edge-left', 0.07, H + 0.28, 0.11, -W / 2 - 0.045, 0, 0.065, mat.wire, [0, 0, 0], false);
box(panel, 'glass-edge-right', 0.07, H + 0.28, 0.11, W / 2 + 0.045, 0, 0.065, mat.wire, [0, 0, 0], false);
box(panel, 'rear-frame-shadow-upper', W + 0.28, 0.09, 0.08, 0.16, H / 2 + 0.26, -0.34, mat.darkMetal);
box(panel, 'rear-frame-shadow-lower', W + 0.18, 0.09, 0.08, -0.12, -H / 2 - 0.26, -0.34, mat.darkMetal);

for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  const x = -W / 2 + gap + cw / 2 + c * (cw + gap), y = H / 2 - gap - ch / 2 - r * (ch + gap);
  const isSelected = c >= 2 && c <= 3 && r >= 2 && r <= 3;
  const cell = box(panel, `pv-cell-${r + 1}-${c + 1}${isSelected ? '-selected-red-halo' : ''}`, cw, ch, 0.034, x, y, 0.176, isSelected ? mat.redCell : mat.cell, [0, 0, 0], false);
  cell.renderOrder = isSelected ? 33 : 10;
  if (isSelected) selectedGlow(panel, `selected-cell-${r + 1}-${c + 1}`, cw * 1.08, ch * 1.08, x, y, 0.225);
  const detail = isSelected ? mat.redDetail : mat.wire;
  for (let i = 1; i < 9; i++) box(panel, `busbar-v-${r}-${c}-${i}`, 0.0048, ch * 0.88, 0.01, x - cw / 2 + (i * cw) / 9, y, 0.214, detail, [0, 0, 0], false);
  for (let i = 1; i < 4; i++) box(panel, `busbar-h-${r}-${c}-${i}`, cw * 0.86, 0.0048, 0.009, x, y - ch / 2 + (i * ch) / 4, 0.217, detail, [0, 0, 0], false);
  if (r < rows - 1 && c < cols - 1) diamond(panel, `interconnect-${r}-${c}`, 0.145, x + cw / 2 + gap / 2, y - ch / 2 - gap / 2, 0.226);
}
for (let i = 0; i <= cols; i++) line(panel, [[-W / 2 + i * (W / cols), -H / 2, 0.245], [-W / 2 + i * (W / cols), H / 2, 0.245]], 0xf7fdff, 0.34);
for (let i = 0; i <= rows; i++) line(panel, [[-W / 2, -H / 2 + i * (H / rows), 0.245], [W / 2, -H / 2 + i * (H / rows), 0.245]], 0xf7fdff, 0.34);
line(panel, [[-W / 2, -H / 2, 0.258], [W / 2, -H / 2, 0.258], [W / 2, H / 2, 0.258], [-W / 2, H / 2, 0.258], [-W / 2, -H / 2, 0.258]], 0xffffff, 0.68);

box(panel, 'rear-primary-horizontal-rail', W * 0.88, 0.13, 0.13, 0, -0.35, -0.78, mat.metal);
box(panel, 'rear-secondary-lower-rail', W * 0.78, 0.105, 0.11, 0, -2.02, -0.76, mat.metal);
box(panel, 'rear-upper-service-rail', W * 0.38, 0.08, 0.1, 0, 1.78, -0.78, mat.metal);
[-3.15, 0, 3.15].forEach((x, i) => { box(panel, `rear-vertical-rail-${i}`, 0.14, H * 0.76, 0.17, x, -0.04, -0.84, mat.metal); box(panel, `upper-clamp-${i}`, 0.36, 0.18, 0.22, x, 1.94, -0.92, mat.bolt); box(panel, `lower-clamp-${i}`, 0.36, 0.18, 0.22, x, -2.03, -0.92, mat.bolt); });
box(panel, 'rear-centre-mounting-plate', 0.95, 0.72, 0.18, 0, -1.15, -1.02, mat.metal);
box(panel, 'junction-box-main-body', 0.82, 0.48, 0.24, 0, 1.05, -1.02, mat.darkMetal);
['top', 'mid', 'bottom'].forEach((name, i) => box(panel, `junction-lip-${name}`, 0.9, 0.05, 0.25, 0, 1.27 - i * 0.22, -1.16, mat.wire));
function cable(name, xOffset, side = 1) {
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(xOffset, 0.8, -1.18), new THREE.Vector3(xOffset + side * 0.18, 0.5, -1.28), new THREE.Vector3(xOffset + side * 0.78, 0.02, -1.34), new THREE.Vector3(xOffset + side * 1.56, -0.58, -1.22), new THREE.Vector3(xOffset + side * 2.55, -1.02, -1.06)]);
  panel.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 54, 0.026, 8, false), mat.cable));
}
cable('left-output-cable', -0.18, -1); cable('right-output-cable', 0.18, 1);

const support = new THREE.Group(); support.position.z = -1.05; root.add(support);
box(support, 'base-plate-lower', 3.0, 0.18, 1.95, 0, -2.18, 0, mat.metal);
box(support, 'base-plate-upper', 2.3, 0.14, 1.42, 0, -1.97, 0, mat.frame);
box(support, 'base-inner-riser', 1.35, 0.18, 0.82, 0, -1.77, 0, mat.darkMetal);
box(support, 'central-rectangular-post', 0.68, 3.7, 0.68, 0, 0.05, -0.08, mat.metal);
box(support, 'top-mounting-head', 1.16, 0.48, 0.44, 0, 1.92, -0.55, mat.metal);
box(support, 'safe-left-rear-bracket', 0.1, 1.58, 0.13, -1.05, 0.75, -0.98, mat.metal, [0.14, 0, -0.34]);
box(support, 'safe-right-rear-bracket', 0.1, 1.58, 0.13, 1.05, 0.75, -0.98, mat.metal, [0.14, 0, 0.34]);
[-1.05, 1.05].forEach((x) => [-0.64, 0.64].forEach((z) => cyl(support, 'base-bolt', 0.058, 0.06, x, -1.76, z, mat.bolt, [Math.PI / 2, 0, 0], 24)));

const grid = new THREE.GridHelper(36, 72, 0x66818d, 0x182229); grid.position.y = -2.28; grid.material.transparent = true; grid.material.opacity = 0.52; scene.add(grid);
scene.add(new THREE.AmbientLight(0xc7e7ff, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 2.45); key.position.set(4.2, 7.4, 6.8); key.castShadow = true; scene.add(key);
const rim = new THREE.PointLight(0xd2f1ff, 2.25, 18, 1.8); rim.position.set(-5.7, 3.2, -4.8); scene.add(rim);
const soft = new THREE.PointLight(0xffffff, 0.76, 20, 2.2); soft.position.set(2.8, 2.4, 5.2); scene.add(soft);

const baseKeyframes = [
  { name: 'Animation_scenen_001', pos: [0.0, 4.8, 18.2], rot: [-0.08, -0.3, 0.02] },
  { name: 'Animation_scenen_002', pos: [0.15, 4.15, 16.3], rot: [-0.09, -0.02, 0.01] },
  { name: 'Animation_scenen_007', pos: [-1.15, 2.7, 15.9], rot: [-0.03, 0.28, -0.02] },
  { name: 'Animation_scenen_004', pos: [-12.8, 2.7, 7.4], rot: [0.01, 1.2, -0.02] },
  { name: 'Animation_scenen_008', pos: [-10.2, 3.45, -11.6], rot: [0.03, 2.28, -0.02] },
  { name: 'Animation_scenen_003', pos: [0.2, 3.7, -17.2], rot: [0.02, Math.PI, 0.01] },
  { name: 'Animation_scenen_006', pos: [10.2, 3.45, -11.6], rot: [0.03, -2.3, 0.02] },
  { name: 'Animation_scenen_005', pos: [10.0, 4.45, 10.1], rot: [-0.1, -0.8, 0.01] },
  { name: 'Animation_scenen_001', pos: [0.0, 4.8, 18.2], rot: [-0.08, -0.3, 0.02] }
];
let keyframes = baseKeyframes;
let cinematic = false, cinematicStart = 0;
const cinematicDuration = reducedMotion ? 1200 : 16000;
let targetRotX = root.rotation.x, targetRotY = root.rotation.y, targetRotZ = root.rotation.z;
let drag = false, lastX = 0, lastY = 0;

function viewportProfile() {
  const w = Math.max(1, canvas.clientWidth || window.innerWidth), h = Math.max(1, canvas.clientHeight || window.innerHeight);
  const portrait = h > w, narrow = w < 760, compactHeight = h < 560;
  const distance = narrow ? (portrait ? 1.48 : 1.28) : compactHeight ? 1.18 : 1;
  const yLift = narrow && portrait ? 0.52 : compactHeight ? 0.2 : 0;
  return { w, h, distance, yLift, fov: narrow ? (portrait ? 39 : 34) : compactHeight ? 33 : 29, pixelRatio: narrow ? 1.5 : 2 };
}
function buildResponsiveKeyframes() {
  const p = viewportProfile();
  keyframes = baseKeyframes.map((k) => ({ ...k, pos: [k.pos[0] * p.distance, k.pos[1] + p.yLift, k.pos[2] * p.distance] }));
  camera.fov = p.fov;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, p.pixelRatio));
}
function setKeyframe(i) { buildResponsiveKeyframes(); const k = keyframes[i]; camera.position.set(...k.pos); root.rotation.set(...k.rot); camera.lookAt(0, 0.75, 0); sceneLabel.textContent = k.name; }
function smoothstep(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }
function applyCinematic(time) {
  const scaled = (((time - cinematicStart) % cinematicDuration) / cinematicDuration) * (keyframes.length - 1);
  const i = Math.min(Math.floor(scaled), keyframes.length - 2), f = smoothstep(scaled - i), a = keyframes[i], b = keyframes[i + 1];
  camera.position.set(lerp(a.pos[0], b.pos[0], f), lerp(a.pos[1], b.pos[1], f), lerp(a.pos[2], b.pos[2], f));
  root.rotation.set(lerp(a.rot[0], b.rot[0], f), lerp(a.rot[1], b.rot[1], f), lerp(a.rot[2], b.rot[2], f));
  camera.lookAt(0, 0.75, 0); sceneLabel.textContent = a.name;
}
canvas.addEventListener('pointerdown', (e) => { cinematic = false; drag = true; lastX = e.clientX; lastY = e.clientY; targetRotX = root.rotation.x; targetRotY = root.rotation.y; targetRotZ = root.rotation.z; canvas.setPointerCapture?.(e.pointerId); });
canvas.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; targetRotY += dx * (viewportProfile().w < 760 ? 0.0048 : 0.006); targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.0032, -0.72, 0.6); });
['pointerup', 'pointercancel'].forEach((type) => canvas.addEventListener(type, (e) => { drag = false; canvas.releasePointerCapture?.(e.pointerId); }));
playBtn.addEventListener('click', () => { cinematic = true; cinematicStart = performance.now(); buildResponsiveKeyframes(); sceneLabel.textContent = 'Animation_scenen_001'; });
resetBtn.addEventListener('click', () => { cinematic = false; autoRotateInput.checked = false; setKeyframe(0); targetRotX = root.rotation.x; targetRotY = root.rotation.y; targetRotZ = root.rotation.z; });
function resize() { const rect = canvas.getBoundingClientRect(); buildResponsiveKeyframes(); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false); if (!cinematic) camera.lookAt(0, 0.75, 0); }
window.addEventListener('resize', resize); window.addEventListener('orientationchange', () => setTimeout(() => { resize(); if (!cinematic) setKeyframe(0); }, 150)); resize(); setKeyframe(0);
function animate(time) { requestAnimationFrame(animate); if (cinematic) applyCinematic(time); else { if (autoRotateInput.checked && !reducedMotion) targetRotY += viewportProfile().w < 760 ? 0.0015 : 0.0022; root.rotation.x += (targetRotX - root.rotation.x) * 0.075; root.rotation.y += (targetRotY - root.rotation.y) * 0.075; root.rotation.z += (targetRotZ - root.rotation.z) * 0.075; camera.lookAt(0, 0.75, 0); } renderer.render(scene, camera); }
requestAnimationFrame(animate);
