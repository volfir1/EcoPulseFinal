// transitions.js

// Duration constants (in milliseconds)
export const DURATIONS = {
    slow: 700,
    medium: 300,
    fast: 150
  };
  
  // Easing functions
  export const EASINGS = {
    // Standard easings
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    inSmooth: 'cubic-bezier(0.4, 0, 1, 1)',
    outSmooth: 'cubic-bezier(0, 0, 0.2, 1)',
    // Special easings
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  };
  
  // Common transition strings
  export const transitions = {
    // Basic transitions
    all: `all ${DURATIONS.medium}ms ${EASINGS.smooth}`,
    transform: `transform ${DURATIONS.medium}ms ${EASINGS.smooth}`,
    opacity: `opacity ${DURATIONS.medium}ms ${EASINGS.smooth}`,
    background: `background ${DURATIONS.medium}ms ${EASINGS.smooth}`,
    colors: `color ${DURATIONS.medium}ms ${EASINGS.smooth}, background-color ${DURATIONS.medium}ms ${EASINGS.smooth}`,
    border: `border-color ${DURATIONS.medium}ms ${EASINGS.smooth}`,
    shadow: `box-shadow ${DURATIONS.medium}ms ${EASINGS.smooth}`,
  
    // Special transitions
    scale: `transform ${DURATIONS.fast}ms ${EASINGS.spring}`,
    slide: `transform ${DURATIONS.medium}ms ${EASINGS.smooth}, opacity ${DURATIONS.medium}ms ${EASINGS.smooth}`,
    fade: `opacity ${DURATIONS.medium}ms ${EASINGS.smooth}`,
    bounce: `transform ${DURATIONS.medium}ms ${EASINGS.bounce}`
  };
  
  // Transform strings
  export const transforms = {
    // Scale transforms
    scaleUp: 'scale(1.05)',
    scaleDown: 'scale(0.95)',
    scaleNormal: 'scale(1)',
    
    // Translation transforms
    slideUp: 'translateY(-10px)',
    slideDown: 'translateY(10px)',
    slideLeft: 'translateX(-10px)',
    slideRight: 'translateX(10px)',
    slideReset: 'translate(0, 0)',
    
    // Combined transforms
    hover: 'translateY(-2px) scale(1.01)',
    active: 'translateY(1px) scale(0.99)',
    press: 'scale(0.95)',
  };
  
  // Animation keyframes objects (for styled-components or emotion)
  export const keyframes = {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },
    slideInUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 }
    },
    slideInDown: {
      from: { transform: 'translateY(-20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 }
    },
    slideInLeft: {
      from: { transform: 'translateX(-20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 }
    },
    slideInRight: {
      from: { transform: 'translateX(20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 }
    },
    scaleIn: {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 }
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.9)', opacity: 0 }
    }
  };
  
  // Component transition presets
  export const componentTransitions = {
    // Modal transitions
    modal: {
      enter: {
        initial: { opacity: 0, transform: 'scale(0.95)' },
        animate: { opacity: 1, transform: 'scale(1)' },
        transition: { duration: DURATIONS.medium, ease: EASINGS.spring }
      },
      exit: {
        initial: { opacity: 1, transform: 'scale(1)' },
        animate: { opacity: 0, transform: 'scale(0.95)' },
        transition: { duration: DURATIONS.medium, ease: EASINGS.smooth }
      }
    },
    
    // Page transitions
    page: {
      enter: {
        initial: { opacity: 0, transform: 'translateY(20px)' },
        animate: { opacity: 1, transform: 'translateY(0)' },
        transition: { duration: DURATIONS.medium, ease: EASINGS.smooth }
      },
      exit: {
        initial: { opacity: 1, transform: 'translateY(0)' },
        animate: { opacity: 0, transform: 'translateY(-20px)' },
        transition: { duration: DURATIONS.medium, ease: EASINGS.smooth }
      }
    },
    
    // Menu/Dropdown transitions
    menu: {
      enter: {
        initial: { opacity: 0, transform: 'translateY(-10px)' },
        animate: { opacity: 1, transform: 'translateY(0)' },
        transition: { duration: DURATIONS.fast, ease: EASINGS.smooth }
      },
      exit: {
        initial: { opacity: 1, transform: 'translateY(0)' },
        animate: { opacity: 0, transform: 'translateY(-10px)' },
        transition: { duration: DURATIONS.fast, ease: EASINGS.smooth }
      }
    }
  };
  
  // Helper function to create transition strings
  export const createTransition = (properties, duration = DURATIONS.medium, easing = EASINGS.smooth) => {
    if (Array.isArray(properties)) {
      return properties.map(prop => `${prop} ${duration}ms ${easing}`).join(', ');
    }
    return `${properties} ${duration}ms ${easing}`;
  };
  
  // Helper function to combine transforms
  export const combineTransforms = (...transforms) => transforms.join(' ');
  
  // Usage example:
  /*
  import { transitions, transforms, createTransition } from './transitions';
  
  // Using predefined transitions
  const buttonStyle = {
    transition: transitions.all,
    '&:hover': {
      transform: transforms.hover
    }
  };
  
  // Creating custom transitions
  const customTransition = createTransition(['transform', 'opacity'], 500, EASINGS.bounce);
  
  // Using with styled-components
  const Button = styled.button`
    transition: ${transitions.all};
    
    &:hover {
      transform: ${transforms.hover};
    }
    
    &:active {
      transform: ${transforms.active};
    }
  `;
  
  // Using with Framer Motion
  const modalVariants = componentTransitions.modal;
  
  <motion.div
    initial={modalVariants.enter.initial}
    animate={modalVariants.enter.animate}
    exit={modalVariants.exit.animate}
    transition={modalVariants.enter.transition}
  >
    Modal Content
  </motion.div>
  */