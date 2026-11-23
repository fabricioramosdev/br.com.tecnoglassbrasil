(function () {
  var root = document.querySelector(".aex-carousel");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(".aex-slide"));
  var thumbs = Array.prototype.slice.call(root.querySelectorAll(".aex-thumb"));
  var count = root.querySelector(".aex-carousel-count b");
  var bar = root.querySelector(".aex-carousel-bar span");
  var area = root.querySelector(".aex-slides");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DELAY = 6000;
  var index = 0;
  var timer = null;
  var hold = { hover: false, focus: false, hidden: false, offscreen: false };

  function isHeld() {
    return hold.hover || hold.focus || hold.hidden || hold.offscreen;
  }

  function schedule() {
    clearTimeout(timer);
    bar.style.animation = "none";
    void bar.offsetWidth;
    bar.style.animation = "";
    if (reduce || isHeld()) return;
    timer = setTimeout(function () { show(index + 1); }, DELAY);
  }

  function show(n) {
    index = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) {
      var on = k === index;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
    });
    thumbs.forEach(function (t, k) {
      if (k === index) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
    count.textContent = String(index + 1).padStart(2, "0");
    schedule();
  }

  function setHold(key, value) {
    hold[key] = value;
    root.classList.toggle("is-paused", isHeld());
    if (isHeld()) clearTimeout(timer);
    else schedule();
  }

  root.querySelector(".prev").addEventListener("click", function () { show(index - 1); });
  root.querySelector(".next").addEventListener("click", function () { show(index + 1); });
  thumbs.forEach(function (t, k) { t.addEventListener("click", function () { show(k); }); });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { show(index - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { show(index + 1); e.preventDefault(); }
  });

  root.addEventListener("mouseenter", function () { setHold("hover", true); });
  root.addEventListener("mouseleave", function () { setHold("hover", false); });
  root.addEventListener("focusin", function () { setHold("focus", true); });
  root.addEventListener("focusout", function () { setHold("focus", false); });
  document.addEventListener("visibilitychange", function () { setHold("hidden", document.hidden); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      setHold("offscreen", !entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(root);
  }

  var startX = null;
  area.addEventListener("pointerdown", function (e) { startX = e.clientX; });
  area.addEventListener("pointerup", function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
  });
  area.addEventListener("pointercancel", function () { startX = null; });

  schedule();
})();
