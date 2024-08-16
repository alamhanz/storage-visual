// Parameters
const gridWidth = 3;  // Width of each grid
const gridHeight = 5; // Height of each grid
const gridDepth = 8;  // Depth of each grid

const gridSections = 4;
const rectangleWidth = 1000;
const rectangleHeight = 500;
const rectangleDepth = 800;
const boxSize = Math.min(rectangleWidth / gridWidth, rectangleHeight / gridHeight, rectangleDepth / gridDepth) * 0.9;
const spacing = boxSize * 0.1;
const colorsMap = {
    'Yellow': 0xFFFF00,
    'Red': 0xFF0000,
    'Blue': 0x0000FF,
    'Green': 0x00FF00
};

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000); // Adjusted max distance
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-canvas').appendChild(renderer.domElement);

// Add OrbitControls for interactivity
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth the dragging
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false; // No panning on vertical axis
controls.minDistance = 100; // Minimum zoom distance
controls.maxDistance = 20000; // Updated max zoom distance
controls.maxPolarAngle = Math.PI / 2; // Limit the vertical rotation

// Initialize the chart
const ctx = document.getElementById('colorBarChart').getContext('2d');
const colorBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Number of Boxes',
            data: [],
            backgroundColor: []
        }]
    },
    options: {
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const colorToShow = colorBarChart.data.labels[index].toLowerCase();
                showOnlySelectedBoxes(colorToShow);
            } else {
                showAllBoxes();
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
   }
});

// Load CSV and populate table, chart, and boxes on page load
loadCSV(data => {
const colorCounts = updateBoxesAndChart(data, colorsMap, gridSections, gridWidth, gridHeight, gridDepth, boxSize, spacing);
updateChart(colorCounts);
});

// Animation loop
function animate() {
requestAnimationFrame(animate);
controls.update(); // Update controls
renderer.render(scene, camera);
}

// Set an initial camera position that makes sense with the increased max zoom distance
camera.position.set(800, 600, 1200); // Adjusted to provide a good initial view
camera.lookAt(0, 0, 0);
animate();