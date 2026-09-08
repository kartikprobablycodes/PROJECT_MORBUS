/**
 * MORBUS 3D Engine - Three.js Scene Controller
 * Centered DNA Double Helix + Orbital Condition Cards + Fluid GLSL Particles
 */

class MorbusScene {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Groups
    this.dnaGroup = null;
    this.cardsGroup = null;
    this.particleMesh = null;

    // Condition Data
    this.conditions = [
      {
        id: 'autism',
        index: '01',
        title: 'AUTISM SPECTRUM',
        tagline: 'Sensory Perception & Unique Cognitive Processing',
        dnaBase: 'CYTOSINE-GUANINE CLUSTER',
        url: 'autism.html',
        color: '#80f0f6'
      },
      {
        id: 'adhd',
        index: '02',
        title: 'ADHD SPECTRUM',
        tagline: 'Kinetic Momentum & Hyperfocus Dynamics',
        dnaBase: 'DOPAMINE-RECEPTOR D4',
        url: 'adhd.html',
        color: '#38bdf8'
      },
      {
        id: 'down-syndrome',
        index: '03',
        title: 'DOWN SYNDROME',
        tagline: 'Trisomy 21 & Radical Emotional Authenticity',
        dnaBase: 'CHROMOSOME 21 TRIPLICATION',
        url: 'down-syndrome.html',
        color: '#00d4ff'
      },
      {
        id: 'bipolar',
        index: '04',
        title: 'BIPOLAR DIVERSITY',
        tagline: 'Neurochemical Tides & High-Intensity Empathy',
        dnaBase: 'SEROTONIN TRANSMISSION HELIX',
        url: 'bipolar.html',
        color: '#60a5fa'
      },
      {
        id: 'tourette',
        index: '05',
        title: 'TOURETTE SYNDROME',
        tagline: 'Involuntary Neural Sparks & Premonitory Urges',
        dnaBase: 'BASAL GANGLIA CIRCUITRY',
        url: 'tourette.html',
        color: '#22d3ee'
      }
    ];

    this.cardMeshes = [];
    this.cardMaterials = [];
    this.activeCardIndex = 0;
    this.hoveredCard = null;

