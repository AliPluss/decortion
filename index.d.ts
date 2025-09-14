/**
 * Complete Universal Decorators Library - TypeScript Definitions
 * All 17 decorators with full TypeScript support
 * 
 * @version 5.0.0 - Complete Edition  
 */

// ===== CORE TYPES =====

export type CacheType = 'light' | 'balanced' | 'fast';
export type ProtectionLevel = 'loose' | 'normal' | 'strict';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type SearchAlgorithm = 'binary' | 'linear' | 'hash';

export interface CacheInfo {
  hits: number;
  misses: number;
  maxsize: number;
  currsize: number;
  ratio: number;
}

export interface LogOptions {
  level?: LogLevel;
  timing?: boolean;
  params?: boolean;
  result?: boolean;
}

export interface SearchOptions {
  algorithm?: SearchAlgorithm;
  indexKeys?: string[];
  cacheResults?: boolean;
}

export interface VarGuardOptions {
  immutable?: boolean;
  deepFreeze?: boolean;
  validateTypes?: boolean;
}

export interface InheritOptions {
  mergeResults?: boolean;
  callParentFirst?: boolean;
  inheritProperties?: boolean;
}

export interface ImmutableOptions {
  deep?: boolean;
  strict?: boolean;
  allowNew?: boolean;
}

export interface AsyncRetryOptions {
  attempts?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  retryOn?: Array<new (...args: any[]) => Error>;
}

// ===== NEW DECORATOR TYPES =====

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean;
  message?: string;
}

export interface ValidationOptions {
  params?: ValidationRule[];
  return?: ValidationRule;
  throwOnError?: boolean;
  logErrors?: boolean;
}

export type RateLimitWindow = '1s' | '1m' | '1h' | '1d';

export interface RateLimitOptions {
  requests: number;
  window: RateLimitWindow;
  per?: string | ((...args: any[]) => string);
  message?: string;
  strategy?: 'wait' | 'reject' | 'cache';
}

export type MetricType = 'counter' | 'gauge' | 'histogram';

export interface MetricsOptions {
  track?: string[];
  name?: string;
  labels?: Record<string, string>;
  type?: MetricType;
  buckets?: number[];
}

export interface MetricsCollector {
  increment(name: string, value?: number, labels?: Record<string, string>): void;
  gauge(name: string, value: number, labels?: Record<string, string>): void;
  histogram(name: string, value: number, labels?: Record<string, string>): void;
}

// ===== SUPER MATRIX OPTIONS =====

export interface SuperMatrixOptions {
  // 1. Cache options
  cache?: CacheType | { type: CacheType; maxsize?: number };
  
  // 2. Protection options
  protect?: ProtectionLevel;
  
  // 3. Logging options
  log?: boolean | LogOptions;
  
  // 4. Repeat options
  repeat?: number | { times: number; delay?: number };
  
  // 5. Loop optimization
  loop?: boolean;
  
  // 6. Search optimization
  search?: boolean | SearchOptions;
  
  // 7. Variable guard
  varGuard?: boolean | VarGuardOptions;
  
  // 8. Inheritance
  inherit?: Function | { parent: Function; options?: InheritOptions };
  
  // 9. Immutable
  immutable?: boolean | ImmutableOptions;
  
  // 10. Time limit
  timeLimit?: number;
  
  // 11. Debounce
  debounce?: number;
  
  // 12. Throttle
  throttle?: number;
  
  // 13. Async retry
  asyncRetry?: boolean | AsyncRetryOptions;
  
  // 14. Validation
  validate?: boolean | ValidationOptions;
  
  // 15. Rate limiting
  rateLimit?: boolean | RateLimitOptions;
  
  // 16. Metrics
  metrics?: boolean | MetricsOptions;
}

// ===== FUNCTION TYPES =====

export type AnyFunction = (...args: any[]) => any;
export type AsyncFunction = (...args: any[]) => Promise<any>;

export type CachedFunction<T extends AnyFunction> = T & {
  cache_info(): CacheInfo;
  cache_clear(): void;
  __wrapped__: T;
};

export type ProtectedFunction<T extends AnyFunction> = T;
export type LoggedFunction<T extends AnyFunction> = T;
export type ImmutableFunction<T extends AnyFunction> = T;

