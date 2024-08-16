// Parameters
const gridSections = 3;
const gridRows = 7;    // Number of rows (depth)
const gridColumn = 3;  // Number of columns
const gridLevel = 6;   // Number of levels (height)

const storageSize = 100;
const spacing = 0.15 * storageSize; // Spacing set as 15% of the storage size
const gridSpacing = storageSize * 3; // Space between grid sections

// Setup the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls for interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.25; // Damping factor for smoothness
controls.screenSpacePanning = false; // Disable screen space panning
controls.minDistance = 10; // Minimum zoom distance
controls.maxDistance = 20000; // Maximum zoom distance
controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation to 90 degrees

camera.position.set(800, 600, 1200);

window.storages = {};  // To store storage objects by key

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

// Function to create text labels
function createTextLabel(text, position) {
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

                    // Store the storage objects for later coloring
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
        textMesh.rotation.z = Math.PI / 2;       // Rotate to align with the correct direction
        // textMesh.rotation.y = Math.PI / 2;  
        
        scene.add(textMesh);
    });
}

// Create grid sections
createGridSections(gridSections, gridColumn, gridRows, gridLevel, storageSize, spacing);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update the controls
    renderer.render(scene, camera);
}
animate();

// Event listener to resize the renderer when the window is resized
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});