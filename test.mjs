// test.mjs
import { 
  super_cache, 
  protect, 
  logExecution,
  UniversalLRU,
  DecoratorError
} from './dist/index.js';

console.log('🧪 Testing Universal Decorators Library\n');

// Test 1: super_cache decorator
console.log('1. Testing super_cache decorator:');
const simpleAdd = (a, b) => a + b;
const cachedAdd = super_cache()(simpleAdd);

console.log('First call (should compute):', cachedAdd(2, 3));
console.log('Second call (should cache):', cachedAdd(2, 3));
console.log('Cache info:', cachedAdd.cache_info());
cachedAdd.cache_clear();
console.log('After cache clear:', cachedAdd.cache_info());
console.log('✅ super_cache test passed\n');

// Test 2: UniversalLRU class
console.log('2. Testing UniversalLRU class:');
const lru = new UniversalLRU(2);
lru.set('key1', 'value1');
lru.set('key2', 'value2');
lru.set('key3', 'value3');

console.log('LRU get key2:', lru.get('key2'));
console.log('LRU get key1 (should be undefined):', lru.get('key1'));
console.log('LRU info:', lru.info());
console.log('✅ UniversalLRU test passed\n');

// Test 3: protect decorator
console.log('3. Testing protect decorator:');
const protectedFn = protect()((a, b) => a + b);
console.log('Protected function result:', protectedFn(5, 3));
console.log('✅ protect test passed\n');

// Test 4: Error classes
console.log('4. Testing Error classes:');
try {
  throw new DecoratorError('Test error', 'testDecorator');
} catch (error) {
  console.log('DecoratorError:', error.name, error.message);
}
console.log('✅ Error classes test passed\n');

console.log('🎉 All basic tests completed successfully!');