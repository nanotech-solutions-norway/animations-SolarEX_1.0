# SolarEX Intro Animation

Implementation folder for the SolarEX intro animation.

## Image assets required

Upload the supplied image files manually to:

`Intro/assets/images/`

Required filenames:

- `Intro_001.png`
- `Intro_002.png`
- `Intro_003.jpg`

The animation uses these files as fixed image layers and does not recreate the scenes as 3D models.

## Runtime behavior

- First frame: `Intro_001.png` shown exactly as supplied.
- Transition 1: scanning beam across `Intro_001.png`, then controlled fade into `Intro_002.png`.
- Transition 2: scanning beam across `Intro_002.png`, then controlled fade into `Intro_003.jpg`.
- Final frame: `Intro_003.jpg` remains visible with the four red selected sections illuminated.
- Total runtime: approximately 4.8 seconds.
- Reduced-motion fallback: shows the final selected image state without motion.
