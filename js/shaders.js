/**
 * MORBUS GLSL Shaders - Active Theory Aesthetic
 * Custom vertex & fragment shaders for fluid particles, bioluminescent DNA helix, and chromatic glass cards.
 */

window.MorbusShaders = {
  // Fluid Reactive Particle Shaders
  particleVertexShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uScrollProgress;
    
    attribute float aScale;
    attribute vec3 aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec3 pos = position;
      
      // Organic harmonic wave motion
      float noiseX = sin(pos.y * 0.2 + uTime * 0.8 + aRandom.x * 6.28);
      float noiseY = cos(pos.x * 0.2 + uTime * 0.6 + aRandom.y * 6.28);
      float noiseZ = sin(pos.z * 0.2 + uTime * 0.7 + aRandom.z * 6.28);
      
      pos.x += noiseX * 0.35;
      pos.y += noiseY * 0.35;
      pos.z += noiseZ * 0.35;

      // Mouse interactive fluid repulsion
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vec2 mouseDist = worldPos.xy - (uMouse * 14.0);
      float d = length(mouseDist);
      if (d < 5.0) {
        float force = (1.0 - d / 5.0);
        pos.xy += normalize(mouseDist) * force * 1.8;
        pos.z += force * 2.2;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Point size attenuation by depth
      gl_PointSize = (aScale * 38.0) / (-mvPosition.z);

      // Bioluminescent palette (electric cyan to soft deep royal blue)
      vec3 cyanColor = vec3(0.0, 0.95, 1.0);
      vec3 blueColor = vec3(0.05, 0.35, 0.95);
      vec3 whiteGlow = vec3(0.85, 0.98, 1.0);

      float colorMix = sin(pos.y * 0.15 + uTime + aRandom.z * 3.14) * 0.5 + 0.5;
      vec3 finalCol = mix(blueColor, cyanColor, colorMix);
      if (aRandom.x > 0.8) {
        finalCol = mix(finalCol, whiteGlow, 0.6);
      }
      
      vColor = finalCol;
      vAlpha = smoothstep(60.0, 5.0, length(mvPosition.xyz)) * 0.85;
    }
  `,

  particleFragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Soft radial circular particle glow
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Smooth falloff from center with bright core
      float strength = pow(1.0 - (dist * 2.0), 2.2);
      gl_FragColor = vec4(vColor, strength * vAlpha);
    }
  `,

  // DNA Strand Bioluminescent Shader
  dnaVertexShader: `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  dnaFragmentShader: `
    uniform float uTime;
    uniform vec3 uColorA; // #00f3ff
    uniform vec3 uColorB; // #0051ff
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;

    void main() {
      // Fresnel edge glow for organic bioluminescence
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.4);

      // Light pulse traveling up the helix
      float pulse = sin(vPosition.y * 1.8 - uTime * 3.2) * 0.5 + 0.5;
      vec3 baseColor = mix(uColorB, uColorA, pulse);

      // Core illumination + outer rim glow
      vec3 finalColor = baseColor * (0.4 + pulse * 0.6) + vec3(0.4, 0.9, 1.0) * fresnel * 1.4;
      
      gl_FragColor = vec4(finalColor, 0.95);
    }
  `,

  // Holographic Glass Card Shader
  cardVertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  cardFragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uEdgeColor;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

      // Glass border glow
      float edgeX = smoothstep(0.0, 0.035, vUv.x) * smoothstep(1.0, 0.965, vUv.x);
      float edgeY = smoothstep(0.0, 0.045, vUv.y) * smoothstep(1.0, 0.955, vUv.y);
      float border = 1.0 - (edgeX * edgeY);

      // Subtle holographic chromatic sheen across face
      float sheen = sin(vUv.x * 6.0 + vUv.y * 3.0 + uTime * 1.5) * 0.5 + 0.5;
      vec3 glassTint = vec3(0.02, 0.04, 0.08);
      vec3 highlight = mix(uEdgeColor, vec3(0.8, 0.95, 1.0), sheen * 0.4);

      vec3 col = glassTint + highlight * (fresnel * 0.8 + border * 0.9 + uHover * 0.4);
      float alpha = 0.65 + border * 0.35 + uHover * 0.25;

      gl_FragColor = vec4(col, alpha);
    }
  `
};
