// Get DOM elements
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const numDropsInput = document.getElementById('numDrops');
const dropRadiusInput = document.getElementById('dropRadius');
const simSpeedInput = document.getElementById('simSpeed');
const restartBtn = document.getElementById('restartBtn');
const addOilBtn = document.getElementById('addOilBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Simulation parameters
const SIM_SIZE = 100;
const CANVAS_SIZE = 600;

// Physics constants
const M = 0.5; // Mobility, higher value means faster merging
const K = 0.05; // Surface tension strength
let totalOilMass; // Tracks the total amount of oil

let grid, nextGrid; // Grid stores the phase-field values
let animationFrameId;

// Set canvas dimensions
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Creates a new oil droplet
function createDroplet(x, y, radius) {
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            if (x + dx >= 0 && x + dx < SIM_SIZE && y + dy >= 0 && y + dy < SIM_SIZE) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius) {
                    // Adds the droplet's mass, ensuring value does not exceed 1
                    grid[x + dx][y + dy] = Math.min(1, grid[x + dx][y + dy] + 1);
                }
            }
        }
    }
}

// Initializes the simulation
function initSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Create and clear the grid, initializing all points to 0 (water)
    grid = new Array(SIM_SIZE).fill(0).map(() => new Array(SIM_SIZE).fill(0));
    nextGrid = new Array(SIM_SIZE).fill(0).map(() => new Array(SIM_SIZE).fill(0));
    totalOilMass = 0; // Reset total oil mass

    const numDrops = parseInt(numDropsInput.value);
    const dropRadius = parseInt(dropRadiusInput.value);

    // Create initial droplets
    for (let i = 0; i < numDrops; i++) {
        let x = Math.floor(Math.random() * SIM_SIZE);
        let y = Math.floor(Math.random() * SIM_SIZE);
        createDroplet(x, y, dropRadius);
    }
    
    // Calculate initial total oil mass
    for (let i = 0; i < SIM_SIZE; i++) {
        for (let j = 0; j < SIM_SIZE; j++) {
            totalOilMass += grid[i][j];
        }
    }
    
    // Start the simulation loop
    simulate();
}

// Main simulation loop
function simulate() {
    // Get simulation speed and calculate time step
    const simSpeed = parseFloat(simSpeedInput.value) / 100;
    const dt = 0.05 * simSpeed;

    // Copy current grid to the next grid for calculation
    for (let i = 0; i < SIM_SIZE; i++) {
        for (let j = 0; j < SIM_SIZE; j++) {
            nextGrid[i][j] = grid[i][j];
        }
    }

    // Iterate through all inner grid points to compute physical updates
    for (let i = 0; i < SIM_SIZE; i++) {
        for (let j = 0; j < SIM_SIZE; j++) {
            const phi = grid[i][j];

            // Calculate Laplacian with no-flux boundary conditions
            let laplacian = 0;
            if (i > 0) laplacian += grid[i - 1][j]; else laplacian += phi;
            if (i < SIM_SIZE - 1) laplacian += grid[i + 1][j]; else laplacian += phi;
            if (j > 0) laplacian += grid[i][j - 1]; else laplacian += phi;
            if (j < SIM_SIZE - 1) laplacian += grid[i][j + 1]; else laplacian += phi;
            laplacian -= 4 * phi;
            
            // Nonlinear term (Surface tension)
            // This function pushes values towards 0 or 1
            const nonLinearTerm = 4 * phi * (phi - 1) * (phi - 0.5); 

            // Update phase-field value: d(phi)/dt = M * laplacian - K * nonLinearTerm
            // M * laplacian drives diffusion (towards uniformity)
            // -K * nonLinearTerm drives separation (towards 0 or 1)
            const dPhi_dt = M * laplacian - K * nonLinearTerm;
            nextGrid[i][j] += dPhi_dt * dt;
        }
    }

    // Enforce mass conservation
    let currentOilMass = nextGrid.flat().reduce((sum, val) => sum + val, 0);
    const massDiff = totalOilMass - currentOilMass;
    const avgCorrection = massDiff / (SIM_SIZE * SIM_SIZE); // Distribute correction evenly
    
    for (let i = 0; i < SIM_SIZE; i++) {
        for (let j = 0; j < SIM_SIZE; j++) {
            nextGrid[i][j] += avgCorrection;
            // Clamp values between 0 (water) and 1 (oil)
            nextGrid[i][j] = Math.min(1, Math.max(0, nextGrid[i][j]));
        }
    }

    // Update the grid with the new time step's results
    grid = nextGrid;

    // Draw the simulation result
    drawSimulation();
    
    // Loop the animation
    animationFrameId = requestAnimationFrame(simulate);
}

// Draws the simulation result to the canvas
function drawSimulation() {
    const cellSize = CANVAS_SIZE / SIM_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw the water background
    ctx.fillStyle = '#ADD8E6';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Iterate through the grid and draw oil droplets
    for (let i = 0; i < SIM_SIZE; i++) {
        for (let j = 0; j < SIM_SIZE; j++) {
            let value = grid[i][j];
            
            // Oil exists where value > 0
            if (value > 0) {
                let alpha = Math.min(1, value); // Opacity changes with phase-field value
                ctx.fillStyle = `rgba(255, 180, 0, ${alpha})`; // Oil color (yellow)
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Event listeners
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * SIM_SIZE);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * SIM_SIZE);
    
    const initialRadius = parseInt(dropRadiusInput.value);
    
    createDroplet(x, y, initialRadius);
    totalOilMass += Math.PI * initialRadius * initialRadius;
});

addOilBtn.addEventListener('click', () => {
    let x = Math.floor(Math.random() * SIM_SIZE);
    let y = Math.floor(Math.random() * SIM_SIZE);
    const initialRadius = parseInt(dropRadiusInput.value);
    
    createDroplet(x, y, initialRadius);
    totalOilMass += Math.PI * initialRadius * initialRadius;
});

restartBtn.addEventListener('click', () => {
    initSimulation();
});

clearAllBtn.addEventListener('click', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Reset all grid values to 0 and reset total mass
    grid = new Array(SIM_SIZE).fill(0).map(() => new Array(SIM_SIZE).fill(0));
    nextGrid = new Array(SIM_SIZE).fill(0).map(() => new Array(SIM_SIZE).fill(0));
    totalOilMass = 0;

    // Clear and redraw the canvas
    drawSimulation();
    
    // Restart the simulation
    animationFrameId = requestAnimationFrame(simulate);
});

// Initial launch of the simulation
initSimulation();
