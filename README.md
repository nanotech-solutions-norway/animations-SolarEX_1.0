# animations-SolarEX_1.0

Interactive SolarEX website animation prototype implemented as native browser code.

## Delivered scope

- Autoplay intro sequence using seven numbered technical SolarEX frames.
- Final frame remains as the resting visual basis after the intro.
- Hero text, CTA controls, telemetry cards and graph remain hidden during intro and reveal only after completion.
- CSS 3D solar-panel surface with click-hold drag, pointer tilt, touch drag and inertial easing.
- Persistent parent-container pointer listeners with one animation state machine: `loading → intro → ready → dragging → inertia`.
- Dark technical stage with HUD corners, scan sweep, ambient grid, particles, data rings and highlighted panel-cell state.
- Animation stack declared for next implementation stage through dependencies: GSAP, Three.js, Rive, dotLottie and PixiJS.
- Quartz SiO₂ and Titan TiO₂ mechanism visuals with claim-control discipline.
- Reduced-motion fallback, accessible labels, responsive layout and no public secrets.

## Current implementation note

The current committed version is a static GitHub Pages-compatible implementation in `index.html`. It uses native HTML/CSS/JavaScript for the first-pass animation and declares GSAP, Three.js, Rive, dotLottie, PixiJS and Vite in `package.json` for the next modular runtime upgrade.

## Local validation

```bash
npm install
npm run dev
npm run build
```

For the current static page, opening `index.html` directly is also sufficient for a visual smoke test.

## Manual QA

1. Confirm intro completes in 3–5 seconds.
2. Confirm text, buttons and graph are hidden during intro.
3. Confirm final visual stays visible after intro.
4. Confirm mouse drag, touch drag and repeated drag cycles continue working after resize and tab switching.
5. Confirm reduced-motion mode avoids high-speed motion.
6. Confirm graph labels remain contextual and do not state universal performance guarantees.
