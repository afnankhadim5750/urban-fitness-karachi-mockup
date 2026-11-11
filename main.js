/* Urban Fitness — plain JS: header state, mobile menu, reveal, counters, lightbox. */
(function () {
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header: solid once scrolled past the hero top */
  var header = document.querySelector(".site-header");
  var toTop = document.getElementById("to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 900);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* Mobile menu — instant open/close (no transition on the toggle) */
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* Active nav link */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* Reveal on scroll */
  var revealTargets = document.querySelectorAll(
    ".space-grid, .space-list, .scroller-wrap, .coach-grid, .plan-card, .why-grid, .steps, .steps-photo, .gallery-grid, .visit-grid, .faq-list"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealTargets.forEach(function (el) { revealObs.observe(el); });
  }

  /* Animated counters — real numbers only (4.8 rating, 128 reviews) */
  var counters = document.querySelectorAll(".trust-num[data-count]");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (prefersReduced) { el.textContent = target.toFixed(decimals); return; }
    var start = null, duration = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* Horizontal-scroll buttons */
  document.querySelectorAll("[data-scroll-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var scroller = document.getElementById(btn.getAttribute("data-scroll-target"));
      if (!scroller) return;
      var dir = parseInt(btn.getAttribute("data-scroll-dir"), 10) || 1;
      scroller.scrollBy({ left: dir * 420, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* Lightbox gallery */
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var current = 0;
  function showLightbox(i) {
    current = (i + items.length) % items.length;
    var item = items[current];
    lightboxImg.src = item.getAttribute("data-full");
    lightboxImg.alt = item.getAttribute("data-alt") || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lightbox-close").focus();
  }
  function hideLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  items.forEach(function (item, i) {
    item.addEventListener("click", function () { showLightbox(i); });
  });
  document.getElementById("lightbox-close").addEventListener("click", hideLightbox);
  document.getElementById("lightbox-prev").addEventListener("click", function () { showLightbox(current - 1); });
  document.getElementById("lightbox-next").addEventListener("click", function () { showLightbox(current + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) hideLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") hideLightbox();
    if (e.key === "ArrowLeft") showLightbox(current - 1);
    if (e.key === "ArrowRight") showLightbox(current + 1);
  });
})();
