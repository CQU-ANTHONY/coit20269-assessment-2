"use strict";

/**
 * Listing detail (#page-detail) — GET /listings/:id.
 * Owner sees Edit (→ #page-form), Mark sold, and Delete.
 */

(function () {
  window.StudySwap = window.StudySwap || {};

  var SELECTED_KEY = "studyswap_selected_listing_id";
  var EDIT_KEY = "studyswap_edit_listing_id";
  var currentListing = null;

  function getSelectedId() {
    if (window.StudySwap.selectedListingId) {
      return window.StudySwap.selectedListingId;
    }
    try {
      return window.sessionStorage.getItem(SELECTED_KEY) || "";
    } catch {
      return "";
    }
  }

  function formatPrice(price) {
    var n = Number(price);
    if (isNaN(n)) {
      return "$—";
    }
    return "$" + n.toFixed(n % 1 === 0 ? 0 : 2);
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

  function campusLabel(campus) {
    var map = {
      BNE: "Brisbane (BNE)",
      SYD: "Sydney (SYD)",
      MEL: "Melbourne (MEL)",
      DST: "Distance (DST)",
      other: "Other",
    };
    return map[campus] || campus || "—";
  }

  function showState(which) {
    $("#detail-loading").prop("hidden", which !== "loading");
    $("#detail-error").prop("hidden", which !== "error");
    $("#detail-content").prop("hidden", which !== "content");
  }

  function renderListing(listing, me) {
    currentListing = listing;

    var $photo = $("#detail-photo");
    if (listing.photo) {
      $photo
        .attr("src", listing.photo)
        .attr("alt", listing.title || "Listing photo")
        .prop("hidden", false);
    } else {
      $photo.removeAttr("src").prop("hidden", true);
    }

    $("#detail-title").text(listing.title || "Untitled");
    $("#detail-price").text(formatPrice(listing.price));
    $("#detail-category").text(listing.category || "");
    $("#detail-description").text(listing.description || "No description.");

    var sold = listing.status === "sold";
    $("#detail-status").prop("hidden", !sold);
    $("#detail-mark-sold")
      .prop("disabled", sold)
      .text(sold ? "Sold" : "Mark sold");

    var seller = listing.seller || {};
    var name = typeof seller === "object" ? seller.name : "";
    var campus = typeof seller === "object" ? seller.campus : "";
    $("#detail-seller-name").text(name || "Unknown seller");
    $("#detail-seller-campus").text(campus ? campusLabel(campus) : "");

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
      $("#detail-error").text("No listing selected.").prop("hidden", false);
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
        $("#detail-error").text((err && err.message) || "Could not load listing");
        showState("error");
        toastError(err);
      });
  }

  $(document).on("pagebeforeshow", "#page-detail", function () {
    loadDetail();
  });

  $(document).on("click", "#detail-edit", function () {
    if (!currentListing || !currentListing._id) {
      return;
    }
    try {
      window.sessionStorage.setItem(EDIT_KEY, currentListing._id);
    } catch {
      // ignore
    }
    window.StudySwap.editListingId = currentListing._id;
  });

  $(document).on("click", "#detail-mark-sold", function () {
    if (!currentListing || !currentListing._id) {
      return;
    }
    if (currentListing.status === "sold") {
      return;
    }
    if (!window.confirm("Mark this listing as sold?")) {
      return;
    }

    var $btn = $(this).prop("disabled", true);
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
        $btn.prop("disabled", false);
        toastError(err);
      });
  });

  $(document).on("click", "#detail-delete", function () {
    if (!currentListing || !currentListing._id) {
      return;
    }
    if (!window.confirm("Delete this listing? This cannot be undone.")) {
      return;
    }

    apiFetch("listings/" + encodeURIComponent(currentListing._id), {
      method: "DELETE",
      auth: true,
    })
      .then(function () {
        toast("Listing deleted");
        currentListing = null;
        window.location.hash = "#page-browse";
      })
      .catch(toastError);
  });
})();
