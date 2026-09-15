/**
 * Slideshow Section JS
 * Replicated from used-theme SlideshowSection logic
 * Implements vanilla JS carousel with fade transitions to replace Flickity dependency
 */

class SlideshowSection extends HTMLElement {
  constructor() {
    super();
    this.slides = [];
    this.dots = [];
    this.currentIndex = 0;
    this.selectedSlide = null;
    this.autoplayTimer = null;
    this.shouldAnimate = true;
  }

  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('.Slideshow__Slide'));
    this.dots = Array.from(this.querySelectorAll('.flickity-page-dots .dot'));
    this.autoplay = this.dataset.autoplay === 'true';
    this.cycleSpeed = parseInt(this.dataset.cycleSpeed, 10) || 5000;

    // Mark carousel as initialized so CSS hides non-selected slides
    const carousel = this.querySelector('.Slideshow__Carousel');
    if (carousel) carousel.classList.add('Carousel--initialized');

    if (this.slides.length > 0) {
      this._transitionToSlide(0, true);
      this._attachListeners();
      if (this.autoplay && this.slides.length > 1) {
        this._startAutoplay();
      }
    }
  }

  disconnectedCallback() {
    this._stopAutoplay();
    if (this._clickHandler) {
      this.removeEventListener('click', this._clickHandler);
    }
  }

  // Shopify theme editor: block selected
  onBlockSelect(event) {
    this._stopAutoplay();
    const slide = event.target.closest('.Slideshow__Slide');
    if (!slide) return;
    const index = parseInt(slide.dataset.slideIndex, 10);
    if (!isNaN(index)) {
      this.shouldAnimate = !event.detail.load;
      this._transitionToSlide(index);
    }
  }

  // Shopify theme editor: block deselected
  onBlockDeselect() {
    this.shouldAnimate = true;
    if (this.autoplay && this.slides.length > 1) {
      this._startAutoplay();
    }
  }

  _attachListeners() {
    this._clickHandler = (event) => {
      const dot = event.target.closest('.dot');
      if (dot) {
        event.preventDefault();
        const index = parseInt(dot.dataset.dotIndex, 10);
        if (!isNaN(index)) {
          this._stopAutoplay();
          this._transitionToSlide(index);
          if (this.autoplay && this.slides.length > 1) {
            this._startAutoplay();
          }
        }
      }
    };
    this.addEventListener('click', this._clickHandler);
  }

  _transitionToSlide(index, immediate) {
    if (index < 0 || index >= this.slides.length) return;

    const slide = this.slides[index];
    if (slide === this.selectedSlide) return;

    // Fade out previous slide
    if (this.selectedSlide) {
      this._slideLeave(this.selectedSlide, immediate);
    }

    // Fade in new slide
    this._slideEnter(slide, immediate);
    this._updateDots(index);
    this.currentIndex = index;
    this.selectedSlide = slide;
  }

  _slideLeave(slide, immediate) {
    const content = slide.querySelector('.SectionHeader');
    const buttonWrapper = slide.querySelector('.SectionHeader__ButtonWrapper');
    const duration = immediate ? 0 : 300;

    slide.style.transition = `opacity ${duration}ms ease-in-out, visibility ${duration}ms ease-in-out`;
    slide.style.opacity = '0';
    slide.style.visibility = 'hidden';
    slide.classList.remove('is-selected');

    if (content && !immediate) {
      content.style.transition = 'opacity 0.4s ease-in, transform 0.4s ease-in';
      content.style.opacity = '0';
      content.style.transform = 'translateY(20px)';
    }

    if (buttonWrapper && !immediate) {
      buttonWrapper.style.transition = 'opacity 0.4s ease-in, transform 0.4s ease-in';
      buttonWrapper.style.opacity = '0';
      buttonWrapper.style.transform = 'translateY(10px)';
    }
  }

  _slideEnter(slide, immediate) {
    const images = Array.from(slide.querySelectorAll('.Slideshow__Image'));
    const content = slide.querySelector('.SectionHeader');
    const buttonWrapper = slide.querySelector('.SectionHeader__ButtonWrapper');
    const imgDuration = immediate ? 0 : 1200;
    const contentDuration = immediate ? 0 : 800;
    const contentDelay = immediate ? 0 : 400;

    slide.classList.add('is-selected');

    requestAnimationFrame(() => {
      // Fade in slide container
      slide.style.transition = immediate ? 'none' : 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out';
      slide.style.opacity = '1';
      slide.style.visibility = 'visible';

      // Animate images
      images.forEach((img) => {
        img.style.transition = immediate ? 'none' : `opacity ${imgDuration}ms ease-out`;
        img.style.opacity = '1';
      });

      // Animate content
      if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(30px)';
        setTimeout(() => {
          content.style.transition = immediate ? 'none' : `opacity ${contentDuration}ms ease-out, transform ${contentDuration}ms ease-out`;
          content.style.opacity = '1';
          content.style.transform = 'translateY(0)';
        }, contentDelay);
      }

      if (buttonWrapper) {
        buttonWrapper.style.opacity = '0';
        buttonWrapper.style.transform = 'translateY(20px)';
        setTimeout(() => {
          buttonWrapper.style.transition = immediate ? 'none' : `opacity ${contentDuration}ms ease-out, transform ${contentDuration}ms ease-out`;
          buttonWrapper.style.opacity = '1';
          buttonWrapper.style.transform = 'translateY(0)';
        }, contentDelay);
      }
    });
  }

  _updateDots(index) {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-selected', i === index);
    });
  }

  _startAutoplay() {
    this._stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      const nextIndex = (this.currentIndex + 1) % this.slides.length;
      this._transitionToSlide(nextIndex);
    }, this.cycleSpeed);
  }

  _stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}

customElements.define('slideshow-section', SlideshowSection);
