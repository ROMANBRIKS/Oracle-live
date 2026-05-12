# Glassmorphism UI Implementation Plan

This document tracks the changes made to implement the "Glassmorphism + Neumorphism Hybrid" UI. 

## Current Status
- [x] Define CSS Theme Variables in `src/index.css`
- [x] Implement Crystal Clear Utility Classes (`.crystal-glass`, `.crystal-button`, `.crystal-pill`)
- [x] **Diamond Cut Phase**: Increased thickness with asymmetrical light physics.
- [x] **3D Slab Evolution**: Implemented 360-degree rim lighting and internal refractive "walls" to simulate a thick physical glass block standing out from the screen.
- [x] **Sea Blue Dispersion**: Added cyan internal glows to match the high-end crystal blend from reference images.
- [x] **Total Clarity**: Removed all blur and background opacity for a 100% see-through crystal effect.
- [x] Applied to Main Navigation (`src/App.tsx`)
- [x] Applied to Live Streaming Controls (`src/pages/Live.jsx`)
- [x] Replaced all standard pink buttons with Crystal/Cyan theme to match the reference.

## Reversion Steps
To reverse these changes:
1. Remove the custom `@utility` blocks from `src/index.css`.
2. Remove the `.crystal-*` classes from the components.
3. Revert `src/App.tsx` and `src/pages/Live.jsx` to their previous state.

## Future UI Tasks
- [ ] Redesign the UI
- [ ] Modify the design
- [ ] Modify the designs

## Data & Infrastructure Rules (CRITICAL)
- [ ] NO FULL RECORDING: We do NOT record entire streams. Save only short user-initiated clips (10-15 seconds).
- [ ] CLIP OVER REPLAY: The "Replay" system is now a "Clips" system.

## Notes on the Design
- **Crystal-Glass (Diamond Cut)**: `border: 7px solid white/80; inset shadow: 14px bevel; blur: 5px; center-opacity: 0.5%;`
- **Volume**: Massive 120px outer shadow and 20px primary light hit (bevel).
- **Refraction**: Minimal blur to ensure objects behind the glass are "crystal clear".
