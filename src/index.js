// import { reactive } from "./reactive/reactive";
// import { effect } from "./reactive/effect";
// import { ref } from "./reactive/ref";
// import { computed } from "./reactive/computed";
// const observed = (window.observed = reactive({
//   count: 0,
// }));
// effect(() => {
//   console.log("observed.count is:", observed.count);
// });
// const observed = (window.observed = reactive([1, 2, 3]));

// effect(() => {
//   console.log('index 4 is:', observed[4]);
// });
// effect(() => {
//   console.log('length is:', observed.length);
// });

// const observed = (window.observed = reactive({
//   count1: 0,
//   count2: 10,
// }));

// effect(() => {
//   effect(() => {
//     console.log('count2 is:', observed.count2);
//   });
//   console.log('count1 is:', observed.count1);
// });

// const foo = ref(window.foo = ref(12));
// effect(() => {
//   console.log('foo: ', foo.value)
// });

// const num = (window.num = ref(0));
// const c = (window.c = computed({
//   get() {
//     console.log('get');
//     return num.value * 2;
//   },
//   set(val) {
//     num.value = val;
//   }, 
// }));

import { render, h, Text } from './runtime';

const vnode = h(
  'div',
  {
    class: 'a b',
    style: {
      border: '1px solid',
      fontSize: '14px',
    },
    onClick: () => console.log('click'),
    checked: '',
    custom: false,
  },
  [
    h('ul', null, [
      h('li', { style: { color: 'red' } }, 1),
      h('li', null, 2),
      h('li', { style: { color: 'blue' } }, 3),
      h('li', null, [h(Text, null, 'hello world')]),
    ]),
  ]
);

render(vnode, document.body);