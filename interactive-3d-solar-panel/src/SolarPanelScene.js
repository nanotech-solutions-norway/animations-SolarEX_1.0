import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#solarCanvas');
const playBtn = document.querySelector('#playBtn');
const resetBtn = document.querySelector('#resetBtn');
const autoRotateInput = document.querySelector('#autoRotate');
const sceneLabel = document.querySelector('#sceneLabel');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020404, 0.016);

const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 240);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const root = new THREE.Group();
root.name = 'SolarEX-artifact-free-full-view-model-v3';
root.rotation.set(-0.08, -0.3, 0.02);
scene.add(root);

const materials = {
  frame: new THREE.MeshPhysicalMaterial({ color: 0xf4fbff, metalness: 0.58, roughness: 0.16, transparent: true, opacity: 0.76, emissive: 0xb8d7e5, emissiveIntensity: 0.055, clearcoat: 0.7, clearcoatRoughness: 0.08 }),
  wire: new THREE.MeshPhysicalMaterial({ color: 0xf8fdff, metalness: 0.24, roughness: 0.22, transparent: true, opacity: 0.7, emissive: 0xbdd9e6, emissiveIntensity: 0.052 }),
  glassEdge: new THREE.MeshPhysicalMaterial({ color: 0xd8f2ff, metalness: 0.04, roughness: 0.12, transparent: true, opacity: 0.3, emissive: 0x253742, emissiveIntensity: 0.025, clearcoat: 1, clearcoatRoughness: 0.04, depthWrite: false }),
  cell: new THREE.MeshPhysicalMaterial({ color: 0x030405, metalness: 0.12, roughness: 0.5, emissive: 0x000000, emissiveIntensity: 0, clearcoat: 0.18, clearcoatRoughness: 0.28 }),
  redCell: new THREE.MeshPhysicalMaterial({ color: 0x8f0f0f, metalness: 0.1, roughness: 0.48, emissive: 0x000000, emissiveIntensity: 0, clearcoat: 0.18, clearcoatRoughness: 0.24 }),
  redDetail: new THREE.MeshPhysicalMaterial({ color: 0x1d0202, metalness: 0.05, roughness: 0.58, emissive: 0x000000, emissiveIntensity: 0 }),
  metal: new THREE.MeshPhysicalMaterial({ color: 0x30373c, metalness: 0.78, roughness: 0.26, transparent: true, opacity: 0.84, emissive: 0x5b6970, emissiveIntensity: 0.028 }),
  darkMetal: new THREE.MeshPhysicalMaterial({ color: 0x0d1114, metalness: 0.82, roughness: 0.34, transparent: true, opacity: 0.88 }),
  cable: new THREE.MeshStandardMaterial({ color: 0x050607, metalness: 0.36, roughness: 0.44 }),
  bolt: new THREE.MeshPhysicalMaterial({ color: 0xf6fcff, metalness: 0.72, roughness: 0.2, transparent: true, opacity: 0.8, emissive: 0xa5b6bf, emissiveIntensity: 0.032 })
};

function addBox(parent, name, w, h, d, x, y, z, mat, rotation = [0, 0, 0], shadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rotation);
  mesh.castShadow = shadow;
  mesh.receiveShadow = shadow;
  parent.add(mesh);
  return mesh;
}
function addCylinder(parent, name, radius, depth, x, y, z, mat, rotation = [0, 0, 0], segments = 32, shadow = true) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rotation);
  mesh.castShadow = shadow;
  mesh.receiveShadow = shadow;
  parent.add(mesh);
  return mesh;
}
function addLine(parent, points, color = 0xf7fdff, opacity = 0.55) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const line = new THREE.Line(geo, mat);
  parent.add(line);
  return line;
}
function addDiamond(parent, name, size, x, y, z, mat, shadow = false) {
  return addBox(parent, name, size, size, 0.04, x, y, z, mat, [0, 0, Math.PI / 4], shadow);
}
function addScrewGroup(parent, x, y, z, label) {
  addCylinder(parent, `${label}-screw-a`, 0.046, 0.045, x - 0.08, y, z, materials.bolt, [Math.PI / 2, 0, 0], 20);
  addCylinder(parent, `${label}-screw-b`, 0.046, 0.045, x + 0.08, y, z, materials.bolt, [Math.PI / 2, 0, 0], 20);
}

const panel = new THREE.Group();
panel.name = 'opaque-front-pv-module-no-face-intersections';
panel.rotation.x = -THREE.MathUtils.degToRad(13.5);
panel.position.y = 1.85;
root.add(panel);

