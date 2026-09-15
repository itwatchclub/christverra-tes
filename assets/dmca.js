(function () {
  const DESKTOP_MQ = window.matchMedia('(min-width: 990px)');
  const HOVER_DELAY = 120;

  function updatePanelLine(navItem, line, panel) {
    if (!line || !panel) return;

    const itemRect = navItem.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();

    line.style.left = `${panelRect.left - itemRect.left}px`;
    line.style.width = `${panelRect.width}px`;
  }

  function clearPanelLine(line) {
    if (!line) return;
    line.style.width = '0';
    line.style.left = '0';
  }

  function bindHoverPanel(navItem) {
    const panel = navItem.querySelector('.header__mega-menu, .header__dropdown-menu');
    const line = navItem.querySelector('.header__nav-line--panel');
    if (!panel || !line) return;

    let closeTimer = null;

    const open = () => {
      clearTimeout(closeTimer);
      navItem.classList.add('is-hovered');
      panel.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => updatePanelLine(navItem, line, panel));
    };

    const close = () => {
      closeTimer = setTimeout(() => {
        navItem.classList.remove('is-hovered');
        panel.setAttribute('aria-hidden', 'true');
        clearPanelLine(line);
      }, HOVER_DELAY);
    };

    [navItem, panel].forEach((el) => {
      el.addEventListener('mouseenter', open);
      el.addEventListener('mouseleave', close);
    });
  }

  function initHeaderNav() {
    if (!DESKTOP_MQ.matches) return;

    document
      .querySelectorAll('.header__inline-menu > .list-menu--inline > .header__nav-item--mega, .header__inline-menu > .list-menu--inline > .header__nav-item--dropdown')
      .forEach(bindHoverPanel);

    window.addEventListener('resize', () => {
      document.querySelectorAll('.header__nav-item.is-hovered').forEach((navItem) => {
        const panel = navItem.querySelector('.header__mega-menu, .header__dropdown-menu');
        const line = navItem.querySelector('.header__nav-line--panel');
        updatePanelLine(navItem, line, panel);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderNav);
  } else {
    initHeaderNav();
  }

  DESKTOP_MQ.addEventListener('change', initHeaderNav);
})();

(function () {
  function closePopover(popover) {
    if (!popover) return;
    popover.setAttribute('aria-hidden', 'true');
    const trigger = document.querySelector(`[aria-controls="${popover.id}"]`);
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function closeAllPopovers(except) {
    document.querySelectorAll('.Popover[aria-hidden="false"]').forEach((popover) => {
      if (popover !== except) closePopover(popover);
    });
  }

  function initFooterPopovers() {
    document.querySelectorAll('.Footer__LocalizationItem .SelectButton[aria-haspopup]').forEach((button) => {
      const popoverId = button.getAttribute('aria-controls');
      const popover = popoverId ? document.getElementById(popoverId) : null;
      if (!popover) return;

      button.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = popover.getAttribute('aria-hidden') === 'false';
        closeAllPopovers();
        if (!isOpen) {
          popover.setAttribute('aria-hidden', 'false');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.querySelectorAll('[data-action="close-popover"]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        closePopover(button.closest('.Popover'));
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.Footer__LocalizationItem')) {
        closeAllPopovers();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterPopovers);
  } else {
    initFooterPopovers();
  }
})();

(function () {
  const STORAGE_KEY = 'currencySelected';

  function formatUSD(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  function cacheOriginalPrices() {
    document.querySelectorAll('.field-money').forEach((el) => {
      if (!el.dataset.idrText) {
        el.dataset.idrText = el.textContent.trim();
      }
      if (!el.dataset.price && el.getAttribute('price')) {
        el.dataset.price = el.getAttribute('price');
      }
    });
  }

  function applyCurrency(currency, usdRate) {
    document.body.setAttribute('data-currency', currency);
    document.body.setAttribute('usd', String(usdRate));

    document.querySelectorAll('.field-money').forEach((el) => {
      const priceCents = el.dataset.price || el.getAttribute('price');
      if (!priceCents) {
        if (currency === 'IDR' && el.dataset.idrText) {
          el.textContent = el.dataset.idrText;
        }
        return;
      }

      const idr = Number(priceCents) / 100;
      if (currency === 'USD') {
        el.textContent = formatUSD(idr / usdRate);
      } else if (el.dataset.idrText) {
        el.textContent = el.dataset.idrText;
      }
    });

    document.querySelectorAll('[data-currency-value]').forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.currencyValue === currency);
    });
  }

  function closeCurrencyMenus(except) {
    document.querySelectorAll('.header__currency-menu').forEach((menu) => {
      if (menu === except) return;
      menu.setAttribute('aria-hidden', 'true');
      const toggle = menu.closest('[data-currency-custom]')?.querySelector('.header__currency-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function initCurrencyCustom() {
    cacheOriginalPrices();

    document.querySelectorAll('[data-currency-custom]').forEach((root) => {
      const toggle = root.querySelector('.header__currency-toggle');
      const menu = root.querySelector('.header__currency-menu');
      const label = root.querySelector('[data-currency-label]');
      if (!toggle || !menu || !label) return;

      const usdRate = parseFloat(root.dataset.usdRate) || 16000;
      const defaultCurrency = root.dataset.defaultCurrency || 'IDR';
      const stored = localStorage.getItem(STORAGE_KEY) || defaultCurrency;

      label.textContent = stored;
      applyCurrency(stored, usdRate);

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = menu.getAttribute('aria-hidden') === 'false';
        closeCurrencyMenus();
        if (!isOpen) {
          menu.setAttribute('aria-hidden', 'false');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });

      root.querySelectorAll('[data-currency-value]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          const currency = button.dataset.currencyValue;
          localStorage.setItem(STORAGE_KEY, currency);
          label.textContent = currency;
          applyCurrency(currency, usdRate);
          menu.setAttribute('aria-hidden', 'true');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('[data-currency-custom]')) {
        closeCurrencyMenus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCurrencyCustom);
  } else {
    initCurrencyCustom();
  }

  document.addEventListener('shopify:section:load', initCurrencyCustom);
})();


// warranty
// Check if warranty-background section exists and set footer margin-top to 0
document.addEventListener('DOMContentLoaded', function() {
    const warrantyBackground = document.getElementById('shopify-section-warranty-background');
    const sectionFooter = document.getElementById('section-footer');
    
    if (warrantyBackground && sectionFooter) {
      sectionFooter.style.marginTop = '0';
    }
  });
  
  // Also check after page load in case elements are added dynamically
  window.addEventListener('load', function() {
    const warrantyBackground = document.getElementById('shopify-section-warranty-background');
    const sectionFooter = document.getElementById('section-footer');
    
    if (warrantyBackground && sectionFooter) {
      sectionFooter.style.marginTop = '0';
    }
  });
  
(function () {
  class SearchBar {
    constructor() {
      this.searchElement = document.getElementById('Search');
      if (!this.searchElement) return;

      this.searchInputElement = this.searchElement.querySelector('[name="q"]');
      this.searchResultsElement = this.searchElement.querySelector('.Search__Results');
      if (!this.searchInputElement || !this.searchResultsElement) return;

      this.pageOverlayElement = document.querySelector('.PageOverlay');
      this.queryMap = {};
      this.isOpen = false;
      this.lastInputValue = '';

      this._onDocumentClick = this._onDocumentClick.bind(this);
      this._onKeydown = this._onKeydown.bind(this);
      this._onSearchCloseEvent = this._closeSearch.bind(this);

      this._attachListeners();
    }

    destroy() {
      if (!this.searchInputElement) return;
      this.searchInputElement.removeEventListener('keydown', this._preventSubmissionListener);
      this.searchInputElement.removeEventListener('input', this._onInputListener);
      document.body.removeEventListener('click', this._onDocumentClick);
      document.removeEventListener('keydown', this._onKeydown);
      document.removeEventListener('search:close', this._onSearchCloseEvent);
    }

    _attachListeners() {
      this._preventSubmissionListener = this._preventSubmission.bind(this);
      this._onInputListener = this._debounce(this._onInput.bind(this), 250);

      this.searchInputElement.addEventListener('keydown', this._preventSubmissionListener);
      this.searchInputElement.addEventListener('input', this._onInputListener);

      document.body.addEventListener('click', this._onDocumentClick);
      document.addEventListener('keydown', this._onKeydown);
      document.addEventListener('search:close', this._onSearchCloseEvent);
    }

    _onDocumentClick(event) {
      if (event.target.closest('[data-action="toggle-search"]')) {
        this._toggleSearch(event);
        return;
      }

      if (event.target.closest('[data-action="open-search"]')) {
        event.preventDefault();
        this._openSearch();
        return;
      }

      if (event.target.closest('[data-action="close-search"]')) {
        event.preventDefault();
        this._closeSearch();
      }
    }

    _onKeydown(event) {
      if (event.key === 'Escape' && this.isOpen) {
        this._closeSearch();
      }
    }

    _toggleSearch(event) {
      if (this.isOpen) {
        this._closeSearch();
      } else {
        this._openSearch();
      }
      event.preventDefault();
    }

    _openSearch() {
      this.searchElement.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('search-open', 'overflow-hidden');
      document.dispatchEvent(new CustomEvent('search:open'));

      requestAnimationFrame(() => {
        this.searchInputElement.focus();
      });

      this.isOpen = true;

      if (this.pageOverlayElement) {
        this.pageOverlayElement.classList.add('is-visible');
      }

      const headerSection = document.querySelector('#shopify-section-header');
      if (headerSection) headerSection.style.zIndex = '100';
    }

    _closeSearch() {
      if (!this.searchElement) return;

      this.searchElement.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('search-open', 'overflow-hidden');
      this.isOpen = false;

      const headerSection = document.querySelector('#shopify-section-header');

      if (this.pageOverlayElement) {
        const onTransitionEnd = (event) => {
          if (event.propertyName === 'visibility' || event.propertyName === 'opacity') {
            if (headerSection) headerSection.style.zIndex = '';
            this.pageOverlayElement.removeEventListener('transitionend', onTransitionEnd);
          }
        };

        this.pageOverlayElement.addEventListener('transitionend', onTransitionEnd);
        this.pageOverlayElement.classList.remove('is-visible');

        // Fallback if transitionend does not fire
        setTimeout(() => {
          if (headerSection && !this.isOpen) headerSection.style.zIndex = '';
        }, 300);
      } else if (headerSection) {
        headerSection.style.zIndex = '';
      }
    }

    _preventSubmission(event) {
      const searchMode = (window.theme && window.theme.searchMode) || 'product';
      if (event.keyCode === 13 && searchMode !== 'product') {
        event.preventDefault();
      }
    }

    _onInput(event) {
      if (event.keyCode === 13) return;

      this.lastInputValue = event.target.value;

      if (this.lastInputValue === '') {
        this._resetSearch();
        return;
      }

      const searchUrl = (window.routes && window.routes.searchUrl) || '/search';
      const searchMode = (window.theme && window.theme.searchMode) || 'product';
      const queryOptions = { method: 'GET', credentials: 'same-origin' };
      const queries = [
        fetch(
          searchUrl + '?view=ajax&q=' + encodeURIComponent(this.lastInputValue) + '*&type=product',
          queryOptions
        )
      ];

      if (searchMode !== 'product') {
        queries.push(
          fetch(
            searchUrl +
              '?view=ajax&q=' +
              encodeURIComponent(this.lastInputValue) +
              '*&type=' +
              searchMode.replace('product,', ''),
            queryOptions
          )
        );
      }

      this.queryMap[this.lastInputValue] = true;

      Promise.all(queries).then((responses) => {
        if (this.lastInputValue !== event.target.value) return;

        delete this.queryMap[event.target.value];

        Promise.all(responses.map((response) => response.text())).then((contents) => {
          if (searchMode === 'product') {
            this.searchResultsElement.innerHTML = contents[0];
          } else {
            this.searchResultsElement.innerHTML =
              '<div class="PageLayout PageLayout--breakLap">\n' +
              '              <div class="PageLayout__Section">' +
              contents[0] +
              '</div>\n' +
              '              <div class="PageLayout__Section PageLayout__Section--secondary">' +
              contents[1] +
              '</div>\n' +
              '            </div>';
          }

          this.searchResultsElement.setAttribute('aria-hidden', 'false');
        });
      });
    }

    _resetSearch() {
      const searchMode = (window.theme && window.theme.searchMode) || 'product';

      if (searchMode === 'product') {
        this.searchResultsElement.innerHTML = '';
      } else {
        this.searchResultsElement.innerHTML =
          '<div class="PageLayout PageLayout--breakLap">\n' +
          '              <div class="PageLayout__Section"></div>\n' +
          '              <div class="PageLayout__Section PageLayout__Section--secondary"></div>\n' +
          '            </div>';
      }

      this.searchResultsElement.setAttribute('aria-hidden', 'true');
    }

    _debounce(fn, delay) {
      let timer = null;

      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(this, args);
        }, delay);
      };
    }
  }

  function initSearchBar() {
    if (window.__christVerraSearchBar && typeof window.__christVerraSearchBar.destroy === 'function') {
      window.__christVerraSearchBar.destroy();
    }
    window.__christVerraSearchBar = new SearchBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchBar);
  } else {
    initSearchBar();
  }
})();
