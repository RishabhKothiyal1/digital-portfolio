// unicorn-init.js

(function () {
    // 1. Load Unicorn Studio Script
    const embedScript = document.createElement('script');
    embedScript.type = 'text/javascript';
    embedScript.textContent = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
    document.head.appendChild(embedScript);

    // 2. Branding Hiding Logic
    const hideBranding = () => {
        // Target all possible UnicornStudio containers
        const selectors = [
            '[data-us-project]',
            '[data-us-project="OMzqyUv6M3kSnv0JeAtC"]',
            '.unicorn-studio-container',
            'canvas[aria-label*="Unicorn"]'
        ];

        selectors.forEach(selector => {
            const containers = document.querySelectorAll(selector);
            containers.forEach(container => {
                // Find and remove any elements containing branding text
                const allElements = container.querySelectorAll('*');
                allElements.forEach(el => {
                    const text = (el.textContent || '').toLowerCase();
                    const title = (el.getAttribute('title') || '').toLowerCase();
                    const href = (el.getAttribute('href') || '').toLowerCase();

                    if (
                        text.includes('made with') ||
                        text.includes('unicorn') ||
                        title.includes('made with') ||
                        title.includes('unicorn') ||
                        href.includes('unicorn.studio')
                    ) {
                        el.style.display = 'none !important';
                        el.style.visibility = 'hidden !important';
                        el.style.opacity = '0 !important';
                        el.style.pointerEvents = 'none !important';
                        el.style.position = 'absolute !important';
                        el.style.left = '-9999px !important';
                        el.style.top = '-9999px !important';
                        try { el.remove(); } catch (e) { }
                    }
                });
            });
        });
    };

    // Run interval to hide branding
    const interval = setInterval(hideBranding, 50);

    // Clear interval after 20 seconds (usually fully loaded by then)
    setTimeout(() => {
        clearInterval(interval);
        // one last check
        hideBranding();
    }, 20000);
})();
