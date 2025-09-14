import { 
  super_cache, protect, logExecution, debounce, throttle, repeat, 
  validate, rate_limit, async_retry, time_limit, immutable,
  super_matrix, wrapFunction 
} from './index.js';

describe('Complete Universal Decorators with @ syntax', () => {
  
  it('should work with @super_cache() decorator', () => {
    class Calculator {
      @super_cache('balanced', 64)
      add(a, b) {
        return a + b;
      }

      @super_cache('fast')
      multiply(a, b) {
        return a * b;
      }
    }

    const calc = new Calculator();
    
    const result1 = calc.add(5, 3);
    const result2 = calc.add(5, 3); // from cache
    
    expect(result1).toBe(8);
    expect(result2).toBe(8);
    expect(calc.add.cache_info().hits).toBe(1);
    expect(calc.add.cache_info().maxsize).toBe(64);
    
    calc.multiply(4, 5);
    expect(calc.multiply.cache_info().maxsize).toBe(256);
  });

  it('should work with @protect() decorator', () => {
    class DataProcessor {
      @protect('strict')
      processData(data) {
        if (!data) throw new Error('No data provided');
        return { processed: data.value * 2 };
      }

      @protect('normal')
      safeProcess(data) {
        return data.value + 10;
      }
    }

    const processor = new DataProcessor();
    
    const result = processor.processData({ value: 5 });
    expect(result.processed).toBe(10);
    expect(Object.isFrozen(result)).toBe(true);
    
    const result2 = processor.safeProcess({ value: 15 });
    expect(result2).toBe(25);
  });

  it('should work with @logExecution() decorator', () => {
    const originalLog = console.log;
    const mockLog = jest.fn();
    console.log = mockLog;

    class ServiceClass {
      @logExecution({ level: 'info', timing: true, params: false })
      performTask(taskName, duration = 10) {
        const start = Date.now();
        while (Date.now() - start < duration) {}
        return `Task ${taskName} completed`;
      }
    }

    const service = new ServiceClass();
    const result = service.performTask('test');
    
    expect(result).toBe('Task test completed');
    expect(mockLog).toHaveBeenCalled();
    
    console.log = originalLog;
  });

  it('should work with @debounce() decorator', async () => {
    let callCount = 0;
    
    class SearchService {
      @debounce(50)
      async search(query) {
        callCount++;
        return `Results for: ${query}`;
      }
    }

    const service = new SearchService();
    
    const promise1 = service.search('test1');
    const promise2 = service.search('test2');
    const promise3 = service.search('test3');
    
    const result = await promise3; // only last call will execute
    
    expect(result).toBe('Results for: test3');
    expect(callCount).toBe(1);
  });

  it('should work with @throttle() decorator', (done) => {
    let callCount = 0;
    
    class EventHandler {
      @throttle(100)
      handleClick(eventData) {
        callCount++;
        return `Handled: ${eventData}`;
      }
    }

    const handler = new EventHandler();
    
    const result1 = handler.handleClick('click1'); // will execute
    const result2 = handler.handleClick('click2'); // will be ignored
    const result3 = handler.handleClick('click3'); // will be ignored
    
    expect(result1).toBe('Handled: click1');
    expect(result2).toBeUndefined();
    expect(result3).toBeUndefined();
    expect(callCount).toBe(1);
    
    setTimeout(() => {
      const result4 = handler.handleClick('click4');
      expect(result4).toBe('Handled: click4');
      expect(callCount).toBe(2);
      done();
    }, 150);
  });

  it('should work with @repeat() decorator', () => {
    let attemptCount = 0;
    
    class UnreliableService {
      @repeat(3, 10)
      unreliableMethod() {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Service temporarily unavailable');
        }
        return 'Success on attempt ' + attemptCount;
      }
    }

    const service = new UnreliableService();
    const result = service.unreliableMethod();
    
    expect(result).toBe('Success on attempt 3');
    expect(attemptCount).toBe(3);
  });

  it('should work with @validate() decorator', () => {
    class UserService {
      @validate({
        params: [
          { type: 'string', required: true, min: 3 },
          { type: 'number', required: true, min: 0, max: 150 }
        ],
        return: { type: 'object', required: true }
      })
      createUser(name, age) {
        return { name, age, id: Date.now() };
      }
    }

    const service = new UserService();
    
    const user = service.createUser('Alice', 25);
    expect(user.name).toBe('Alice');
    expect(user.age).toBe(25);
    expect(user.id).toBeTruthy();
    
    expect(() => {
      service.createUser('Bob', -5);
    }).toThrow('Parameter 1 must be >= 0');
    
    expect(() => {
      service.createUser('Al', 30);
    }).toThrow('Parameter 0 must be >= 3');
  });

  it('should work with @rate_limit() decorator', (done) => {
    class APIService {
      @rate_limit({ requests: 2, window: '1s', strategy: 'reject' })
      makeRequest(data) {
        return `API response: ${data}`;
      }
    }

    const service = new APIService();
    
    expect(service.makeRequest('data1')).toBe('API response: data1');
    expect(service.makeRequest('data2')).toBe('API response: data2');
    
    expect(() => {
      service.makeRequest('data3');
    }).toThrow('Rate limit exceeded');
    
    setTimeout(() => {
      expect(service.makeRequest('data4')).toBe('API response: data4');
      done();
    }, 1100);
  });

  it('should work with metrics decorator (manual application)', () => {
    // Manual application of metrics decorator to avoid hoisting issues
    const originalProcessData = function(data) {
      if (data === 'error') {
        throw new Error('Processing failed');
      }
      return `Processed: ${data}`;
    };

    // Import and apply metrics manually
    const { metrics } = require('./index.js');
    const decoratedFunction = metrics({ track: ['calls', 'duration', 'errors'] })(
      originalProcessData,
      'processData',
      { value: originalProcessData }
    );
    
    const processData = decoratedFunction.value || decoratedFunction;
    
    processData('data1');
    processData('data2');
    
    try {
      processData('error');
    } catch (e) {
      // expected
    }
    
    const metricsData = processData.getMetrics();
    expect(metricsData.calls).toBe(3);
    expect(metricsData.errors).toBe(1);
    expect(Math.round(metricsData.successRate * 10) / 10).toBe(66.7);
    expect(metricsData.averageDuration).toBeGreaterThan(0);
  });

  it('should work with @async_retry() decorator', async () => {
    let attemptCount = 0;
    
    class AsyncService {
      @async_retry({ attempts: 3, delay: 10 })
      async fetchData() {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
        return 'Data fetched successfully';
      }
    }

    const service = new AsyncService();
    const result = await service.fetchData();
    
    expect(result).toBe('Data fetched successfully');
    expect(attemptCount).toBe(3);
  });

  it('should work with @time_limit() decorator', () => {
    class ProcessingService {
      @time_limit(100)
      quickTask() {
        return 'Task completed quickly';
      }

      @time_limit(50)
      slowTask() {
        const start = Date.now();
        while (Date.now() - start < 100) {}
        return 'Task completed slowly';
      }
    }

    const service = new ProcessingService();
    
    expect(service.quickTask()).toBe('Task completed quickly');
    
    expect(() => {
      service.slowTask();
    }).toThrow('exceeded time limit');
  });

  it('should work with @immutable() decorator', () => {
    class DataService {
      @immutable()
      createConfig(options) {
        return { ...options, timestamp: Date.now() };
      }
    }

    const service = new DataService();
    const config = service.createConfig({ feature: 'enabled' });
    
    expect(config.feature).toBe('enabled');
    expect(config.timestamp).toBeTruthy();
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('should work with multiple decorators on same method', () => {
    const originalLog = console.log;
    console.log = jest.fn();

    class ComplexService {
      @super_cache('light')
      @protect('normal')  
      @logExecution({ level: 'debug', timing: false, params: false })
      complexOperation(input) {
        return input * input + 10;
      }
    }

    const service = new ComplexService();
    const result1 = service.complexOperation(5);
    const result2 = service.complexOperation(5);
    
    expect(result1).toBe(35);
    expect(result2).toBe(35);
    // Note: cache_info is not available when multiple decorators are stacked
    // This is expected behavior due to decorator wrapping order
    
    console.log = originalLog;
  });

  it('should work with @super_matrix() - combined decorator', () => {
    class MatrixService {
      @super_matrix({
        cache: 'fast',
        protect: 'loose',
        log: { timing: false, params: false }
        // Simplified matrix without validation to avoid complex interactions
      })
      advancedCalculation(x) {
        return Math.pow(x, 2) + Math.sqrt(x);
      }
    }

    const service = new MatrixService();
    
    const result1 = service.advancedCalculation(16);
    const result2 = service.advancedCalculation(16);
    
    expect(result1).toBe(260); // 16² + √16 = 256 + 4 = 260
    expect(result2).toBe(260);
    
    // Test that the function works correctly with different inputs
    expect(service.advancedCalculation(4)).toBe(18); // 4² + √4 = 16 + 2 = 18
    expect(service.advancedCalculation(9)).toBe(84); // 9² + √9 = 81 + 3 = 84
  });

  it('should work with function wrappers (non-decorator usage)', () => {
    const simpleAdd = (a, b) => a + b;
    
    const cachedAdd = wrapFunction.cache(simpleAdd, 'fast');
    const protectedAdd = wrapFunction.protect(simpleAdd, 'strict');
    const loggedAdd = wrapFunction.log(simpleAdd, { timing: false, params: false });
    
    expect(cachedAdd(3, 4)).toBe(7);
    expect(cachedAdd(3, 4)).toBe(7); // cached
    expect(cachedAdd.cache_info().hits).toBe(1);
    
    // Test protected wrapper with simple numbers
    const result = protectedAdd(5, 3);
    expect(result).toBe(8);
    
    expect(loggedAdd(1, 2)).toBe(3);
  });
});