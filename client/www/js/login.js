"use strict";

/**
 * Login page (#page-login) — POST /users/login, store JWT, redirect to browse.
 * Also wires the shared nav Logout control once.
 */

(function () {
  function goBrowse() {
    window.location.hash = "#page-browse";
  }

  // Already signed in → skip the form.
  $(document).on("pagebeforeshow", "#page-login", function () {
    if (getToken()) {
      goBrowse();
    }
  });

  $(document).on("submit", "#form-login", function (event) {
    event.preventDefault();

    var email = $("#login-email").val().trim();
    var password = $("#login-password").val();
    var $submit = $("#login-submit");

    if (!email || !password) {
      toast("Email and password are required");
      return;
    }

    $submit.prop("disabled", true);

    apiFetch("users/login", {
      method: "POST",
      body: { email: email, password: password },
      auth: false,
    })
      .then(function (data) {
        setToken(data.token);
        toast("Welcome back, " + (data.user && data.user.name ? data.user.name : "student"));
        $("#form-login")[0].reset();
        goBrowse();
      })
      .catch(toastError)
      .then(function () {
        $submit.prop("disabled", false);
      });
  });

  // Shared menu logout (declared once in index.html).
  $(document).on("click", "#nav-logout", function (event) {
    event.preventDefault();
    logout();
  });

  // Guard app pages that need a session (browse/detail/form/profile).
  $(document).on(
    "pagebeforeshow",
    "#page-browse, #page-detail, #page-form, #page-profile",
    function () {
      requireAuth();
    },
  );
})();
