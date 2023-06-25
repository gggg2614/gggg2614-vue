const target = {
    name: 'John',
    age: 30
  };
  
  const handler = {
    get(target, property) {
      console.log(`Getting ${property}`);
      return target[property];
    },
    set(target, property, value) {
      console.log(`Setting ${property} to ${value}`);
      target[property] = value;
    },
    deleteProperty(target, property) {
      delete target[property];
    }
  };
  
  const proxy = new Proxy(target, handler);
  
  delete proxy.age; // 输出：Deleting age
  
  console.log(proxy); // 输出：{ name: 'Alice' }
  