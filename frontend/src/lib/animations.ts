/**
 * Shared Framer Motion animation variants and configurations
 * Used across payment flow and subscription management components
 */

import { Variants } from "framer-motion";

/**
 * Page entrance animation - fade in with slight upward movement
 */
export const pageEntranceVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

/**
 * Fade in animation - simple opacity transition
 */
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

/**
 * Success celebration animation - scale up with spring physics
 */
export const successCelebrationVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.5, 
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

/**
 * Card entrance animation - fade in with scale
 */
export const cardEntranceVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

/**
 * Slide in from left animation
 */
export const slideInLeftVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

/**
 * Slide in from right animation
 */
export const slideInRightVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

/**
 * Stagger children animation - for lists and tables
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

/**
 * Stagger child item animation
 */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

/**
 * QR code pulse animation configuration
 */
export const qrCodePulseAnimation = {
  animate: {
    scale: [1, 1.02, 1],
    boxShadow: [
      "0 0 0 0 rgba(59, 130, 246, 0)",
      "0 0 0 10px rgba(59, 130, 246, 0.1)",
      "0 0 0 0 rgba(59, 130, 246, 0)"
    ]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

/**
 * Button hover and tap animation configuration
 */
export const buttonAnimationConfig = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

/**
 * Icon scale animation - for success checkmarks, etc.
 */
export const iconScaleVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: { 
      duration: 0.5,
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

/**
 * Collapse/expand animation for accordions and dropdowns
 */
export const collapseVariants: Variants = {
  collapsed: { 
    opacity: 0, 
    height: 0,
    transition: { duration: 0.3 }
  },
  expanded: { 
    opacity: 1, 
    height: "auto",
    transition: { duration: 0.3 }
  }
};

/**
 * Smooth height animation configuration
 */
export const heightAnimationConfig = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.3 }
};