// ===== DECORATOR TYPES =====

export type MethodDecorator<T = any> = (
  target: any,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | any;

export type FunctionDecorator<T extends AnyFunction = AnyFunction> = (fn: T) => T;

export type UniversalDecorator<T extends AnyFunction = AnyFunction> = 
  | MethodDecorator<T>
  | FunctionDecorator<T>;

// ===== CORE CLASSES =====

export declare class UniversalLRU {
  constructor(maxSize?: number);
  
  get(key: string): any;
  set(key: string, value: any): void;
  info(): CacheInfo;
  clear(): void;
  
  readonly maxSize: number;
  readonly cache: Map<string, any>;
  hits: number;
  misses: number;
}

// ===== THE 17 MAIN DECORATORS =====

/**
 * 1. SUPER_CACHE - Fast/balanced/light cache
 */
export declare function super_cache<T extends AnyFunction>(
  type?: CacheType,
  maxsize?: number
): UniversalDecorator<CachedFunction<T>>;

/**
 * 2. PROTECT - Function protection (strict/normal/loose)
 */
export declare function protect<T extends AnyFunction>(
  level?: ProtectionLevel
): UniversalDecorator<ProtectedFunction<T>>;

/**
 * 3. LOG_EXECUTION - Log execution time and parameters
 */
export declare function logExecution<T extends AnyFunction>(
  options?: LogOptions
): UniversalDecorator<LoggedFunction<T>>;

/**
 * 4. REPEAT - Repeat function calls
 */
export declare function repeat<T extends AnyFunction>(
  times?: number,
  delay?: number
): UniversalDecorator<T>;

/**
 * 5. LOOP_OPTIMIZE - Optimize loops inside functions
 */
export declare function loop_optimize<T extends AnyFunction>(): UniversalDecorator<T>;

/**
 * 6. SEARCH_OPTIMIZE - Optimize search operations
 */
export declare function search_optimize<T extends AnyFunction>(
  options?: SearchOptions
): UniversalDecorator<T>;

/**
 * 7. VAR_GUARD - Variable protection
 */
export declare function var_guard<T extends AnyFunction>(
  options?: VarGuardOptions
): UniversalDecorator<T>;

/**
 * 8. INHERIT_FROM - Inherit function from another function
 */
export declare function inheritFrom<T extends AnyFunction>(
  parentFunction: AnyFunction,
  options?: InheritOptions
): UniversalDecorator<T>;

/**
 * 9. IMMUTABLE - Make objects immutable
 */
export declare function immutable<T extends AnyFunction>(
  options?: ImmutableOptions
): UniversalDecorator<ImmutableFunction<T>>;

/**
 * 10. TIME_LIMIT - Stop function if it exceeds time limit
 */
export declare function time_limit<T extends AnyFunction>(
  milliseconds?: number
): UniversalDecorator<T>;

/**
 * 11. DEBOUNCE - Prevent multiple calls within a period
 */
export declare function debounce<T extends AnyFunction>(
  delay?: number
): UniversalDecorator<T>;

/**
 * 12. THROTTLE - Limit number of calls
 */
export declare function throttle<T extends AnyFunction>(
  interval?: number
): UniversalDecorator<T>;

/**
 * 13. ASYNC_RETRY - Retry async functions on failure
 */
export declare function async_retry<T extends AsyncFunction>(
  options?: AsyncRetryOptions
): UniversalDecorator<T>;

/**
 * 14. VALIDATE - Validate function parameters and return values
 */
export declare function validate<T extends AnyFunction>(
  options: ValidationOptions
): UniversalDecorator<T>;

/**
 * 15. RATE_LIMIT - Control function call rate
 */
export declare function rate_limit<T extends AnyFunction>(
  options: RateLimitOptions
): UniversalDecorator<T>;

/**
 * 16. METRICS - Collect performance metrics
 */
export declare function metrics<T extends AnyFunction>(
  options?: MetricsOptions
): UniversalDecorator<T>;

/**
 * 17. SUPER_MATRIX - Combined decorator that applies multiple decorators
 */
export declare function super_matrix<T extends AnyFunction>(
  options?: SuperMatrixOptions
): UniversalDecorator<T>;

// ===== UTILITY FUNCTIONS =====

/**
 * Apply multiple decorators to a function
 */
export declare function decorate<T extends AnyFunction>(
  fn: T,
  ...decorators: UniversalDecorator[]
): T;

/**
 * Fast key generation for caching
 */
export declare function fastKey(args: any[]): string;

// ===== ENVIRONMENT DETECTION =====

export interface EnvironmentInfo {
  isNode: boolean;
  isBrowser: boolean;
  isReact: boolean;
  isVue: boolean;
  isWorker: boolean;
}

export declare const ENV: EnvironmentInfo;

// ===== LOGGER =====

export interface UniversalLogger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}

