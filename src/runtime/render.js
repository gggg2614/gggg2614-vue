import { ShapeFlags } from "./vnode";
import { patchProps } from "./patchProps";

export function render(vnode, container) {
  const prevVNode = container._vnode;
  if (!vnode) {
    if (prevVNode) {
      unmount(prevVNode);
    }
  } else {
    patch(prevVNode, vnode, container);
  }
  container._vnode = vnode;
}

function unmount(vnode) {
  const { shapeFlag, el } = vnode;
  if (shapeFlag & ShapeFlags.COMPONENT) {
    unmountComponent(vnode);
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    unmountFragment(vnode);
  } else {
    el.parentNode.removeChild(el);
  }
}

function unmountComponent(vnode) {}

function unmountFragment(vnode) {
  let { el: cur, anchor: end } = vnode;
  const { parentNode } = cur;
  while (cur !== end) {
    let next = cur.nextSibling;
    parentNode.removeChild(cur);
    cur = next;
  }
  parentNode.removeChild(end);
}

function patch(n1, n2, container, anchor) {
  if (n1 && isSanmeVNode(n1, n2)) {
    // anchor = n1.el.nextSibling;
    anchor = (n1.anchor || n1.el).nextSibling;
    unmount(n1);
    n1 = null;
  }
  const { shapeFlag } = n2;
  if (shapeFlag & ShapeFlags.COMPONENT) {
    processComponent(n1, n2, container, anchor);
  } else if (shapeFlag & ShapeFlags.TEXT) {
    processText(n1, n2, container, anchor);
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    processFragment(n1, n2, container, anchor);
  } else {
    processElement(n1, n2, container, anchor);
  }
}

function isSanmeVNode(n1, n2) {
  return n1.type === n2.type;
}

function processComponent(n1, n2, container, anchor) {}

function processText(n1, n2, container, anchor) {
  if (n1) {
    n2.el = n1.el;
    n1.el.textContent = n2.children;
  } else {
    mountTextNode(n2, container, anchor);
  }
}

function processFragment(n1, n2, container, anchor) {
  const fragmentStartAnchor = (n2.el = n1
    ? n1.el
    : document.createTextNode(""));
  const fragmentEndAnchor = (n2.anchor = n1
    ? n1.anchor
    : document.createTextNode(""));
  if (n1) {
    patchChildren(n1, n2, container, fragmentEndAnchor);
  } else {
    container.insertBefore(fragmentStartAnchor, anchor);
    container.insertBefore(fragmentEndAnchor, anchor);
    mountChildren(n2.children, container, fragmentEndAnchor);
  }
}

function processElement(n1, n2, container, anchor) {
  if (n1) {
    patchElement(n1, n2);
  } else {
    mountElement(n2, container, anchor);
  }
}

function mountTextNode(vnode, container, anchor) {
  const textNode = document.createTextNode(vnode.children);
  // container.appendChild(textNode);
  container.insertBefore(textNode, anchor);
  vnode.el = textNode;
}

function mountElement(vnode, container, anchor) {
  const { type, props, shapeFlag, children } = vnode;
  const el = document.createElement(type);
  // mountProps(props, el);
  patchProps(null, props, el);

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    mountTextNode(vnode, el);
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }
  // container.appendChild(el);
  container.insertBefore(el, anchor);
  vnode.el = el;
}

function mountChildren(children, container, anchor) {
  children.forEach((child) => {
    // mount(child, container);
    patch(null, child, container, anchor);
  });
}

function patchElement(n1, n2) {
  n2.el = n1.el;
  patchProps(n1.props, n2.props, n2.el);
  patchChildren(n1, n2, n2.el);
}

function unmountChildren(children) {
  children.forEach((child) => {
    unmount(child);
  });
}

