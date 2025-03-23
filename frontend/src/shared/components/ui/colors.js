import { createTheme } from "@mui/material/styles";

// Elements for specific use cases
export const elements = {
  solar: '#F4D03F',
  wind: '#38BDF8',
  geothermal: '#FF7F7F',
  hydropower: '#1C556F',
  biomass: '#166545'
};

// Export direct access objects
export const p = {  // primary
  main: '#166534',
  light: '#22863a',
  dark: '#14532d',
  text: '#ffffff'
};

export const s = {  // secondary
  main: '#1a5f7a',
  light: '#2a7c9c',
  dark: '#134857',
  text: '#ffffff'
};

export const bg = {  // background
  default: '#f0fdf4',
  paper: '#ffffff',
  subtle: '#f8fafc'
};

export const t = {  // text
  main: '#0f172a',
  secondary: '#334155',
  disabled: '#94a3b8',
  hint: '#64748b'
};

export const success = {
  main: '#15803d',
  light: '#86efac',
  dark: '#14532d'
};

export const warning = {
  main: '#854d0e',
  light: '#fde68a',
  dark: '#713f12'
};

export const error = {
  main: '#991b1b',
  light: '#fecaca',
  dark: '#7f1d1d'
};

export const hover = {
  p: '#15803d',      // primary
  s: '#216b8d',      // secondary
  success: '#16a34a',
  warning: '#9a3412',
  error: '#b91c1c'
};

// Create theme
const theme = createTheme({
  palette: {
    primary: p,
    secondary: s,
    background: bg,
    text: {
      primary: t.main,
      secondary: t.secondary,
      disabled: t.disabled,
      hint: t.hint
    },
    success,
    warning,
    error,
    hovers: {
      primary: hover.p,
      secondary: hover.s,
      success: hover.success,
      warning: hover.warning,
      error: hover.error
    },
    elements
  }
});

export default theme;