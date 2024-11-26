let xPanTarget = 0;
let yPanTarget = 0;
let xPanCurrent = 0;
let yPanCurrent = 0;

const gridContainer = document.querySelector('menu');
const containerRect = gridContainer.getBoundingClientRect();
const containerWidth = containerRect.width;
const containerHeight = containerRect.height;

// Define the edge distances as percentages of the viewport width and height
const horizontalEdgeDistancePercentage = 50; // 5% of the viewport width
const verticalEdgeDistancePercentage = 50; // 10% of the viewport height

// Calculate the actual edge distances in pixels
const horizontalEdgeDistance = (horizontalEdgeDistancePercentage / 100) * window.innerWidth;
const verticalEdgeDistance = (verticalEdgeDistancePercentage / 100) * window.innerHeight;

// Define the speed factor (you can adjust this)
const speedFactor = 0.75;

// Define the time factor to control the interpolation speed
const timeFactor = 0.005; // Adjust this value to control the interpolation speed (lower value = slower)

// Function to update the panning
function updatePanning() {
  // Interpolate the current panning position towards the target position
  xPanCurrent += (xPanTarget - xPanCurrent) * timeFactor;
  yPanCurrent += (yPanTarget - yPanCurrent) * timeFactor;

  // Apply the transformation to the grid container
  gridContainer.style.transform = `translate(${xPanCurrent}px, ${yPanCurrent}px)`;

  // Store the panning state in sessionStorage
  localStorage.setItem('panningState', JSON.stringify({ x: xPanCurrent, y: yPanCurrent }));

  // Continue animating until the target position is reached
  if (Math.abs(xPanTarget - xPanCurrent) > 0.1 || Math.abs(yPanTarget - yPanCurrent) > 0.1) {
    requestAnimationFrame(updatePanning);
  }
}

// Retrieve the panning state from sessionStorage and apply it
function applyPanningState() {
  const storedState = localStorage.getItem('panningState');
  if (storedState) {
    const { x, y } = JSON.parse(storedState);
    xPanCurrent = x;
    yPanCurrent = y;
    gridContainer.style.transform = `translate(${x}px, ${y}px)`;
  }
}

// Function to handle mousemove events
function handleMouseMove(event) {
  // Calculate the panning target
  if (event.clientX < horizontalEdgeDistance) {
    xPanTarget = (horizontalEdgeDistance - event.clientX) * speedFactor;
  } else if (event.clientX > containerWidth - horizontalEdgeDistance) {
    xPanTarget = -(event.clientX - (containerWidth - horizontalEdgeDistance)) * speedFactor;
  } else {
    xPanTarget = 0;
  }

  if (event.clientY < verticalEdgeDistance) {
    yPanTarget = (verticalEdgeDistance - event.clientY) * speedFactor;
  } else if (event.clientY > containerHeight - verticalEdgeDistance) {
    yPanTarget = -(event.clientY - (containerHeight - verticalEdgeDistance)) * speedFactor;
  } else {
    yPanTarget = 0;
  }

  // Calculate the shadow offsets
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const offsetX = (centerX - event.clientX) * 0.10; // Adjust the multiplier to control the shadow intensity
  const offsetY = (centerY - event.clientY) * 0.15; // Adjust the multiplier to control the shadow intensity

  // Apply the box-shadow to the grid container
  gridContainer.querySelector('.grid-container').style.boxShadow = `${-offsetY}px ${offsetX}px ${12+Math.abs(offsetX)+Math.abs(offsetY)}px var(--shadow)`;

  // Start the panning update loop
  updatePanning();
  
}

// Function to detect if the device is in a mobile-like viewport
function isMobileDevice() {
  return window.matchMedia("(max-width: 768px)").matches;
}

// Add or remove the event listener based on the device type
function setupEventListeners() {
  if (isMobileDevice()) {
    console.log('Mobile-like viewport detected. Removing mousemove event listener.');

    gridContainer.style.transform = null;
    document.removeEventListener('mousemove', handleMouseMove);
  } else {
    console.log('Desktop-like viewport detected. Adding mousemove event listener.');
    document.addEventListener('mousemove', handleMouseMove);
  }
}

// Apply the panning state when the page loads
applyPanningState();

// Initial setup of event listeners
setupEventListeners();

/*window.addEventListener('pageswap', async (event) => { 
  localStorage.setItem('panningState', JSON.stringify({ x: xPanCurrent, y: yPanCurrent }));
  applyPanningState();
  updatePanning();
})

window.addEventListener('pagereveal', async (event) => { 
  localStorage.setItem('panningState', JSON.stringify({ x: xPanCurrent, y: yPanCurrent }));
  applyPanningState();
  updatePanning()
})*/

// Listen for changes in the viewport size
const mediaQueryList = window.matchMedia("(max-width: 768px)");
mediaQueryList.addListener(setupEventListeners);

// Optional: Re-evaluate the device type on window resize (in case the user resizes the browser window)
window.addEventListener('resize', setupEventListeners);