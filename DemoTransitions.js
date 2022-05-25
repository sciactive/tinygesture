export function addTransition(node, transition) {
  node.style.transition = (node.style.transition ? node.style.transition + ', ' : '') + transition;
}

export function removeTransition(node, transition) {
  const match = node.style.transition.match(new RegExp('(?:^|,)\\s*' + transition + '(?:$|\\s|,)[^,]*', 'i'));
  if (match) {
    const transitionArray = node.style.transition.split('');
    transitionArray.splice(match.index, match[0].length);
    node.style.transition = transitionArray.join('');
  }
}