function patchChildren(n1, n2, container) {
  const { shapeFlag: prevShapeFlag, children: c1 } = n1;
  const { shapeFlag, children: c2 } = n2;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(c1);
    }
    if (c1 !== c2) {
      container.textContent = c2;
    }
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = "";
      mountChildren(c2, container);
    } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (c1[0] && c1[0].key != null && c2[0] && c2[0].key != null) {
        patchkeyedChildren(c1, c2, container, anchor);
      } else {
        patchUnkeyedChildren(c1, c2, container, anchor);
      }
    } else {
      mountChildren(c2, container);
    }
  } else {
    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = "";
    } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(c1);
    }
  }
}

function patchUnkeyedChildren(c1, c2, container, anchor) {
  const oldLength = c1.length;
  const newLength = c2.length;
  const commonLength = Math.min(oldLength, newLength);
  for (let i = 0; i < commonLength; i++) {
    patch(c1[i], c2[i], container, anchor);
  }
  if (oldLength > newLength) {
    unmountChildren(c1.slice(commonLength));
  } else if (oldLength < newLength) {
    mountChildren(c2.slice(commonLength), container, anchor);
  }
}

function patchkeyedChildren2(c1, c2, container, anchor) {
  const map = new Map();
  c1.forEach((prev, j) => {
    map.set(prev.key, { prev, j });
  });
  let maxNewIndexSoFar = 0;
  for (let i = 0; i < c2.length; i++) {
    const next = c2[i];
    const prev = c1[i];
    if (next.key === prev.key) {
      patch(prev, next, container, anchor);
      if (j < maxNewIndexSoFar) {
        const curAnchor = c2[i - 1].el.nextSibling;
        container.insertBefore(next.el, curAnchor);
      } else {
        maxNewIndexSoFar = j;
      }
      map.delete(next.key);
    } else {
      patch(null, next, container, curAnchor);
    }
  }
  map.forEach((prev) => {
    unmount(prev);
  });
}

function patchkeyedChildren(c1, c2, container, anchor) {
  let i = 0;
  let e1 = c1.length - 1;
  let e2 = c2.length - 1;
  while (i <= e1 && e1 <= e2 && c1[i].key === c2[i].key) {
    patch(c1[i], c2[i], container, anchor);
    i++;
  }

  while (i <= e1 && e1 <= e2 && c1[e1].key === c2[e2].key) {
    patch(c1[i], c2[i], container, anchor);
    e1--;
    e2--;
  }
  if (i > el) {
    for (let j = i; j <= e2; j++) {
      const nextPos = e2 + 1;
      const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
      patch(null, c2[j], container, curAnchor);
    }
  } else if (i > e2) {
    for (let j = 1; j <= el; j++) {
      unmount(c1[j]);
    }
  } else {
    const map = new Map();
    c1.forEach((prev, j) => {
      map.set(prev.key, { prev, j });
    });
    let maxNewIndexSoFar = 0;
    let move = false;
    const source = new Array(e2 - i + 1).fill(-1);
    const toMounted = [];
    for (let k = 0; k < c2.length; k++) {
      const next = c2[k];
      if (map.has(next.key)) {
        const { prev, j } = map.get(next.key);
        patch(prev, next, container, anchor);
        if (j < maxNewIndexSoFar) {
          move = true;
        } else {
          maxNewIndexSoFar = j;
        }
        source[k] = j;
        map.delete(next.key);
      } else {
        toMounted.push(k + i);
      }
    }
    map.forEach((prev) => {
      unmount(prev);
    });
    if (move) {
      const seq = getSequence(source);
      let j = seq.length - 1;
      for (let k = source.length - 1; k >= 0; k--) {
        if (seq[j] === k) {
          j--;
        } else {
          const pos = k + i;
          const nextPos = pos + 1;
          const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
          if (source[k] === -1) {
            patch(null, c2[pos], container, curAnchor);
          } else {
            container.insertBefore(c2[pos].el, curAnchor);
          }
        }
      }
    } else if (toMounted.length) {
      for (let k = toMounted.length - 1; k >= 0; k--) {
        const pos = toMounted[k];
        const nextPos = pos + 1;
        const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
        patch(null, c2[pos], container, curAnchor);
      }
    }
  }
}

function getSequence() {}
