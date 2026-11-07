/* =========================================================
   pdp/ingredients.js: the "Ingredients" part of a product's Description.
   Single dish: its list from product-ingredients.js (window.PRODUCT_INGREDIENTS).
   Combo: one list per pouch, in the order of the pouches (window.COMBO_PDP[id].dishes).
   A product with no list gets nothing. No colours, no animation.
   window.MMIngredients.html(product, titleOf) -> HTML string ('' when there is nothing to show)
   ========================================================= */
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // one dish: a plain list, or [[label, list], ...] for a dish made of parts (Idli Sambar)
  function lines(entry) {
    if (Array.isArray(entry)) return entry.map(function (part) { return '<strong>' + esc(part[0]) + ':</strong> ' + esc(part[1]); });
    return [esc(entry)];
  }

  function html(p, titleOf) {
    var data = window.PRODUCT_INGREDIENTS || {};
    var out = '';
    if (p.category === 'Combos') {
      var combo = (window.COMBO_PDP || {})[p.id];
      var dishes = combo && combo.dishes ? combo.dishes : [];
      dishes.forEach(function (id) {
        if (!data[id]) return;
        out += '<p><strong>' + esc((titleOf && titleOf(id)) || id) + '</strong><br>' + lines(data[id]).join('<br>') + '</p>';
      });
    } else if (data[p.id]) {
      out = '<p>' + lines(data[p.id]).join('<br>') + '</p>';
    }
    return out ? '<h3>Ingredients</h3>' + out : '';
  }

  window.MMIngredients = { html: html };
})();
