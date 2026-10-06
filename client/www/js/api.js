"use strict";

/**
 * StudySwap shared API helper.
 *
 * Every page script uses these functions instead of calling fetch directly,
 * so auth headers, error shapes and redirects stay consistent app-wide.
 *
 * Server contract (see docs/api-contract.md):
 *   success -> { data: ... }
 *   failure -> { error: { message, status } }
 */

/* eslint-disable no-unused-vars */

// Dev default: docker compose maps the API container's port 3000 to host
// port 3100 (see compose.yaml) and runs it over plain HTTP. On Render,
// overridden in config step.
// var API_BASE = "http://localhost:3100/api";
var API_BASE = "https://coit20269-assessment-2-bnzk.onrender.com/api";

var TOKEN_KEY = "studyswap_token";

// ---------------------------------------------------------------------------
// Token store
// ---------------------------------------------------------------------------

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * apiFetch('users/login', { method: 'POST', body: {...}, auth: false })
 * Resolves with parsed `data` on 2xx.
 * Rejects with { message, status } on any failure.
 */
function apiFetch(path, options) {
  options = options || {};
  var method = options.method || "GET";
  var headers = { Accept: "application/json" };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.auth) {
    var token = getToken();
    if (!token) {
      return Promise.reject({ message: "Not logged in", status: 401 });
    }
    headers.Authorization = "Bearer " + token;
  }

  return fetch(API_BASE + "/" + path.replace(/^\//, ""), {
    method: method,
    headers: headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  }).then(function (res) {
    return res
      .json()
      .catch(function () {
        // Non-JSON body (e.g. server down HTML page)
        throw { message: "Server returned an invalid response", status: res.status };
      })
      .then(function (payload) {
        if (!res.ok) {
          throw {
            message: (payload.error && payload.error.message) || "Request failed",
            status: res.status,
          };
        }
        return payload.data;
      });
  });
}

// ---------------------------------------------------------------------------
// Navigation guards & session
// ---------------------------------------------------------------------------

/** Redirect to login page if there is no token. Use on pagesbefore show. */
function requireAuth() {
  if (!getToken()) {
    window.location.hash = "#page-login";
    return false;
  }
  return true;
}

/** Log out: tell the server, drop the token, go to login. */
function logout() {
  return apiFetch("users/logout", { method: "POST", auth: true })
    .catch(function () {
      // Token already invalid — treat as logged out anyway.
    })
    .then(function () {
      clearToken();
      window.location.hash = "#page-login";
    });
}

// ---------------------------------------------------------------------------
// Toast (single shared element, declared in index.html)
// ---------------------------------------------------------------------------

// Deliberately not a jQuery Mobile popup: a status message must not throw an
// overlay over the page or take focus the way a dialog does. #toast-popup is a
// plain aria-live region that sits above the tab bar and fades itself out.

var TOAST_MS = 3200;
var _toastTimer = null;

/**
 * toast("Listing created")           — confirmation
 * toast("Price is required", "error") — problem
 */
function toast(message, kind) {
  var popup = document.getElementById("toast-popup");
  var text = document.getElementById("toast-text");

  if (!popup || !text) {
    // No toast host in the DOM (e.g. a page rendered standalone).
    return;
  }

  var isError = kind === "error";
  text.textContent = message;
  popup.className = "toast" + (isError ? " toast--error" : "");
  popup.querySelector("use").setAttribute("xlink:href", isError ? "#i-alert" : "#i-check");

  popup.hidden = false;
  // Next frame, so the transition runs from the hidden state rather than
  // being collapsed into the same style recalculation.
  window.requestAnimationFrame(function () {
    popup.classList.add("is-open");
  });

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function () {
    popup.classList.remove("is-open");
    _toastTimer = setTimeout(function () {
      popup.hidden = true;
    }, 240);
  }, TOAST_MS);
}

/** Convenience: toast the message from an apiFetch rejection. */
function toastError(err) {
  toast((err && err.message) || "Something went wrong", "error");
}