export declare const universalLog: UniversalLogger;

// ===== FRAMEWORK INTEGRATIONS =====

// React Integration
export interface ReactIntegration {
  /**
   * React hook for applying decorators
   */
  useDecorator<T extends AnyFunction>(
    fn: T,
    decorator: UniversalDecorator<T>,
    deps?: React.DependencyList
  ): T;

  /**
   * React hook for cached functions
   */
  useCachedFunction<T extends AnyFunction>(
    fn: T,
    cacheType?: CacheType,
    deps?: React.DependencyList
  ): CachedFunction<T>;

  /**
   * React hook for debounced functions
   */
  useDebouncedFunction<T extends AnyFunction>(
    fn: T,
    delay?: number,
    deps?: React.DependencyList
  ): T;

  /**
   * React hook for throttled functions
   */
  useThrottledFunction<T extends AnyFunction>(
    fn: T,
    interval?: number,
    deps?: React.DependencyList
  ): T;
}

// Vue Integration
export interface VueIntegration {
  /**
   * Vue mixin for decorator support
   */
  decoratorMixin: {
    methods: {
      $decorate<T extends AnyFunction>(
        method: T,
        decorators: UniversalDecorator[]
      ): T;
    };
  };
}

// Angular Integration
export interface AngularIntegration {
  /**
   * Angular service for decorator management
   */
  DecoratorService: {
    decorate<T extends AnyFunction>(
      method: T,
      decorators: UniversalDecorator[]
    ): T;
  };
}

// ===== MAIN EXPORT INTERFACE =====

export interface CompleteDecorators extends Partial<ReactIntegration> {
  // The 17 decorators
  super_cache: typeof super_cache;
  protect: typeof protect;
  logExecution: typeof logExecution;
  repeat: typeof repeat;
  loop_optimize: typeof loop_optimize;
  search_optimize: typeof search_optimize;
  var_guard: typeof var_guard;
  inheritFrom: typeof inheritFrom;
  immutable: typeof immutable;
  time_limit: typeof time_limit;
  debounce: typeof debounce;
  throttle: typeof throttle;
  async_retry: typeof async_retry;
  validate: typeof validate;
  rate_limit: typeof rate_limit;
  metrics: typeof metrics;
  super_matrix: typeof super_matrix;

  // Utility functions
  decorate: typeof decorate;

  // Core utilities
  UniversalLRU: typeof UniversalLRU;
  universalLog: UniversalLogger;
  fastKey: typeof fastKey;
  ENV: EnvironmentInfo;

  // Framework integrations (conditional)
  useDecorator?: ReactIntegration['useDecorator'];
  useCachedFunction?: ReactIntegration['useCachedFunction'];
  useDebouncedFunction?: ReactIntegration['useDebouncedFunction'];
  useThrottledFunction?: ReactIntegration['useThrottledFunction'];
}

declare const decorators: CompleteDecorators;
export default decorators;

// ===== ERROR TYPES =====

export class DecoratorError extends Error {
  constructor(
    message: string,
    public readonly decoratorName: string,
    public readonly originalError?: Error
  );
}

export class CacheError extends DecoratorError {
  constructor(message: string, originalError?: Error);
}

export class ProtectionError extends DecoratorError {
  constructor(message: string, originalError?: Error);
}

export class TimeoutError extends DecoratorError {
  constructor(message: string, timeLimit: number);
}

export class RetryError extends DecoratorError {
  constructor(message: string, attempts: number, originalError?: Error);
}

export class ValidationError extends DecoratorError {
  constructor(message: string, fieldName?: string, originalError?: Error);
}

