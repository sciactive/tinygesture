import TinyGesture from './dist/TinyGesture.js';
import { addTransition, removeTransition } from './DemoTransitions.js';

/**
 * This function can be used as a Svelte action.
 */
export default function Pannable(node) {
  const gesture = new TinyGesture(node);
  let animationFrame = null;
  const preventDefault = (event) => {
    event.preventDefault();
  };

  addTransition(node, 'opacity .3s ease');

  // Don't allow the page to scroll when the target is first pressed.
  node.addEventListener('touchstart', preventDefault, { passive: false });

  gesture.on('panstart', () => {
    // Remove left and top transitions so the target updates its position immediately.
    removeTransition(node, 'left');
    removeTransition(node, 'top');
  });

  gesture.on('panmove', () => {
    if (animationFrame) {
      return;
    }
    animationFrame = window.requestAnimationFrame(() => {
      // Give an indication of whether we've passed the swiping threshold.
      if (!gesture.swipingDirection.startsWith('pre-')) {
        node.style.opacity = '0.7';
      } else {
        node.style.opacity = '1';
      }
      // Give an indication of how far the user has pulled the target away from its origin.
      node.style.transform = 'rotate(' + (gesture.touchMoveX / 8 + gesture.touchMoveY / 8) + 'deg)';
      // Update the location to under the user's finger/mouse.
      node.style.left = gesture.touchMoveX + 'px';
      node.style.top = gesture.touchMoveY + 'px';
      animationFrame = null;
    });
  });

  gesture.on('panend', () => {
    animationFrame == null || window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    node.style.transform = '';
    // Set left and top transitions so we smoothly animate back to the target's origin.
    addTransition(node, 'left .3s ease');
    addTransition(node, 'top .3s ease');
    // Reset all the styles.
    node.style.left = '0px';
    node.style.top = '0px';
    node.style.opacity = '1';
  });

  return {
    destroy() {
      node.removeEventListener('touchstart', preventDefault, {
        passive: false,
      });
      animationFrame == null || window.cancelAnimationFrame(animationFrame);
      node.style.transform = '';
      removeTransition(node, 'opacity');
      removeTransition(node, 'left');
      removeTransition(node, 'top');
      gesture.destroy();
    },
  };
}
