(function () {
  "use strict";

  var form = document.querySelector("[data-reservation-form]");
  if (!form) return; // ce script ne s'exécute que sur pages/reserver.html

  /* ---------------------------------------------------- */
  /* Configuration Formspree                               */
  /* ---------------------------------------------------- */
  /* Même endpoint que le formulaire de contact d'index.html : les    */
  /* deux formulaires (contact et demande de rendez-vous) arrivent    */
  /* dans la même boîte Formspree.                                    */
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/mzezpgdv";

  /* ---------------------------------------------------- */
  /* Schéma des questions par catégorie de service          */
  /* Chaque champ garde un nom explicite, prêt à être relu   */
  /* plus tard par un CRM (Supabase) sans changer le format. */
  /* ---------------------------------------------------- */
  var SERVICE_QUESTIONS = {
    depannage: {
      subtitle: "Dépannage électrique — quelques précisions sur la panne.",
      fields: [
        {
          name: "depannage_type",
          label: "Quel est le problème rencontré ?",
          type: "radio",
          required: true,
          options: [
            "Coupure électrique",
            "Prises électriques",
            "Éclairage",
            "Tableau électrique",
            "Disjonction répétée",
            "Autre",
          ],
        },
        {
          name: "urgence",
          label: "Le problème est-il urgent ?",
          type: "radio",
          required: true,
          options: [
            "Oui, je n'ai plus d'électricité",
            "Oui, mais une partie de l'installation fonctionne",
            "Non, ce n'est pas urgent",
          ],
        },
        {
          name: "depannage_description",
          label: "Décrivez brièvement le problème",
          type: "textarea",
          required: false,
        },
      ],
    },
    renovation: {
      subtitle: "Rénovation électrique — quelques précisions sur le logement.",
      fields: [
        {
          name: "renovation_type_logement",
          label: "Quel type de logement ?",
          type: "radio",
          required: true,
          options: ["Maison", "Appartement", "Local professionnel", "Autre"],
        },
        {
          name: "renovation_surface",
          label: "Quelle est la surface approximative ?",
          type: "radio",
          required: true,
          options: ["Moins de 50 m²", "50 à 100 m²", "100 à 200 m²", "Plus de 200 m²"],
        },
        {
          name: "renovation_occupation",
          label: "Le logement est-il actuellement habité ?",
          type: "radio",
          required: true,
          options: ["Oui", "Non"],
        },
        {
          name: "renovation_type_projet",
          label: "Quel type de projet ?",
          type: "radio",
          required: true,
          options: ["Rénovation complète", "Mise en conformité", "Rénovation partielle", "Extension", "Autre"],
        },
        {
          name: "renovation_description",
          label: "Décrivez votre projet",
          type: "textarea",
          required: false,
        },
      ],
    },
    irve: {
      subtitle: "Borne de recharge — quelques précisions sur votre installation.",
      fields: [
        {
          name: "irve_vehicule",
          label: "Quel type de véhicule souhaitez-vous recharger ?",
          type: "radio",
          required: true,
          options: ["Véhicule électrique", "Hybride rechargeable", "Je ne sais pas encore"],
        },
        {
          name: "irve_borne_existante",
          label: "Avez-vous déjà une borne de recharge ?",
          type: "radio",
          required: true,
          options: ["Oui", "Non"],
        },
        {
          name: "irve_emplacement",
          label: "Où souhaitez-vous installer la borne ?",
          type: "radio",
          required: true,
          options: ["Garage", "Parking extérieur", "Autre"],
        },
        {
          name: "irve_distance",
          label: "Quelle est la distance approximative entre votre tableau électrique et la borne ?",
          type: "radio",
          required: true,
          options: ["Moins de 10 m", "10 à 20 m", "Plus de 20 m", "Je ne sais pas"],
        },
        {
          name: "irve_description",
          label: "Décrivez votre projet",
          type: "textarea",
          required: false,
        },
      ],
    },
    extension: {
      subtitle: "Extension / construction — quelques précisions sur le projet.",
      fields: [
        {
          name: "extension_type",
          label: "Quel type de projet ?",
          type: "radio",
          required: true,
          options: ["Extension", "Construction neuve", "Rénovation avec extension", "Autre"],
        },
        {
          name: "extension_surface",
          label: "Surface approximative du projet",
          type: "radio",
          required: true,
          options: ["Moins de 20 m²", "20 à 50 m²", "50 à 100 m²", "Plus de 100 m²"],
        },
        {
          name: "extension_plans",
          label: "Le projet est-il déjà défini ?",
          type: "radio",
          required: true,
          options: ["Plans disponibles", "Projet en cours de définition", "Pas encore de plans"],
        },
        {
          name: "extension_description",
          label: "Décrivez votre projet",
          type: "textarea",
          required: false,
        },
      ],
    },
    autre: {
      subtitle: "Décrivez-nous votre besoin.",
      fields: [
        {
          name: "autre_description",
          label: "Décrivez votre besoin",
          type: "textarea",
          required: true,
        },
      ],
    },
  };

  var SERVICE_LABELS = {
    depannage: "Dépannage électrique",
    renovation: "Rénovation électrique",
    irve: "Installation d'une borne de recharge",
    extension: "Extension / construction",
    autre: "Autre demande",
  };

  var TOTAL_STEPS = 5;
  var currentStep = 1;
  var maxVisitedStep = 1;

  var progressItems = form.parentElement.querySelectorAll("[data-progress-step]");
  var stepPanels = form.querySelectorAll("[data-step-panel]");
  var btnPrev = form.querySelector("[data-btn-prev]");
  var btnNext = form.querySelector("[data-btn-next]");
  var btnSubmit = form.querySelector("[data-btn-submit]");
  var formError = form.querySelector("[data-reservation-error]");
  var step2Container = form.querySelector("[data-step2-container]");
  var step2Subtitle = form.querySelector("[data-step2-subtitle]");
  var confirmationPanel = document.querySelector("[data-confirmation]");
  var confirmationSummary = document.querySelector("[data-confirmation-summary]");

  /* ---------------------------------------------------- */
  /* Pré-sélection du service depuis l'URL (?service=...)  */
  /* Utilisé par les liens "Réserver" des landing pages     */
  /* dédiées, pour arriver avec la bonne catégorie cochée.  */
  /* ---------------------------------------------------- */
  function preselectServiceFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var service = params.get("service");
    if (service && SERVICE_QUESTIONS[service]) {
      var radio = form.querySelector('input[name="service"][value="' + service + '"]');
      if (radio) {
        radio.checked = true;
        onServiceChange(service);
      }
    }
  }

  /* ---------------------------------------------------- */
  /* Changement de service (étape 1)                       */
  /* ---------------------------------------------------- */
  function onServiceChange(service) {
    renderStep2Questions(service);
    clearFieldError("service");
  }

  form.querySelectorAll('input[name="service"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      onServiceChange(radio.value);
    });
  });

  /* ---------------------------------------------------- */
  /* Affichage des questions (étape 2, générées en JS)      */
  /* ---------------------------------------------------- */
  function renderStep2Questions(service) {
    var schema = SERVICE_QUESTIONS[service];
    step2Container.innerHTML = "";
    if (!schema) return;

    step2Subtitle.textContent = schema.subtitle;

    schema.fields.forEach(function (field) {
      var wrapper = document.createElement("div");

      var legend = document.createElement("p");
      legend.className = "font-medium mb-3";
      legend.textContent = field.label + (field.required ? " *" : "");
      wrapper.appendChild(legend);

      if (field.type === "radio") {
        var optionsGrid = document.createElement("div");
        optionsGrid.className = "grid sm:grid-cols-2 gap-3";
        field.options.forEach(function (option, index) {
          var label = document.createElement("label");
          label.className =
            "flex items-center gap-2 border border-line rounded px-4 py-3 cursor-pointer text-sm transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent has-[:checked]:font-medium";

          var input = document.createElement("input");
          input.type = "radio";
          input.name = field.name;
          input.value = option;
          input.className = "sr-only";
          if (field.required) input.required = true;
          input.id = field.name + "-" + index;

          var span = document.createElement("span");
          span.textContent = option;

          label.appendChild(input);
          label.appendChild(span);
          optionsGrid.appendChild(label);
        });
        wrapper.appendChild(optionsGrid);
      } else if (field.type === "textarea") {
        var textarea = document.createElement("textarea");
        textarea.name = field.name;
        textarea.id = field.name;
        textarea.rows = 3;
        if (field.required) textarea.required = true;
        textarea.className = "w-full border border-line rounded px-4 py-2 bg-bone focus-visible:outline-accent";
        wrapper.appendChild(textarea);
      }

      var errorEl = document.createElement("p");
      errorEl.className = "text-xs text-red-700 mt-2";
      errorEl.setAttribute("data-error-for", field.name);
      errorEl.hidden = true;
      wrapper.appendChild(errorEl);

      step2Container.appendChild(wrapper);
    });
  }

  /* ---------------------------------------------------- */
  /* Gestion des disponibilités (étape 4)                   */
  /* ---------------------------------------------------- */
  function initAvailabilityDateMinimums() {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var dd = String(today.getDate()).padStart(2, "0");
    var todayStr = yyyy + "-" + mm + "-" + dd;

    form.querySelectorAll("[data-dispo-date]").forEach(function (input) {
      input.min = todayStr;
    });
  }

  function validateAvailability() {
    var valid = true;

    for (var i = 1; i <= 3; i++) {
      var dateField = "disponibilite_" + i + "_date";
      var horaireField = "disponibilite_" + i + "_horaire";
      var dateInput = form.elements[dateField];
      var horaireInput = form.elements[horaireField];
      var dateVal = dateInput ? dateInput.value : "";
      var horaireVal = horaireInput ? horaireInput.value : "";

      clearFieldError(dateField);
      clearFieldError(horaireField);

      if (i === 1) {
        if (!dateVal) {
          showFieldError(dateField, "Merci d'indiquer une date pour cette disponibilité.");
          valid = false;
        }
        if (!horaireVal) {
          showFieldError(horaireField, "Merci de choisir un créneau.");
          valid = false;
        }
      } else {
        // Disponibilités 2 et 3 facultatives, mais si l'une des deux
        // valeurs est renseignée, l'autre devient obligatoire.
        if (dateVal && !horaireVal) {
          showFieldError(horaireField, "Merci de choisir un créneau pour cette date.");
          valid = false;
        }
        if (!dateVal && horaireVal) {
          showFieldError(dateField, "Merci d'indiquer une date pour ce créneau.");
          valid = false;
        }
      }
    }

    return valid;
  }

  /* ---------------------------------------------------- */
  /* Validation de chaque étape                             */
  /* ---------------------------------------------------- */
  function validateStep(step) {
    clearAllErrorsInStep(step);

    if (step === 1) {
      var service = form.querySelector('input[name="service"]:checked');
      if (!service) {
        showFieldError("service", "Merci de choisir une catégorie.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      var selected = form.querySelector('input[name="service"]:checked');
      var schema = selected ? SERVICE_QUESTIONS[selected.value] : null;
      if (!schema) return true;
      var valid = true;
      schema.fields.forEach(function (field) {
        if (!field.required) return;
        var value = getFieldValue(field.name);
        if (!value) {
          showFieldError(field.name, "Ce champ est requis.");
          valid = false;
        }
      });
      return valid;
    }

    if (step === 3) {
      var valid3 = true;
      ["adresse", "code_postal", "ville"].forEach(function (name) {
        if (!getFieldValue(name)) {
          showFieldError(name, "Ce champ est requis.");
          valid3 = false;
        }
      });
      return valid3;
    }

    if (step === 4) {
      return validateAvailability();
    }

    if (step === 5) {
      var valid5 = true;
      ["prenom", "nom", "telephone"].forEach(function (name) {
        if (!getFieldValue(name)) {
          showFieldError(name, "Ce champ est requis.");
          valid5 = false;
        }
      });
      var email = getFieldValue("email");
      if (!email) {
        showFieldError("email", "Ce champ est requis.");
        valid5 = false;
      } else if (!isValidEmail(email)) {
        showFieldError("email", "Merci de renseigner un email valide.");
        valid5 = false;
      }
      var consent = form.elements["consentement"];
      if (!consent || !consent.checked) {
        showFieldError("consentement", "Merci d'accepter d'être recontacté pour envoyer votre demande.");
        valid5 = false;
      }
      return valid5;
    }

    return true;
  }

  function getFieldValue(name) {
    var field = form.elements[name];
    if (!field) return "";
    if (field instanceof RadioNodeList) {
      return field.value || "";
    }
    return (field.value || "").trim();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showFieldError(name, message) {
    var el = form.querySelector('[data-error-for="' + name + '"]');
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
  }

  function clearFieldError(name) {
    var el = form.querySelector('[data-error-for="' + name + '"]');
    if (el) {
      el.hidden = true;
      el.textContent = "";
    }
  }

  function clearAllErrorsInStep(step) {
    var panel = form.querySelector('[data-step-panel="' + step + '"]');
    if (!panel) return;
    panel.querySelectorAll("[data-error-for]").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
  }

  /* ---------------------------------------------------- */
  /* Navigation entre étapes                                */
  /* ---------------------------------------------------- */
  function goToStep(step) {
    currentStep = step;
    if (step > maxVisitedStep) maxVisitedStep = step;

    stepPanels.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute("data-step-panel")) !== step;
    });

    updateProgressUI();
    updateNavButtons();

    var currentPanel = form.querySelector('[data-step-panel="' + step + '"]');
    if (currentPanel) currentPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateProgressUI() {
    progressItems.forEach(function (item) {
      var stepNum = Number(item.getAttribute("data-progress-step"));
      if (stepNum === currentStep) {
        item.classList.add("text-accent", "font-medium");
      } else {
        item.classList.remove("text-accent", "font-medium");
      }
    });
  }

  function updateNavButtons() {
    // Ces boutons portent la classe .btn (display: inline-flex), qui
    // l'emporte sur l'attribut natif "hidden" dans la cascade CSS.
    // On pilote donc leur visibilité via un style inline explicite.
    btnPrev.style.display = currentStep === 1 ? "none" : "";
    btnNext.style.display = currentStep === TOTAL_STEPS ? "none" : "";
    btnSubmit.style.display = currentStep !== TOTAL_STEPS ? "none" : "";
  }

  btnNext.addEventListener("click", function () {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
  });

  btnPrev.addEventListener("click", function () {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  /* ---------------------------------------------------- */
  /* Préparation des données                                */
  /* Champs nommés explicitement pour une reprise ultérieure */
  /* par un CRM (Supabase) sans changer le format d'envoi.    */
  /* ---------------------------------------------------- */
  function buildSubmissionData() {
    var data = new FormData(form);

    // Retire les disponibilités 2/3 totalement vides pour ne pas
    // envoyer de champs inutiles.
    for (var i = 2; i <= 3; i++) {
      var dateVal = data.get("disponibilite_" + i + "_date");
      var horaireVal = data.get("disponibilite_" + i + "_horaire");
      if (!dateVal && !horaireVal) {
        data.delete("disponibilite_" + i + "_date");
        data.delete("disponibilite_" + i + "_horaire");
      }
    }

    return data;
  }

  function buildConfirmationSummary(data) {
    var service = data.get("service");
    var lines = [];

    lines.push({ label: "Service demandé", value: SERVICE_LABELS[service] || service });
    lines.push({ label: "Ville", value: data.get("ville") || "—" });

    for (var i = 1; i <= 3; i++) {
      var dateVal = data.get("disponibilite_" + i + "_date");
      var horaireVal = data.get("disponibilite_" + i + "_horaire");
      if (dateVal || horaireVal) {
        var formattedDate = dateVal ? formatDateFr(dateVal) : "";
        lines.push({
          label: "Disponibilité souhaitée " + i,
          value: [formattedDate, horaireVal].filter(Boolean).join(" — "),
        });
      }
    }

    return lines;
  }

  function formatDateFr(isoDate) {
    var parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  /* ---------------------------------------------------- */
  /* Affichage de la confirmation                           */
  /* ---------------------------------------------------- */
  function showConfirmation(data) {
    var lines = buildConfirmationSummary(data);
    confirmationSummary.innerHTML = "";
    lines.forEach(function (line) {
      var p = document.createElement("p");
      var strong = document.createElement("span");
      strong.className = "font-medium";
      strong.textContent = line.label + " : ";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(line.value));
      confirmationSummary.appendChild(p);
    });

    form.hidden = true;
    // Le conteneur de progression porte la classe .flex (display: flex),
    // qui l'emporterait sur l'attribut "hidden" — même traitement que les
    // boutons de navigation ci-dessus.
    document.querySelector("[data-progress]").style.display = "none";
    confirmationPanel.hidden = false;
    confirmationPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------------------------------------------- */
  /* Envoi Formspree                                        */
  /* ---------------------------------------------------- */
  function submitReservation() {
    formError.hidden = true;
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Envoi en cours…";

    var data = buildSubmissionData();

    fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        if (response.ok) {
          if (typeof window.gtag === "function") {
            window.gtag("event", "conversion", {
              send_to: "AW-18110089839/auiICJ3VjPscEO-UyLtD",
            });
          }
          showConfirmation(data);
        } else {
          formError.hidden = false;
        }
      })
      .catch(function () {
        formError.hidden = false;
      })
      .finally(function () {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Envoyer ma demande";
      });
  }

  btnSubmit.addEventListener("click", function () {
    if (!validateStep(5)) return;
    submitReservation();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  /* ---------------------------------------------------- */
  /* Effacement d'une erreur dès que le champ est corrigé  */
  /* (délégation : couvre aussi les champs de l'étape 2,    */
  /* générés dynamiquement après coup).                     */
  /* ---------------------------------------------------- */
  form.addEventListener("input", function (e) {
    if (e.target && e.target.name) clearFieldError(e.target.name);
  });
  form.addEventListener("change", function (e) {
    if (e.target && e.target.name) clearFieldError(e.target.name);
  });

  /* ---------------------------------------------------- */
  /* Initialisation                                         */
  /* ---------------------------------------------------- */
  initAvailabilityDateMinimums();
  preselectServiceFromUrl();
  goToStep(1);
})();
