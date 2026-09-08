# MORBUS // HELIX OF EMPATHY
### An Active Theory-Inspired 3D WebGL Neurodiversity Awareness Experience

> *"In a universe of infinite variation, differences in the human brain are not design flaws—they are the diverse expressions of consciousness itself."*

---

## Overview

**MORBUS: Helix of Empathy** is an avant-garde interactive 3D web experience built with the aesthetic sensibility of **Active Theory** (`activetheory.net`). Designed to dismantle stigmas and foster deep emotional resonance toward neurodivergent and mentally challenged communities, the portal centers around a bioluminescent **3D DNA double helix** in a pitch-black void, encircled by orbital condition tiles that rotate into focus as you scroll.

Clicking any tile card launches a cinematic camera warp that transports you into that condition's dedicated sub-page—rendered in deep black accented with empathetic crimson and red hues—culminating in an interactive **Heart Empathy Reflection Chamber** that prompts you to contemplate, feel, and pledge genuine empathy.

---

## Technical Architecture

### 1. 3D Graphics & WebGL (Three.js)
- **Centered DNA Double Helix**: Real-time procedurally generated double helix featuring Catmull-Rom spline curves, phosphodiester backbones, base pair rungs, and Adenine-Thymine / Cytosine-Guanine hydrogen bond clusters.
- **Orbital 3D Condition Cards**: Metallic, glassmorphic 3D planes floating in cylindrical orbit around the DNA strand that smoothly translate and rotate to face the camera upon scrolling.
- **Raycasting & Spatial Interaction**: Three.js raycasting detects pointer hover, plays harmonic audio cues, and triggers camera warp dives upon selection.

### 2. Particle Systems & GLSL Shaders
- **Fluid Reactive Particle Cloud**: 3,600 luminous particles powered by custom vertex (`MorbusShaders.particleVertexShader`) and fragment (`MorbusShaders.particleFragmentShader`) shaders.
- **Mouse & Noise Dynamics**: Simulates fluid curl noise and interactive pointer repulsion in 3D world space.
- **Bioluminescent DNA Shaders**: Real-time Fresnel glow and traveling light pulses running vertically through the helical strand.

### 3. Audio Integration (Web Audio API Synthesizer)
- **Zero-Dependency Procedural Soundscape**:
  - Deep 55Hz / 73.4Hz ambient sub-bass drone modulated by a low-frequency breathing oscillator (LFO).
  - Celestial pentatonic chimes in D-minor triggered algorithmically with simulated reverb delay loops.
  - Interactive spatial audio triggers:
    - **Card Hover**: Crystalline harmonic chime (D5 to A5 glide).
    - **Scroll**: Subtle fluid granular frequency ticks.
    - **Warp / Selection**: Sub-bass drop (120Hz to 38Hz) + sweeping bandpass laser warp.
    - **Heart Pulse**: Anatomical "lub-dub" heartbeat acoustic pulse.
    - **Empathy Swell**: Emotional Fmaj7 chord resolution upon sealing an empathy pledge.

### 4. Color Palette & Visual Contrast
- **Main Nexus Portal (`index.html`)**:
  - Base: Pure pitch-black void (`#000000`)
  - Accent Palette: Light, calm bioluminescent **cyan and blue** (`#00f3ff`, `#0066ff`, `#38bdf8`)
- **Condition Detail Pages (`autism.html`, `adhd.html`, etc.)**:
  - Base: Pitch-black void (`#000000`)
  - Accent Palette: Empathetic **red, crimson, and rose** (`#ff2a55`, `#e11d48`, `#880825`), evoking the biological human heart, emotional warmth, and vulnerability.

---

## Condition Pages & Lived Experiences

1. **Autism Spectrum (`autism.html`)**:
   - Focus: Sensory processing diversity, monotropic focus, and non-linear social communication.
   - Asset Integration: Interactive **Autism Color Wheel** (`images_800_lktlqftkn5d.jpeg`).
   - Lived Narrative: *"Marcus & The Fluorescent Symphony"*.
   - Interactive Simulator: Sensory Overload Perception Chamber (live adjustments to fluorescent glare, acoustic cacophony, and social demands).
   - Empathy Question: *"When the world feels ten times louder, brighter, and faster than you can bear, what would you need from the person standing beside you?"*

2. **ADHD Spectrum (`adhd.html`)**:
   - Focus: Dopamine regulation, executive dysfunction, and kinetic associative brilliance.
   - Lived Narrative: *"Maya's Kaleidoscope Mind"*.
   - Interactive Simulator: Cognitive Kinetic Velocity Engine (visualizing dopamine depletion vs creative hyperfocus).
   - Empathy Question: *"If your mind ran at the speed of a comet while the world demanded you stand still in neat rows, how would you hope to be understood?"*

3. **Down Syndrome / Trisomy 21 (`down-syndrome.html`)**:
   - Focus: Chromosome 21 connection back to the DNA helix, emotional intelligence, and radical authenticity.
   - Lived Narrative: *"David's Unconditional Light"*.
   - Interactive Radar: Computational Speed vs Authentic Heart Intelligence.
   - Empathy Question: *"In a society obsessed with intellectual calculation and speed, what if pure presence, warmth, and sincerity are the highest forms of intelligence?"*

4. **Bipolar Diversity (`bipolar.html`)**:
   - Focus: Neurochemical tides, circadian desynchrony, and emotional courage.
   - Lived Narrative: *"Elena's Storm and Starlight"*.
   - Interactive Simulator: Affective Neurochemical Tide Waveform (manic supernova vs depressive oceanic void).
   - Empathy Question: *"If the weather inside your chest could shift from blinding sun to endless winter without your permission, how patient would you hope love could be?"*

5. **Tourette Syndrome (`tourette.html`)**:
   - Focus: Basal ganglia motor gating circuitry, premonitory urges, and dismantling stereotypic caricatures.
   - Lived Narrative: *"Julian's Inner Echoes"*.
   - Interactive Simulator: Premonitory Urge Suppression Simulator (experiencing the physical impossibility of holding back a neurological imperative).
   - Empathy Question: *"Imagine your physical body performing an action you never intended, while your conscious mind screams 'stop'. How would you want the strangers around you to look at you?"*

---

## How to Run

### Option 1: One-Click Windows Launcher
Double-click `run.bat` in the project root. It will automatically launch the server and open your browser at:
```
http://localhost:8080
```

### Option 2: PowerShell
Run the included zero-dependency server:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

### Option 3: Direct Browser Launch
You can also open `index.html` directly in modern web browsers (Chrome, Edge, Opera, Firefox).