    // Mouse & Scroll State
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.raycaster = new THREE.Raycaster();
    this.isWarping = false;

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000208, 0.035);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 13.5);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.8);
    this.scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x00f3ff, 3.5, 30);
    cyanPointLight.position.set(0, 4, 6);
    this.scene.add(cyanPointLight);

    const deepBlueLight = new THREE.PointLight(0x0051ff, 2.5, 25);
    deepBlueLight.position.set(0, -5, -4);
    this.scene.add(deepBlueLight);

    // 5. Construct Scene Geometry
    this.createDnaHelix();
    this.createFluidParticles();
    this.createOrbitalCards();

    // 6. Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: true });
    window.addEventListener('scroll', this.onWindowScroll.bind(this), { passive: true });
    window.addEventListener('click', this.onClick.bind(this));

    // 7. Start Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createDnaHelix() {
    this.dnaGroup = new THREE.Group();
    this.scene.add(this.dnaGroup);

    const numRungs = 72;
    const helixHeight = 28;
    const helixRadius = 1.85;
    const turns = 3.5;

    // Custom shader material for luminous DNA strands
    this.dnaMaterial = new THREE.ShaderMaterial({
      vertexShader: window.MorbusShaders.dnaVertexShader,
      fragmentShader: window.MorbusShaders.dnaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x00f3ff) }, // Cyan
        uColorB: { value: new THREE.Color(0x0055ff) }  // Royal Blue
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const sphereGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const rungCylinderGeo = new THREE.CylinderGeometry(0.045, 0.045, helixRadius * 2, 12);
    rungCylinderGeo.rotateZ(Math.PI / 2);

    const strand1Points = [];
    const strand2Points = [];

    for (let i = 0; i < numRungs; i++) {
      const t = i / (numRungs - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * helixHeight;

      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;

      strand1Points.push(new THREE.Vector3(x1, y, z1));
      strand2Points.push(new THREE.Vector3(x2, y, z2));

      // Node Spheres (Phosphodiester Backbones)
      const sphere1 = new THREE.Mesh(sphereGeo, this.dnaMaterial);
      sphere1.position.set(x1, y, z1);
      this.dnaGroup.add(sphere1);

      const sphere2 = new THREE.Mesh(sphereGeo, this.dnaMaterial);
      sphere2.position.set(x2, y, z2);
      this.dnaGroup.add(sphere2);

      // Connecting Base Pair Rung
      if (i % 2 === 0) {
        const rung = new THREE.Mesh(rungCylinderGeo, this.dnaMaterial);
        rung.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
        rung.rotation.y = -angle;
        this.dnaGroup.add(rung);

        // Core Hydrogen bond sphere in center of rung
        const bondCore = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), this.dnaMaterial);
        bondCore.position.set(0, y, 0);
        this.dnaGroup.add(bondCore);
      }
    }

    // Continuous smooth spine tubes along both strands
    const curve1 = new THREE.CatmullRomCurve3(strand1Points);
    const curve2 = new THREE.CatmullRomCurve3(strand2Points);

    const tubeGeo1 = new THREE.TubeGeometry(curve1, 140, 0.06, 8, false);
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 140, 0.06, 8, false);

    const spineMesh1 = new THREE.Mesh(tubeGeo1, this.dnaMaterial);
    const spineMesh2 = new THREE.Mesh(tubeGeo2, this.dnaMaterial);

    this.dnaGroup.add(spineMesh1);
    this.dnaGroup.add(spineMesh2);

    // Initial position
    this.dnaGroup.position.set(0, 0, 0);
  }

  createFluidParticles() {
    const particleCount = 3600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Cylinder distribution around DNA helix
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 8.5;
      const y = (Math.random() - 0.5) * 32;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      scales[i] = 0.4 + Math.random() * 0.9;

      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: window.MorbusShaders.particleVertexShader,
      fragmentShader: window.MorbusShaders.particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScrollProgress: { value: 0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particleMesh = new THREE.Points(geometry, this.particleMaterial);
    this.scene.add(this.particleMesh);
  }

  createCardTexture(condition) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');

    // Deep high-tech active theory background
    ctx.fillStyle = '#020713';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle technical grid pattern
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Border Frame
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.45)';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Corner crosshairs
    const drawCross = (x, y) => {
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 15, y);
      ctx.lineTo(x + 15, y);
      ctx.moveTo(x, y - 15);
      ctx.lineTo(x, y + 15);
      ctx.stroke();
    };
    drawCross(60, 60);
    drawCross(canvas.width - 60, 60);
    drawCross(60, canvas.height - 60);
    drawCross(canvas.width - 60, canvas.height - 60);

    // Header index
    ctx.font = '700 32px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#00f3ff';
    ctx.fillText(`LOCUS // ${condition.index}`, 75, 110);

    ctx.font = '400 22px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
    ctx.fillText(`SYSTEM ID: NX-${1024 + parseInt(condition.index) * 87}`, canvas.width - 320, 110);

    // Horizontal divider
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 140);
    ctx.lineTo(canvas.width - 75, 140);
    ctx.stroke();

    // Central DNA base badge
    ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
    ctx.fillRect(75, 180, canvas.width - 150, 48);
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`DNA ANCHOR: [ ${condition.dnaBase} ]`, 95, 212);

    // Main Title
    ctx.font = '800 68px "Syne", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(condition.title, 75, 340);

    // Subtitle / Tagline
    ctx.font = '400 30px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const words = condition.tagline.split(' ');
    let line = '';
    let curY = 410;
    for (let w = 0; w < words.length; w++) {
      const testLine = line + words[w] + ' ';
      if (ctx.measureText(testLine).width > canvas.width - 160) {
        ctx.fillText(line, 75, curY);
        line = words[w] + ' ';
        curY += 44;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 75, curY);

    // Decorative Graphic Ring / Pulse
    const centerX = canvas.width / 2;
    const centerY = 780;
    const grad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 220);
    grad.addColorStop(0, 'rgba(0, 243, 255, 0.25)');
    grad.addColorStop(0.7, 'rgba(0, 81, 255, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 220, 0, Math.PI * 2);
    ctx.fill();

    // Concentric orbital rings
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center icon text
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00f3ff';
    ctx.textAlign = 'center';
    ctx.fillText('EMPATHY LOCUS', centerX, centerY + 8);
    ctx.textAlign = 'left';

    // Interactive CTA Box at bottom
    ctx.fillStyle = '#00f3ff';
    ctx.fillRect(75, canvas.height - 210, canvas.width - 150, 95);

    ctx.font = '800 32px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('EXPLORE PERSPECTIVE  →', 110, canvas.height - 150);

    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillText('ENTER DEEP PAGE & REFLECTION', 110, canvas.height - 122);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  createOrbitalCards() {
    this.cardsGroup = new THREE.Group();
    this.scene.add(this.cardsGroup);

    const cardGeometry = new THREE.PlaneGeometry(3.3, 4.5, 32, 32);

    this.conditions.forEach((condition, idx) => {
      const texture = this.createCardTexture(condition);

      const material = new THREE.ShaderMaterial({
        vertexShader: window.MorbusShaders.cardVertexShader,
        fragmentShader: window.MorbusShaders.cardFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uEdgeColor: { value: new THREE.Color(0x00f3ff) },
          uMap: { value: texture }
        },
        transparent: true,
        side: THREE.DoubleSide
      });

      // Combine shader with basic diffuse map using standard material for crystal crisp text
      const meshMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.96,
        roughness: 0.15,
        metalness: 0.85,
        emissive: new THREE.Color(0x002244),
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(cardGeometry, meshMaterial);
      mesh.userData = {
        index: idx,
        condition: condition,
        baseAngle: (idx / this.conditions.length) * Math.PI * 2,
        baseY: (2 - idx) * 3.8
      };

      this.cardMeshes.push(mesh);
      this.cardMaterials.push(material);
      this.cardsGroup.add(mesh);
    });

    this.updateCardPositions(0);
  }

  updateCardPositions(progress) {
    // Progress goes from 0.0 to 1.0 based on page scroll
    const totalCards = this.conditions.length;
    const currentFloatIndex = progress * (totalCards - 1);

    this.cardMeshes.forEach((mesh, idx) => {
      const diff = idx - currentFloatIndex;

      // Position cards on a 3D orbital curve around the DNA strand
      // The currently focused card comes straight to the front (Z = 6.2, X = 0, Y = 0)
      const angle = diff * 0.95;
      const radius = 5.2 + Math.abs(diff) * 1.8;

      const targetX = Math.sin(angle) * radius;
      const targetZ = 6.2 - Math.abs(diff) * 3.6;
      const targetY = -diff * 2.8;

      // Smooth lerp
      mesh.position.x += (targetX - mesh.position.x) * 0.15;
      mesh.position.y += (targetY - mesh.position.y) * 0.15;
      mesh.position.z += (targetZ - mesh.position.z) * 0.15;

      // Face the camera with slight angle
      const targetRotY = -angle * 0.65;
      const targetRotX = diff * 0.08;
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.15;
      mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.15;

      // Opacity / Depth fade
      const distFromCenter = Math.abs(diff);
      const targetScale = Math.max(0.65, 1.0 - distFromCenter * 0.22);
      mesh.scale.set(targetScale, targetScale, targetScale);

      mesh.material.opacity = Math.max(0.2, 1.0 - distFromCenter * 0.45);
    });

    // Update active index
    const roundedIndex = Math.min(Math.max(Math.round(currentFloatIndex), 0), totalCards - 1);
    if (roundedIndex !== this.activeCardIndex) {
      this.activeCardIndex = roundedIndex;
      this.onCardFocusChange(roundedIndex);
    }
  }

  onCardFocusChange(index) {
    // Notify DOM HUD
    if (window.onMorbusCardChanged) {
      window.onMorbusCardChanged(this.conditions[index], index);
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMouseMove(e) {
    // Normalized device coordinates (-1 to +1)
    this.targetMouse.x = (e.clientX / this.width) * 2 - 1;
    this.targetMouse.y = -(e.clientY / this.height) * 2 + 1;

    // Raycast against cards
    this.raycaster.setFromCamera(this.targetMouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (this.hoveredCard !== hit) {
        this.hoveredCard = hit;
        document.body.style.cursor = 'pointer';
        if (window.morbusAudio) {
          window.morbusAudio.playCardHover();
        }
      }
    } else {
      if (this.hoveredCard) {
        this.hoveredCard = null;
        document.body.style.cursor = 'default';
      }
    }
  }

  onWheel(e) {
    if (window.morbusAudio) {
      window.morbusAudio.playScrollTick(Math.abs(e.deltaY));
    }
  }

  onWindowScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      this.targetScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    }
  }

  onClick(e) {
    if (this.isWarping) return;

    // Ensure audio starts on first user click
    if (window.morbusAudio) {
      window.morbusAudio.ensureStarted();
    }

    this.raycaster.setFromCamera(this.targetMouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardMeshes);

    if (intersects.length > 0) {
      const hitCard = intersects[0].object;
      this.warpIntoCard(hitCard.userData.condition);
    }
  }

  warpIntoCard(condition) {
    this.isWarping = true;
    if (window.morbusAudio) {
      window.morbusAudio.playCardWarp();
    }

    // Active Theory warp flash effect
    const flashOverlay = document.getElementById('warp-flash');
    if (flashOverlay) {
      flashOverlay.classList.add('active');
    }

    // Smooth camera dive forward
    if (window.gsap) {
      gsap.to(this.camera.position, {
        z: 4.5,
        duration: 0.85,
        ease: 'power3.in',
        onComplete: () => {
          window.location.href = condition.url;
        }
      });
      gsap.to(this.camera.rotation, {
        z: 0.15,
        duration: 0.85,
        ease: 'power3.in'
      });
    } else {
      setTimeout(() => {
        window.location.href = condition.url;
      }, 750);
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth lerp mouse & scroll
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.12;

    // 1. DNA Strand Dynamic Rotation on Scroll & Time
    if (this.dnaGroup) {
      // Continuous slow majestic idle rotation + rapid responsive scroll spin
      this.dnaGroup.rotation.y = elapsedTime * 0.35 + this.scrollProgress * Math.PI * 4.2;
      this.dnaGroup.position.y = -this.scrollProgress * 4.0;

      // Update shader uniforms
      if (this.dnaMaterial) {
        this.dnaMaterial.uniforms.uTime.value = elapsedTime;
      }
    }

    // 2. Fluid Particle Cloud Update
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uTime.value = elapsedTime;
      this.particleMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
      this.particleMaterial.uniforms.uScrollProgress.value = this.scrollProgress;
    }

    // 3. Update Orbital Cards
    this.updateCardPositions(this.scrollProgress);

    // 4. Parallax Camera motion based on mouse
    if (!this.isWarping) {
      this.camera.position.x = this.mouse.x * 0.85;
      this.camera.position.y = this.mouse.y * 0.65;
      this.camera.lookAt(0, 0, 0);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global hook
window.initMorbusScene = () => {
  window.morbusScene = new MorbusScene();
};
