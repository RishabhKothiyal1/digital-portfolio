document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentSlideEl = document.getElementById('current-slide');
    const totalSlidesEl = document.getElementById('total-slides');

    // --- Theme Toggle Logic (Global) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    // Check localStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Save preference
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- Smooth Cursor Logic ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
        let cursorX = 0;
        let cursorY = 0;
        // Current position of outline (for lerping)
        let outlineX = 0;
        let outlineY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${cursorX}px`;
            cursorDot.style.top = `${cursorY}px`;

            // Show if hidden (e.g. on load)
            cursorDot.style.opacity = 1;
            cursorOutline.style.opacity = 1;
        });

        // Animation loop for smooth outline
        const animateCursor = () => {
            // Linear Interpolation (Lerp)
            // Move 15% of the distance towards the target per frame
            const speed = 0.15;

            outlineX += (cursorX - outlineX) * speed;
            outlineY += (cursorY - outlineY) * speed;

            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;

            requestAnimationFrame(animateCursor);
        };

        animateCursor();

        // Add hover effect for clickable elements
        const clickables = document.querySelectorAll('a, button, .folder-trigger, .theme-toggle-btn');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorOutline.style.backgroundColor = 'rgba(128, 128, 128, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    // --- Text Animation Logic ---
    function initTextAnimations() {
        const elements = document.querySelectorAll('.animate-text');
        elements.forEach(el => {
            // Normalize: replace newlines and multiple spaces with a single space
            const text = el.textContent.replace(/\s+/g, ' ').trim();
            if (!text) return;

            el.innerHTML = ''; // Clear text
            el.style.opacity = '1'; // Ensure container is visible

            // Split text into characters
            const chars = [...text];

            chars.forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.classList.add('char-wrapper');
                span.classList.add('animate-blur-in');
                // Stagger delay: 0.03s per char
                span.style.animationDelay = `${index * 0.04}s`;
                el.appendChild(span);
            });
        });
    }

    // Initialize Animations immediately
    initTextAnimations();

    // --- Globe Animation Logic (Cobe) ---
    async function initGlobe() {
        const canvas = document.getElementById("globe-canvas");
        if (!canvas) return;

        try {
            // Dynamic import from CDN
            const { default: createGlobe } = await import('https://cdn.skypack.dev/cobe');

            let phi = 0;

            createGlobe(canvas, {
                devicePixelRatio: 2,
                width: 600 * 2,
                height: 600 * 2,
                phi: 0,
                theta: 0,
                dark: 1,
                diffuse: 1.2,
                mapSamples: 16000,
                mapBrightness: 6,
                baseColor: [0.3, 0.3, 0.3],
                markerColor: [0.1, 0.8, 1],
                glowColor: [1, 1, 1],
                markers: [
                    { location: [28.61, 77.20], size: 0.1 }, // Delhi
                ],
                onRender: (state) => {
                    // Called on every animation frame.
                    state.phi = phi;
                    phi += 0.005;
                },
            });
        } catch (e) {
            console.error("Failed to load globe:", e);
        }
    }

    // Load Globe only when idle or DOM ready
    initGlobe();

    // --- SPA ROUTING LOGIC ---
    const slideSlugs = [
        '/',                // 0: Cover
        '/index',           // 1: Index
        '/introduction',    // 2: Introduction
        '/overview',        // 3: Overview
        '/certifications',  // 4: Certifications
        '/projects',        // 5: Projects
        '/events',          // 6: Events
        '/hobbies'          // 7: Hobbies
    ];

    function getSlugIndex(path) {
        // Normalize path (remove trailing slash)
        path = path.replace(/\/$/, "") || '/';
        // Handle root cases
        if (path === '' || path === '/') return 0;

        // Find exact match
        const index = slideSlugs.indexOf(path);
        return index !== -1 ? index : 0; // Default to cover if not found
    }

    // Initialize Index from URL
    let currentIndex = getSlugIndex(window.location.pathname);
    const totalSlides = slides.length;

    function updateSlide(index, pushToHistory = true) {
        // Bounds check
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        currentIndex = index;

        // Update visual state
        slides.forEach((slide, i) => {
            if (i === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update counters
        currentSlideEl.textContent = currentIndex + 1;

        // Check localStorage for theme
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }

        // --- UPDATE URL ---
        if (pushToHistory) {
            const slug = slideSlugs[currentIndex];
            if (slug) {
                history.pushState({ index: currentIndex }, '', slug);
            }
        }
    }

    // Handle Browser Back/Forward Buttons
    window.addEventListener('popstate', (e) => {
        if (e.state && typeof e.state.index === 'number') {
            updateSlide(e.state.index, false); // Don't push state again
        } else {
            // Fallback if state is missing (e.g. external link)
            updateSlide(getSlugIndex(window.location.pathname), false);
        }
    });

    // Initialize
    totalSlidesEl.textContent = totalSlides;
    // Don't push state on initial load, but replace it to ensure state object exists
    updateSlide(currentIndex, false);
    history.replaceState({ index: currentIndex }, '', slideSlugs[currentIndex]);

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
            updateSlide(currentIndex + 1);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            updateSlide(currentIndex - 1);
        }
    });

    // Cover Page Arrow Navigation
    const coverArrow = document.querySelector('.circle-arrow');
    if (coverArrow) {
        coverArrow.addEventListener('click', () => {
            if (currentIndex < totalSlides - 1) {
                updateSlide(currentIndex + 1);
            }
        });
    }

    // Index Map Navigation
    document.querySelectorAll('.index-list li').forEach(item => {
        item.addEventListener('click', () => {
            const target = parseInt(item.getAttribute('data-target'));
            updateSlide(target);
        });
    });

    // Folder Interaction (Generic for all folders)
    const folders = document.querySelectorAll('.folder-wrapper');
    folders.forEach(folder => {
        const trigger = folder.querySelector('.folder-trigger');
        const closeBtn = folder.querySelector('.close-folder-btn');

        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Optional: Close others? For now, let's allow multiple or just z-index handling. 
                // But modal style usually implies one at a time.
                // Let's close all others first for cleaner UI.
                folders.forEach(f => f.classList.remove('open'));
                folder.classList.add('open');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                folder.classList.remove('open');
            });
        }
    });

    // Close folder when clicking outside (on backdrop/slide)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.folder-content') && !e.target.closest('.folder-trigger')) {
            document.querySelectorAll('.folder-wrapper.open').forEach(f => {
                f.classList.remove('open');
            });
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            if (currentIndex < totalSlides - 1) updateSlide(currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            if (currentIndex > 0) updateSlide(currentIndex - 1);
        }
    });

    // Wheel Navigation (Debounced)
    let isScrolling = false;
    document.addEventListener('wheel', (e) => {
        // DISABLE custom navigation on mobile so native scroll works
        if (window.innerWidth <= 768) return;

        if (isScrolling) return;
        isScrolling = true;

        if (e.deltaY > 0) {
            if (currentIndex < totalSlides - 1) updateSlide(currentIndex + 1);
        } else {
            if (currentIndex > 0) updateSlide(currentIndex - 1);
        }

        setTimeout(() => { isScrolling = false; }, 800);
    });

    // Touch Navigation
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', (e) => {
        // DISABLE custom navigation on mobile so native scroll works
        if (window.innerWidth <= 768) return;

        touchEndY = e.changedTouches[0].screenY;
        handleTouchGesture();
    });

    function handleTouchGesture() {
        if (touchEndY < touchStartY - 50) {
            // Swipe Up -> Next
            if (currentIndex < totalSlides - 1) updateSlide(currentIndex + 1);
        } else if (touchEndY > touchStartY + 50) {
            // Swipe Down -> Prev
            if (currentIndex > 0) updateSlide(currentIndex - 1);
        }
    }
});

// --- YouTube IFrame API & Cassette Player Logic ---

// --- YouTube IFrame API & Music Player Logic ---

let player;    // YT.Player instance
let timeUpdateInterval; // Interval ID for syncing time/progress

// 1. Load the IFrame Player API code asynchronously.
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
//    NOTE: The manual iframe in HTML will be replaced/controlled by this.
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 3. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // Player is ready
    updateDuration();
}

// 4. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
    const playBtn = document.getElementById('retro-play');
    const pauseBtn = document.getElementById('retro-pause');

    if (event.data == YT.PlayerState.PLAYING) {
        // Switch to Pause UI
        if (playBtn) playBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'inline-flex';

        // Start Sync Loop
        startTimeSync();
    } else {
        // Switch to Play UI (Paused, Ended, Buffered, Cued)
        if (playBtn) playBtn.style.display = 'inline-flex';
        if (pauseBtn) pauseBtn.style.display = 'none';

        // Stop Sync Loop
        stopTimeSync();
    }
}

// --- Sync Logic ---
function startTimeSync() {
    stopTimeSync(); // clear any existing
    timeUpdateInterval = setInterval(updatePlayerInfo, 1000); // Update every second
}

function stopTimeSync() {
    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
}

function updatePlayerInfo() {
    if (!player || !player.getCurrentTime || !player.getDuration) return;

    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    // Update Time Display
    const timeDisplay = document.querySelector('.music-time-display');
    if (timeDisplay) {
        timeDisplay.innerHTML = `<span>${formatTime(currentTime)}</span><span>${formatTime(duration)}</span>`;
    }

    // Update Progress Bar
    const progressFill = document.getElementById('progress-fill');
    if (progressFill && duration > 0) {
        const percent = (currentTime / duration) * 100;
        progressFill.style.width = `${percent}%`;
    }
}

// Initial Duration Set
function updateDuration() {
    if (!player || !player.getDuration) return;
    const duration = player.getDuration();
    const timeDisplay = document.querySelector('.music-time-display');
    if (timeDisplay && duration > 0) {
        // Only update total time initially, playing time is 0
        const spans = timeDisplay.querySelectorAll('span');
        if (spans.length > 1) spans[1].textContent = formatTime(duration);
    }
}

// Helper: Format Seconds to MM:SS
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}


// --- Button Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('retro-play');
    const pauseBtn = document.getElementById('retro-pause');
    const prevBtn = document.getElementById('retro-prev');
    const nextBtn = document.getElementById('retro-next');
    const progressBar = document.getElementById('music-progress');

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (player && typeof player.playVideo === 'function') {
                player.playVideo();
            }
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (player && typeof player.pauseVideo === 'function') {
                player.pauseVideo();
            }
        });
    }

    // Prev Button: Single click = -10s, Double click = Restart
    let prevClickTimer = null;
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (prevClickTimer) {
                // Double Click Detected
                clearTimeout(prevClickTimer);
                prevClickTimer = null;
                if (player && typeof player.seekTo === 'function') {
                    player.seekTo(0);
                }
            } else {
                // Single Click - Wait 250ms
                prevClickTimer = setTimeout(() => {
                    prevClickTimer = null;
                    if (player && typeof player.getCurrentTime === 'function') {
                        const cur = player.getCurrentTime();
                        player.seekTo(Math.max(0, cur - 10));
                    }
                }, 250);
            }
        });
    }

    // Next Button: +10s
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (player && typeof player.getCurrentTime === 'function') {
                const cur = player.getCurrentTime();
                const dur = player.getDuration();
                player.seekTo(Math.min(dur, cur + 10));
            }
        });
    }

    // Progress Bar: Seek on Click
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            if (!player || typeof player.seekTo !== 'function') return;
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percent = x / width;
            const dur = player.getDuration();

            if (dur > 0) {
                player.seekTo(dur * percent);
            }
        });
    }
});


// --- Interactive Image Swap ---
document.addEventListener('DOMContentLoaded', () => {
    const swapper = document.querySelector('.image-swapper');
    if (swapper) {
        swapper.addEventListener('click', () => {
            swapper.classList.toggle('swapped');
        });
    }
    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        // Sync toggle with initial state
        function syncToggleState() {
            if (document.body.classList.contains('dark-mode')) {
                themeToggle.checked = true;
            } else {
                themeToggle.checked = false;
            }
        }

        // Initial sync
        syncToggleState();

        // Listen for manual toggle
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                // Switching to Dark & Set Global Override
                document.body.classList.add('dark-mode');
                document.body.setAttribute('data-theme-override', 'dark');
            } else {
                // Switching to Light & Set Global Override
                document.body.classList.remove('dark-mode');
                document.body.setAttribute('data-theme-override', 'light');
            }
        });

        // Add an observer to body class to keep toggle in sync
        const observer = new MutationObserver(() => {
            syncToggleState();
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // --- Calendar Navigation Logic ---
        const prevBtn = document.getElementById('cal-prev');
        const nextBtn = document.getElementById('cal-next');
        const calViews = ['view-dec-2025', 'view-jan-2026'];
        let currentViewIndex = 0;

        function updateCalendarView() {
            // Hide all
            calViews.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.remove('active');
                    el.style.display = 'none';
                }
            });

            // Show current
            const currentId = calViews[currentViewIndex];
            // Ensure index is valid
            if (!currentId) return;

            const currentEl = document.getElementById(currentId);
            if (currentEl) {
                currentEl.style.display = 'block';
                setTimeout(() => currentEl.classList.add('active'), 10);
            }

            // Update Buttons
            if (prevBtn) prevBtn.disabled = currentViewIndex === 0;
            if (nextBtn) nextBtn.disabled = currentViewIndex === calViews.length - 1;
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent folder from closing
                if (currentViewIndex > 0) {
                    currentViewIndex--;
                    updateCalendarView();
                }
            });

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent folder from closing
                if (currentViewIndex < calViews.length - 1) {
                    currentViewIndex++;
                    updateCalendarView();
                }
            });

            // Initial state
            updateCalendarView();
        }
    }

    // --- HyperText Animation ---
    class HyperText {
        constructor(element) {
            this.element = element;
            this.originalText = element.getAttribute('data-text') || element.textContent;
            this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
            this.speed = 30; // Faster speed for HyperText
            this.iterations = 0;
            this.maxIterations = 10; // How many scrambles before settling
            this.interval = null;

            // Start automatically on load for effect, then listener
            this.startAnimation();
            this.init();
        }

        init() {
            this.element.addEventListener('mouseenter', () => this.startAnimation());
        }

        startAnimation() {
            clearInterval(this.interval);
            this.iterations = 0;

            this.interval = setInterval(() => {
                this.element.textContent = this.originalText.split('').map((char, index) => {
                    if (char === ' ') return ' ';
                    if (index < this.iterations) {
                        return this.originalText[index]; // Revealed
                    }
                    return this.characters[Math.floor(Math.random() * this.characters.length)];
                }).join('');

                if (this.iterations >= this.originalText.length) {
                    clearInterval(this.interval);
                }

                // Increment iteration to slowly reveal the text from left to right
                this.iterations += 1 / 3;
            }, this.speed);
        }
    }

    // Initialize HyperText
    document.querySelectorAll('.hyper-text').forEach(el => new HyperText(el));
});


// --- Magic Bento Grid Logic (GSAP) ---
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('bento-grid');
    if (!grid) return;

    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded. Magic Bento animations disabled.');
        return;
    }

    const cards = grid.querySelectorAll('.magic-bento-card');
    const spotlightRadius = 300;

    // 1. Global Spotlight
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    document.body.appendChild(spotlight);

    // 2. Mouse Move Handler (Spotlight & Glow)
    document.addEventListener('mousemove', (e) => {
        // Move Spotlight
        gsap.to(spotlight, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });

        // Check proximity for global spotlight visibility
        const gridRect = grid.getBoundingClientRect();
        const isNear = (
            e.clientX >= gridRect.left - 200 &&
            e.clientX <= gridRect.right + 200 &&
            e.clientY >= gridRect.top - 200 &&
            e.clientY <= gridRect.bottom + 200
        );

        gsap.to(spotlight, {
            opacity: isNear ? 0.8 : 0,
            duration: 0.3
        });

        if (!isNear) return;

        // Card Glow Update
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate distance to center
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

            // Calculate intensity based on distance (closer = brighter)
            const proximity = spotlightRadius;
            let intensity = 0;
            if (dist < proximity + Math.max(rect.width, rect.height)) {
                // Simple linear falloff
                intensity = 1 - Math.min(dist / proximity, 1);
            }

            // Update CSS Variables
            card.style.setProperty('--glow-x', `${x}px`);
            card.style.setProperty('--glow-y', `${y}px`);
            card.style.setProperty('--glow-intensity', intensity.toFixed(2));

            // Tilt Effect (Subtle)
            const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -2; // Max 2deg
            const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 2;

            if (intensity > 0) {
                gsap.to(card, {
                    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(card, {
                    transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`,
                    duration: 0.5
                });
            }
        });
    });

    // 3. Particles system per card
    cards.forEach(card => {
        // init particles
        const particleCount = 8; // Reduce for performance
        const content = card.querySelector('.magic-bento-card__content'); // Particles behind content? No, snippet implies inside.

        let container = document.createElement('div');
        container.className = 'particle-container';
        container.style.position = 'absolute';
        container.style.inset = '0';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '0';
        card.appendChild(container); // Append to card, but z-index 0. Content is 2.

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            let p = document.createElement('div');
            p.className = 'particle';
            // Random start pos
            gsap.set(p, {
                x: Math.random() * card.clientWidth,
                y: Math.random() * card.clientHeight,
                opacity: 0,
                scale: 0
            });
            container.appendChild(p);
        }

        const particles = container.querySelectorAll('.particle');

        // Hover -> Animate Particles
        card.addEventListener('mouseenter', () => {
            particles.forEach((p, i) => {
                gsap.to(p, {
                    opacity: 0.6 + Math.random() * 0.4,
                    scale: 1,
                    duration: 0.4,
                    delay: i * 0.05
                });
                // Random float motion
                animateParticle(p, card.clientWidth, card.clientHeight);
            });
        });

        card.addEventListener('mouseleave', () => {
            particles.forEach(p => {
                gsap.killTweensOf(p);
                gsap.to(p, {
                    opacity: 0,
                    scale: 0,
                    duration: 0.3
                });
            });
        });

        // Click Ripple
        card.addEventListener('click', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            let ripple = document.createElement('div');
            ripple.className = 'bento-ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height) * 2}px`;
            ripple.style.marginLeft = ripple.style.marginTop = `-${Math.max(rect.width, rect.height)}px`;

            card.appendChild(ripple);

            gsap.fromTo(ripple,
                { scale: 0, opacity: 0.6 },
                { scale: 1, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => ripple.remove() }
            );
        });
    });

    function animateParticle(p, w, h) {
        gsap.to(p, {
            x: Math.random() * w,
            y: Math.random() * h,
            duration: 2 + Math.random() * 3,
            ease: 'sine.inOut',
            onComplete: () => animateParticle(p, w, h)
        });
    }
});
