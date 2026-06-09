(function () {
  'use strict';

  // ─── Config from script tag ─────────────────────────────
  var script = document.currentScript;
  if (!script) {
    // Fallback: find the script by src
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') > -1) {
        script = scripts[i];
        break;
      }
    }
  }
  if (!script) return;

  var business = script.getAttribute('data-business') || '';
  var style = script.getAttribute('data-style') || 'carousel';
  var theme = script.getAttribute('data-theme') || 'light';
  var count = parseInt(script.getAttribute('data-count')) || 5;

  if (!business) return;

  // ─── API endpoint ───────────────────────────────────────
  var API = 'https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/get-widget-reviews?slug=' + encodeURIComponent(business);

  // ─── Detect dark mode ───────────────────────────────────
  function isDark() {
    if (theme === 'dark') return true;
    if (theme === 'auto') return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return false;
  }

  // ─── Colors ─────────────────────────────────────────────
  var C = {
    bg: isDark() ? '#1a1a2e' : '#ffffff',
    card: isDark() ? '#16213e' : '#f8f9fa',
    text: isDark() ? '#e8e8e8' : '#1a1a2e',
    muted: isDark() ? '#8892b0' : '#6b7280',
    star: '#f59e0b',
    accent: '#c93d10',
    border: isDark() ? '#2a2a4a' : '#e5e7eb',
  };

  // ─── Create container ───────────────────────────────────
  var container = document.createElement('div');
  container.className = 'rp-widget rp-' + style;
  container.style.cssText = 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:' + C.text + ';line-height:1.5;';

  // ─── Insert placeholder ─────────────────────────────────
  container.innerHTML = '<div style="text-align:center;padding:20px;color:' + C.muted + ';font-size:14px;">Loading reviews…</div>';
  script.parentNode.insertBefore(container, script.nextSibling);

  // ─── Fetch reviews ──────────────────────────────────────
  var xhr = new XMLHttpRequest();
  xhr.open('GET', API, true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        if (data.error) {
          container.innerHTML = '';
          return;
        }
        renderWidget(data);
      } catch (e) {
        container.innerHTML = '';
      }
    } else {
      container.innerHTML = '';
    }
  };
  xhr.onerror = function () { container.innerHTML = ''; };
  xhr.send();

  // ─── Render functions ───────────────────────────────────

  /** Star SVG */
  function starSVG(filled) {
    return '<svg viewBox="0 0 20 20" width="16" height="16" style="display:inline;vertical-align:text-bottom;">' +
      '<polygon points="10,1 13,7 19,7 14,12 16,19 10,15 4,19 6,12 1,7 7,7" ' +
      'fill="' + (filled ? C.star : C.border) + '" /></svg>';
  }

  /** Render stars inline */
  function stars(rating) {
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += starSVG(i <= rating);
    }
    return s;
  }

  /** Truncate text */
  function truncate(text, len) {
    if (!text) return '';
    return text.length > len ? text.substring(0, len) + '…' : text;
  }

  /** Format date */
  function fmtDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  /** Main render dispatcher */
  function renderWidget(data) {
    var html = '';
    var items = (data.reviews || []).slice(0, count);

    // Widget header
    html += '<div style="padding:16px 0;text-align:center;">';
    if (data.logo_url) {
      html += '<img src="' + escapeAttr(data.logo_url) + '" alt="' + escapeAttr(data.business_name) + '" style="width:40px;height:40px;border-radius:8px;object-fit:cover;margin-bottom:8px;" />';
    }
    html += '<div style="font-weight:700;font-size:15px;">' + escapeHtml(data.business_name) + '</div>';
    html += '<div style="margin:4px 0;">' + stars(Math.round(data.avg_rating)) + '</div>';
    html += '<div style="font-size:12px;color:' + C.muted + ';">' + data.total_reviews + ' review' + (data.total_reviews !== 1 ? 's' : '') + '</div>';
    html += '</div>';

    if (style === 'badge') {
      renderBadge(html, data);
      return;
    }

    if (style === 'list') {
      renderList(items);
      return;
    }

    if (style === 'grid') {
      renderGrid(items);
      return;
    }

    // Default: carousel
    renderCarousel(items);
  }

  /** Render badge */
  function renderBadge(headerHtml, data) {
    container.innerHTML =
      '<div style="display:inline-flex;align-items:center;gap:10px;padding:10px 16px;background:' + C.card + ';border:1px solid ' + C.border + ';border-radius:10px;cursor:pointer;" onclick="window.open(\'https://search.google.com/local/reviews?placeid=\')">' +
        headerHtml +
      '</div>';
  }

  /** Render list */
  function renderList(items) {
    var html = '<div style="max-height:400px;overflow-y:auto;">';
    items.forEach(function (r) {
      var initials = (r.author_name || '?').charAt(0).toUpperCase();
      html +=
        '<div style="padding:14px 0;border-bottom:1px solid ' + C.border + ';">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
            '<div style="width:32px;height:32px;border-radius:50%;background:' + C.accent + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">' + initials + '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div style="font-weight:600;font-size:13px;">' + escapeHtml(r.author_name) + '</div>' +
              '<div style="font-size:11px;color:' + C.muted + ';">' + fmtDate(r.submitted_at) + '</div>' +
            '</div>' +
            '<div style="flex-shrink:0;">' + stars(r.rating) + '</div>' +
          '</div>' +
          (r.review_text ? '<div style="font-size:13px;color:' + C.text + ';line-height:1.6;">' + escapeHtml(truncate(r.review_text, 200)) + '</div>' : '') +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  /** Render grid */
  function renderGrid(items) {
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">';
    items.forEach(function (r) {
      var initials = (r.author_name || '?').charAt(0).toUpperCase();
      html +=
        '<div style="background:' + C.card + ';border:1px solid ' + C.border + ';border-radius:12px;padding:16px;">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
            '<div style="width:28px;height:28px;border-radius:50%;background:' + C.accent + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">' + initials + '</div>' +
            '<div style="font-weight:600;font-size:12px;">' + escapeHtml(r.author_name) + '</div>' +
          '</div>' +
          '<div style="margin-bottom:6px;">' + stars(r.rating) + '</div>' +
          (r.review_text ? '<div style="font-size:12.5px;line-height:1.6;color:' + C.muted + ';">' + escapeHtml(truncate(r.review_text, 150)) + '</div>' : '') +
          '<div style="font-size:11px;color:' + C.muted + ';margin-top:8px;">' + fmtDate(r.submitted_at) + '</div>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  /** Render carousel */
  function renderCarousel(items) {
    var id = 'rp-carousel-' + Math.random().toString(36).substring(2, 7);
    var html = '<div id="' + id + '" style="position:relative;overflow:hidden;">';
    html += '<div style="display:flex;transition:transform 0.4s ease;gap:12px;padding:4px 0;" class="rp-track">';

    items.forEach(function (r) {
      var initials = (r.author_name || '?').charAt(0).toUpperCase();
      html +=
        '<div style="min-width:280px;max-width:320px;background:' + C.card + ';border:1px solid ' + C.border + ';border-radius:12px;padding:18px;flex-shrink:0;">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
            '<div style="width:36px;height:36px;border-radius:50%;background:' + C.accent + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;">' + initials + '</div>' +
            '<div style="flex:1;">' +
              '<div style="font-weight:600;font-size:13px;">' + escapeHtml(r.author_name) + '</div>' +
              '<div style="margin-top:2px;">' + stars(r.rating) + '</div>' +
            '</div>' +
          '</div>' +
          (r.review_text ? '<div style="font-size:13px;line-height:1.7;color:' + C.muted + ';">"' + escapeHtml(truncate(r.review_text, 180)) + '"</div>' : '') +
          '<div style="font-size:11px;color:' + C.muted + ';margin-top:10px;">' + fmtDate(r.submitted_at) + '</div>' +
        '</div>';
    });

    html += '</div></div>';

    // Add simple auto-scroll
    if (items.length > 1) {
      html += '<style>#' + id + ' .rp-track{animation:rp-scroll-' + id + ' ' + Math.max(8, items.length * 3) + 's linear infinite;}@keyframes rp-scroll-' + id + '{0%{transform:translateX(0)}100%{transform:translateX(-' + (items.length * 300) + 'px)}}';
      html += '#' + id + ':hover .rp-track{animation-play-state:paused;}</style>';
    }

    container.innerHTML = html;
  }

  // ─── Helpers ────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

})();
