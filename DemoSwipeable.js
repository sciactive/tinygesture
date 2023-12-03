import TinyGesture from './dist/TinyGesture.js';
import { addTransition, removeTransition } from './DemoTransitions.js';

/**
 * This function can be used as a Svelte action.
 */
export default function Swipeable(node) {
  const gesture = new TinyGesture(node, { diagonalSwipes: true });
  let goRaf;
  let backTimeout;
  const preventDefault = (event) => {
    event.preventDefault();
  };

  addTransition(node, 'transform .3s ease');

  // Don't allow the page to scroll when the target is first pressed.
  node.addEventListener('touchstart', preventDefault, { passive: false });

  let xpos = 0;
  let ypos = 0;

  function doTransform() {
    node.style.transform = `perspective(1000px) translate3d(${xpos}px, ${ypos}px, 0)`;
    clearTimeout(backTimeout);
    backTimeout = setTimeout(() => {
      xpos = 0;
      ypos = 0;
      node.style.transform = '';
    }, 1000);
  }

  // When the target is swiped, fling it really far in that direction before coming back to origin.
  gesture.on('swiperight', () => {
    xpos = 2000;
    cancelAnimationFrame(goRaf);
    goRaf = requestAnimationFrame(doTransform);
  });
  gesture.on('swipeleft', () => {
    xpos = -2000;
    cancelAnimationFrame(goRaf);
    goRaf = requestAnimationFrame(doTransform);
  });
  gesture.on('swipeup', () => {
    ypos = -2000;
    cancelAnimationFrame(goRaf);
    goRaf = requestAnimationFrame(doTransform);
  });
  gesture.on('swipedown', () => {
    ypos = 2000;
    cancelAnimationFrame(goRaf);
    goRaf = requestAnimationFrame(doTransform);
  });

  return {
    destroy() {
      node.removeEventListener('touchstart', preventDefault, {
        passive: false,
      });
      cancelAnimationFrame(goRaf);
      clearTimeout(backTimeout);
      node.style.transform = '';
      removeTransition(node, 'transform');
      gesture.destroy();
    },
  };
}
