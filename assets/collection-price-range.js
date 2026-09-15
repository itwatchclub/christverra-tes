function formatMoney(cents, format) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, format);
    }
    return (cents / 100).toLocaleString('id-ID');
  }
  
  function initPriceRangeSliders(scope) {
    if (typeof noUiSlider === 'undefined') return;
  
    (scope || document).querySelectorAll('.flat-slider').forEach(function (sliderEl) {
      if (sliderEl.dataset.initialized === 'true') return;
  
      var rangeMax = Number(sliderEl.dataset.rangeMax);
      var startMin = Number(sliderEl.dataset.startMin || 0);
      var startMax = Number(sliderEl.dataset.startMax || rangeMax);
      var moneyFormat = sliderEl.dataset.moneyFormat || '{{amount_no_decimals}}';
  
      var minInput = sliderEl.closest('.filter-panel').querySelector('[name="filter.v.price.gte"]');
      var maxInput = sliderEl.closest('.filter-panel').querySelector('[name="filter.v.price.lte"]');
      var fromLabel = sliderEl.parentElement.querySelector('[id^="from-range"]');
      var toLabel = sliderEl.parentElement.querySelector('[id^="to-range"]');
  
      noUiSlider.create(sliderEl, {
        start: [startMin, startMax],
        connect: true,
        range: { min: 0, max: rangeMax },
        step: 1
      });
  
      sliderEl.noUiSlider.on('update', function (values) {
        var minValue = Math.round(Number(values[0]));
        var maxValue = Math.round(Number(values[1]));
  
        if (minInput) minInput.value = minValue;
        if (maxInput) maxInput.value = maxValue;
        if (fromLabel) fromLabel.textContent = formatMoney(minValue, moneyFormat);
        if (toLabel) toLabel.textContent = formatMoney(maxValue, moneyFormat);
      });
  
      sliderEl.dataset.initialized = 'true';
    });
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    initPriceRangeSliders(document);
  
    document.querySelectorAll('.filter-form .filter-submit').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        btn.closest('form').submit();
      });
    });
  });