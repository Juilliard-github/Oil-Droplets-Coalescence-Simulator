# Oil Droplets Coalescence Simulator
This is a web-based physics simulation that models the fascinating process of oil droplets merging in a liquid medium. Built using JavaScript and the HTML5 Canvas API, the simulator uses a numerical approximation of the **Cahn-Hilliard equation** to create a highly realistic and dynamic visual representation of fluid dynamics, turning abstract mathematical principles into an engaging visual experience.

## How it Works
The simulation runs on a 100x100 grid, where each point represents the local concentration of oil, also known as the **phase field ($ϕ$).** The value of $ϕ$ ranges from 0 (pure water) to 1 (pure oil).
The core of the simulation is a continuous calculation that updates the phase field at every frame. This calculation is driven by two primary physical forces:

### 1. Diffusion
This force represents the natural tendency for a substance to spread from areas of high concentration to low concentration. It's calculated using the **Laplacian operator ($$∇^2$$)**, which measures the difference between a point's value and the average of its neighbors. This is what causes the droplets to spread and interact with each other.

### 2. Surface Tension
This is the most crucial force for droplet coalescence. It's modeled using a **non-linear term** that acts like a repulsive force, pushing the phase field values toward either 0 or 1. This force not only creates the sharp boundary between oil and water but also drives the droplets to merge. By doing so, the system's total surface area is minimized, a fundamental principle of surface tension in fluids.

## The Cahn-Hilliard Equation
The two forces—diffusion and surface tension—are combined in the Cahn-Hilliard equation, which is implemented in the simulation's code as:

### <p style="text-align:center">$$\frac{\partial \phi}{\partial t} = M \nabla^2 \phi - K \frac{\partial f}{\partial \phi}$$</p>

$\phi$: The **phase field**, representing oil concentration (from 0 to 1).

$\frac{\partial \phi}{\partial t}$: The rate of change of $\phi$ over time.

$M$: The **mobility** constant, controlling the diffusion rate.

$\nabla^2$: The **Laplacian operator**, which models diffusion.

$K$: The **surface energy** constant, controlling the interface sharpness.

$\frac{\partial f}{\partial \phi}$: The derivative of the double-well free energy function, representing the **surface tension** force. This term is defined by the following **double-well potential derivative:**

### <p style="text-align:center">$$\frac{\partial f}{\partial \phi} = 4\phi(\phi - 1)(\phi - 0.5)$$</p>

This function has roots at $\phi = 0$, $\phi = 0.5$, and $\phi = 1$, which define the stable (0 and 1) and unstable (0.5) states of the system.

## User Controls
The user interface allows you to change key parameters of the simulation in real-time.

**Initial Drops:** Sets the number of oil droplets that appear at the beginning of the simulation.

**Drop Radius:** Controls the size of the droplets when they are created.

**Simulation Speed:** Adjusts the M (Mobility) parameter in the physics equation, changing how quickly the droplets diffuse and merge.

**Interface Sharpness:** Modifies the K (Surface Energy Coefficient) parameter, which controls the width of the boundary between the oil and water, making the edges appear softer or sharper.
