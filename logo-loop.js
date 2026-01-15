/**
 * LogoLoop - Vanilla JS Implementation
 * Handles infinite scrolling marquee with easing and resize observer
 */
class LogoLoop {
    constructor(container, options = {}) {
        this.container = container;
        this.track = container.querySelector('.logoloop__track');
        this.list = container.querySelector('.logoloop__list');

        this.speed = options.speed || 80;
        this.pauseOnHover = options.pauseOnHover !== false;

        this.offset = 0;
        this.velocity = this.speed;
        this.lastTimestamp = null;
        this.isHovered = false;
        this.rafId = null;

        this.init();
    }

    init() {
        // Clone lists to ensure seamless looping
        this.updateClones();

        // Resize Observer
        this.resizeObserver = new ResizeObserver(() => this.updateClones());
        this.resizeObserver.observe(this.container);

        // Hover events
        if (this.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.isHovered = true);
            this.container.addEventListener('mouseleave', () => this.isHovered = false);
        }

        // Start animation
        this.rafId = requestAnimationFrame((t) => this.animate(t));
    }

    updateClones() {
        const containerWidth = this.container.clientWidth;
        const listWidth = this.list.offsetWidth;

        if (listWidth === 0) return;

        // Clear existing clones (except the first one)
        const lists = this.track.querySelectorAll('.logoloop__list');
        lists.forEach((list, index) => {
            if (index > 0) list.remove();
        });

        // Calculate needed copies
        const copiesNeeded = Math.ceil(containerWidth / listWidth) + 1;
        for (let i = 0; i < copiesNeeded; i++) {
            const clone = this.list.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            this.track.appendChild(clone);
        }

        this.listWidth = listWidth;
    }

    animate(timestamp) {
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Easing for smooth start/stop
        const targetVelocity = this.isHovered ? 0 : this.speed;
        const easing = 1 - Math.exp(-deltaTime / 0.25);
        this.velocity += (targetVelocity - this.velocity) * easing;

        if (this.listWidth > 0) {
            this.offset += this.velocity * deltaTime;
            this.offset %= this.listWidth;

            this.track.style.transform = `translate3d(${-this.offset}px, 0, 0)`;
        }

        this.rafId = requestAnimationFrame((t) => this.animate(t));
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }
}

// Initialize on load
window.addEventListener('load', () => {
    const loops = document.querySelectorAll('.logoloop');
    loops.forEach(loop => new LogoLoop(loop));
});
