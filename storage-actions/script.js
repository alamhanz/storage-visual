// script.js

// Parameters
const gridSections = 4;
const gridRows = 5;    // Number of rows (depth)
const gridColumn = 2;  // Number of columns
const gridLevel = 7;   // Number of levels (height)

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

// Create grid sections
createGridSections(gridSections, gridColumn, gridRows, gridLevel, storageSize, spacing);

// Load totes from CSV file
loadTotesFromCSV('assigned_totes.csv');

// Add event listener for mouse clicks
window.addEventListener('click', onMouseClick, false);

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