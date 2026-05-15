/**
 * Three.js Global Background Transitions - "Flow State"
 * Reactive 3D field that morphs and shifts based on active slide.
 */

class ThreeBg {
  constructor() {
    this.container = document.getElementById('three-bg-container');
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.currentSlide = 0;
    this.targetRotation = { x: 0.2, y: 0.2 };
    this.currentRotation = { x: 0.2, y: 0.2 };

    this.init();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.z = 20;

    // Create a large morphed plane/field
    this.geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    this.originalPositions = this.geometry.attributes.position.array.slice();

    // Material - Deep Teal Glow
    this.material = new THREE.PointsMaterial({
      color: 0x4FD1C5,
      size: 0.08,
      transparent: true,
      opacity: 0.2,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.rotation.x = -Math.PI / 2.5;
    this.scene.add(this.points);

    window.addEventListener('resize', () => this.onResize());

    this.animate();
  }

  setSlide(index) {
    this.currentSlide = index;
    // Shift rotation and intensity based on slide
    // 0: Cover, 1: Index, 2: Intro, 3: Overview, 4: Certs, 5: Projects, 6: Events, 7: Hobbies
    this.targetRotation.y = index * 0.15;
    this.targetRotation.x = -Math.PI / 2.5 + (index * 0.05);

    // Adjust Opacity for specific pages
    if (index === 0) {
      this.material.opacity = 0.1; // Quieter on cover
    } else if (index === 3 || index === 5) { // Overview / Projects
      this.material.opacity = 0.3; // More intense for the user's specific request
    } else {
      this.material.opacity = 0.2;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Smooth Rotation Transitions
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.02;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.02;

    this.points.rotation.x = this.currentRotation.x;
    this.points.rotation.y = this.currentRotation.y + Math.sin(time * 0.1) * 0.05;

    // Dynamic Wave Morphing
    const positions = this.geometry.attributes.position.array;
    const indexShift = this.currentSlide * 0.5;

    for (let i = 0; i < positions.length; i += 3) {
      const x = this.originalPositions[i];
      const y = this.originalPositions[i + 1];

      // Complex Sine Waves reacting to slide index
      const wave1 = Math.sin(x * 0.1 + time + indexShift) * 2;
      const wave2 = Math.cos(y * 0.1 + time * 0.8 + indexShift) * 2;
      const wave3 = Math.sin((x + y) * 0.05 + time * 1.2) * 1.5;

      positions[i + 2] = wave1 + wave2 + wave3;
    }
    this.geometry.attributes.position.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization
window.addEventListener('load', () => {
  window.threeBg = new ThreeBg();
});
