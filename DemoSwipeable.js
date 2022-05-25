import TinyGesture from './dist/TinyGesture.js';
import { addTransition, removeTransition } from './DemoTransitions.js';

/**
 * This function can be used as a Svelte action.
 */
export default function Swipeable(node) {
  const gesture = new TinyGesture(node);
  let timeout;
  const preventDefault = (event) => {
    event.preventDefault();
  };

  addTransition(node, 'transform .3s ease');

  // Don't allow the page to scroll when the target is first pressed.
  node.addEventListener('touchstart', preventDefault, { passive: false });

  // When the target is swiped, fling it really far in that direction before coming back to origin.
  gesture.on('swiperight', () => {
    node.style.transform = 'perspective(1000px) translate3d(2000px, 0, 0)';
    clearTimeout(timeout);
    setTimeout(() => (node.style.transform = ''), 1000);
  });
  gesture.on('swipeleft', () => {
    node.style.transform = 'perspective(1000px) translate3d(-2000px, 0, 0)';
    clearTimeout(timeout);
    setTimeout(() => (node.style.transform = ''), 1000);
  });
  gesture.on('swipeup', () => {
    node.style.transform = 'perspective(1000px) translate3d(0, -2000px, 0)';
    clearTimeout(timeout);
    setTimeout(() => (node.style.transform = ''), 1000);
  });
  gesture.on('swipedown', () => {
    node.style.transform = 'perspective(1000px) translate3d(0, 2000px, 0)';
    clearTimeout(timeout);
    setTimeout(() => (node.style.transform = ''), 1000);
  });

  return {
    destroy() {
      node.removeEventListener('touchstart', preventDefault, {
        passive: false,
      });
      clearTimeout(timeout);
      node.style.transform = '';
      removeTransition(node, 'transform');
      gesture.destroy();
    },
  };
}
