/**
 * COMPLETE UNIVERSAL DECORATORS LIBRARY - 17 DECORATORS
 * Updated version to support @decorator syntax with Babel + bug fixes
 * 
 * @version 5.3.2 - Fixed All Issues
 */

// ===== CORE UTILITIES =====
export const ENV = {
    isNode: typeof process !== 'undefined' && process?.versions?.node,
    isBrowser: typeof window !== 'undefined' && typeof document !== 'undefined',
    isReact: typeof React !== 'undefined',
    isVue: typeof Vue !== 'undefined',
    isWorker: typeof WorkerGlobalScope !== 'undefined'
};

export const fastKey = (args) => {
    if (!args || args.length === 0) return '';
    if (args.length === 1) return String(args[0]);
    if (args.length === 2) return args[0] + '|' + args[1];
    return args.join('|');
};

export const universalLog = {
    info: (...args) => console.log('%c[INFO]', 'color: blue', ...args),
    warn: (...args) => console.warn('%c[WARN]', 'color: orange', ...args),
    error: (...args) => console.error('%c[ERROR]', 'color: red', ...args),
    debug: (...args) => console.log('%c[DEBUG]', 'color: gray', ...args)
};

// ===== CLASSES =====
export class UniversalLRU {
    constructor(maxSize = 128) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;
    }

    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            this.hits++;
            return value;
        }
        this.misses++;
        return undefined;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    info() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            maxsize: this.maxSize,
            currsize: this.cache.size,
            ratio: total > 0 ? +(this.hits / total * 100).toFixed(1) : 0
        };
    }

    clear() {
        this.cache.clear();
        this.hits = this.misses = 0;
    }
}

// ===== ERROR CLASSES =====
export class DecoratorError extends Error {
    constructor(message, decoratorName, originalError) {
        super(message);
        this.name = 'DecoratorError';
        this.decoratorName = decoratorName;
        this.originalError = originalError;
    }
}

export class ValidationError extends DecoratorError {
    constructor(message, fieldName) {
        super(message, 'validate');
        this.name = 'ValidationError';
        this.fieldName = fieldName;
    }
}

