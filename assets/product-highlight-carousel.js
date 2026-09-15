/**
 * Product Highlight Carousel
 * Vanilla JS fade carousel (1 slide), mirrors slideshow-section.js pattern
 */

class ProductHighlightCarousel extends HTMLElement {
    constructor() {
      super();
      this.slides = [];
      this.currentIndex = 0;
      this.selectedSlide = null;
    }
  
    connectedCallback() {
      this.carousel = this.querySelector('.product-highlight-carousel');
      this.slides = Array.from(this.querySelectorAll('.product-carousel-item'));
      this.prevBtn = this.querySelector('.product-highlight-carousel__nav--prev');
      this.nextBtn = this.querySelector('.product-highlight-carousel__nav--next');
      this.currentSlideEl = this.querySelector('.current-slide');
      this.totalSlidesEl = this.querySelector('.total-slides');
  
      if (this.carousel) this.carousel.classList.add('Carousel--initialized');
  
      if (this.slides.length > 0) {
        this._transitionToSlide(0, true);
        this._attachListeners();
      }
    }
  
    disconnectedCallback() {
      if (this._clickHandler) this.removeEventListener('click', this._clickHandler);
    }
  
    onBlockSelect(event) {
      const slide = event.target.closest('.product-carousel-item');
      if (!slide) return;
      const index = parseInt(slide.dataset.slideIndex, 10);
      if (!isNaN(index)) this._transitionToSlide(index);
    }
  
    _attachListeners() {
      this._clickHandler = (event) => {
        if (event.target.closest('.product-highlight-carousel__nav--prev')) {
          this._goTo(this.currentIndex - 1);
        } else if (event.target.closest('.product-highlight-carousel__nav--next')) {
          this._goTo(this.currentIndex + 1);
        }
      };
      this.addEventListener('click', this._clickHandler);
    }
  
    _goTo(index) {
      if (this.slides.length <= 1) return;
      // loop seperti owlCarousel loop: true
      if (index < 0) index = this.slides.length - 1;
      if (index >= this.slides.length) index = 0;
      this._transitionToSlide(index);
    }
  
    _transitionToSlide(index, immediate) {
      if (index < 0 || index >= this.slides.length) return;
      const slide = this.slides[index];
      if (slide === this.selectedSlide) return;
  
      if (this.selectedSlide) this._slideLeave(this.selectedSlide, immediate);
      this._slideEnter(slide, immediate);
  
      this.currentIndex = index;
      this.selectedSlide = slide;
      this._updateCounter(index);
    }
  
    _slideLeave(slide, immediate) {
      const duration = immediate ? 0 : 300;
      slide.style.transition = `opacity ${duration}ms ease-in-out, visibility ${duration}ms ease-in-out`;
      slide.style.opacity = '0';
      slide.style.visibility = 'hidden';
      slide.classList.remove('is-selected');
    }
  
    _slideEnter(slide, immediate) {
      slide.classList.add('is-selected');
      requestAnimationFrame(() => {
        slide.style.transition = immediate ? 'none' : 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out';
        slide.style.opacity = '1';
        slide.style.visibility = 'visible';
      });
    }
  
    _updateCounter(index) {
      if (this.currentSlideEl) this.currentSlideEl.textContent = index + 1;
      if (this.totalSlidesEl) this.totalSlidesEl.textContent = this.slides.length;
    }
  }
  
  customElements.define('product-highlight-carousel', ProductHighlightCarousel);