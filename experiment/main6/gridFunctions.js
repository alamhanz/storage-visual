// gridFunctions.js

// Define the global boxes object
window.boxes = {};

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

function createGridSections(gridSections, gridWidth, gridHeight, gridDepth, boxSize, spacing) {
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
                    window.boxes[boxKey] = box;
                }
            }
        }
    }
}

function loadCSV(updateBoxesAndChart) {
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
            const colorCounts = updateBoxesAndChart(parsedData.data);
            updateChart(colorCounts);
        });
}

function updateBoxesAndChart(data, colorsMap, gridSections, gridWidth, gridHeight, gridDepth, boxSize, spacing) {
    // Create grid sections with spacing
    createGridSections(gridSections, gridWidth, gridHeight, gridDepth, boxSize, spacing);

    // Update the boxes based on the CSV data across all three grid sections
    data.forEach((row, index) => {
        const color = colorsMap[row.Color];
        const section = Math.floor(index / (gridWidth * gridHeight * gridDepth)); // Determine which grid section
        const localIndex = index % (gridWidth * gridHeight * gridDepth);

        const x = localIndex % gridWidth;
        const y = Math.floor(localIndex / gridWidth) % gridHeight;
        const z = Math.floor(localIndex / (gridWidth * gridHeight)) % gridDepth;

        const boxKey = `${section}_${x},${y},${z}`;
        const box = window.boxes[boxKey];
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

    return colorCounts;
}

function updateChart(colorCounts) {
    const labels = Object.keys(colorCounts);
    const counts = Object.values(colorCounts);
    const backgroundColors = ['#FFFF00', '#FF0000', '#0000FF', '#00FF00'];

    colorBarChart.data.labels = labels;
    colorBarChart.data.datasets[0].data = counts;
    colorBarChart.data.datasets[0].backgroundColor = backgroundColors;
    colorBarChart.update();
}

function showOnlySelectedBoxes(colorToShow) {
    Object.keys(window.boxes).forEach((key) => {
        const box = window.boxes[key];
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

function showAllBoxes() {
    Object.keys(window.boxes).forEach(key => {
        const box = window.boxes[key];
        const isColored = box.material.color.getHex() !== 0x000000; // Check if the box is colored
        box.material.opacity = isColored ? 1.0 : 0.0; // Set opacity to 1.0 if colored, 0.0 if not
    });
}

// Expose functions globally
window.createBox = createBox;
window.createGridSections = createGridSections;
window.loadCSV = loadCSV;
window.updateBoxesAndChart = updateBoxesAndChart;
window.updateChart = updateChart;
window.showOnlySelectedBoxes = showOnlySelectedBoxes;
window.showAllBoxes = showAllBoxes;