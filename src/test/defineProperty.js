const obj = {};

Object.defineProperty(obj, 'name', {
  value: 'John',
  writable: true,
  enumerable: true,
  configurable: true
});

// 监听属性的添加
Object.defineProperty(obj, 'age', {
  set(newValue) {
    console.log(`Setting age to ${newValue}`);
  }
});

// 属性添加后无法自动触发操作
obj.age = 12; // 不会触发设置操作的日志输出
obj.age=23
delete obj.age;
console.log(obj);