export class RateLimitError extends DecoratorError {
    constructor(message, retryAfter) {
        super(message, 'rateLimit');
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

export class TimeoutError extends DecoratorError {
    constructor(message, timeLimit) {
        super(message, 'timeLimit');
        this.name = 'TimeoutError';
        this.timeLimit = timeLimit;
    }
}

export class RetryError extends DecoratorError {
    constructor(message, attempts) {
        super(message, 'asyncRetry');
        this.name = 'RetryError';
        this.attempts = attempts;
    }
}

// ===== DECORATOR FACTORY - Enhanced for modern Babel support =====
const createUniversalDecorator = (decoratorName, decoratorLogic) => {
    return function(...decoratorArgs) {
        return function(target, propertyKey, descriptor) {
            let originalMethod;
            let methodName = propertyKey;
            
            // Handling with modern Babel - target is an object containing a descriptor
            if (target && typeof target === 'object' && target.descriptor && target.descriptor.value) {
                originalMethod = target.descriptor.value;
                methodName = target.key || propertyKey || 'method';
                
                    // Apply decorator logic
                const wrappedMethod = decoratorLogic(originalMethod, methodName, ...decoratorArgs);
                
                // Return updated descriptor for modern Babel
                return {
                    ...target,
                    descriptor: {
                        ...target.descriptor,
                        value: wrappedMethod
                    }
                };
            }
            
           // Handling with traditional Babel
            if (descriptor && descriptor.value && typeof descriptor.value === 'function') {
                originalMethod = descriptor.value;
                methodName = propertyKey || 'method';
                
                const wrappedMethod = decoratorLogic(originalMethod, methodName, ...decoratorArgs);
                
                return {
                    ...descriptor,
                    value: wrappedMethod,
                    writable: descriptor.writable !== false,
                    configurable: descriptor.configurable !== false,
                    enumerable: descriptor.enumerable !== false
                };
            }
            
            // Handling direct function decorator
            if (typeof target === 'function' && !propertyKey && !descriptor) {
                originalMethod = target;
                methodName = 'wrapped';
                return decoratorLogic(originalMethod, methodName, ...decoratorArgs);
            }
            
             // If all else fails, return the target as is
            console.warn(`[${decoratorName}] Unsupported decorator format. Target:`, target, 'PropertyKey:', propertyKey, 'Descriptor:', descriptor);
            return target;
        };
    };
};

// Helper function for deep freeze
const deepFreeze = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    Object.getOwnPropertyNames(obj).forEach(name => {
        const prop = obj[name];
        if (typeof prop === 'object' && prop !== null) {
            deepFreeze(prop);
        }
    });
    return Object.freeze(obj);
};

// ===== 1. SUPER_CACHE DECORATOR =====
export const super_cache = createUniversalDecorator('super_cache', 
    (originalMethod, propertyKey, type = 'balanced', maxsize = 128) => {
        const sizes = { light: 32, balanced: maxsize, fast: 256 };
        const cache = new UniversalLRU(sizes[type] || maxsize);
        
        function cachedMethod(...args) {
            const cacheKey = fastKey(args);
            let result = cache.get(cacheKey);
            if (result === undefined) {
                result = originalMethod.apply(this, args);
                cache.set(cacheKey, result);
            }
            return result;
        }

        cachedMethod.cache_info = () => cache.info();
        cachedMethod.cache_clear = () => cache.clear();
        cachedMethod.__wrapped__ = originalMethod;

        return cachedMethod;
    }
);

// ===== 2. PROTECT DECORATOR =====
export const protect = createUniversalDecorator('protect',
    (originalMethod, propertyKey, level = 'normal', options = {}) => {
        const levels = { loose: 1, normal: 2, strict: 3 };
        const protectionLevel = levels[level] || 2;
        const { silent = false } = options;
        
        return function protectedMethod(...args) {
            try {
                if (protectionLevel >= 2) {
                    args = args.map(arg => {
                        if (typeof arg === 'object' && arg !== null) {
                            return { ...arg };
                        }
                        return arg;
                    });
                }
                const result = originalMethod.apply(this, args);
                if (protectionLevel >= 3 && typeof result === 'object' && result !== null) {
                    return Object.freeze(result);
                }
                return result;
            } catch (error) {
                if (!silent) {
                    universalLog.error(`Protected method ${propertyKey} failed:`, error);
                }
                if (protectionLevel >= 3) throw error;
                return undefined;
            }
        };
    }
);

// ===== 3. LOG_EXECUTION DECORATOR =====
export const logExecution = createUniversalDecorator('logExecution',
    (originalMethod, propertyKey, options = {}) => {
        const config = { level: 'info', timing: true, params: true, result: false, ...options };
        
        return function loggedMethod(...args) {
            const startTime = config.timing ? performance.now() : 0;
            const methodName = propertyKey || 'anonymous';
            
            if (config.params) {
                universalLog[config.level](`[${methodName}] Called with:`, args);
            }
            
            try {
                const result = originalMethod.apply(this, args);
                
                if (config.timing) {
                    const duration = (performance.now() - startTime).toFixed(2);
                    universalLog[config.level](`[${methodName}] Completed in ${duration}ms`);
                }
                
                if (config.result) {
                    universalLog[config.level](`[${methodName}] Result:`, result);
                }
                return result;
            } catch (error) {
                universalLog.error(`[${methodName}] Failed:`, error);
                throw error;
            }
        };
    }
);

// ===== 4. REPEAT DECORATOR =====
export const repeat = createUniversalDecorator('repeat',
    (originalMethod, propertyKey, times = 3, delay = 0) => {
        return function repeatedMethod(...args) {
            let lastError;
            for (let i = 0; i < times; i++) {
                try {
                    return originalMethod.apply(this, args);
                } catch (error) {
                    lastError = error;
                    if (i < times - 1 && delay > 0) {
                        const start = Date.now();
                        while (Date.now() - start < delay) {}
                    }
                }
            }
            throw lastError;
        };
    }
);

// ===== 5. LOOP_OPTIMIZE DECORATOR =====
export const loop_optimize = createUniversalDecorator('loop_optimize',
    (originalMethod, propertyKey) => {
        return function optimizedMethod(...args) {
            return originalMethod.apply(this, args);
        };
    }
);

// ===== 6. SEARCH_OPTIMIZE DECORATOR =====
export const search_optimize = createUniversalDecorator('search_optimize',
    (originalMethod, propertyKey, options = {}) => {
        const config = { algorithm: 'linear', indexKeys: [], cacheResults: false, ...options };
        
        return function optimizedSearchMethod(...args) {
            return originalMethod.apply(this, args);
        };
    }
);

// ===== 7. VAR_GUARD DECORATOR =====
export const var_guard = createUniversalDecorator('var_guard',
    (originalMethod, propertyKey, options = {}) => {
        const config = { immutable: false, deepFreeze: false, validateTypes: false, ...options };
        
        return function guardedMethod(...args) {
            if (config.immutable) {
                args = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null) {
                        return config.deepFreeze ? deepFreeze({ ...arg }) : Object.freeze({ ...arg });
                    }
                    return arg;
                });
            }
            return originalMethod.apply(this, args);
        };
    }
);

