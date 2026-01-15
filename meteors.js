/**
 * Meteors Effect - Vanilla JS Implementation
 * Dynamically creates meteor elements for a background effect.
 */
class Meteors {
    constructor(container, number = 20) {
        this.container = container;
        this.number = number;
        this.init();
    }

    init() {
        for (let i = 0; i < this.number; i++) {
            const meteor = document.createElement('span');
            meteor.className = 'meteor';

            // Randomize position and animation properties
            const top = Math.floor(Math.random() * 100) + '%';
            const left = Math.floor(Math.random() * 100) + '%';
            const delay = (Math.random() * (0.8 - 0.2) + 0.2).toFixed(2) + 's';
            const duration = Math.floor(Math.random() * (10 - 2) + 2) + 's';

            meteor.style.top = top;
            meteor.style.left = left;
            meteor.style.animationDelay = delay;
            meteor.style.animationDuration = duration;

            this.container.appendChild(meteor);
        }
    }
}

// Initialize on load
window.addEventListener('load', () => {
    const containers = document.querySelectorAll('.meteors-container');
    containers.forEach(container => {
        const count = parseInt(container.getAttribute('data-count')) || 20;
        new Meteors(container, count);
    });
});
