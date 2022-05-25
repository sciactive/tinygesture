import TinyGesture from './dist/TinyGesture.js';
import { addTransition, removeTransition } from './DemoTransitions.js';

/**
 * This function can be used as a Svelte action.
 */
export default function Tappable(
  node,
  options = {
    bgColor: 'transparent',
    color: 'black',
  }
) {
  const gesture = new TinyGesture(node);
  let tapTimeout;
  let pressTimeout;
  // This prevents the 'tap' handler from firing on a long press.
  let pressed = false;

  addTransition(node, 'background-color .3s ease');
  addTransition(node, 'color .3s ease');

  // Note: don't use the 'tap' event to detect when the user has finished a long press, because it doesn't always fire.
  gesture.on('tap', () => {
    // If the user long pressed, don't run the tap handler. This event fires after the user lifts their finger.
    if (pressed) {
      return;
    }
    // Embiggen.
    node.style.transform = 'perspective(1000px) translate3d(0, 0, 100px)';
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => (node.style.transform = ''), 300);
  });
  gesture.on('doubletap', () => {
    // Embiggen extra cromulently.
    node.style.transform = 'perspective(1000px) translate3d(0, 0, 400px)';
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => (node.style.transform = ''), 300);
  });
  gesture.on('longpress', () => {
    // Indicate that this is a long press. This event fires before the user lifts their finger.
    pressed = true;
    // Change colors.
    node.style.backgroundColor = options.bgColor;
    node.style.color = options.color;
    clearTimeout(pressTimeout);
  });

  gesture.on('panend', () => {
    // This is how you would detect when the user has finished a long press, because 'panend' will always fire, even if
    // the user has moved their finger a little after 'longpress' has fired.
    if (pressed) {
      pressTimeout = setTimeout(() => {
        node.style.backgroundColor = '';
        node.style.color = '';
      }, 300);

      // Make sure to reset pressed after the current event loop.
      setTimeout(() => {
        pressed = false;
      }, 0);
    }
  });

  return {
    destroy() {
      clearTimeout(tapTimeout);
      clearTimeout(pressTimeout);
      node.style.transform = '';
      node.style.backgroundColor = '';
      node.style.color = '';
      removeTransition(node, 'background-color');
      removeTransition(node, 'color');
      gesture.destroy();
    },
  };
}
