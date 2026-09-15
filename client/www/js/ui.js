"use strict";

/**
 * StudySwap shared presentation helpers.
 *
 * Browse and Profile render the same listing card, and every page needs the
 * same escaping, price and label formatting — this file owns all of it so the
 * card markup has exactly one definition. Page scripts stay responsible for
 * fetching and for their own events.
 */

/* eslint-disable no-unused-vars */

(function () {
  var SS = (window.StudySwap = window.StudySwap || {});

  var CATEGORY_LABELS = {
    textbooks: "Textbooks",
    furniture: "Furniture",
    electronics: "Electronics",
    other: "Other",
  };

  var CAMPUS_LABELS = {
    BNE: "Brisbane (BNE)",
    SYD: "Sydney (SYD)",
    MEL: "Melbourne (MEL)",
    DST: "Distance (DST)",
    other: "Other / not listed",
  };

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatPrice(price) {
    var n = Number(price);
    if (!isFinite(n)) {
      return "$—";
    }
    if (n === 0) {
      return "Free";
    }
    return "$" + n.toFixed(n % 1 === 0 ? 0 : 2);
  }

  function categoryLabel(category) {
    return CATEGORY_LABELS[category] || category || "Uncategorised";
  }

  function campusLabel(campus) {
    return CAMPUS_LABELS[campus] || campus || "Campus not set";
  }

  /** "Alex Nguyen" -> "AN". Falls back to the first letter, then to a dash. */
  function initials(name) {
    var parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) {
      return "—";
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /** Pluralise a count for result lines: count(2, "listing") -> "2 listings". */
  function count(n, noun) {
    return n + " " + noun + (n === 1 ? "" : "s");
  }

  // ---------------------------------------------------------------------------
  // Markup
  // ---------------------------------------------------------------------------

  /** Reference one symbol from the sprite in index.html. */
  function icon(name, className) {
    return (
      '<svg class="icon' +
      (className ? " " + escapeHtml(className) : "") +
      '" aria-hidden="true"><use xlink:href="#i-' +
      escapeHtml(name) +
      '"></use></svg>'
    );
  }

  /**
   * One listing row. `index` staggers the entrance animation so a loaded list
   * resolves as a sequence rather than a single flash.
   */
  function listingCard(listing, index, linkClass) {
    var sold = listing.status === "sold";
    var category = listing.category || "";
    var photo = listing.photo ? String(listing.photo) : "";

    var thumb = photo
      ? '<img src="' + escapeHtml(photo) + '" alt="" loading="lazy">'
      : icon("image");

    return (
      '<li class="card' +
      (sold ? " is-sold" : "") +
      '" data-listing-id="' +
      escapeHtml(listing._id) +
      '" style="--i:' +
      (Number(index) || 0) +
      '">' +
      '<a href="#page-detail" class="card__link ' +
      escapeHtml(linkClass || "") +
      '">' +
      '<span class="card__thumb">' +
      thumb +
      "</span>" +
      '<span class="card__body">' +
      '<span class="card__title">' +
      escapeHtml(listing.title || "Untitled") +
      "</span>" +
      '<span class="card__meta">' +
      '<span class="card__price">' +
      escapeHtml(formatPrice(listing.price)) +
      "</span>" +
      '<span class="chip chip--static" data-category="' +
      escapeHtml(category) +
      '">' +
      escapeHtml(categoryLabel(category)) +
      "</span>" +
      (sold ? '<span class="chip chip--sold">Sold</span>' : "") +
      "</span>" +
      "</span>" +
      "</a></li>"
    );
  }

  /** Placeholder rows shown while a list request is in flight. */
  function skeletonCards(n) {
    var out = "";
    for (var i = 0; i < n; i++) {
      out += '<li class="skel skel--card"></li>';
    }
    return out;
  }

  /**
   * Render an empty or error state into `$el`.
   * opts: { icon, title, text, action: { id, label } , variant: "error" }
   */
  function renderState($el, opts) {
    var action = opts.action
      ? '<button type="button" data-role="none" class="btn btn--sm" id="' +
        escapeHtml(opts.action.id) +
        '">' +
        escapeHtml(opts.action.label) +
        "</button>"
      : "";

    $el
      .attr("class", "state" + (opts.variant === "error" ? " state--error" : ""))
      .html(
        '<span class="state__icon">' +
          icon(opts.icon || "box") +
          "</span>" +
          '<p class="state__title">' +
          escapeHtml(opts.title) +
          "</p>" +
          (opts.text ? '<p class="state__text">' + escapeHtml(opts.text) + "</p>" : "") +
          action,
      )
      .prop("hidden", false);
  }

  /** Swap a button into its spinner state without changing its width. */
  function setBusy($btn, busy) {
    $btn.toggleClass("is-busy", !!busy).prop("disabled", !!busy);
  }

  SS.escapeHtml = escapeHtml;
  SS.formatPrice = formatPrice;
  SS.categoryLabel = categoryLabel;
  SS.campusLabel = campusLabel;
  SS.initials = initials;
  SS.count = count;
  SS.icon = icon;
  SS.listingCard = listingCard;
  SS.skeletonCards = skeletonCards;
  SS.renderState = renderState;
  SS.setBusy = setBusy;
})();
