"use strict";

/**
 * Profile page (#page-profile) — GET /users/me + GET /listings?mine=1.
 * Links into create (#page-form) and detail for each of my listings.
 */

(function () {
  var SS = (window.StudySwap = window.StudySwap || {});

  var SELECTED_KEY = "studyswap_selected_listing_id";

  function selectListing(id) {
    SS.selectedListingId = id;
    try {
      window.sessionStorage.setItem(SELECTED_KEY, id);
    } catch {
      // sessionStorage may be unavailable in some WebViews — global still set.
    }
  }

  function loadMyListings() {
    var $list = $("#profile-list");
    var $empty = $("#profile-empty");
    var $count = $("#profile-count");

    $empty.prop("hidden", true);
    $count.text("");
    $list.attr("aria-busy", "true").html(SS.skeletonCards(2));

    // mine=1 still defaults to active; also fetch sold so profile shows both.
    return Promise.all([
      apiFetch("listings?mine=1", { auth: true }),
      apiFetch("listings?mine=1&status=sold", { auth: true }),
    ])
      .then(function (results) {
        var active = (results[0] && results[0].listings) || [];
        var sold = (results[1] && results[1].listings) || [];
        var listings = active.concat(sold);

        $list.attr("aria-busy", "false");

        if (!listings.length) {
          $list.empty();
          SS.renderState($empty, {
            icon: "sell",
            title: "No listings yet",
            text: "Post the textbooks, furniture or gear you no longer need and they will appear here.",
          });
          return;
        }

        // 'active' is an adjective here, so it never takes the plural 's'.
        $count.text(active.length + " active" + (sold.length ? " · " + sold.length + " sold" : ""));
        $list.html(
          listings
            .map(function (listing, i) {
              return SS.listingCard(listing, i, "profile-listing-link");
            })
            .join(""),
        );
      })
      .catch(function (err) {
        $list.attr("aria-busy", "false").empty();
        SS.renderState($empty, {
          variant: "error",
          icon: "alert",
          title: "Could not load your listings",
          text: (err && err.message) || "Check your connection and try again.",
          action: { id: "profile-retry", label: "Try again" },
        });
        toastError(err);
      });
  }

  function loadProfile() {
    if (!requireAuth()) {
      return;
    }

    apiFetch("users/me", { auth: true })
      .then(function (data) {
        var user = (data && data.user) || {};
        var name = user.name || "Student";
        $("#profile-avatar").text(SS.initials(name));
        $("#profile-name").text(name);
        $("#profile-email").text(user.email || "No email on file");
        $("#profile-campus").text(SS.campusLabel(user.campus));
        return loadMyListings();
      })
      .catch(function (err) {
        toastError(err);
        if (err && err.status === 401) {
          window.location.hash = "#page-login";
        }
      });
  }

  $(document).on("pagebeforeshow", "#page-profile", function () {
    loadProfile();
  });

  $(document).on("click", "#profile-retry", function () {
    loadMyListings();
  });

  $(document).on("click", "#profile-list .profile-listing-link", function () {
    var id = $(this).closest("li").attr("data-listing-id");
    if (id) {
      selectListing(id);
    }
  });
})();
