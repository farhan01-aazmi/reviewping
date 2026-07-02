/**
 * ReviewPing Badge — Embeddable widget that generates natural backlinks.
 * 
 * Add this to any website:
 *   <script src="https://www.reviewping.pro/badge.js" data-position="bottom-right"></script>
 * 
 * Options:
 *   data-position: "bottom-right" (default), "bottom-left", "top-right", "top-left"
 *   data-text: "Powered by ReviewPing" (default), or custom text
 *   data-theme: "light" (default), "dark"
 */
(function() {
  'use strict';

  const script = document.currentScript;
  const position = script?.getAttribute('data-position') || 'bottom-right';
  const customText = script?.getAttribute('data-text');
  const theme = script?.getAttribute('data-theme') || 'light';

  const isLight = theme === 'light';

  // Create badge element
  const badge = document.createElement('a');
  badge.href = 'https://www.reviewping.pro?ref=badge';
  badge.target = '_blank';
  badge.rel = 'noopener noreferrer';
  badge.setAttribute('aria-label', 'Powered by ReviewPing — Google Review Automation');
  
  badge.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: ${isLight ? '#ffffff' : '#1a1a2e'};
      border: 1px solid ${isLight ? '#e2e8f0' : '#2d2d44'};
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: ${isLight ? '#64748b' : '#94a3b8'};
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill="${isLight ? '#f59e0b' : '#fbbf24'}" stroke="${isLight ? '#d97706' : '#f59e0b'}" stroke-width="1.5"/>
      </svg>
      <span>${customText || 'Powered by ReviewPing'}</span>
    </div>
  `;

  // Hover effect
  badge.addEventListener('mouseenter', () => {
    badge.firstElementChild.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
    badge.firstElementChild.style.transform = 'translateY(-1px)';
  });
  badge.addEventListener('mouseleave', () => {
    badge.firstElementChild.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    badge.firstElementChild.style.transform = 'none';
  });

  // Position
  const positions = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };
  const pos = positions[position] || positions['bottom-right'];

  badge.style.position = 'fixed';
  badge.style.zIndex = '999999';
  Object.assign(badge.style, pos);

  document.body.appendChild(badge);
})();