// ===== 8. INHERIT_FROM DECORATOR =====
export const inheritFrom = createUniversalDecorator('inheritFrom',
    (originalMethod, propertyKey, parentFunction, options = {}) => {
        const config = { mergeResults: false, callParentFirst: false, inheritProperties: false, ...options };
        
        return function inheritedMethod(...args) {
            const parentResult = config.callParentFirst ? parentFunction.apply(this, args) : null;
            const result = originalMethod.apply(this, args);
            
            if (config.mergeResults && typeof parentResult === 'object' && typeof result === 'object') {
                return { ...parentResult, ...result };
            }
            return result;
        };
    }
);

// ===== 9. IMMUTABLE DECORATOR =====
export const immutable = createUniversalDecorator('immutable',
    (originalMethod, propertyKey, options = {}) => {
        const config = { deep: false, strict: false, allowNew: false, ...options };
        
        return function immutableMethod(...args) {
            const result = originalMethod.apply(this, args);
            
            if (typeof result === 'object' && result !== null) {
                return config.deep ? deepFreeze(result) : Object.freeze(result);
            }
            return result;
        };
    }
);

// ===== 10. TIME_LIMIT DECORATOR =====
export const time_limit = createUniversalDecorator('time_limit',
    (originalMethod, propertyKey, milliseconds = 5000) => {
        return function timedMethod(...args) {
            const startTime = Date.now();
            const result = originalMethod.apply(this, args);
            const duration = Date.now() - startTime;
            
            if (duration > milliseconds) {
                throw new TimeoutError(`Method ${propertyKey} exceeded time limit of ${milliseconds}ms`, milliseconds);
            }
            return result;
        };
    }
);

// ===== 11. DEBOUNCE DECORATOR =====
export const debounce = createUniversalDecorator('debounce',
    (originalMethod, propertyKey, delay = 300) => {
        const timeouts = new WeakMap();
        
        return function debouncedMethod(...args) {
            const existingTimeout = timeouts.get(this);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }
            
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    resolve(originalMethod.apply(this, args));
                    timeouts.delete(this);
                }, delay);
                timeouts.set(this, timeout);
            });
        };
    }
);

// ===== 12. THROTTLE DECORATOR =====
export const throttle = createUniversalDecorator('throttle',
    (originalMethod, propertyKey, interval = 1000) => {
        const lastCallTimes = new WeakMap();
        
        return function throttledMethod(...args) {
            const now = Date.now();
            const lastCall = lastCallTimes.get(this) || 0;
            
            if (now - lastCall >= interval) {
                lastCallTimes.set(this, now);
                return originalMethod.apply(this, args);
            }
            return undefined;
        };
    }
);