export class RateLimitError extends DecoratorError {
  constructor(message: string, retryAfter?: number, originalError?: Error);
}

// ===== CONFIGURATION =====

export interface GlobalConfig {
  defaultCacheType: CacheType;
  defaultCacheSize: number;
  defaultProtectionLevel: ProtectionLevel;
  enablePerformanceMonitoring: boolean;
  enableDebugMode: boolean;
  logLevel: LogLevel;
  customLogger?: UniversalLogger;
  
  // Environment-specific settings
  browser?: {
    useWebWorkers: boolean;
    maxWorkers: number;
  };
  
  node?: {
    useWorkerThreads: boolean;
    maxThreads: number;
  };
  
  // Framework-specific settings
  react?: {
    enableHooks: boolean;
    enableDevtools: boolean;
  };
  
  vue?: {
    enableMixin: boolean;
    enableDevtools: boolean;
  };
  
  angular?: {
    enableService: boolean;
    enableDevtools: boolean;
  };
}

export declare function configure(config: Partial<GlobalConfig>): void;
export declare function getConfig(): GlobalConfig;
export declare function resetConfig(): void;

// ===== PERFORMANCE MONITORING =====

export interface PerformanceMetrics {
  functionName: string;
  decoratorName: string;
  callCount: number;
  totalTime: number;
  averageTime: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  retryCount: number;
  lastCalled: Date;
}

export interface PerformanceMonitor {
  getMetrics(functionName?: string): PerformanceMetrics | PerformanceMetrics[];
  clearMetrics(functionName?: string): void;
  exportMetrics(): string;
  startProfiling(): void;
  stopProfiling(): PerformanceMetrics[];
  
  // New methods for 17 decorators
  getCacheMetrics(): CacheInfo[];
  getRetryStatistics(): { functionName: string; attempts: number; successRate: number }[];
  getPerformanceInsights(): {
    slowestFunctions: PerformanceMetrics[];
    mostCachedFunctions: PerformanceMetrics[];
    mostRetriedFunctions: PerformanceMetrics[];
  };
}

export declare const performanceMonitor: PerformanceMonitor;

// ===== TESTING UTILITIES =====

export interface DecoratorTestUtils {
  /**
   * Mock any of the 17 decorators for testing
   */
  mockDecorator<T extends AnyFunction>(
    decoratorName: keyof CompleteDecorators,
    implementation?: (fn: T) => T
  ): UniversalDecorator<T>;
  
  /**
   * Spy on decorator calls
   */
  spyOnDecorator<T extends AnyFunction>(
    decorator: UniversalDecorator<T>
  ): jest.SpyInstance;
  
  /**
   * Reset all caches and states
   */
  resetAll(): void;
  
  /**
   * Get comprehensive statistics
   */
  getAllStats(): {
    caches: CacheInfo[];
    performance: PerformanceMetrics[];
    errors: Error[];
  };
  
  /**
   * Simulate decorator scenarios
   */
  simulateScenario(scenario: 'high-load' | 'network-errors' | 'cache-overflow'): void;
}

export declare const testUtils: DecoratorTestUtils;

// ===== MODULE DECLARATIONS =====

declare module 'universal-decorators-complete' {
  export * from './index';
  export { default } from './index';
}

declare module 'universal-decorators-complete/react' {
  export * from './index';
  export const useDecorator: ReactIntegration['useDecorator'];
  export const useCachedFunction: ReactIntegration['useCachedFunction'];
  export const useDebouncedFunction: ReactIntegration['useDebouncedFunction'];
  export const useThrottledFunction: ReactIntegration['useThrottledFunction'];
}

declare module 'universal-decorators-complete/vue' {
  export * from './index';
  export const decoratorMixin: VueIntegration['decoratorMixin'];
}

declare module 'universal-decorators-complete/angular' {
  export * from './index';
  export const DecoratorService: AngularIntegration['DecoratorService'];
}

// ===== GLOBAL AUGMENTATION =====

declare global {
  interface Window {
    decorators?: CompleteDecorators;
    universalDecorators?: CompleteDecorators;
  }

  interface WorkerGlobalScope {
    decorators?: CompleteDecorators;
  }

  namespace NodeJS {
    interface Global {
      decorators?: CompleteDecorators;
    }
  }
}