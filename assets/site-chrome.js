/* Mobile/tablet menu for pages without their own menu script: opens and closes .mobile-menu from .nav-toggle. */
(function () {
  var toggle = document.querySelector('.site-nav .nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;
  var close = menu.querySelector('.mobile-menu-close');
  function open() { menu.classList.add('open'); toggle.classList.add('active'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
  function shut() { menu.classList.remove('open'); toggle.classList.remove('active'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  toggle.addEventListener('click', function () { menu.classList.contains('open') ? shut() : open(); });
  if (close) close.addEventListener('click', shut);
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) shut(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) shut(); });
})();