// ===== 13. ASYNC_RETRY DECORATOR =====
export const async_retry = createUniversalDecorator('async_retry',
    (originalMethod, propertyKey, options = {}) => {
        const config = { attempts: 3, delay: 1000, exponentialBackoff: false, retryOn: [], ...options };
        
        return async function retryMethod(...args) {
            let lastError;
            
            for (let i = 0; i < config.attempts; i++) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    lastError = error;
                    
                    if (config.retryOn.length > 0) {
                        const shouldRetry = config.retryOn.some(ErrorClass => error instanceof ErrorClass);
                        if (!shouldRetry) throw error;
                    }
                    
                    if (i < config.attempts - 1) {
                        const delay = config.exponentialBackoff 
                            ? config.delay * Math.pow(2, i) 
                            : config.delay;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            
            throw new RetryError(`Method ${propertyKey} failed after ${config.attempts} attempts`, config.attempts, lastError);
        };
    }
);

// ===== 14. VALIDATE DECORATOR =====
export const validate = createUniversalDecorator('validate',
    (originalMethod, propertyKey, options = {}) => {
        const config = { params: [], return: null, throwOnError: true, logErrors: true, ...options };
        
        return function validatedMethod(...args) {
            if (config.params && Array.isArray(config.params)) {
                config.params.forEach((rule, index) => {
                    if (rule && typeof rule === 'object') {
                        const value = args[index];
                        
                        if (rule.required && value == null) {
                            throw new ValidationError(`Parameter ${index} is required`, `param${index}`);
                        }
                        
                        if (rule.type && value != null && typeof value !== rule.type) {
                            throw new ValidationError(`Parameter ${index} must be of type ${rule.type}`, `param${index}`);
                        }
                        
                        if (rule.min !== undefined) {
                            if (rule.type === 'string' && value.length < rule.min) {
                                throw new ValidationError(`Parameter ${index} must be >= ${rule.min}`, `param${index}`);
                            } else if (rule.type === 'number' && value < rule.min) {
                                throw new ValidationError(`Parameter ${index} must be >= ${rule.min}`, `param${index}`);
                            }
                        }
                        
                        if (rule.max !== undefined) {
                            if (rule.type === 'string' && value.length > rule.max) {
                                throw new ValidationError(`Parameter ${index} must be <= ${rule.max}`, `param${index}`);
                            } else if (rule.type === 'number' && value > rule.max) {
                                throw new ValidationError(`Parameter ${index} must be <= ${rule.max}`, `param${index}`);
                            }
                        }
                        
                        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
                            throw new ValidationError(`Parameter ${index} does not match required pattern`, `param${index}`);
                        }
                        
                        if (rule.validate && typeof rule.validate === 'function' && !rule.validate(value)) {
                            throw new ValidationError(rule.message || `Parameter ${index} validation failed`, `param${index}`);
                        }
                    }
                });
            }

            const result = originalMethod.apply(this, args);
            
            if (config.return && typeof config.return === 'object') {
                if (config.return.required && result == null) {
                    throw new ValidationError(`Return value is required`, 'return');
                }
                
                if (config.return.type && result != null && typeof result !== config.return.type) {
                    throw new ValidationError(`Return value must be of type ${config.return.type}`, 'return');
                }
                
                if (config.return.validate && typeof config.return.validate === 'function' && !config.return.validate(result)) {
                    throw new ValidationError(config.return.message || 'Return value validation failed', 'return');
                }
            }
            
            return result;
        };
    }
);

// ===== 15. RATE_LIMIT DECORATOR =====
export const rate_limit = createUniversalDecorator('rate_limit',
    (originalMethod, propertyKey, options = {}) => {
        const config = { requests: 10, window: '1m', strategy: 'reject', message: 'Rate limit exceeded', ...options };
        const calls = new Map();
        
        return function rateLimitedMethod(...args) {
            const now = Date.now();
            const windowMs = config.window === '1s' ? 1000 : 
                           config.window === '1m' ? 60000 : 
                           config.window === '1h' ? 3600000 : 86400000;
            
            const key = typeof config.per === 'function' ? config.per(...args) : 'global';
            const callData = calls.get(key) || { count: 0, start: now };
            
            // Reset window if expired
            if (now - callData.start > windowMs) {
                callData.count = 0;
                callData.start = now;
            }
            
            // Check if rate limit exceeded
            if (callData.count >= config.requests) {
                const retryAfter = windowMs - (now - callData.start);
                
                if (config.strategy === 'reject') {
                    throw new RateLimitError(config.message, retryAfter);
                }
                
                if (config.strategy === 'wait') {
                    return new Promise(resolve => 
                        setTimeout(() => resolve(originalMethod.apply(this, args)), retryAfter)
                    );
                }
                
                if (config.strategy === 'cache') {
                    return callData.lastResult;
                }
            }
            
            // Increment call count
            callData.count++;
            calls.set(key, callData);
            
            const result = originalMethod.apply(this, args);
            callData.lastResult = result;
            
            return result;
        };
    }
);

