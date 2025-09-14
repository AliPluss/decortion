# 🚀 Universal Decorators Complete - 17 Powerful Decorators

A comprehensive JavaScript decorators library featuring **17 powerful decorators**! 🌟 With Python-style `@decorators`, enjoy seamless compatibility across React, Vue, Angular, Node.js, Browser, TypeScript, and any JavaScript environment.

## ✨ All 17 Decorators

| #   | Decorator     | Description                              | Usage                                        |
|-----|---------------|------------------------------------------|----------------------------------------------|
| 1️⃣  | `@super_cache` | Fast/balanced/light caching             | `@super_cache('fast', 100)`                  |
| 2️⃣  | `@protect`    | Function protection (strict/normal/loose) | `@protect('strict')`                         |
| 3️⃣  | `@logExecution` | Log execution time and parameters       | `@logExecution({ timing: true })`            |
| 4️⃣  | `@repeat`     | Repeat function calls with delay        | `@repeat(3, 1000)`                           |
| 5️⃣  | `@loop_optimize` | Optimize loops inside functions        | `@loop_optimize()`                           |
| 6️⃣  | `@search_optimize` | Optimize search operations          | `@search_optimize({ algorithm: 'binary' })`  |
| 7️⃣  | `@var_guard`  | Variable protection and immutability    | `@var_guard({ immutable: true })`            |
| 8️⃣  | `@inheritFrom`| Function inheritance from parent       | `@inheritFrom(parentFunction)`               |
| 9️⃣  | `@immutable`  | Make objects immutable                  | `@immutable({ deep: true })`                 |
| 🔟  | `@time_limit` | Stop function if exceeds time limit     | `@time_limit(5000)`                          |
| 1️⃣1️⃣ | `@debounce`  | Prevent multiple calls within period    | `@debounce(300)`                             |
| 1️⃣2️⃣ | `@throttle`  | Limit function call frequency           | `@throttle(1000)`                            |
| 1️⃣3️⃣ | `@async_retry` | Retry async functions on failure      | `@async_retry({ attempts: 3 })`              |
| 1️⃣4️⃣ | `@validate`  | Validate parameters and return values  | `@validate({ params: [...] })`               |
| 1️⃣5️⃣ | `@rate_limit`| Control function call rate             | `@rate_limit({ requests: 100, window: '1m' })` |
| 1️⃣6️⃣ | `@metrics`   | Collect performance metrics            | `@metrics({ track: ['calls', 'duration'] })` |
| 1️⃣7️⃣ | `@super_matrix` | Combined decorator for multiple decorators | `@super_matrix({ cache: 'fast', protect: 'strict' })` |

## 📦 Installation

```bash
npm install universal-decorators-complete
```

## 🚀 Vanilla JavaScript Usage

For plain JavaScript without Babel or TypeScript, use decorators as regular functions:

```javascript
import { super_cache, protect } from 'universal-decorators-complete'

function multiply(x) {
  console.log('Calculating...');
  return x * 2;
}

const decorated = super_cache('fast')(protect('normal')(multiply));
console.log(decorated(5)); // Calculating... -> 10
console.log(decorated(5)); // 10 (from cache)
```

To use `@` decorator syntax, a build tool like Babel is required. See setup instructions below.

## 🚀 Setup with Babel

Enable `@` decorator syntax in JavaScript by configuring Babel:

1. **Install Dependencies:**

   ```bash
   npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/plugin-proposal-decorators
   ```

2. **Create `.babelrc`:**

   ```json
   {
     "presets": ["@babel/preset-env"],
     "plugins": [["@babel/plugin-proposal-decorators", { "legacy": true }]]
   }
   ```

3. **Example:**

   ```javascript
   import { super_cache } from 'universal-decorators-complete'

   @super_cache('fast')
   function multiply(x) {
     console.log('Calculating...');
     return x * 2;
   }

   console.log(multiply(5)); // Calculating... -> 10
   console.log(multiply(5)); // 10 (from cache)
   ```

4. **Transpile and Run:**

   ```bash
   npx babel src/ --out-dir dist/ --extensions ".js"
   node dist/your-script.js
   ```

## 🚀 Quick Start

Import individual decorators:

```javascript
import { 
  super_cache, protect, logExecution, repeat,
  debounce, throttle, async_retry, validate,
  rate_limit, metrics 
} from 'universal-decorators-complete'

class DataService {
  // Example methods using decorators

  @super_cache('fast', 100)
  expensiveCalculation(data) {
    return data.reduce((sum, num) => sum + Math.sqrt(num), 0);
  }

  @protect('strict')
  sensitiveOperation(userData) {
    return { ...userData, processed: true };
  }

  // More methods...
}
```

## 🧩 Super Matrix - All in One

Combine multiple decorators conveniently:

