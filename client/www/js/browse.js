"use strict";

/**
 * Browse page (#page-browse) — GET /listings with category, search and sort.
 * Tapping a card stores the listing id and opens #page-detail.
 *
 * Category comes from the chip row, which writes the selected value into the
 * hidden #browse-category field; search is debounced so typing does not fire a
 * request per keystroke.
 */

(function () {
  var SS = (window.StudySwap = window.StudySwap || {});

  var SELECTED_KEY = "studyswap_selected_listing_id";
  var SEARCH_DEBOUNCE = 300;

  var searchTimer = null;
  var requestId = 0;

  function buildPath() {
    var category = $("#browse-category").val() || "";
    var q = String($("#browse-search").val() || "").trim();
    var sort = $("#browse-sort").val() || "newest";
    var params = [];

    if (category) {
      params.push("category=" + encodeURIComponent(category));
    }
    if (q) {
      params.push("q=" + encodeURIComponent(q));
    }
    if (sort !== "newest") {
      params.push("sort=" + encodeURIComponent(sort));
    }
    return "listings" + (params.length ? "?" + params.join("&") : "");
  }

  /** Describe the filters in play, so an empty result explains itself. */
  function emptyCopy() {
    var q = String($("#browse-search").val() || "").trim();
    var category = $("#browse-category").val() || "";

    if (q) {
      return 'Nothing matches "' + q + '". Try a shorter search or a different category.';
    }
    if (category) {
      return "No one is selling in " + SS.categoryLabel(category) + " right now. Try All.";
    }
    return "Listings from your campus show up here. Be the first to post one.";
  }

  function loadListings() {
    var $list = $("#browse-list");
    var $empty = $("#browse-empty");
    var $count = $("#browse-count");
    var path = buildPath();
    var ticket = ++requestId;

    $empty.prop("hidden", true);
    $count.text("");
    $list.attr("aria-busy", "true").html(SS.skeletonCards(4));

    return apiFetch(path)
      .then(function (data) {
        // A slower earlier request must not overwrite a newer result.
        if (ticket !== requestId) {
          return;
        }
        var listings = (data && data.listings) || [];
        $list.attr("aria-busy", "false");

        if (!listings.length) {
          $list.empty();
          $count.text("No matches");
          SS.renderState($empty, {
            icon: "box",
            title: "No listings yet",
            text: emptyCopy(),
          });
          return;
        }

        $count.text(SS.count(listings.length, "listing"));
        $list.html(
          listings
            .map(function (listing, i) {
              return SS.listingCard(listing, i, "browse-listing-link");
            })
            .join(""),
        );
      })
      .catch(function (err) {
        if (ticket !== requestId) {
          return;
        }
        $list.attr("aria-busy", "false").empty();
        SS.renderState($empty, {
          variant: "error",
          icon: "alert",
          title: "Could not load listings",
          text: (err && err.message) || "Check your connection and try again.",
          action: { id: "browse-retry", label: "Try again" },
        });
        toastError(err);
      });
  }

  function selectListing(id) {
    SS.selectedListingId = id;
    try {
      window.sessionStorage.setItem(SELECTED_KEY, id);
    } catch {
      // sessionStorage may be unavailable in some WebViews — global still set.
    }
  }

  function syncClearButton() {
    var hasText = String($("#browse-search").val() || "").length > 0;
    $("#browse-clear").prop("hidden", !hasText);
  }

  $(document).on("pagebeforeshow", "#page-browse", function () {
    syncClearButton();
    loadListings();
  });

  $(document).on("click", "#browse-chips .chip", function () {
    var $chip = $(this);
    if ($chip.hasClass("is-active")) {
      return;
    }
    $("#browse-chips .chip").removeClass("is-active");
    $chip.addClass("is-active");
    $("#browse-category").val($chip.attr("data-category") || "");
    loadListings();
  });

  $(document).on("change", "#browse-sort", function () {
    loadListings();
  });

  $(document).on("click", "#browse-refresh, #browse-retry", function () {
    loadListings();
  });

  $(document).on("submit", "#browse-searchbar", function (event) {
    event.preventDefault();
    clearTimeout(searchTimer);
    $("#browse-search").blur();
    loadListings();
  });

  $(document).on("input", "#browse-search", function () {
    syncClearButton();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadListings, SEARCH_DEBOUNCE);
  });

  $(document).on("click", "#browse-clear", function () {
    clearTimeout(searchTimer);
    $("#browse-search").val("").focus();
    syncClearButton();
    loadListings();
  });

  $(document).on("click", "#browse-list .browse-listing-link", function () {
    var id = $(this).closest("li").attr("data-listing-id");
    if (id) {
      selectListing(id);
    }
  });
})();