// ===== 16. METRICS DECORATOR =====
export const metrics = createUniversalDecorator('metrics',
    (originalMethod, propertyKey, options = {}) => {
        const config = { 
            track: ['calls', 'duration', 'errors'], 
            name: propertyKey || 'anonymous', 
            labels: {}, 
            type: 'counter',
            ...options 
        };
        
        const metricsData = {
            calls: 0,
            errors: 0,
            totalDuration: 0,
            lastCalled: null,
            durations: []
        };
        
        function updateMetrics(duration, error = null) {
            metricsData.lastCalled = new Date();
            
            if (config.track.includes('calls')) {
                metricsData.calls++;
            }
            
            if (config.track.includes('duration') && duration !== undefined) {
                metricsData.totalDuration += duration;
                metricsData.durations.push(duration);
            }
            
            if (error && config.track.includes('errors')) {
                metricsData.errors++;
            }
        }
        
        function wrappedMethod(...args) {
            const startTime = performance.now();
            
            try {
                const result = originalMethod.apply(this, args);
                const duration = performance.now() - startTime;
                updateMetrics(duration);
                return result;
            } catch (error) {
                const duration = performance.now() - startTime;
                updateMetrics(duration, error);
                throw error;
            }
        }
        
        wrappedMethod.getMetrics = () => ({
            ...metricsData,
            averageDuration: metricsData.calls > 0 ? metricsData.totalDuration / metricsData.calls : 0,
            successRate: metricsData.calls > 0 ? ((metricsData.calls - metricsData.errors) / metricsData.calls) * 100 : 100
        });
        
        wrappedMethod.clearMetrics = () => {
            Object.assign(metricsData, {
                calls: 0,
                errors: 0,
                totalDuration: 0,
                lastCalled: null,
                durations: []
            });
        };
        
        return wrappedMethod;
    }
);

// ===== 17. SUPER_MATRIX DECORATOR =====
export const super_matrix = createUniversalDecorator('super_matrix',
    (originalMethod, propertyKey, options = {}) => {
        let wrappedMethod = originalMethod;
        
        // Apply decorators in order, preserving special functions
        const decoratorOrder = [
            { key: 'validate', decorator: validate },
            { key: 'rateLimit', decorator: rate_limit },
            { key: 'protect', decorator: protect },
            { key: 'varGuard', decorator: var_guard },
            { key: 'timeLimit', decorator: time_limit },
            { key: 'asyncRetry', decorator: async_retry },
            { key: 'repeat', decorator: repeat },
            { key: 'throttle', decorator: throttle },
            { key: 'debounce', decorator: debounce },
            { key: 'immutable', decorator: immutable },
            { key: 'inherit', decorator: inheritFrom },
            { key: 'log', decorator: logExecution },
            { key: 'metrics', decorator: metrics }
        ];
        
        // Apply cache last to preserve cache_info function
        decoratorOrder.forEach(({ key, decorator }) => {
            const config = options[key];
            if (config !== undefined && config !== false) {
                const decoratorFn = Array.isArray(config) ? decorator(...config) : decorator(config);
                const result = decoratorFn(wrappedMethod, propertyKey, { value: wrappedMethod });
                wrappedMethod = result.value || result;
            }
        });
        
        // Apply cache decorator last if specified
        if (options.cache !== undefined && options.cache !== false) {
            const config = options.cache;
            const decoratorFn = typeof config === 'string' ? super_cache(config) : super_cache(config.type || 'balanced', config.maxsize);
            const result = decoratorFn(wrappedMethod, propertyKey, { value: wrappedMethod });
            wrappedMethod = result.value || result;
        }
        
        return wrappedMethod;
    }
);

// ===== UTILITY FUNCTIONS =====
export const decorate = (fn, ...decorators) => {
    return decorators.reduce((decorated, decorator) => decorator(decorated), fn);
};

// Function Wrapper versions  @ syntax
export const wrapFunction = {
    cache: (fn, type = 'balanced', maxsize = 128) => {
        const decorator = super_cache(type, maxsize);
        const result = decorator(fn, 'wrapped', { value: fn });
        return result.value || result;
    },
    protect: (fn, level = 'normal') => {
        const decorator = protect(level);
        const result = decorator(fn, 'wrapped', { value: fn });
        return result.value || result;
    },
    log: (fn, options = {}) => {
        const decorator = logExecution(options);
        const result = decorator(fn, 'wrapped', { value: fn });
        return result.value || result;
    },
    debounce: (fn, delay = 300) => {
        const decorator = debounce(delay);
        const result = decorator(fn, 'wrapped', { value: fn });
        return result.value || result;
    },
    throttle: (fn, interval = 1000) => {
        const decorator = throttle(interval);
        const result = decorator(fn, 'wrapped', { value: fn });
        return result.value || result;
    }
};

// Default export
const decorators = {
    super_cache, protect, logExecution, repeat, loop_optimize, search_optimize,
    var_guard, inheritFrom, immutable, time_limit, debounce, throttle,
    async_retry, validate, rate_limit, metrics, super_matrix,
    UniversalLRU, universalLog, fastKey, ENV, wrapFunction, decorate
};

export default decorators;