const W = 9.0;
const H = 5.55;
const T = 0.22;
const cols = 6;
const rows = 6;
const gap = 0.072;
const cw = (W - gap * (cols + 1)) / cols;
const ch = (H - gap * (rows + 1)) / rows;

addBox(panel, 'rear-backsheet-plane', W * 0.986, H * 0.985, 0.034, 0, 0, -0.16, materials.cell);
addBox(panel, 'outer-aluminium-frame-top', W + 0.46, 0.14, T, 0, H / 2 + 0.13, -0.005, materials.frame);
addBox(panel, 'outer-aluminium-frame-bottom', W + 0.46, 0.14, T, 0, -H / 2 - 0.13, -0.005, materials.frame);
addBox(panel, 'outer-aluminium-frame-left', 0.14, H + 0.46, T, -W / 2 - 0.13, 0, -0.005, materials.frame);
addBox(panel, 'outer-aluminium-frame-right', 0.14, H + 0.46, T, W / 2 + 0.13, 0, -0.005, materials.frame);
addBox(panel, 'front-glass-edge-top', W + 0.28, 0.07, 0.11, 0, H / 2 + 0.045, 0.065, materials.glassEdge, [0, 0, 0], false);
addBox(panel, 'front-glass-edge-bottom', W + 0.28, 0.07, 0.11, 0, -H / 2 - 0.045, 0.065, materials.glassEdge, [0, 0, 0], false);
addBox(panel, 'front-glass-edge-left', 0.07, H + 0.28, 0.11, -W / 2 - 0.045, 0, 0.065, materials.glassEdge, [0, 0, 0], false);
addBox(panel, 'front-glass-edge-right', 0.07, H + 0.28, 0.11, W / 2 + 0.045, 0, 0.065, materials.glassEdge, [0, 0, 0], false);
addBox(panel, 'rear-offset-frame-shadow-upper', W + 0.28, 0.09, 0.08, 0.16, H / 2 + 0.26, -0.34, materials.darkMetal);
addBox(panel, 'rear-offset-frame-shadow-lower', W + 0.18, 0.09, 0.08, -0.12, -H / 2 - 0.26, -0.34, materials.darkMetal);

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const x = -W / 2 + gap + cw / 2 + c * (cw + gap);
    const y = H / 2 - gap - ch / 2 - r * (ch + gap);
    const isRed = c >= 2 && c <= 4 && r >= 2 && r <= 4;
    const cellMat = isRed ? materials.redCell : materials.cell;
    const lineMat = isRed ? materials.redDetail : materials.wire;
    const cell = addBox(panel, `pv-cell-${r + 1}-${c + 1}${isRed ? '-red-non-emissive' : ''}`, cw, ch, 0.034, x, y, 0.176, cellMat, [0, 0, 0], false);
    cell.userData.nonEmissiveHighlight = isRed;
    cell.renderOrder = 10;

    addBox(panel, `cell-top-lip-${r + 1}-${c + 1}`, cw * 0.92, 0.012, 0.018, x, y + ch * 0.47, 0.204, lineMat, [0, 0, 0], false);
    addBox(panel, `cell-bottom-lip-${r + 1}-${c + 1}`, cw * 0.92, 0.012, 0.018, x, y - ch * 0.47, 0.204, lineMat, [0, 0, 0], false);
    for (let i = 1; i < 9; i++) {
      const lx = x - cw / 2 + (i * cw) / 9;
      addBox(panel, `fine-vertical-busbar-${r + 1}-${c + 1}-${i}`, 0.0048, ch * 0.88, 0.01, lx, y, 0.214, lineMat, [0, 0, 0], false);
    }
    for (let i = 1; i < 4; i++) {
      const ly = y - ch / 2 + (i * ch) / 4;
      addBox(panel, `fine-horizontal-busbar-${r + 1}-${c + 1}-${i}`, cw * 0.86, 0.0048, 0.009, x, ly, 0.217, lineMat, [0, 0, 0], false);
    }
    if (r < rows - 1 && c < cols - 1) {
      addDiamond(panel, `diamond-interconnect-${r + 1}-${c + 1}`, 0.145, x + cw / 2 + gap / 2, y - ch / 2 - gap / 2, 0.226, materials.bolt, false);
    }
  }
}

