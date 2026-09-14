"use strict";

/**
 * Listing create / edit / delete form (#page-form).
 *
 * sessionStorage keys:
 *   studyswap_edit_listing_id — if set, page is edit mode (GET listings/:id, PUT on save).
 *     Cleared after a successful save or delete. Unset = create mode (POST).
 */

(function () {
  var EDIT_KEY = "studyswap_edit_listing_id";
  var CATEGORIES = ["textbooks", "furniture", "electronics", "other"];

  /** @type {string|null} */
  var editingId = null;

  function setModeUi(isEdit) {
    $("#form-page-title").text(isEdit ? "Edit listing" : "New listing");
    $("#listing-submit").text(isEdit ? "Save changes" : "Save listing");
    $("#form-delete-wrap").prop("hidden", !isEdit);
  }

  function clearEditKey() {
    sessionStorage.removeItem(EDIT_KEY);
    editingId = null;
  }

  function updatePhotoPreview(src) {
    var $img = $("#listing-photo-preview");
    if (src) {
      $img.attr("src", src).prop("hidden", false).show();
    } else {
      $img.attr("src", "").prop("hidden", true).hide();
    }
  }

  function resetForm() {
    var form = document.getElementById("form-listing");
    if (form) {
      form.reset();
    }
    updatePhotoPreview("");
    var $cat = $("#listing-category");
    if ($cat.data("mobile-selectmenu")) {
      $cat.selectmenu("refresh");
    }
  }

  function populateForm(listing) {
    $("#listing-title").val(listing.title || "");
    $("#listing-description").val(listing.description || "");
    $("#listing-price").val(
      listing.price !== undefined && listing.price !== null ? listing.price : "",
    );
    $("#listing-category").val(listing.category || "");
    $("#listing-photo").val(listing.photo || "");
    updatePhotoPreview(listing.photo || "");
    var $cat = $("#listing-category");
    if ($cat.data("mobile-selectmenu")) {
      $cat.selectmenu("refresh", true);
    }
  }

  function validateAndBuildBody() {
    var title = String($("#listing-title").val() || "").trim();
    var description = String($("#listing-description").val() || "").trim();
    var priceRaw = String($("#listing-price").val() || "").trim();
    var category = String($("#listing-category").val() || "").trim();
    var photo = String($("#listing-photo").val() || "").trim();

    if (!title) {
      toast("Title is required");
      return null;
    }
    if (priceRaw === "") {
      toast("Price is required");
      return null;
    }
    var price = Number(priceRaw);
    if (!isFinite(price) || price < 0) {
      toast("Price must be a number zero or greater");
      return null;
    }
    if (!category || CATEGORIES.indexOf(category) === -1) {
      toast("Choose a valid category");
      return null;
    }

    var body = {
      title: title,
      description: description,
      price: price,
      category: category,
    };
    if (photo) {
      body.photo = photo;
    }
    return body;
  }

  function goAfterSave(listing) {
    clearEditKey();
    resetForm();
    if (listing && listing._id) {
      // #16 detail page can read this if needed; browse is the safe fallback.
      sessionStorage.setItem("studyswap_detail_listing_id", listing._id);
      window.location.hash = "#page-detail";
    } else {
      window.location.hash = "#page-browse";
    }
  }

  function takePhoto() {
    var Camera = navigator.camera;
    if (Camera && typeof Camera.getPicture === "function") {
      var destType =
        Camera.DestinationType && Camera.DestinationType.DATA_URL !== undefined
          ? Camera.DestinationType.DATA_URL
          : 0;
      Camera.getPicture(
        function (imageData) {
          var dataUrl =
            String(imageData).indexOf("data:") === 0
              ? imageData
              : "data:image/jpeg;base64," + imageData;
          $("#listing-photo").val(dataUrl);
          updatePhotoPreview(dataUrl);
          toast("Photo attached");
        },
        function () {
          toast("Could not take photo");
        },
        { quality: 50, destinationType: destType },
      );
      return;
    }

    var fileInput = document.getElementById("listing-photo-file");
    if (fileInput && typeof fileInput.click === "function") {
      toast("Camera comes with Cordova setup (#18). Choose a file for now.");
      fileInput.click();
      return;
    }

    toast("Camera comes with Cordova setup (#18). Paste a photo URL for now.");
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject({ message: "Could not read image file" });
      };
      reader.readAsDataURL(file);
    });
  }

  $(document).on("pagebeforeshow", "#page-form", function () {
    if (!requireAuth()) {
      return;
    }

    editingId = sessionStorage.getItem(EDIT_KEY);

    if (editingId) {
      setModeUi(true);
      apiFetch("listings/" + editingId)
        .then(function (data) {
          if (!data || !data.listing) {
            throw { message: "Listing not found", status: 404 };
          }
          populateForm(data.listing);
        })
        .catch(function (err) {
          toastError(err);
          clearEditKey();
          setModeUi(false);
          resetForm();
          window.location.hash = "#page-browse";
        });
    } else {
      setModeUi(false);
      resetForm();
    }
  });

  $(document).on("input change", "#listing-photo", function () {
    updatePhotoPreview(String($(this).val() || "").trim());
  });

  $(document).on("click", "#listing-photo-camera", function (event) {
    event.preventDefault();
    takePhoto();
  });

  $(document).on("change", "#listing-photo-file", function () {
    var file = this.files && this.files[0];
    if (!file) {
      return;
    }
    readFileAsDataUrl(file)
      .then(function (dataUrl) {
        $("#listing-photo").val(dataUrl);
        updatePhotoPreview(dataUrl);
        toast("Photo attached");
      })
      .catch(toastError);
    this.value = "";
  });

  $(document).on("submit", "#form-listing", function (event) {
    event.preventDefault();

    var body = validateAndBuildBody();
    if (!body) {
      return;
    }

    var $submit = $("#listing-submit");
    $submit.prop("disabled", true);

    var request;
    if (editingId) {
      request = apiFetch("listings/" + editingId, {
        method: "PUT",
        body: body,
        auth: true,
      });
    } else {
      request = apiFetch("listings", {
        method: "POST",
        body: body,
        auth: true,
      });
    }

    request
      .then(function (data) {
        toast(editingId ? "Listing updated" : "Listing created");
        goAfterSave(data && data.listing);
      })
      .catch(toastError)
      .then(function () {
        $submit.prop("disabled", false);
      });
  });

  $(document).on("click", "#listing-delete", function (event) {
    event.preventDefault();
    if (!editingId) {
      return;
    }
    if (!window.confirm("Delete this listing? This cannot be undone.")) {
      return;
    }

    var $btn = $("#listing-delete");
    $btn.prop("disabled", true);

    apiFetch("listings/" + editingId, { method: "DELETE", auth: true })
      .then(function () {
        toast("Listing deleted");
        clearEditKey();
        resetForm();
        window.location.hash = "#page-browse";
      })
      .catch(toastError)
      .then(function () {
        $btn.prop("disabled", false);
      });
  });
})();
