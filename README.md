# Solar System Visualization

A Three.js visualization of the Sun-Earth-Moon system demonstrating day/night cycles.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Deployment

This project is configured for easy deployment to Netlify. Simply connect your GitHub repository to Netlify, and it will automatically build and deploy using the settings in `netlify.toml`.

## Controls

- Click and drag to rotate the view
- Scroll to zoom in/out
- The visualization shows:
  - Sun (yellow sphere) as the central light source
  - Earth rotating on its axis and orbiting the Sun
  - Moon orbiting the Earth