# SolarEX Interactive 3D Solar Panel Model

Dedicated interactive 3D model built from the uploaded SolarEX animation scene series. The implementation uses a procedural Three.js model rather than a flat video so the panel can be rotated, tilted, paused, and replayed in-browser.

## Scope

- High-detail PV module geometry with glass face, transparent frame, cell grid, busbar texture, highlighted 3 × 3 red cell group, rear rails, crossbars, brackets, central post, base plate, junction box, cables, and technical grid floor.
- Mouse/touch drag rotation and tilt.
- Cinematic playback via the **Play** button.
- Seamless keyframe interpolation using the reordered scene path below.
- Starts and ends on `Animation_scenen_001` by design.

## Scene order

The uploaded scene series has been rearranged into a continuous camera orbit sequence:

1. `Animation_scenen_001` — front-left hero start
2. `Animation_scenen_002` — front approach
3. `Animation_scenen_007` — front low sweep
4. `Animation_scenen_004` — side profile tilt
5. `Animation_scenen_008` — rear-side entry
6. `Animation_scenen_003` — rear engineering view
7. `Animation_scenen_006` — rear alternate view
8. `Animation_scenen_005` — front-side return
9. `Animation_scenen_001` — loop close / endpoint

## Files

- `index.html` — standalone viewer page.
- `src/styles.css` — UI, layout, dark technical background, reduced-motion handling.
- `src/SolarPanelScene.js` — Three.js scene, procedural model, camera keyframes, drag controls, and cinematic playback.
- `model-config.json` — frame order, model metadata, and acceptance controls.

## Usage

Open `interactive-3d-solar-panel/index.html` through GitHub Pages or any static web server. No build step is required.

## Validation controls

- The model must load without a bundler.
- Dragging the model must rotate and tilt the assembly smoothly.
- Play must trigger a complete cinematic rotation.
- The first and final camera keyframes must both reference `Animation_scenen_001`.
- Reduced-motion users should receive a stable, non-aggressive animation experience.