for (let i = 0; i <= cols; i++) {
  const x = -W / 2 + i * (W / cols);
  addLine(panel, [[x, -H / 2, 0.245], [x, H / 2, 0.245]], 0xf7fdff, 0.34);
}
for (let i = 0; i <= rows; i++) {
  const y = -H / 2 + i * (H / rows);
  addLine(panel, [[-W / 2, y, 0.245], [W / 2, y, 0.245]], 0xf7fdff, 0.34);
}
addLine(panel, [[-W / 2, -H / 2, 0.258], [W / 2, -H / 2, 0.258], [W / 2, H / 2, 0.258], [-W / 2, H / 2, 0.258], [-W / 2, -H / 2, 0.258]], 0xffffff, 0.68);
addLine(panel, [[-W / 2 - 0.19, -H / 2 - 0.19, -0.04], [W / 2 + 0.19, -H / 2 - 0.19, -0.04], [W / 2 + 0.19, H / 2 + 0.19, -0.04], [-W / 2 - 0.19, H / 2 + 0.19, -0.04], [-W / 2 - 0.19, -H / 2 - 0.19, -0.04]], 0xffffff, 0.55);

// Front panel face intentionally contains no triangular, diagonal, or decorative overlay geometry.

addBox(panel, 'rear-primary-horizontal-rail', W * 0.88, 0.13, 0.13, 0, -0.35, -0.78, materials.metal);
addBox(panel, 'rear-secondary-lower-rail', W * 0.78, 0.105, 0.11, 0, -2.02, -0.76, materials.metal);
addBox(panel, 'rear-upper-service-rail', W * 0.38, 0.08, 0.1, 0, 1.78, -0.78, materials.metal);
[-3.15, 0, 3.15].forEach((x, idx) => {
  addBox(panel, `rear-vertical-rail-${idx + 1}`, 0.14, H * 0.76, 0.17, x, -0.04, -0.84, materials.metal);
  addBox(panel, `upper-clamp-block-${idx + 1}`, 0.36, 0.18, 0.22, x, 1.94, -0.92, materials.bolt);
  addBox(panel, `lower-clamp-block-${idx + 1}`, 0.36, 0.18, 0.22, x, -2.03, -0.92, materials.bolt);
  addScrewGroup(panel, x, 1.94, -0.78, `upper-clamp-${idx + 1}`);
  addScrewGroup(panel, x, -2.03, -0.78, `lower-clamp-${idx + 1}`);
});
// Rear diagonal braces were removed from the panel plane because their projected silhouette was the persistent face artifact.
addBox(panel, 'rear-centre-mounting-plate', 0.95, 0.72, 0.18, 0, -1.15, -1.02, materials.metal);
addScrewGroup(panel, -0.26, -0.94, -0.88, 'centre-mounting-upper-left');
addScrewGroup(panel, 0.26, -1.36, -0.88, 'centre-mounting-lower-right');

addBox(panel, 'junction-box-main-body', 0.82, 0.48, 0.24, 0, 1.05, -1.02, materials.darkMetal);
addBox(panel, 'junction-box-cover-lip-top', 0.9, 0.05, 0.25, 0, 1.27, -1.16, materials.wire);
addBox(panel, 'junction-box-cover-lip-mid', 0.88, 0.04, 0.25, 0, 1.05, -1.16, materials.wire);
addBox(panel, 'junction-box-cover-lip-bottom', 0.9, 0.05, 0.25, 0, 0.83, -1.16, materials.wire);
addCylinder(panel, 'junction-left-cable-gland', 0.055, 0.2, -0.18, 0.76, -1.14, materials.metal, [Math.PI / 2, 0, 0], 18);
addCylinder(panel, 'junction-right-cable-gland', 0.055, 0.2, 0.18, 0.76, -1.14, materials.metal, [Math.PI / 2, 0, 0], 18);

function makeCable(name, xOffset, side = 1) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(xOffset, 0.8, -1.18),
    new THREE.Vector3(xOffset + side * 0.18, 0.5, -1.28),
    new THREE.Vector3(xOffset + side * 0.78, 0.02, -1.34),
    new THREE.Vector3(xOffset + side * 1.56, -0.58, -1.22),
    new THREE.Vector3(xOffset + side * 2.55, -1.02, -1.06)
  ]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 54, 0.026, 8, false), materials.cable);
  tube.name = name;
  tube.castShadow = true;
  panel.add(tube);
  addCylinder(panel, `${name}-connector`, 0.047, 0.18, xOffset + side * 2.55, -1.02, -1.06, materials.darkMetal, [Math.PI / 2, 0, 0], 16);
}
makeCable('left-output-cable', -0.18, -1);
makeCable('right-output-cable', 0.18, 1);

