# @staabler/core

A comprehensive collection of shared utilities, data structures, and foundational components. This package provides essential building blocks used across various modules.

## Features

### 🚀 **Concurrency & Execution**
- **Executor** - Task execution with controlled concurrency and error handling
- **ExecutorStrand** - Strand-based execution for isolated task contexts
- **ExecutorWorkGuard** - Work guard for managing execution lifecycle
- **Strand** - Lightweight execution strand implementation

### 📊 **Data Structures**
- **Queue** - Efficient FIFO queue implementation
- **OrderedArray** - Array with automatic ordering capabilities
- **LRUMap** - Least Recently Used cache implementation
- **DefaultMap** - Map with default value factory
- **PersistentMap** - Persistent map with change tracking
- **SparseMap** - Memory-efficient sparse map
- **BiMap** - Bidirectional map implementation
- **MultiIndex** - Multi-dimensional indexing structure
- **RadixTree** - Radix tree for efficient string operations

### 🛠️ **Utility Functions**

#### Type Checking
- `isNullish` - Check for null/undefined values
- `isTruthy` - Check if value is truthy
- `isThuthyString` - Check if string is truthy
- `isThenable` - Check if value is promise-like
- `isObjectLiteral` - Check if value is a plain object
- `isArrayBuffer` - Check if value is ArrayBuffer
- `isWeakable` - Check if value can be used as WeakMap key
- `isEmpty` - Check if value is empty
- `isEqual` - Deep equality comparison

#### String Utilities
- `capitalize` - Capitalize first letter
- `toCamelCase` - Convert to camelCase
- `toPascalCase` - Convert to PascalCase
- `tokenize` - String tokenization
- `levenshtein` - Levenshtein distance calculation
- `interpolate` - String interpolation

#### Object Utilities
- `getIn` - Safe nested property access
- `setIn` - Safe nested property assignment
- `compare` - Generic comparison function
- `sortBy` - Sort array by property
- `shuffle` - Array shuffling
- `flyweight` - Flyweight pattern implementation

#### Functional Utilities
- `memoize` - Function memoization
- `autobind` - Automatic method binding
- `noop` - No-operation function
- `forward` - Function forwarding
- `tryCatch` - Try-catch wrapper

### ⏱️ **Timing & Scheduling**
- **Timer** - Simple timer implementation
- **DeadlineTimer** - Timer with deadline support
- `sleep` - Promise-based sleep function
- `withDelay` - Function execution with delay
- `withDebounce` - Debounced function execution
- `withRateLimit` - Rate-limited function execution
- `withCallOnce` - Function that can only be called once

### 🔄 **Async & Promises**
- `createResolvablePromise` - Create manually resolvable promises
- `createAsyncIterator` - Create async iterators
- `createSignal` - Signal/event emitter creation
- `createUnsubscribe` - Unsubscribe function factory
- `createReducer` - Reducer pattern implementation
- `createRefFactory` - Reference factory
- `createSearchQuery` - Search query builder
- `promisify` - Convert callback-based functions to promises
- `assertAllFulfilled` - Assert all promises are fulfilled

### 🧠 **Memory Management**
- **Allocator** - Memory allocation management
- **ObjectPool** - Object pooling for performance
- `getObjectPool` - Get object pool instance
- `withCache` - Caching wrapper
- `withBenchmark` - Performance benchmarking wrapper
- `withParallelLimit` - Parallel execution with concurrency limit

### 📝 **Logging & Debugging**
- **Logger** - Logging utility
- `debug` - Debug utility functions
- `assert` - Assertion utilities
- `throw` - Error throwing utilities

### 🔧 **System Utilities**
- `hash` - Hashing functions
- `getUint8Array` - Get Uint8Array from various sources
- `parseInteger` - Integer parsing
- `parseVersion` - Version string parsing
- `getPackageName` - Package name extraction
- `toISOString` - ISO string conversion

### 🎯 **Event System**
- **EventEmitter** - Event emitter implementation
- `addEventListener` - Event listener management

### 📦 **Module System**
- **Module** - Module loading and management
- **Enum** - Enumeration implementation
- **Callable** - Callable object wrapper

## Performance

This package is optimized for:
- **Memory efficiency** - Minimal garbage collection pressure
- **CPU performance** - Optimized algorithms and data structures
- **Concurrency** - Efficient task execution and resource management