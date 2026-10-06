"use strict";

/**
 * Load HTML page/shared components, then hand control to jQuery Mobile.
 *
 * jQM is started with autoInitializePage = false (see index.html mobileinit)
 * so pages can be injected into <body> before the first enhance pass.
 * Fragments live under components/ — no build step; works on file:// (Cordova)
 * and http(s) via XHR (status 0 is success on file://).
 */

(function () {
  var COMPONENTS = [
    "components/icon-sprite.html",
    "components/page-login.html",
    "components/page-signup.html",
    "components/page-browse.html",
    "components/page-detail.html",
    "components/page-form.html",
    "components/page-profile.html",
    "components/toast.html",
  ];

  var TABBAR_PATH = "components/partial-tabbar.html";

  // Long enough that a page change reads as a loader, not a flicker of text.
  var TRANSITION_VEIL_MS = 200;
  var booted = false;
  var veilShownAt = 0;
  var veilTimer = null;

  function showVeil() {
    clearTimeout(veilTimer);
    veilShownAt = performance.now();
    document.documentElement.classList.add("is-changing");
    document.documentElement.setAttribute("aria-busy", "true");
  }

  function hideVeil() {
    clearTimeout(veilTimer);
    var wait = booted ? Math.max(0, TRANSITION_VEIL_MS - (performance.now() - veilShownAt)) : 0;
    veilTimer = setTimeout(function () {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          document.documentElement.classList.add("is-booted");
          document.documentElement.classList.remove("is-changing");
          document.documentElement.removeAttribute("aria-busy");
          booted = true;
        });
      });
    }, wait);
  }

  if (window.jQuery) {
    // Cover the swap itself. The first page has no outgoing page, so the
    // veil that was in the HTML stays up until pagecontainershow.
    jQuery(document).on("pagecontainerbeforehide", function () {
      if (booted) {
        showVeil();
      }
    });
    jQuery(document).on("pagecontainershow", hideVeil);
    jQuery(document).on("pagecontainerchangefailed", hideVeil);
  }

  function loadHtml(path) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path);
      xhr.onload = function () {
        // file:// often reports status 0 on success
        if (xhr.status === 200 || xhr.status === 0) {
          resolve(xhr.responseText);
          return;
        }
        reject(new Error("Failed to load " + path + " (" + xhr.status + ")"));
      };
      xhr.onerror = function () {
        reject(new Error("Network error loading " + path));
      };
      xhr.send();
    });
  }

  function mount(html) {
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    while (wrap.firstChild) {
      document.body.appendChild(wrap.firstChild);
    }
  }

  /** Expand <div data-ss-tabbar="browse|sell|profile"> with the shared footer. */
  function expandTabbars(tabbarHtml) {
    var nodes = document.querySelectorAll("[data-ss-tabbar]");
    Array.prototype.forEach.call(nodes, function (el) {
      var active = el.getAttribute("data-ss-tabbar") || "";
      var wrap = document.createElement("div");
      wrap.innerHTML = tabbarHtml.trim();
      var footer = wrap.firstElementChild;
      if (!footer) {
        return;
      }
      var tab = footer.querySelector('[data-tab="' + active + '"]');
      if (tab) {
        tab.classList.add("is-active");
      }
      el.parentNode.replaceChild(footer, el);
    });
  }

  function boot() {
    return Promise.all(COMPONENTS.map(loadHtml).concat([loadHtml(TABBAR_PATH)])).then(
      function (parts) {
        var tabbarHtml = parts.pop();
        parts.forEach(mount);
        expandTabbars(tabbarHtml);
        if (window.jQuery && jQuery.mobile && jQuery.mobile.initializePage) {
          jQuery.mobile.initializePage();
        }
      },
    );
  }

  window.StudySwapBoot = { boot: boot, loadHtml: loadHtml };

  // Run after jQuery Mobile is on the page (script order in index.html).
  boot().catch(function (err) {
    // Surface clearly — a blank shell means a missing fragment path.
    console.error("[StudySwap] boot failed:", err);
    document.documentElement.classList.add("is-booted");
    document.documentElement.classList.remove("is-changing");
    document.documentElement.removeAttribute("aria-busy");
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="padding:1rem;font-family:sans-serif;color:#f38ba8">' +
        "StudySwap failed to load UI components. Check the console." +
        "</p>",
    );
  });
})();
