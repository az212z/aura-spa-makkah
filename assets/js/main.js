/* Aura Spa — main.js (vanilla, guarded) */
(function () {
  "use strict";

  /* ---------- Mobile menu (full-screen) ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  var menuClose = document.getElementById("menuClose");

  function openMenu() {
    if (!menu) return;
    menu.classList.add("open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (menu) {
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeLightbox(); }
  });

  /* ---------- Scroll reveal (IntersectionObserver + fallback) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
  // Safety: ensure nothing stays hidden after 1.2s
  window.setTimeout(function () {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }, 1200);

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
  document.querySelectorAll(".gphoto").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!lightbox || !lightboxImg) return;
      var src = btn.getAttribute("data-full");
      var img = btn.querySelector("img");
      lightboxImg.src = src;
      lightboxImg.alt = img ? img.alt : "صورة من داخل مركز أورا";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------- Booking form → wa.me + localStorage + toast ---------- */
  var form = document.getElementById("bookForm");
  var toast = document.getElementById("toast");
  var WA = "966543600508";

  function setInvalid(id, on) {
    var input = document.getElementById(id);
    if (!input) return;
    var field = input.closest(".field");
    if (field) field.classList.toggle("invalid", on);
  }
  function showToast() {
    if (!toast) return;
    toast.classList.add("show");
    window.setTimeout(function () { toast.classList.remove("show"); }, 4000);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name");
      var phone = document.getElementById("phone");
      var service = document.getElementById("service");
      var date = document.getElementById("date");
      var notes = document.getElementById("notes");

      var ok = true;
      if (!name.value.trim()) { setInvalid("name", true); ok = false; } else setInvalid("name", false);
      var phoneVal = phone.value.replace(/\D/g, "");
      if (phoneVal.length < 10) { setInvalid("phone", true); ok = false; } else setInvalid("phone", false);
      if (!service.value) { setInvalid("service", true); ok = false; } else setInvalid("service", false);

      if (!ok) {
        var firstInvalid = form.querySelector(".field.invalid input, .field.invalid select");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var booking = {
        name: name.value.trim(),
        phone: phone.value.trim(),
        service: service.value,
        date: date.value || "غير محدد",
        notes: notes.value.trim() || "—",
        ts: new Date().toISOString()
      };

      // localStorage demo
      try {
        var key = "aura_bookings";
        var list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push(booking);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (err) { /* ignore storage errors */ }

      // Build WhatsApp message
      var msg =
        "السلام عليكم، أرغب بحجز موعد في مركز أورا%0A" +
        "الاسم: " + encodeURIComponent(booking.name) + "%0A" +
        "الجوال: " + encodeURIComponent(booking.phone) + "%0A" +
        "الخدمة: " + encodeURIComponent(booking.service) + "%0A" +
        "التاريخ المفضّل: " + encodeURIComponent(booking.date) + "%0A" +
        "ملاحظات: " + encodeURIComponent(booking.notes);

      showToast();
      window.setTimeout(function () {
        window.open("https://wa.me/" + WA + "?text=" + msg, "_blank", "noopener");
      }, 600);

      form.reset();
    });
  }

  /* ---------- Footer year (already 2026 in markup, kept dynamic-safe) ---------- */
})();
