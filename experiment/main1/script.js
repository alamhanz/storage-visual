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

            // Update the chart with the CSV data
            updateChart(parsedData.data);

            // Update the boxes with the CSV data
            updateBoxes(parsedData.data);
        });
}

// Function to update the chart based on the CSV data
function updateChart(data) {
    const labels = data.map(row => row.Color);
    const counts = data.map(row => parseInt(row.Count));
    const backgroundColors = ['#FFFF00', '#FF0000', '#0000FF', '#00FF00'];

    colorBarChart.data.labels = labels;
    colorBarChart.data.datasets[0].data = counts;
    colorBarChart.data.datasets[0].backgroundColor = backgroundColors;
    colorBarChart.update();
}

// Function to update the boxes based on the CSV data
function updateBoxes(data) {
    const colorsMap = {
        'Yellow': 0xFFFF00,
        'Red': 0xFF0000,
        'Blue': 0x0000FF,
        'Green': 0x00FF00
    };

    const colorArray = [];

    data.forEach(row => {
        const color = colorsMap[row.Color];
        const count = parseInt(row.Count);
        for (let i = 0; i < count; i++) {
            colorArray.push({ color, colorKey: row.Color.toLowerCase() });
        }
    });

    shuffle(colorArray);

    let gridIndex = 0;
    colorArray.forEach(({ color, colorKey }) => {
        const row = Math.floor(gridIndex / gridColumns);
        const col = gridIndex % gridColumns;
        const x = col * (boxSize + spacing) - rectangleWidth / 2 + boxSize / 2;
        const y = -row * (boxSize + spacing) + rectangleHeight / 2 - boxSize / 2;
        const box = createBox(color, boxSize);
        box.position.set(x, y, 0);
        scene.add(box);

        // Store boxes in corresponding color group for toggling
        if (!boxes[colorKey]) {
            boxes[colorKey] = [];
        }
        boxes[colorKey].push(box);

        gridIndex++;
    });

    camera.position.z = 1000;
    animate();
}

// Shuffle function for randomizing colors
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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

// Function to show only selected color boxes
function showOnlySelectedBoxes(colorToShow) {
    Object.keys(boxes).forEach(color => {
        boxes[color].forEach(box => {
            box.visible = (color === colorToShow);
        });
    });
}

// Function to show all boxes
function showAllBoxes() {
    Object.keys(boxes).forEach(color => {
        boxes[color].forEach(box => {
            box.visible = true;
        });
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
const rectangleHeight = 510;
const blackRectGeometry = new THREE.PlaneGeometry(rectangleWidth, rectangleHeight);
const blackRectMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const blackRect = new THREE.Mesh(blackRectGeometry, blackRectMaterial);
scene.add(blackRect);

// Function to create a box
function createBox(color, size) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({ color });
    const box = new THREE.Mesh(geometry, material);
    return box;
}

const gridColumns = 20;
const gridRows = 17;
const boxSize = Math.min(rectangleWidth / gridColumns, rectangleHeight / gridRows) * 0.9; // Small distance between boxes
const spacing = boxSize * 0.1;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Load CSV and populate table, chart, and boxes on page load
loadCSV();