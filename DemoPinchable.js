import TinyGesture from './dist/TinyGesture.js';
import { addTransition, removeTransition } from './DemoTransitions.js';

/**
 * This function can be used as a Svelte action.
 */
export default function Pinchable(node) {
  const gesture = new TinyGesture(node);
  let backTimeout;
  const preventDefault = (event) => {
    event.preventDefault();
  };

  addTransition(node, 'transform .5s ease');
  addTransition(node, 'transform-origin .5s ease');

  // Don't allow the page to scroll when the target is first pressed.
  node.addEventListener('touchstart', preventDefault, { passive: false });

  let scale = 1;
  let origin = null;
  let myTransform = ` scale(${scale})`;
  node.style.transform = '';

  function resetTransform() {
    node.style.transform = `${node.style.transform}`.replace(/\s*scale\([^)]*\)/, '');
    myTransform = ` scale(${scale})`;
  }

  // When the target is pinched, scale it to the right size.
  gesture.on('pinch', () => {
    scale = gesture.scale;
    if (origin == null) {
      const box = node.getBoundingClientRect();
      origin = [gesture.touchMove1.clientX - box.x, gesture.touchMove1.clientY - box.y];
      node.style.transformOrigin = `${origin[0]}px ${origin[1]}px`;
    }
    resetTransform();
    removeTransition(node, 'transform');
    removeTransition(node, 'transform-origin');
    node.style.transform = `${node.style.transform}` + myTransform;
  });

  // When the target is pinched, scale it to the right size.
  gesture.on('pinchend', () => {
    scale = gesture.scale;
    origin = null;
    addTransition(node, 'transform .5s ease');
    addTransition(node, 'transform-origin .5s ease');
    node.style.transformOrigin = 'center';
    clearTimeout(backTimeout);
    backTimeout = setTimeout(() => {
      scale = 0;
      resetTransform();
    }, 1000);
  });

  return {
    destroy() {
      node.removeEventListener('touchstart', preventDefault, {
        passive: false,
      });
      clearTimeout(backTimeout);
      node.style.transform = '';
      removeTransition(node, 'transform');
      gesture.destroy();
    },
  };
}
