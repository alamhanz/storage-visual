// functions.js

// Function to create a storage with specified color and size
function createStorage(color, size) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.0,  // Initially fully transparent
        side: THREE.DoubleSide
    });

    const edges = new THREE.EdgesGeometry(geometry);
    const border = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xFFFFFF }));

    const storage = new THREE.Mesh(geometry, material);
    storage.add(border);  // Add the white border to the storage
    return storage;
}

// // Function to create totes with specified color and size
// function createTote(color, size) {
//     const geometry = new THREE.BoxGeometry(size, size, size);
//     const material = new THREE.MeshBasicMaterial({ color: color });
//     const tote = new THREE.Mesh(geometry, material);
//     return tote;
// }

// Function to create totes with specified color and a slightly smaller y-axis size
function createTote(color, storageSize) {
    const toteHeight = storageSize * 0.9;  // Make the tote's height 90% of the storage's height
    const geometry = new THREE.BoxGeometry(storageSize, toteHeight, storageSize);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const tote = new THREE.Mesh(geometry, material);
    return tote;
}

// Function to create text labels facing the y-axis
function createTextLabelFacingYAxis(text, position) {
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new THREE.TextGeometry(text, {
            font: font,
            size: 20,
            height: 5,
            curveSegments: 12,
            bevelEnabled: false
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position);

        // Rotate the label to face the y-axis
        textMesh.rotation.x = -Math.PI / 2;  // Rotate around x-axis to face y-axis
        textMesh.rotation.z = Math.PI / 2;   // Rotate to align with the correct direction
        
        scene.add(textMesh);
    });
}

// Function to create the grid sections with reversed alphabet labels for columns and reversed labels for rows
function createGridSections(gridSections, gridColumn, gridRows, gridLevel, storageSize, spacing) {
    for (let section = 0; section < gridSections; section++) {
        const xOffset = (section * (gridColumn * storageSize + gridSpacing)) - ((gridSections - 1) * (gridColumn * storageSize + gridSpacing)) / 2;

        for (let z = 0; z < gridRows; z++) {  // Depth
            for (let y = 0; y < gridLevel; y++) {  // Height
                for (let x = 0; x < gridColumn; x++) {
                    const xPos = x * (storageSize + spacing) + xOffset;
                    const yPos = y * (storageSize + spacing) - (gridLevel * (storageSize + spacing)) / 2 + storageSize / 2;
                    const zPos = z * (storageSize + spacing) - (gridRows * (storageSize + spacing)) / 2 + storageSize / 2;

                    const storageKey = `${section}_${x},${y},${z}`;
                    const storage = createStorage(0x000000, storageSize); // Transparent storage
                    storage.position.set(xPos, yPos, zPos);
                    scene.add(storage);

                    // Store the storage objects for later use
                    window.storages[storageKey] = storage;

                    // Add gridColumn labels on the farthest z-axis (reversed order)
                    if (y === 0 && z === gridRows - 1) { // Farthest z-axis
                        const labelPos = new THREE.Vector3(xPos, yPos - storageSize / 2 - 10, zPos + storageSize / 2 + 20);
                        const alphabetLabel = String.fromCharCode(65 + (gridColumn - 1 - x)); // Reverse order, 0 -> B, 1 -> A, etc.
                        createTextLabelFacingYAxis(alphabetLabel, labelPos);
                    }

                    // Add gridRow labels on the farthest x-axis (reversed)
                    if (y === 0 && x === gridColumn - 1) { // Farthest x-axis
                        const labelPos = new THREE.Vector3(xPos + storageSize / 2 + 20, yPos - storageSize / 2 - 10, zPos);
                        createTextLabelFacingYAxis((gridRows - z).toString(), labelPos); // Reverse the row numbering
                    }
                }
            }
        }
    }
}

// Function to parse storage ID and return section, row, column, and level
function parseStorageId(storageId) {
    const [sectionPart, positionPart] = storageId.split('-');
    const section = parseInt(sectionPart.replace('storage', '')) - 1;
    const [rowColumn, level] = positionPart.split('_');
    const row = parseInt(rowColumn[0]) - 1;
    const column = rowColumn.charCodeAt(1) - 65; // Convert 'A' to 0, 'B' to 1, etc.
    const levelIndex = parseInt(level) - 1;
    return { section, row, column, level: levelIndex };
}

// Function to load totes data from CSV and create totes
function loadTotesFromCSV(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
            results.data.forEach((tote) => {
                const { section, row, column, level } = parseStorageId(tote.storage_id);
                const storageKey = `${section}_${column},${level},${row}`;
                const storage = window.storages[storageKey];

                if (storage) {
                    const toteMesh = createTote(tote.color, storageSize);
                    toteMesh.position.copy(storage.position);
                    scene.add(toteMesh);
                }
            });
        }
    });
}