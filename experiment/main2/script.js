let boxes = {};

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

    // Initialize the grid with empty transparent boxes
    let gridIndex = 0;
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridColumns; col++) {
            const x = col * (boxSize + spacing) - rectangleWidth / 2 + boxSize / 2;
            const y = -row * (boxSize + spacing) + rectangleHeight / 2 - boxSize / 2;
            const box = createBox(0x000000, boxSize); // Transparent box
            box.position.set(x, y, 0);
            scene.add(box);

            // Store the boxes for later coloring
            if (!boxes[gridIndex]) {
                boxes[gridIndex] = box;
            }

            gridIndex++;
        }
    }

    // Update the boxes based on the CSV data
    data.forEach((row, index) => {
        const color = colorsMap[row.Color];
        const box = boxes[index];
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

    camera.position.z = 1000;
    animate();
}

// Function to create a box with transparent color and white border
function createBox(color, size) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.0,  // Initially fully transparent
        side: THREE.DoubleSide
    });

    const borderGeometry = new THREE.EdgesGeometry(geometry);
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);

    const box = new THREE.Mesh(geometry, material);
    box.add(border);  // Add the white border to the box
    return box;
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
    Object.keys(boxes).forEach((index) => {
        const box = boxes[index];
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
    Object.keys(boxes).forEach(index => {
        boxes[index].material.opacity = 1.0;
    });
}

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    1, 1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-canvas').appendChild(renderer.domElement);

// Create a black background rectangle
const rectangleWidth = 600;
const rectangleHeight = 600;
const blackRectGeometry = new THREE.PlaneGeometry(rectangleWidth, rectangleHeight);
const blackRectMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const blackRect = new THREE.Mesh(blackRectGeometry, blackRectMaterial);
scene.add(blackRect);

const gridColumns = 20;
const gridRows = 20;
const boxSize = Math.min(rectangleWidth / gridColumns, rectangleHeight / gridRows) * 0.9; // Small distance between boxes
const spacing = boxSize * 0.1;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Load CSV and populate table, chart, and boxes on page load
loadCSV();