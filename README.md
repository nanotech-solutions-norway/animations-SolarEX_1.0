# animations-SolarEX_1.0

Interactive SolarEX website animation prototype implemented as native browser code.

## Delivered scope

- Autoplay intro sequence using seven numbered technical SolarEX frames.
- Final frame remains as the resting visual basis after the intro.
- Hero text, CTA controls, telemetry cards and graph remain hidden during intro and reveal only after completion.
- Three.js solar-panel surface with click-hold drag, pointer tilt, touch drag and inertial easing.
- Persistent parent-container pointer listeners with one animation state machine: `loading → intro → ready → dragging → inertia`.
- GSAP sequencing and reveal choreography.
- Animation stack enabled through dependencies: GSAP, Three.js, Rive, dotLottie and PixiJS.
- Quartz SiO₂ and Titan TiO₂ mechanism visuals with claim-control discipline.
- Reduced-motion fallback, accessible labels, responsive layout and no public secrets.

## Local validation

```bash
npm install
npm run dev
npm run build
```

## Manual QA

1. Confirm intro completes in 3–5 seconds.
2. Confirm text, buttons and graph are hidden during intro.
3. Confirm final visual stays visible after intro.
4. Confirm mouse drag, touch drag and repeated drag cycles continue working after resize and tab switching.
5. Confirm reduced-motion mode avoids high-speed motion.
6. Confirm graph labels remain contextual and do not state universal performance guarantees.
