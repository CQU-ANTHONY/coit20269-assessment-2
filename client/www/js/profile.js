"use strict";

/**
 * Profile page (#page-profile) — GET /users/me + GET /listings?mine=1.
 * Links into create (#page-form) and detail for each of my listings.
 */

(function () {
  window.StudySwap = window.StudySwap || {};

  var SELECTED_KEY = "studyswap_selected_listing_id";
  var EDIT_KEY = "studyswap_edit_listing_id";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatPrice(price) {
    var n = Number(price);
    if (isNaN(n)) {
      return "$—";
    }
    return "$" + n.toFixed(n % 1 === 0 ? 0 : 2);
  }

  function campusLabel(campus) {
    var map = {
      BNE: "Brisbane (BNE)",
      SYD: "Sydney (SYD)",
      MEL: "Melbourne (MEL)",
      DST: "Distance (DST)",
      other: "Other / not listed",
    };
    return map[campus] || campus || "—";
  }

  function buildListItem(listing) {
    var id = listing._id;
    var title = escapeHtml(listing.title || "Untitled");
    var category = escapeHtml(listing.category || "");
    var price = escapeHtml(formatPrice(listing.price));
    var photo = listing.photo ? String(listing.photo) : "";
    var thumb = photo ? '<img src="' + escapeHtml(photo) + '" alt="" class="listing-thumb">' : "";
    var sold = listing.status === "sold" ? ' <span class="sold-badge">Sold</span>' : "";

    return (
      '<li data-listing-id="' +
      escapeHtml(id) +
      '">' +
      '<a href="#page-detail" class="profile-listing-link">' +
      thumb +
      "<h2>" +
      title +
      ' <span class="price-badge">' +
      price +
      "</span></h2>" +
      "<p>" +
      category +
      sold +
      "</p>" +
      "</a></li>"
    );
  }

  function refreshListview($list) {
    if ($list.hasClass("ui-listview")) {
      $list.listview("refresh");
    } else if ($.fn.listview) {
      $list.listview();
    }
  }

  function selectListing(id) {
    window.StudySwap.selectedListingId = id;
    try {
      window.sessionStorage.setItem(SELECTED_KEY, id);
    } catch {
      // ignore
    }
  }

  function clearEditMode() {
    window.StudySwap.editListingId = null;
    try {
      window.sessionStorage.removeItem(EDIT_KEY);
    } catch {
      // ignore
    }
  }

  function loadMyListings() {
    var $list = $("#profile-list");
    var $empty = $("#profile-empty");

    $list.empty();
    $empty.text("Loading…").prop("hidden", false);

    // mine=1 still defaults to active; also fetch sold so profile shows both.
    return Promise.all([
      apiFetch("listings?mine=1", { auth: true }),
      apiFetch("listings?mine=1&status=sold", { auth: true }),
    ])
      .then(function (results) {
        var active = (results[0] && results[0].listings) || [];
        var sold = (results[1] && results[1].listings) || [];
        var listings = active.concat(sold);

        $empty.prop("hidden", true);
        if (!listings.length) {
          $empty.text("You have no listings yet.").prop("hidden", false);
          refreshListview($list);
          return;
        }

        $list.html(listings.map(buildListItem).join(""));
        refreshListview($list);
      })
      .catch(function (err) {
        $empty.text((err && err.message) || "Could not load your listings").prop("hidden", false);
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
        $("#profile-name").text(user.name || "Student");
        $("#profile-email").text(user.email || "");
        $("#profile-campus").text(campusLabel(user.campus));
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

  $(document).on("click", "#profile-new-listing", function () {
    clearEditMode();
  });

  $(document).on("click", "#profile-list .profile-listing-link", function () {
    var id = $(this).closest("li").attr("data-listing-id");
    if (id) {
      selectListing(id);
    }
  });
})();
