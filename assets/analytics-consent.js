/* Google Analytics only with analytics consent (CookieYes).
 *
 * Nothing is sent to Google, and no GA cookie is set, until the visitor accepts analytics:
 * - on page load, GA is loaded only if the CookieYes consent cookie already records analytics:yes;
 * - when the visitor accepts analytics in the banner (cookieyes_consent_update), GA is loaded once;
 * - when the visitor withdraws analytics, GA is disabled for the page and its cookies are removed.
 * window.gtag only exists after consent, so insurance-tracking.js sends no events before it.
 */
(function () {
  var ID = 'G-K0X9M61S63';
  var loaded = false;

  function consentCookieAllowsAnalytics() {
    var m = document.cookie.match(/(?:^|;\s*)cookieyes-consent=([^;]*)/);
    return !!(m && /(?:^|,)analytics:yes(?:,|$)/.test(decodeURIComponent(m[1])));
  }

  function loadAnalytics() {
    window['ga-disable-' + ID] = false;
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  function stopAnalytics() {
    window['ga-disable-' + ID] = true;
    var host = location.hostname, apex = host.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga(_|$)/.test(name)) return;
      ['', '; domain=' + host, '; domain=.' + apex].forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
  }

  if (consentCookieAllowsAnalytics()) loadAnalytics();

  document.addEventListener('cookieyes_consent_update', function (e) {
    var accepted = (e.detail && e.detail.accepted) || [];
    if (accepted.indexOf('analytics') > -1) loadAnalytics();
    else stopAnalytics();
  });
})();