```javascript
import { super_matrix } from 'universal-decorators-complete'

@super_matrix({
  cache: 'fast',
  protect: 'strict',
  log: { timing: true },
  repeat: 2,
  debounce: 300
})
async function fetchUserProfile(userId) {
  return await api.get(`/users/${userId}`);
}
```

## 🚀 Advanced Usage Patterns

### Decorator Composition

Create reusable decorator combinations:

```javascript
const apiDecorator = (name) => super_matrix({
  cache: 'balanced',
  asyncRetry: { attempts: 3, exponentialBackoff: true },
  rateLimit: { requests: 100, window: '1m' },
  validate: { throwOnError: true },
  metrics: { name, track: ['calls', 'duration', 'errors'] },
  log: { timing: true, level: 'info' }
});

const databaseDecorator = super_matrix({
  cache: 'fast',
  protect: 'strict',
  timeLimit: 30000,
  asyncRetry: { attempts: 5, delay: 2000 },
  metrics: { track: ['calls', 'duration', 'errors'] }
});

// Apply to functions
@apiDecorator('user_service')
async function fetchUserProfile(userId) {
  return await api.get(`/users/${userId}`);
}

@databaseDecorator
async function saveUserData(userData) {
  return await database.users.create(userData);
}
```

### Performance Monitoring

```javascript
import { performanceMonitor } from 'universal-decorators-complete'

// Start profiling
performanceMonitor.startProfiling();

// Your decorated functions run...

// Get comprehensive performance insights
const insights = performanceMonitor.getPerformanceInsights();

console.log('Slowest Functions:', insights.slowestFunctions);
console.log('Most Cached:', insights.mostCachedFunctions);
console.log('Most Retried:', insights.mostRetriedFunctions);

// Export metrics for external monitoring
const metricsData = performanceMonitor.exportMetrics();
```

### Error Handling & Debugging

```javascript
import { 
  DecoratorError, 
  ValidationError, 
  RateLimitError,
  TimeoutError 
} from 'universal-decorators-complete'

try {
  await decoratedFunction(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.fieldName, error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter, 'seconds');
  } else if (error instanceof TimeoutError) {
    console.error('Function timed out after:', error.timeLimit, 'ms');
  } else if (error instanceof DecoratorError) {
    console.error('Decorator error in:', error.decoratorName);
  }
}
```

## 📊 Configuration & Customization

```javascript
import { configure, getConfig, resetConfig } from 'universal-decorators-complete';

// Global configuration
configure({
  defaultCacheType: 'fast',
  defaultCacheSize: 256,
  defaultProtectionLevel: 'strict',
  enablePerformanceMonitoring: true,
  enableDebugMode: true,
  logLevel: 'info',
  
  // Environment-specific settings
  browser: {
    useWebWorkers: true,
    maxWorkers: 4
  },
  
  node: {
    useWorkerThreads: true,
    maxThreads: 8
  },
  
  // Framework integration
  react: {
    enableHooks: true,
    enableDevtools: true
  }
});

// Get current configuration
const config = getConfig();
console.log('Current config:', config);

// Reset to defaults
resetConfig();
```

## 🧪 Testing

```javascript
import { testUtils } from 'universal-decorators-complete';

describe('Decorated Functions', () => {
  beforeEach(() => {
    testUtils.resetAll();
  });

  test('should cache function results', () => {
    const mockFn = jest.fn().mockReturnValue('result');
    const cachedFn = super_cache()(mockFn);
    
    expect(cachedFn()).toBe('result');
    expect(cachedFn()).toBe('result');
    
    expect(mockFn).toHaveBeenCalledTimes 
 ```
```javascript
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(cachedFn.cache_info().hits).toBe(1);
  });

  test('should validate inputs', () => {
    const validatedFn = validate({
      params: [{ type: 'string', required: true }]
    })((str) => str.toUpperCase());

    expect(() => validatedFn()).toThrow(ValidationError);
    expect(() => validatedFn(123)).toThrow(ValidationError);
    expect(validatedFn('hello')).toBe('HELLO');
  });

  test('should respect rate limits', async () => {
    const rateLimitedFn = rate_limit({
      requests: 2,
      window: '1s',
      strategy: 'reject'
    })(() => 'success');

    expect(await rateLimitedFn()).toBe('success');
    expect(await rateLimitedFn()).toBe('success');
    
    await expect(rateLimitedFn()).rejects.toThrow(RateLimitError);
  });
});
```

## 📈 Bundle Size & Performance

- **Main bundle:** ~32KB gzipped
- **Individual decorators:** ~2-4KB each
- **Zero dependencies**
- **Tree-shakeable:** Import only what you need
- **TypeScript:** Full type safety included
- **Universal:** Works in all JavaScript environments

## 🤝 Contributing

We welcome contributions! Please read our Contributing Guide for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Star History

Made with ❤️ for the JavaScript community.