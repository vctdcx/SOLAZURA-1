(function () {
  "use strict";

  /* ---------------------------------------------------- */
  /* Chaque page démarre en haut, jamais sur le scroll     */
  /* restauré d'une visite précédente (bfcache / historique) */
  /* ---------------------------------------------------- */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
  window.addEventListener("pageshow", function () {
    window.scrollTo(0, 0);
  });

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
    servicesDropdown.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeDropdown);
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
  /* Formulaire de contact (Formspree)                     */
  /* ---------------------------------------------------- */
  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    var contactSubmit = contactForm.querySelector("[data-contact-submit]");
    var contactSuccess = contactForm.querySelector("[data-contact-success]");
    var contactError = contactForm.querySelector("[data-contact-error]");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (contactSuccess) contactSuccess.hidden = true;
      if (contactError) contactError.hidden = true;
      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.textContent = "Envoi en cours…";
      }

      fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            contactForm.reset();
            if (contactSuccess) contactSuccess.hidden = false;
            if (typeof window.gtag === "function") {
              window.gtag("event", "conversion", {
                send_to: "AW-18110089839/auiICJ3VjPscEO-UyLtD",
              });
            }
          } else if (contactError) {
            contactError.hidden = false;
          }
        })
        .catch(function () {
          if (contactError) contactError.hidden = false;
        })
        .finally(function () {
          if (contactSubmit) {
            contactSubmit.disabled = false;
            contactSubmit.textContent = "Envoyer la demande";
          }
        });
    });
  }

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
