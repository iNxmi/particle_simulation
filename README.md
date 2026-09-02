# Particle Gravitation Simulation

An interactive 2D physics simulation of gravitational pull and particle dynamics running directly in the browser via HTML5 Canvas.

**Live URL**: [https://particle.web.mhergh.com](https://particle.web.mhergh.com)

---

## Features

- **Interactive Gravitational Attraction**: Click/tap and drag on the canvas to create a localized gravitational sink pulling particles toward your cursor.
- **Dynamic Velocity Color Mapping**: Particles dynamically shift color across the HSL spectrum based on current velocity.
- **Physical Boundary Collisions & Roughness**: Bounding-box collisions with configurable surface roughness and normal vector perturbation.
- **Configurable Simulation Parameters**:
  - Particle count
  - Gravitational field strength
  - Gravitational radius
  - Linear friction
  - Elasticity / restitution
  - Surface bounce roughness
- **Real-Time Telemetry**: Live readout of FPS, frame delta time, and particles currently in gravitational range.
- **Fully Responsive & Touch Enabled**: Works across desktop and mobile devices.

---

## Technical Stack

- **Rendering**: HTML5 2D Canvas API (`requestAnimationFrame`)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Mathematics**: Custom 2D Vector algebra implementation

---

## Project Structure

```text
├── index.html        # Entrypoint with embedded UI controls, semantic tags, and SEO metadata
├── index.jsx          # Physics engine, vector math, and canvas rendering loop
├── robots.txt        # Web crawler directive and sitemap declaration
├── sitemap.xml       # Google search indexing sitemap
└── README.md         # Project documentation
```

---

## Deployment & Hosting

### 1. Static File Server (Nginx / Caddy)
Serve the root directory directly over port 80/443 with TLS:

```caddy
particle.web.mhergh.com {
    root * /var/www/particle-simulation
    file_server
    encode gzip zstd
}
```

### 2. Local Testing via NixOS / Ad-hoc Server
```bash
nix run nixpkgs#caddy -- file-server --root . --listen 0.0.0.0:8000
```