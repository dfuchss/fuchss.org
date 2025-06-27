import PhotoSwipeLightbox from "/assets/libs/photoswipe-lightbox/photoswipe-lightbox.esm.min.js";
import PhotoSwipe from "/assets/libs/photoswipe/photoswipe.esm.min.js";
const photoswipe = new PhotoSwipeLightbox({
  gallery: ".pswp-gallery",
  children: "a",
  pswpModule: PhotoSwipe,
});
photoswipe.init();
