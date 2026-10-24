/* Insurance hand-off tracking: tags links to spanish-healthinsurance.com with non-personal
   source parameters and records a GA4 event per click (source page + page block). */
(function () {
  var SHI_HOST = /(^|\.)spanish-healthinsurance\.com$/i;

  function pageSlug() {
    var p = location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '').replace(/\/index$/, '');
    return p || 'home';
  }

  function blockOf(a) {
    var el = a.closest('section, [id]');
    if (!el) return 'page';
    if (el.classList && el.classList.contains('insurance-standalone')) return 'standalone';
    if (el.id) return el.id;
    var cls = (el.getAttribute('class') || '').split(/\s+/)[0];
    return cls || 'section';
  }

  function prepare(a) {
    var url;
    try { url = new URL(a.href); } catch (e) { return; }
    if (!SHI_HOST.test(url.hostname)) return;
    if (!url.searchParams.has('utm_source')) {
      url.searchParams.set('utm_source', 'myspanishnlv');
      url.searchParams.set('utm_medium', 'referral');
      url.searchParams.set('utm_campaign', 'insurance');
      url.searchParams.set('utm_content', pageSlug());
      a.href = url.toString();
    }
    a.addEventListener('click', function () {
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', 'insurance_quote_click', {
        source_page: location.pathname,
        block: blockOf(a),
        link_url: url.origin + url.pathname,
        transport_type: 'beacon'
      });
    });
  }

  function init() {
    var links = document.querySelectorAll('a[href*="spanish-healthinsurance.com"]');
    for (var i = 0; i < links.length; i++) prepare(links[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
