# Event Horizon

An offline light-bending puzzle with eight chambers. Open `index.html` directly in a browser, or serve it from a static server. It has no external assets, dependencies or build step.

## Controls

Aim by dragging on the field, moving the angle slider, or using the minus and plus buttons. With the field focused, left and right arrows change the angle by one degree; Shift changes the step to a tenth of a degree. Press Space or Enter to release light. The **Release light** button works with touch and keyboard.

R resets the current chamber when the field or a button has focus. The **Reset** button works from any input mode. Reset clears attempts and paths but keeps chambers solved during the current visit. Choose any chamber from the selector; none is locked. The next-chamber button appears after a successful connection. Solved progress is held for this page visit only.

Aim for the gold detector. Touching a dark core or a pale barrier ends the path. A faint previous path helps with the next adjustment. Earlier chambers introduce a single well, later ones add multiple wells, barriers and smaller detectors. These are geometric difficulty choices, not play-tested difficulty ratings.

## Bending model

The field uses a 720 by 540 coordinate system. A path advances two units per step at constant speed. Each well contributes a turn towards its centre proportional to the cross product of the direction and the displacement to the well, divided by the softened distance cubed. The softening length is 28 units; the total turn is capped at 0.065 radians per step. A path stops at a core, barrier, detector, field boundary or the 2,200-step limit.

Segment-to-circle distance tests detect cores and detectors. A segment-to-rectangle test detects barriers, including thin ones between sample points. Geometry is computed before animation, so display frame rate does not alter the result. Reduced motion shows the complete path immediately. The model is a visual illustration, not real gravitational optics or a simulation of black-hole physics.

The page is designed to fit a 390 px viewport. Slider and buttons offer an alternative to precise canvas gestures. Actual browser layout and physical touch input remain subject to review. The spatial puzzle does not have a complete non-visual equivalent.

## Checks

Run in your terminal:

```sh
node tests/check.cjs
```

Run from this game folder. The test parses the shipped inline script, validates level geometry, checks a recorded successful angle for every level and verifies that each recorded angle fails without bending. It also covers core and barrier collisions, all integer angles in the allowed range, bounded paths, a zero-pull mutation and simulated UI controls. Recorded angles are in `tests/solutions.json`; reading them reveals solutions.

The check uses only Node built-ins. Its DOM and canvas mocks verify control flow, not rendered pixels or device input. No browser or physical-device play test is implied.

## Credits

Made with OpenAI GPT-6 (Astra) for NM AI Research.

Code, level data and canvas visuals are original to this game.
