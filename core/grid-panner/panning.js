document.addEventListener('mousemove', function(event) {
  const gridContainer = document.querySelector('.panner');
  const containerRect = gridContainer.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // Define the edge distances as percentages of the viewport width and height
  const horizontalEdgeDistancePercentage = 40; // 5% of the viewport width
  const verticalEdgeDistancePercentage = 20; // 5% of the viewport height

  // Calculate the actual edge distances in pixels
  const horizontalEdgeDistance = (horizontalEdgeDistancePercentage / 100) * window.innerWidth;
  const verticalEdgeDistance = (verticalEdgeDistancePercentage / 100) * window.innerHeight;

  // Define the speed factor (you can adjust this)
  const speedFactor = 0.5;

  // Calculate the panning amount
  let xPan = 0;
  let yPan = 0;

  if (event.clientX < horizontalEdgeDistance) {
    xPan = (horizontalEdgeDistance - event.clientX) * speedFactor;
  } else if (event.clientX > containerWidth - horizontalEdgeDistance) {
    xPan = -(event.clientX - (containerWidth - horizontalEdgeDistance)) * speedFactor;
  }

  if (event.clientY < verticalEdgeDistance) {
    yPan = (verticalEdgeDistance - event.clientY) * speedFactor;
  } else if (event.clientY > containerHeight - verticalEdgeDistance) {
    yPan = -(event.clientY - (containerHeight - verticalEdgeDistance)) * speedFactor;
  }

  // Apply the transformation to the grid container
  gridContainer.style.transform = `translate(${xPan}px, ${yPan}px)`;
});