let xPanTarget = 0;
let yPanTarget = 0;
let xPanCurrent = 0;
let yPanCurrent = 0;

const gridContainer = document.querySelector('.panner');
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

  // Continue animating until the target position is reached
  if (Math.abs(xPanTarget - xPanCurrent) > 0.1 || Math.abs(yPanTarget - yPanCurrent) > 0.1) {
    requestAnimationFrame(updatePanning);
  }
}

document.addEventListener('mousemove', function(event) {
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

  // Start the panning update loop
  updatePanning();
});