let boxes = {};

// Define grid dimensions globally
const gridWidth = 3;  // Width of each grid
const gridHeight = 5; // Height of each grid
const gridDepth = 8;  // Depth of each grid

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

// Define box size and spacing
const rectangleWidth = 1000;
const rectangleHeight = 500;
const rectangleDepth = 800;

const boxSize = Math.min(rectangleWidth / gridWidth, rectangleHeight / gridHeight, rectangleDepth / gridDepth) * 0.9;
const spacing = boxSize * 0.1;

// Function to create a 3D box with transparent color and white border
function createBox(color, size) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.0,  // Initially fully transparent
        side: THREE.DoubleSide
    });

    const edges = new THREE.EdgesGeometry(geometry);
    const border = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xFFFFFF }));

    const box = new THREE.Mesh(geometry, material);
    box.add(border);  // Add the white border to the box
    return box;
}

// Function to create the grid sections and position them
function createGridSections() {
    const gridSections = 5;
    const gridSpacing = boxSize * 1.85; // Space between grid sections

    for (let section = 0; section < gridSections; section++) {
        const xOffset = (section * (gridWidth * boxSize + gridSpacing)) - ((gridSections - 1) * (gridWidth * boxSize + gridSpacing)) / 2;

        for (let z = 0; z < gridDepth; z++) {
            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    const xPos = x * (boxSize + spacing) + xOffset;
                    const yPos = y * (boxSize + spacing) - (gridHeight * (boxSize + spacing)) / 2 + boxSize / 2;
                    const zPos = z * (boxSize + spacing) - (gridDepth * (boxSize + spacing)) / 2 + boxSize / 2;

                    const boxKey = `${section}_${x},${y},${z}`;
                    const box = createBox(0x000000, boxSize); // Transparent box
                    box.position.set(xPos, yPos, zPos);
                    scene.add(box);

                    // Store the boxes for later coloring
                    boxes[boxKey] = box;
                }
            }
        }
    }
}

// Function to fetch and display the CSV data
function loadCSV() {
    fetch('data.csv')
        .then(response => response.text())
        .then(csvText => {
            const parsedData = Papa.parse(csvText, { header: true });
            const tableBody = document.querySelector('#data-table tbody');
            
            // Clear existing rows
            tableBody.innerHTML = '';

            parsedData.data.forEach(row => {
                const tr = document.createElement('tr');
                Object.values(row).forEach(cellData => {
                    const td = document.createElement('td');
                    td.textContent = cellData;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });

            // Update the boxes and chart with the CSV data
            updateBoxesAndChart(parsedData.data);
        });
}

// Function to create an empty grid and update boxes and chart based on the CSV data
function updateBoxesAndChart(data) {
    const colorsMap = {
        'Yellow': 0xFFFF00,
        'Red': 0xFF0000,
        'Blue': 0x0000FF,
        'Green': 0x00FF00
    };

    // Create grid sections with spacing
    createGridSections();

    // Update the boxes based on the CSV data across all three grid sections
    data.forEach((row, index) => {
        const color = colorsMap[row.Color];
        const section = Math.floor(index / (gridWidth * gridHeight * gridDepth)); // Determine which grid section
        const localIndex = index % (gridWidth * gridHeight * gridDepth);

        const x = localIndex % gridWidth;
        const y = Math.floor(localIndex / gridWidth) % gridHeight;
        const z = Math.floor(localIndex / (gridWidth * gridHeight)) % gridDepth;

        const boxKey = `${section}_${x},${y},${z}`;
        const box = boxes[boxKey];
        if (box) {
            box.material.color.setHex(color);
            box.material.opacity = 1.0; // Make it fully opaque when colored
        }
    });

    // Count colors for the bar chart
    const colorCounts = {
        'Yellow': 0,
        'Red': 0,
        'Blue': 0,
        'Green': 0
    };

    data.forEach(row => {
        colorCounts[row.Color] += 1;
    });

    // Update the chart with the color counts
    updateChart(colorCounts);

    // Set an initial camera position that makes sense with the increased max zoom distance
    camera.position.set(800, 600, 1200); // Adjusted to provide a good initial view
    camera.lookAt(0, 0, 0);
    animate();
}

// Function to update the chart based on the color counts
function updateChart(colorCounts) {
    const labels = Object.keys(colorCounts);
    const counts = Object.values(colorCounts);
    const backgroundColors = ['#FFFF00', '#FF0000', '#0000FF', '#00FF00'];

    colorBarChart.data.labels = labels;
    colorBarChart.data.datasets[0].data = counts;
    colorBarChart.data.datasets[0].backgroundColor = backgroundColors;
    colorBarChart.update();
}

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

// Function to show only selected color boxes (without hiding the grid)
function showOnlySelectedBoxes(colorToShow) {
    Object.keys(boxes).forEach((key) => {
        const box = boxes[key];
        if (box) {
            const currentColor = box.material.color.getHex();
            const targetColor = {
                'yellow': 0xFFFF00,
                'red': 0xFF0000,
                'blue': 0x0000FF,
                'green': 0x00FF00
            }[colorToShow];
            box.material.opacity = (currentColor === targetColor) ? 1.0 : 0.0;
        }
    });
}

// Function to show all boxes (without hiding the grid)
function showAllBoxes() {
    Object.keys(boxes).forEach(key => {
        const box = boxes[key];
        const isColored = box.material.color.getHex() !== 0x000000; // Check if the box is colored
        box.material.opacity = isColored ? 1.0 : 0.0; // Set opacity to 1.0 if colored, 0.0 if not
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    renderer.render(scene, camera);
}

// Load CSV and populate table, chart, and boxes on page load
loadCSV();