[-3.6, -2.0, -0.72, 0.72, 2.0, 3.6].forEach((x, idx) => {
  addBox(panel, `underside-standoff-tab-${idx + 1}`, 0.22, 0.18, 0.18, x, -H / 2 - 0.23, -0.66, materials.metal, [0.12, 0, 0]);
});
addBox(panel, 'inner-frame-rib-left', 0.05, H * 0.94, 0.08, -W / 2 + 0.17, 0, -0.18, materials.wire);
addBox(panel, 'inner-frame-rib-right', 0.05, H * 0.94, 0.08, W / 2 - 0.17, 0, -0.18, materials.wire);
addBox(panel, 'inner-frame-rib-top', W * 0.95, 0.05, 0.08, 0, H / 2 - 0.17, -0.18, materials.wire);
addBox(panel, 'inner-frame-rib-bottom', W * 0.95, 0.05, 0.08, 0, -H / 2 + 0.17, -0.18, materials.wire);

const support = new THREE.Group();
support.name = 'taller-reference-proportion-post-base-and-safe-rear-brackets';
support.position.z = -1.05;
root.add(support);
addBox(support, 'base-plate-lower-transparent', 3.0, 0.18, 1.95, 0, -2.18, 0, materials.metal);
addBox(support, 'base-plate-upper-transparent', 2.3, 0.14, 1.42, 0, -1.97, 0, materials.frame);
addBox(support, 'base-inner-riser', 1.35, 0.18, 0.82, 0, -1.77, 0, materials.darkMetal);
addBox(support, 'central-rectangular-post', 0.68, 3.7, 0.68, 0, 0.05, -0.08, materials.metal);
addBox(support, 'post-inner-front-line', 0.02, 3.7, 0.7, -0.24, 0.05, 0.26, materials.wire);
addBox(support, 'post-inner-rear-line', 0.02, 3.7, 0.7, 0.24, 0.05, -0.42, materials.wire);
addBox(support, 'top-mounting-head', 1.16, 0.48, 0.44, 0, 1.92, -0.55, materials.metal);
// Support braces are kept below/behind the module so they cannot project onto the active cell face.
addBox(support, 'safe-left-rear-bracket', 0.1, 1.58, 0.13, -1.05, 0.75, -0.98, materials.metal, [0.14, 0, -0.34]);
addBox(support, 'safe-right-rear-bracket', 0.1, 1.58, 0.13, 1.05, 0.75, -0.98, materials.metal, [0.14, 0, 0.34]);
[-1.05, 1.05].forEach(x => [-0.64, 0.64].forEach((z, i) => {
  addCylinder(support, `base-corner-bolt-${x}-${i}`, 0.058, 0.06, x, -1.76, z, materials.bolt, [Math.PI / 2, 0, 0], 24);
  addCylinder(support, `base-corner-washer-${x}-${i}`, 0.095, 0.018, x, -1.745, z, materials.wire, [Math.PI / 2, 0, 0], 24);
}));

const grid = new THREE.GridHelper(36, 72, 0x66818d, 0x182229);
grid.position.y = -2.28;
grid.material.transparent = true;
grid.material.opacity = 0.52;
scene.add(grid);

scene.add(new THREE.AmbientLight(0xc7e7ff, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 2.45);
key.position.set(4.2, 7.4, 6.8);
key.castShadow = true;
scene.add(key);
const rim = new THREE.PointLight(0xd2f1ff, 2.25, 18, 1.8);
rim.position.set(-5.7, 3.2, -4.8);
scene.add(rim);
const soft = new THREE.PointLight(0xffffff, 0.76, 20, 2.2);
soft.position.set(2.8, 2.4, 5.2);
scene.add(soft);

const keyframes = [
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
  camera.lookAt(0, 0.75, 0);
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
  camera.position.set(lerp(a.pos[0], b.pos[0], f), lerp(a.pos[1], b.pos[1], f), lerp(a.pos[2], b.pos[2], f));
  root.rotation.set(lerp(a.rot[0], b.rot[0], f), lerp(a.rot[1], b.rot[1], f), lerp(a.rot[2], b.rot[2], f));
  camera.lookAt(0, 0.75, 0);
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
  targetRotY += dx * 0.006;
  targetRotX += dy * 0.0034;
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
    if (autoRotateInput.checked && !reducedMotion) targetRotY += 0.0022;
    root.rotation.x += (targetRotX - root.rotation.x) * 0.075;
    root.rotation.y += (targetRotY - root.rotation.y) * 0.075;
    root.rotation.z += (targetRotZ - root.rotation.z) * 0.075;
    camera.lookAt(0, 0.75, 0);
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
