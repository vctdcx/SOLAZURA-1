(function () {
  "use strict";

  /* ---------------------------------------------------- */
  /* Menu mobile accessible                                */
  /* ---------------------------------------------------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-menu-panel]");
  var closeBtn = document.querySelector("[data-menu-close]");
  var body = document.body;

  function openMenu() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    body.style.overflow = "hidden";
    var firstLink = panel.querySelector("a, button");
    if (firstLink) firstLink.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeMenu() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    body.style.overflow = "";
    toggle.focus();
    document.removeEventListener("keydown", onKeydown);
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      closeMenu();
      return;
    }
    if (e.key === "Tab") {
      var focusable = panel.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  /* ---------------------------------------------------- */
  /* Menu déroulant Services (desktop)                     */
  /* ---------------------------------------------------- */
  var servicesTrigger = document.querySelector("[data-services-trigger]");
  var servicesDropdown = document.querySelector("[data-services-dropdown]");

  if (servicesTrigger && servicesDropdown) {
    function closeDropdown() {
      servicesDropdown.hidden = true;
      servicesTrigger.setAttribute("aria-expanded", "false");
    }
    function openDropdown() {
      servicesDropdown.hidden = false;
      servicesTrigger.setAttribute("aria-expanded", "true");
    }
    servicesTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var expanded = servicesTrigger.getAttribute("aria-expanded") === "true";
      expanded ? closeDropdown() : openDropdown();
    });
    document.addEventListener("click", function (e) {
      if (!servicesDropdown.hidden && !servicesDropdown.contains(e.target)) {
        closeDropdown();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !servicesDropdown.hidden) {
        closeDropdown();
        servicesTrigger.focus();
      }
    });
  }

  /* ---------------------------------------------------- */
  /* FAQ accordéon accessible                              */
  /* ---------------------------------------------------- */
  var faqButtons = document.querySelectorAll("[data-faq-trigger]");
  faqButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panelId = btn.getAttribute("aria-controls");
      var faqPanel = document.getElementById(panelId);
      btn.setAttribute("aria-expanded", String(!expanded));
      if (faqPanel) faqPanel.hidden = expanded;
    });
  });

  /* ---------------------------------------------------- */
  /* Liens tel: — jamais bloquer la navigation              */
  /* Le suivi de conversion se déclenche en parallèle,      */
  /* sans jamais empêcher la composition du numéro.         */
  /* ---------------------------------------------------- */
  var telLinks = document.querySelectorAll('a[href^="tel:"]');
  telLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      try {
        if (typeof window.gtag === "function") {
          window.gtag("event", "conversion", {
            send_to: "AW-18027130698/6TtVCJXX-ZEcEMregJRD",
          });
        }
      } catch (err) {
        /* la composition du numéro ne doit jamais être bloquée */
      }
    });
  });

  /* ---------------------------------------------------- */
  /* Bandeau de consentement RGPD                          */
  /* Le tag Google Ads n'est chargé qu'après acceptation.   */
  /* ---------------------------------------------------- */
  var CONSENT_KEY = "solazura-consent";
  var banner = document.querySelector("[data-consent-banner]");
  var acceptBtn = document.querySelector("[data-consent-accept]");
  var declineBtn = document.querySelector("[data-consent-decline]");

  function loadAdsTag() {
    if (document.getElementById("google-ads-tag")) return;
    var script = document.createElement("script");
    script.id = "google-ads-tag";
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=AW-18027130698";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", "AW-18027130698");
  }

  var storedConsent = null;
  try {
    storedConsent = window.localStorage.getItem(CONSENT_KEY);
  } catch (err) {
    storedConsent = null;
  }

  if (storedConsent === "accepted") {
    loadAdsTag();
  } else if (!storedConsent && banner) {
    banner.hidden = false;
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      try {
        window.localStorage.setItem(CONSENT_KEY, "accepted");
      } catch (err) {
        /* stockage indisponible : le bandeau reviendra à la prochaine visite */
      }
      if (banner) banner.hidden = true;
      loadAdsTag();
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener("click", function () {
      try {
        window.localStorage.setItem(CONSENT_KEY, "declined");
      } catch (err) {
        /* stockage indisponible */
      }
      if (banner) banner.hidden = true;
    });
  }
})();
