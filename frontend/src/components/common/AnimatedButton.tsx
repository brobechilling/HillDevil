/**
 * Animated button wrapper component
 * Provides consistent hover and tap animations for buttons
 */

import { motion, MotionProps } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { buttonAnimationConfig } from "@/lib/animations";
import { forwardRef } from "react";

interface AnimatedButtonProps extends ButtonProps {
  /**
   * Disable animations (useful for loading states)
   */
  disableAnimation?: boolean;
  /**
   * Custom animation configuration
   */
  animationConfig?: {
    whileHover?: MotionProps["whileHover"];
    whileTap?: MotionProps["whileTap"];
    transition?: MotionProps["transition"];
  };
}

/**
 * Button component with built-in hover and tap animations
 * Uses Framer Motion for smooth interactions
 */
const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    disableAnimation = false,
    animationConfig,
    disabled,
    ...props 
  }, ref) => {
    // Don't animate if disabled or animation is explicitly disabled
    const shouldAnimate = !disabled && !disableAnimation;

    const config = animationConfig || buttonAnimationConfig;

    if (!shouldAnimate) {
      return (
        <Button ref={ref} disabled={disabled} {...props}>
          {children}
        </Button>
      );
    }

    return (
      <motion.div
        whileHover={config.whileHover}
        whileTap={config.whileTap}
        transition={config.transition}
        className="inline-block"
      >
        <Button ref={ref} disabled={disabled} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;
