"use strict";

/**
 * Browse page (#page-browse) — GET /listings with category + search filters.
 * Tapping a row stores the listing id and opens #page-detail.
 */

(function () {
  window.StudySwap = window.StudySwap || {};

  var SELECTED_KEY = "studyswap_selected_listing_id";

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
      '<a href="#page-detail" class="browse-listing-link">' +
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

  function loadListings() {
    var category = $("#browse-category").val() || "";
    var q = ($("#browse-search").val() || "").trim();
    var path = "listings";
    var params = [];

    if (category) {
      params.push("category=" + encodeURIComponent(category));
    }
    if (q) {
      params.push("q=" + encodeURIComponent(q));
    }
    if (params.length) {
      path += "?" + params.join("&");
    }

    var $list = $("#browse-list");
    var $empty = $("#browse-empty");

    $list.empty();
    $empty.text("Loading…").prop("hidden", false);

    return apiFetch(path)
      .then(function (data) {
        var listings = (data && data.listings) || [];
        $empty.prop("hidden", true);

        if (!listings.length) {
          $empty.text("No listings found.").prop("hidden", false);
          refreshListview($list);
          return;
        }

        var html = listings.map(buildListItem).join("");
        $list.html(html);
        refreshListview($list);
      })
      .catch(function (err) {
        $empty.text((err && err.message) || "Could not load listings").prop("hidden", false);
        toastError(err);
      });
  }

  function selectListing(id) {
    window.StudySwap.selectedListingId = id;
    try {
      window.sessionStorage.setItem(SELECTED_KEY, id);
    } catch {
      // sessionStorage may be unavailable in some WebViews — global still set.
    }
  }

  $(document).on("pagebeforeshow", "#page-browse", function () {
    loadListings();
  });

  $(document).on("change", "#browse-category", function () {
    loadListings();
  });

  $(document).on("click", "#browse-refresh", function () {
    loadListings();
  });

  // Enter in search field
  $(document).on("keydown", "#browse-search", function (event) {
    if (event.key === "Enter" || event.keyCode === 13) {
      event.preventDefault();
      loadListings();
    }
  });

  $(document).on("click", "#browse-list .browse-listing-link", function () {
    var id = $(this).closest("li").attr("data-listing-id");
    if (id) {
      selectListing(id);
    }
  });
})();
