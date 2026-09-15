"use strict";

/**
 * Sign-up page (#page-signup) — POST /users/signup, store JWT, redirect to browse.
 */

(function () {
  function goBrowse() {
    window.location.hash = "#page-browse";
  }

  // Already signed in → skip the form.
  $(document).on("pagebeforeshow", "#page-signup", function () {
    if (getToken()) {
      goBrowse();
    }
  });

  $(document).on("submit", "#form-signup", function (event) {
    event.preventDefault();

    var name = $("#signup-name").val().trim();
    var email = $("#signup-email").val().trim();
    var password = $("#signup-password").val();
    var campus = $("#signup-campus").val() || "other";
    var $submit = $("#signup-submit");

    if (!name || !email || !password) {
      toast("Fill in your name, email and password", "error");
      return;
    }
    if (password.length < 8) {
      toast("Password must be at least 8 characters", "error");
      return;
    }

    window.StudySwap.setBusy($submit, true);

    apiFetch("users/signup", {
      method: "POST",
      body: {
        name: name,
        email: email,
        password: password,
        campus: campus,
      },
      auth: false,
    })
      .then(function (data) {
        setToken(data.token);
        toast(
          "Account created — welcome, " + (data.user && data.user.name ? data.user.name : name),
        );
        $("#form-signup")[0].reset();
        goBrowse();
      })
      .catch(toastError)
      .then(function () {
        window.StudySwap.setBusy($submit, false);
      });
  });
})();
