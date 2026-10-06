"use strict";

/**
 * Listing detail (#page-detail) — GET /listings/:id.
 * Owner sees Edit (→ #page-form), Mark sold, and Delete.
 */

(function () {
  var SS = (window.StudySwap = window.StudySwap || {});

  var SELECTED_KEY = "studyswap_selected_listing_id";
  var EDIT_KEY = "studyswap_edit_listing_id";
  var currentListing = null;

  function getSelectedId() {
    if (SS.selectedListingId) {
      return SS.selectedListingId;
    }
    try {
      return window.sessionStorage.getItem(SELECTED_KEY) || "";
    } catch {
      return "";
    }
  }

  function sellerId(seller) {
    if (!seller) {
      return "";
    }
    if (typeof seller === "string") {
      return seller;
    }
    return String(seller._id || seller.id || "");
  }

  function showState(which) {
    $("#detail-loading").prop("hidden", which !== "loading");
    $("#detail-error").prop("hidden", which !== "error");
    $("#detail-content").prop("hidden", which !== "content");
  }

  function renderPhoto(listing) {
    var $photo = $("#detail-photo");
    var $fallback = $("#detail-photo-fallback");

    if (listing.photo) {
      $photo
        .attr("src", listing.photo)
        .attr("alt", listing.title || "Listing photo")
        .prop("hidden", false);
      $fallback.prop("hidden", true);
    } else {
      $photo.removeAttr("src").prop("hidden", true);
      $fallback.prop("hidden", false);
    }
  }

  function renderListing(listing, me) {
    currentListing = listing;

    renderPhoto(listing);

    $("#detail-title").text(listing.title || "Untitled");
    $("#detail-price").text(SS.formatPrice(listing.price));
    $("#detail-category")
      .text(SS.categoryLabel(listing.category))
      .attr("data-category", listing.category || "");

    var description = String(listing.description || "").trim();
    $("#detail-description")
      .text(description || "The seller did not add a description.")
      .toggleClass("is-empty", !description);

    var sold = listing.status === "sold";
    $("#detail-status").prop("hidden", !sold);
    $("#detail-mark-sold")
      .prop("disabled", sold)
      .find(".btn__label")
      .text(sold ? "Already sold" : "Mark sold");

    var seller = listing.seller || {};
    var name = (typeof seller === "object" && seller.name) || "Unknown seller";
    var campus = typeof seller === "object" ? seller.campus : "";
    $("#detail-seller-avatar").text(SS.initials(name));
    $("#detail-seller-name").text(name);
    $("#detail-seller-campus").text(SS.campusLabel(campus));

    var myId = me && me.id ? String(me.id) : "";
    var isOwner = myId && myId === sellerId(seller);
    $("#detail-owner-actions").prop("hidden", !isOwner);

    showState("content");
  }

  function loadDetail() {
    var id = getSelectedId();
    currentListing = null;
    showState("loading");
    $("#detail-owner-actions").prop("hidden", true);

    if (!id) {
      SS.renderState($("#detail-error"), {
        variant: "error",
        icon: "alert",
        title: "No listing selected",
        text: "Open a listing from Browse to see its details.",
      });
      showState("error");
      return;
    }

    var listingPromise = apiFetch("listings/" + encodeURIComponent(id));
    var mePromise = getToken()
      ? apiFetch("users/me", { auth: true })
          .then(function (data) {
            return data && data.user;
          })
          .catch(function () {
            return null;
          })
      : Promise.resolve(null);

    Promise.all([listingPromise, mePromise])
      .then(function (results) {
        var data = results[0];
        var me = results[1];
        var listing = data && data.listing;
        if (!listing) {
          throw { message: "Listing not found", status: 404 };
        }
        renderListing(listing, me);
      })
      .catch(function (err) {
        SS.renderState($("#detail-error"), {
          variant: "error",
          icon: "alert",
          title: "Could not load listing",
          text: (err && err.message) || "Check your connection and try again.",
          action: { id: "detail-retry", label: "Try again" },
        });
        showState("error");
        toastError(err);
      });
  }

  $(document).on("pagebeforeshow", "#page-detail", function () {
    loadDetail();
  });

  $(document).on("click", "#detail-retry", function () {
    loadDetail();
  });

  $(document).on("click", "#detail-edit", function () {
    if (!currentListing || !currentListing._id) {
      return;
    }
    try {
      window.sessionStorage.setItem(EDIT_KEY, currentListing._id);
    } catch {
      // ignore — the global below still carries the id for this session.
    }
    SS.editListingId = currentListing._id;
  });

  $(document).on("click", "#detail-mark-sold", function () {
    if (!currentListing || !currentListing._id) {
      return;
    }
    if (currentListing.status === "sold") {
      return;
    }
    if (!window.confirm("Mark this listing as sold? Buyers will still see it.")) {
      return;
    }

    var $btn = $(this);
    SS.setBusy($btn, true);

    apiFetch("listings/" + encodeURIComponent(currentListing._id), {
      method: "PUT",
      body: { status: "sold" },
      auth: true,
    })
      .then(function () {
        toast("Marked as sold");
        loadDetail();
      })
      .catch(function (err) {
        toastError(err);
      })
      .then(function () {
        SS.setBusy($btn, false);
      });
  });

  $(document).on("click", "#detail-delete", function () {
    if (!currentListing || !currentListing._id) {
      return;
    }
    if (!window.confirm("Delete this listing? This cannot be undone.")) {
      return;
    }

    var $btn = $(this);
    SS.setBusy($btn, true);

    apiFetch("listings/" + encodeURIComponent(currentListing._id), {
      method: "DELETE",
      auth: true,
    })
      .then(function () {
        toast("Listing deleted");
        currentListing = null;
        window.location.hash = "#page-browse";
      })
      .catch(toastError)
      .then(function () {
        SS.setBusy($btn, false);
      });
  });
})();
