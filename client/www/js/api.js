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

// Dev default: local Express server. On Render, overridden in config step.
var API_BASE = "https://localhost:3000/api";

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
// Toast (single shared jQuery Mobile popup, declared in index.html)
// ---------------------------------------------------------------------------

var _toastTimer = null;

function toast(message) {
  var popup = document.getElementById("toast-popup");
  var text = document.getElementById("toast-text");
  if (!popup || typeof $ === "undefined") {
    // Fallback when navigating between pages removed the popup from DOM.
    alert(message);
    return;
  }
  text.textContent = message;
  $("#toast-popup").popup("open");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function () {
    $("#toast-popup").popup("close");
  }, 2500);
}

/** Convenience: toast the message from an apiFetch rejection. */
function toastError(err) {
  toast((err && err.message) || "Something went wrong");
}
