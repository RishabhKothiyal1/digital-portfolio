/**
 * Three.js Hero Animation - "Cyber-Teal" Abstract Soul
 * Interactive morphed wireframe sphere for the cover slide.
 */

class ThreeHero {
    constructor() {
        this.container = document.getElementById('three-hero-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;

        // Abstract Geometry
        this.geometry = new THREE.IcosahedronGeometry(2, 64);

        // Custom Material with displacement logic in vertex shader if we had access to shaders, 
        // but for robustness in vanilla JS Three.js, we'll use a standard Wireframe with noise-like math in update loop
        // Or better, use a MeshStandardMaterial with high wireframe and emissive.
        this.material = new THREE.MeshStandardMaterial({
            color: 0x4FD1C5, // Teal Accent
            wireframe: true,
            transparent: true,
            opacity: 0.4,
            emissive: 0x4FD1C5,
            emissiveIntensity: 0.5
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4FD1C5, 2);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        // Original vertex positions for displacement
        this.originalPositions = this.geometry.attributes.position.array.slice();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.animate();
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 - 1;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Mouse Smoothing
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Subtle Rotation & Parallax
        this.mesh.rotation.y = time * 0.1 + this.mouse.x * 0.2;
        this.mesh.rotation.x = time * 0.05 + this.mouse.y * 0.2;

        // Vertex Displacement (Morphed Effect)
        const positions = this.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalPositions[i];
            const y = this.originalPositions[i + 1];
            const z = this.originalPositions[i + 2];

            // Noise-like deformation
            const noise = Math.sin(x * 1.5 + time) *
                Math.cos(y * 1.5 + time) *
                Math.sin(z * 1.5 + time) * 0.2;

            const ratio = 1 + noise;
            positions[i] = x * ratio;
            positions[i + 1] = y * ratio;
            positions[i + 2] = z * ratio;
        }
        this.geometry.attributes.position.needsUpdate = true;

        // Pulsing Emissive
        this.material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.3;

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize on Load
window.addEventListener('load', () => {
    window.heroAnimation = new ThreeHero();
});
