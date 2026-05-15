// Make it globally accessible so script.js can trigger it
window.playOverviewAnimations = function () {
    // Fallback: Check if anime is loaded
    if (typeof anime === 'undefined') {
        console.error("Anime.js not loaded!");
        return;
    }

    // PREPARE STATES (Hide elements specifically for animation)
    anime.set('.stagger-text .letter', { opacity: 0, translateY: 50 });
    anime.set('.fade-in', { opacity: 0, translateY: 20 });
    anime.set('.kinetic-card', { opacity: 0, translateX: 50 }); // Reduced distance

    // 1. Staggered Name Reveal
    anime({
        targets: '.stagger-text .letter',
        translateY: [50, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: anime.stagger(50, { start: 100 })
    });

    // 2. Fade In Badges & Bio
    anime({
        targets: '.fade-in',
        translateY: [20, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 800,
        delay: anime.stagger(200, { start: 600 })
    });

    // 3. Kinetic Cards Entrance 
    anime({
        targets: '.kinetic-card',
        translateX: [50, 0],
        opacity: [0, 1],
        easing: 'easeOutCubic',
        duration: 800,
        delay: anime.stagger(100, { start: 800 })
    });
};
