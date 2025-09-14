import { super_cache } from './index.js';

class Calculator {
  @super_cache('fast')
  multiply(x) {
    console.log('Calculating...');
    return x * 2;
  }
}

const calculator = new Calculator();
console.log(calculator.multiply(5));
console.log(calculator.multiply(5));
// console.log(calculator.multiply.cache_info()); // This line will fail because the method is replaced by the decorator