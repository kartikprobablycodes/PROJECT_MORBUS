/**
 * MORBUS Sound Engine - Web Audio API Procedural Synthesizer
 * Inspired by Active Theory's ambient generative soundscapes & tactile UI audio feedback.
 * Zero external asset dependencies - 100% synthesized in real time.
 */

class MorbusAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.isPlaying = false;
    this.droneNodes = [];
    this.chimeInterval = null;

    // Pentatonic scale frequencies in D-minor / Celestial calm (D3, F3, G3, A3, C4, D4, F4, A4)
    this.chimeFrequencies = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 440.00, 523.25];

    // Throttle for scroll ticks
    this.lastScrollSound = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Compressor for smooth cinematic mastering
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Sub-busses
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

      // Reverb simulation via delay network
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.28, this.ctx.currentTime);

      this.feedbackGain = this.ctx.createGain();
      this.feedbackGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

      this.filterDelay = this.ctx.createBiquadFilter();
      this.filterDelay.type = 'lowpass';
      this.filterDelay.frequency.setValueAtTime(2200, this.ctx.currentTime);

      // Route delay loop
      this.delayNode.connect(this.filterDelay);
      this.filterDelay.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);
      this.feedbackGain.connect(this.masterGain);

      this.ambientGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.connect(this.delayNode);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this.startAmbientDrone();
    } catch (e) {
      console.warn('Web Audio API not allowed yet or not supported', e);
    }
  }

  ensureStarted() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
  }

  startAmbientDrone() {
    if (!this.ctx) return;

    // Sub Drone 1 (Deep Fundamental 55Hz A1 / 73.4Hz D2)
    const osc1 = this.ctx.createOscillator();
    const osc1Gain = this.ctx.createGain();
    const filter1 = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(73.42, this.ctx.currentTime); // D2

    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(180, this.ctx.currentTime);

    osc1Gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    osc1.connect(filter1);
    filter1.connect(osc1Gain);
    osc1Gain.connect(this.ambientGain);
    osc1.start();
    this.droneNodes.push(osc1);

    // Warm Ethereal Pad 2 (Detuned Saw filtered down for Active Theory aquatic texture)
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const padGain = this.ctx.createGain();
    const padFilter = this.ctx.createBiquadFilter();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3
    osc2.detune.setValueAtTime(-6, this.ctx.currentTime);

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(220.00, this.ctx.currentTime); // A3
    osc3.detune.setValueAtTime(5, this.ctx.currentTime);

    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    padFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    // Subtle LFO modulation on pad filter for breathing organism effect
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.09, this.ctx.currentTime); // very slow breath
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(padFilter.frequency);
    lfo.start();

    padGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    osc2.connect(padFilter);
    osc3.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(this.ambientGain);

    osc2.start();
    osc3.start();
    this.droneNodes.push(osc2, osc3, lfo);

    // Periodic gentle chimes
    this.chimeInterval = setInterval(() => {
      if (this.isPlaying && !this.isMuted && Math.random() > 0.4) {
        this.playAmbientTinkle();
      }
    }, 4200);
  }

  playAmbientTinkle() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const freq = this.chimeFrequencies[Math.floor(Math.random() * this.chimeFrequencies.length)] * 2;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, now);
    filter.Q.setValueAtTime(8, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 2.9);
  }

  // Card Hover: Glass crystalline harmonic sound
  playCardHover() {
    this.ensureStarted();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.18); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now); // D6
    osc2.frequency.exponentialRampToValueAtTime(1760.00, now + 0.22);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  // Scroll Tick: Subtle organic granular sweep
  playScrollTick(velocity = 1) {
    if (!this.ctx || this.isMuted) return;
    const now = performance.now();
    if (now - this.lastScrollSound < 90) return; // throttle
    this.lastScrollSound = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const pitch = 380 + Math.min(velocity * 40, 400);
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.85, t + 0.05);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Card Warp / Click: Cinematic sub drop + laser warp filter sweep
  playCardWarp() {
    this.ensureStarted();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Sub drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.45);

    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.55);

    // Warp filter sweep
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    const sweepFilter = this.ctx.createBiquadFilter();

    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(220, now);

    sweepFilter.type = 'bandpass';
    sweepFilter.frequency.setValueAtTime(400, now);
    sweepFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.35);
    sweepFilter.Q.setValueAtTime(7, now);

    sweepGain.gain.setValueAtTime(0.001, now);
    sweepGain.gain.linearRampToValueAtTime(0.08, now + 0.08);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    sweepOsc.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(this.sfxGain);

    sweepOsc.start(now);
    sweepOsc.stop(now + 0.5);
  }

  // Heart Pulse (for Empathy questions): Lub-Dub heartbeat sound
  playHeartPulse() {
    this.ensureStarted();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Lub (first beat)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(75, t);
    osc1.frequency.exponentialRampToValueAtTime(42, t + 0.12);

    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Dub (second beat, slightly higher and faster)
    const t2 = t + 0.16;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(88, t2);
    osc2.frequency.exponentialRampToValueAtTime(48, t2 + 0.14);

    gain2.gain.setValueAtTime(0.35, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.16);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t2);
    osc2.stop(t2 + 0.18);
  }

  // Empathy Resonance Swell (Triggered when user completes the empathy question)
  playEmpathyResonance() {
    this.ensureStarted();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Warm rich chord: F3, A3, C4, E4 (Fmaj7 - profound heart warmth)
    const chord = [174.61, 220.00, 261.63, 329.63, 523.25];

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.linearRampToValueAtTime(1400, t + 1.2);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.3 + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 4.0);
    });

    // Also trigger heart pulse
    this.playHeartPulse();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.7;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }
}

// Global singleton instance
window.morbusAudio = new MorbusAudioEngine();
