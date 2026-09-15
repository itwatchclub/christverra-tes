/**
 * Featured Collections Section JS
 * Replicated from used-theme FeaturedCollectionsSection logic
 * Implements vanilla JS tab switching as a Web Component (Shopify 2.0 pattern)
 */

class FeaturedCollectionsComponent extends HTMLElement {
  connectedCallback() {
    this._attachListeners();
  }

  disconnectedCallback() {
    if (this._clickHandler) {
      this.removeEventListener('click', this._clickHandler);
    }
  }

  /**
   * Shopify theme editor: when a block is selected in the editor,
   * switch to that tab so the merchant can see it.
   */
  onBlockSelect(event) {
    const tabBtn = this.querySelector('[aria-controls="' + event.target.id + '"]');
    if (tabBtn) tabBtn.click();
  }

  _attachListeners() {
    this._clickHandler = (event) => {
      const target = event.target.closest('[data-action="toggle-tab"]');
      if (target) this._switchTab(target);
    };
    this.addEventListener('click', this._clickHandler);
  }

  _switchTab(target) {
    // If the tab is already active, do nothing
    if (target.classList.contains('is-active')) return;

    // Update tab button states
    this.querySelectorAll('[data-action="toggle-tab"]').forEach((btn) => {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-selected', 'false');
    });
    target.classList.add('is-active');
    target.setAttribute('aria-selected', 'true');

    // Find and show the corresponding tab panel
    const panelId = target.getAttribute('aria-controls');
    this.querySelectorAll('.TabPanel').forEach((panel) => {
      panel.setAttribute('aria-hidden', 'true');
    });
    const panelToShow = this.querySelector('#' + panelId);
    if (panelToShow) {
      panelToShow.setAttribute('aria-hidden', 'false');
    }
  }
}

customElements.define('featured-collections-component', FeaturedCollectionsComponent);
