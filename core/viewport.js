function checkViewport() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  document.body.classList.toggle('is-mobile', isMobile);
  document.body.classList.toggle('is-desktop', !isMobile);
}

// Initial check
checkViewport();

// Listen for resize events
window.addEventListener('resize', checkViewport);