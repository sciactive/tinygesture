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

  addTransition(node, 'transform .5s ease');

  // Don't allow the page to scroll when the target is first pressed.
  node.addEventListener('touchstart', preventDefault, { passive: false });

  let xpos = 0;
  let ypos = 0;
  let myTransform = ` translateX(${xpos}px) translateY(${ypos}px)`;
  node.style.transform = '';

  function resetTransform() {
    node.style.transform = `${node.style.transform}`.replace(/\s*translateX\([^)]*\)/, '');
    node.style.transform = `${node.style.transform}`.replace(/\s*translateY\([^)]*\)/, '');
    myTransform = ` translateX(${xpos}px) translateY(${ypos}px)`;
  }

  function doTransform() {
    node.style.transform = `${node.style.transform}` + myTransform;
    clearTimeout(backTimeout);
    backTimeout = setTimeout(() => {
      xpos = 0;
      ypos = 0;
      resetTransform();
    }, 1000);
  }

  // When the target is swiped, fling it really far in that direction before coming back to origin.
  gesture.on('swiperight', () => {
    if (gesture.scale > 1.1 || gesture.scale < 0.9) {
      return;
    }
    xpos = 2000;
    resetTransform();
    cancelAnimationFrame(goRaf);
    goRaf = requestAnimationFrame(doTransform);
  });
  gesture.on('swipeleft', () => {
    if (gesture.scale > 1.1 || gesture.scale < 0.9) {
      return;
    }
    xpos = -2000;
    resetTransform();
    cancelAnimationFrame(goRaf);
    goRaf = requestAnimationFrame(doTransform);
  });
  gesture.on('swipeup', () => {
    if (gesture.scale > 1.1 || gesture.scale < 0.9) {
      return;
    }
    ypos = -2000;
    resetTransform();
    cancelAnimationFrame(goRaf);
    goRaf = requestAnimationFrame(doTransform);
  });
  gesture.on('swipedown', () => {
    if (gesture.scale > 1.1 || gesture.scale < 0.9) {
      return;
    }
    ypos = 2000;
    resetTransform();
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
