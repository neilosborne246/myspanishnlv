/* Insurance hand-off tracking for links to spanish-healthinsurance.com.
 *
 * 1. Source tags: adds non-personal UTM parameters so SHI can see which myspanishnlv page sent the
 *    visitor. Existing query parameters and #fragments are kept; links that already carry any utm_*
 *    parameter are left untouched, so tags are never duplicated.
 * 2. Click events: sent to GA4 ONLY when the visitor has accepted analytics cookies in CookieYes
 *    (getCkyConsent().categories.analytics === true). No consent, or no answer yet, means no event.
 *    - insurance_quote_click  -> links whose visible text is a quote call to action
 *    - insurance_link_click   -> any other SHI link, with destination_type "product" or "guide"
 */
(function () {
  var SHI_HOST = /(^|\.)spanish-healthinsurance\.com$/i;
  var CAMPAIGN = 'msnlv-insurance-2026-10';
  var QUOTE_TEXT = /\bquote\b/i;
  var GUIDE_PATH = /\/(guides|blog)\/|(^|\/)(change|switch|switching|when|how|what|why|which|can|is|are|do)-|-(explained|requirements|vs|guide)\/?$/i;

  function pageSlug() {
    var p = location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '').replace(/\/index$/, '');
    return p || 'home';
  }

  function blockOf(a) {
    var el = a.closest('section, [id]');
    if (!el) return 'page';
    if (el.classList && el.classList.contains('insurance-standalone')) return 'standalone';
    if (el.id) return el.id;
    return (el.getAttribute('class') || 'section').split(/\s+/)[0];
  }

  function destinationType(a, url) {
    if (QUOTE_TEXT.test(a.textContent || '')) return 'quote';
    return GUIDE_PATH.test(url.pathname) ? 'guide' : 'product';
  }

  function analyticsAllowed() {
    try {
      if (typeof window.getCkyConsent !== 'function') return false;
      var c = window.getCkyConsent();
      return !!(c && c.categories && c.categories.analytics === true);
    } catch (e) {
      return false;
    }
  }

  function tagUrl(url) {
    var has = false;
    url.searchParams.forEach(function (v, k) { if (/^utm_/i.test(k)) has = true; });
    if (has) return false;
    url.searchParams.append('utm_source', 'myspanishnlv');
    url.searchParams.append('utm_medium', 'referral');
    url.searchParams.append('utm_campaign', CAMPAIGN);
    url.searchParams.append('utm_content', pageSlug());
    return true; /* URL keeps url.hash, so fragments survive */
  }

  function prepare(a) {
    if (a.getAttribute('data-ins-ready')) return;
    var url;
    try { url = new URL(a.href); } catch (e) { return; }
    if (!SHI_HOST.test(url.hostname)) return;
    if (tagUrl(url)) a.href = url.toString();
    a.setAttribute('data-ins-ready', '1');
    var type = destinationType(a, url);
    a.addEventListener('click', function () {
      if (typeof window.gtag !== 'function' || !analyticsAllowed()) return;
      window.gtag('event', type === 'quote' ? 'insurance_quote_click' : 'insurance_link_click', {
        source_page: location.pathname,
        block: blockOf(a),
        destination_type: type,
        link_url: url.origin + url.pathname,
        campaign: CAMPAIGN,
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
