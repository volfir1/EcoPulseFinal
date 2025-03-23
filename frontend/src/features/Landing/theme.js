// Theme configuration with dark green primary color
export const theme = {
    palette: {
      primary: {
        main: '#32a832',      // Dark green as requested
        light: '#5bc05b',     // Lighter shade for hover effects
        dark: '#267d26',      // Darker shade for pressed states
        text: '#ffffff',      // White text on primary color
      },
      secondary: {
        main: '#1e3a1e',      // Darker green for secondary elements
        light: '#2a4d2a',     // Lighter shade
        dark: '#122a12',      // Darker shade
      },
      background: {
        default: '#f8fdf8',   // Very light green tint for background
        subtle: '#eaf7ea',    // Subtle green background for alternating sections
        paper: '#ffffff',     // White background for cards
      },
      text: {
        primary: '#2c3e2c',   // Dark green-gray for primary text
        secondary: '#4a634a', // Medium green-gray for secondary text
        disabled: '#a3b8a3',  // Light green-gray for disabled text
      },
      hovers: {
        primary: '#267d26',   // Darker green for hover states
      },
      elements: {
        hydropower: '#3498db', 
        solar: '#f39c12',
        wind: '#2ecc71',
        geothermal: '#e74c3c',
        biomass: '#27ae60',
      },
      // 3D effect colors
      shadows: {
        light: 'rgba(50, 168, 50, 0.15)',
        medium: 'rgba(50, 168, 50, 0.25)',
        strong: 'rgba(30, 58, 30, 0.35)',
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      }
    },
    shape: {
      borderRadius: 12,  // Slightly more rounded corners
    },
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  };
  
  /**
   * Helper for 3D shadow effects with different elevation levels
   * @param {number} elevation - Elevation level (0-5)
   * @returns {string} CSS box-shadow value
   */
  export const get3DEffect = (elevation = 1) => {
    const elevations = {
      0: 'none',
      1: `0 4px 6px ${theme.palette.shadows.light}`,
      2: `0 6px 10px ${theme.palette.shadows.medium}`,
      3: `0 10px 16px ${theme.palette.shadows.medium}`,
      4: `0 14px 22px ${theme.palette.shadows.strong}`,
      5: `0 20px 28px ${theme.palette.shadows.strong}`,
    };
    
    return elevations[elevation] || elevations[1];
  };