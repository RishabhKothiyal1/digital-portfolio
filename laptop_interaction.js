
// Interactive Laptop Rotation
document.addEventListener('DOMContentLoaded', () => {
    const macbookContainer = document.querySelector('.macbook');
    const macbookInner = document.querySelector('.inner');

    if (macbookContainer && macbookInner) {
        let isDragging = false;
        let startX, startY;
        let currentX = -20; // Initial CSS rotateX
        let currentY = 0;   // Initial CSS rotateY

        macbookContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            macbookInner.classList.add('manual');

            // Optional: You could read the computed style to start exactly where the animation left off,
            // but simply snapping to a "ready" position is often cleaner for this specific visual.
            // If we want to snap to current, we'd need complex matrix parsing.
            // For now, we start from the 'rest' position defined above.

            startX = e.clientX;
            startY = e.clientY;
            e.preventDefault(); // Prevent text selection
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // Sensitivity
            currentY += deltaX * 0.5;
            currentX -= deltaY * 0.5;

            // Clamp X rotation to prevent flipping upside down if desired (optional)
            // currentX = Math.max(-90, Math.min(90, currentX));

            macbookInner.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg) rotateZ(0deg)`;

            startX = e.clientX;
            startY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            // We leave it in the new position
        });

        window.addEventListener('mouseleave', () => {
            if (isDragging) isDragging = false;
        });

        // Touch support for mobile
        macbookContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            macbookInner.classList.add('manual');
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            // e.preventDefault(); // Might block scroll, use carefully
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            currentY += deltaX * 0.5;
            currentX -= deltaY * 0.5;

            macbookInner.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg) rotateZ(0deg)`;

            startX = touch.clientX;
            startY = touch.clientY;
            // e.preventDefault(); 
        }, { passive: false });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
});
