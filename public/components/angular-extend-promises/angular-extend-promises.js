/*!
 * angular-extend-promises v1.0.0-rc.2 - 2014-12-12
 * (c) 2014 L.systems SARL, Etienne Folio, Quentin Raynaud
 * https://bitbucket.org/lsystems/angular-extend-promises
 * License: MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["angular-extend-promises"] = factory();
	else
		root["angular-extend-promises"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	angular.module('angular-extend-promises', [])
	
	  .provider('angularExtendPromises', function() {
	    this.options = {
	      compatibilityAliases: true,
	      disableES5Methods: false
	    };
	
	    this.$get = function() {
	      return this.options;
	    };
	  })
	
	  .config(['$provide', function($provide) {
	    // In test mode, empty the cache before doing anything else
	    if (angular.mock) {
	      for (var key in __webpack_require__.c) {
	        delete __webpack_require__.c[key];
	      }
	    }
	
	    $provide.decorator('$q', ['$delegate', 'angularExtendPromises', function($delegate, angularExtendPromises) {
	      var globals = __webpack_require__(1);
	
	      globals.$delegate = $delegate;
	      globals.$options = angularExtendPromises;
	
	      return __webpack_require__(2);
	    }]);
	  }])
	
	;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	
	_.extend(module.exports, {
	  $defer: _.noop(),
	  $delegate: {},
	  $options: {}
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var globals = __webpack_require__(1);
	var errors = __webpack_require__(4);
	
	var newq = module.exports = function(resolver) {
	  if (!_.isFunction(resolver))
	    throw new Error('resolver should be a function');
	
	  var deferred = newq.defer();
	  try {
	    resolver(deferred.resolve, deferred.reject);
	  }
	  catch (e) {
	    deferred.reject(e);
	  }
	  return deferred.promise;
	};
	
	_.extend(newq, {
	  // Methods & aliases
	  all: __webpack_require__(5),
	  any: __webpack_require__(6),
	  bind: __webpack_require__(7),
	  defer: __webpack_require__(8),
	  each: __webpack_require__(9),
	  filter: __webpack_require__(10),
	  map: __webpack_require__(11),
	  join: __webpack_require__(12),
	  method: __webpack_require__(13),
	  props: __webpack_require__(14),
	  reduce: __webpack_require__(15),
	  reject: __webpack_require__(16),
	  resolve: __webpack_require__(17),
	  some: __webpack_require__(18),
	  when: __webpack_require__(19),
	
	  // Errors
	  AggregateError: errors.AggregateError,
	  TimeoutError: errors.TimeoutError
	});
	
	if (globals.$options.compatibilityAliases) {
	  _.extend(newq, {
	    attempt: __webpack_require__(20)
	  });
	}
	
	if (!globals.$options.disableES5Methods) {
	  _.extend(newq, {
	    'try': __webpack_require__(20)
	  });
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/* global _ */
	
	try {
	  module.exports = __webpack_require__(21);
	}
	catch (e) {
	  module.exports = _;
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var NewQError = module.exports.NewQError = function NewQError(message) {
	  this.name = this.constructor.name;
	  Error.apply(this, arguments);
	  this.message = message;
	  if (Error.captureStackTrace)
	    Error.captureStackTrace(this, this.constructor);
	  else
	    this.stack = (new Error()).stack;
	};
	
	NewQError.prototype.toString = function() {
	    return this.stack.toString();
	};
	
	NewQError.subError = function subError(SubError, Parent) {
	  Parent = Parent || NewQError;
	
	  function F() {}
	  F.prototype = Parent.prototype;
	  SubError.prototype = new F();
	  SubError.prototype.constructor = SubError;
	
	  if (SubError.subError)
	    return;
	
	  SubError.subError = function subError(SubSubError) {
	    NewQError.subError(SubSubError, SubError);
	  };
	};
	
	NewQError.subError(NewQError, Error);
	
	var AggregateError = module.exports.AggregateError = function AggregateError() {
	  NewQError.apply(this, arguments);
	};
	NewQError.subError(AggregateError);
	
	var TimeoutError = module.exports.TimeoutError = function TimeoutError() {
	  NewQError.apply(this, arguments);
	};
	NewQError.subError(TimeoutError);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var decorate = __webpack_require__(24);
	var globals = __webpack_require__(1);
	var newq = __webpack_require__(2);
	
	module.exports = function(promises) {
	  if (!_.isArray(promises))
	    return newq.props(promises);
	
	  promises = _.map(promises, function(promise) {
	    return newq.when(promise);
	  });
	
	  return decorate(globals.$delegate.all(promises));
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var newq = __webpack_require__(2);
	
	module.exports = function(array) {
	  return newq.some(array, 1).get(0);
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var newq = __webpack_require__(2);
	
	module.exports = function(oThis) {
	  return newq.resolve().bind(oThis);
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var decorate = __webpack_require__(24);
	var globals = __webpack_require__(1);
	
	globals.$defer = function $defer(parent) {
	  var deferred = globals.$delegate.defer();
	  deferred.promise = decorate(deferred.promise, parent);
	  return deferred;
	};
	
	module.exports = function defer() {
	  return globals.$defer();
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var walkCollection = __webpack_require__(22);
	
	module.exports = walkCollection('tap');


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var newq = __webpack_require__(2);
	
	module.exports = function(array, cb, options) {
	  return newq.map(array, function(val) {
	    return newq.props({
	      val: val,
	      toFilter: cb.apply(null, arguments)
	    });
	  }, options)
	    .then(function(array) {
	      return _.map(_.filter(array, 'toFilter'), 'val');
	    })
	  ;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var walkCollection = __webpack_require__(22);
	
	module.exports = walkCollection('then');


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var newq = __webpack_require__(2);
	
	module.exports = function join() {
	  var args = _.toArray(arguments);
	  var cb = args.pop();
	  return newq.all(args).spread(cb);
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var attempt = __webpack_require__(20);
	
	module.exports = function(fn) {
	  return function() {
	    return attempt(fn, arguments, this);
	  };
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var newq = __webpack_require__(2);
	
	module.exports = function(obj) {
	  return newq.all(_.values(obj)).then(function(vals) {
	    return _.object(_.keys(obj), vals);
	  });
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var newq = __webpack_require__(2);
	
	module.exports = function(array, cb, initialValue) {
	  return _.reduce(array, function(acc, val, i) {
	    return newq.join(acc, val, function(acc, val) {
	      return cb(acc, val, i, array.length);
	    });
	  }, newq.resolve(initialValue));
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var autoDecorate = __webpack_require__(23);
	
	module.exports = autoDecorate('reject');


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var newq = __webpack_require__(2);
	var autoDecorate = __webpack_require__(23);
	
	// depending Angular's version, $q.resolve might not exist
	module.exports = autoDecorate('resolve') || function(val) {
	  var def = newq.defer();
	  def.resolve(val);
	  return def.promise;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var newq = __webpack_require__(2);
	var AggregateError = __webpack_require__(4).AggregateError;
	
	module.exports = function(array, count) {
	  if (array.length < count) {
	    return newq.reject(new AggregateError(
	      'initial array length (' + array.length + ') > count (' + count + ')'
	    ));
	  }
	
	  var rejectedCount = 0;
	  var res = [];
	  var def = newq.defer();
	
	  _.each(array, function(elt) {
	    newq.when(elt)
	      .tap(function(val) {
	        if (res === null)
	          return;
	
	        res.push(val);
	
	        // resolve when we have enough fulfilled elements
	        if (res.length >= count) {
	          def.resolve(res);
	          res = null;
	        }
	      })
	      .$$catch(function() {
	        if (res === null)
	          return;
	
	        ++rejectedCount;
	
	        // reject if objective cannot be fulfilled
	        if (array.length - rejectedCount < count) {
	          def.reject(new AggregateError(
	            'Cannot resolve promise: too many rejections (' + rejectedCount + ')'
	          ));
	          res = null;
	        }
	      })
	    ;
	  });
	
	  return def.promise;
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var autoDecorate = __webpack_require__(23);
	
	module.exports = autoDecorate('when');


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var newq = __webpack_require__(2);
	
	module.exports = function(fn, args, oThis) {
	  try {
	    if (!_.isEmpty(args) && !(_.isArray(args) || _.isArguments(args)))
	      args = [args];
	
	    return newq.when(fn.apply(oThis || this, args));
	  }
	  catch (err) {
	    return newq.reject(err);
	  }
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/**
	 * @license
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash include="constant,defaults,each,extend,filter,isArray,isEmpty,isFunction,isArguments,keys,map,methods,noop,object,pick,reduce,toArray,values" -o tmp/lodash.js`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	;(function() {
	
	  /** Used to pool arrays and objects used internally */
	  var arrayPool = [];
	
	  /** Used internally to indicate various things */
	  var indicatorObject = {};
	
	  /** Used as the max size of the `arrayPool` and `objectPool` */
	  var maxPoolSize = 40;
	
	  /** Used to detected named functions */
	  var reFuncName = /^\s*function[ \n\r\t]+\w/;
	
	  /** Used to detect functions containing a `this` reference */
	  var reThis = /\bthis\b/;
	
	  /** Used to fix the JScript [[DontEnum]] bug */
	  var shadowedProps = [
	    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
	    'toLocaleString', 'toString', 'valueOf'
	  ];
	
	  /** `Object#toString` result shortcuts */
	  var argsClass = '[object Arguments]',
	      arrayClass = '[object Array]',
	      boolClass = '[object Boolean]',
	      dateClass = '[object Date]',
	      errorClass = '[object Error]',
	      funcClass = '[object Function]',
	      numberClass = '[object Number]',
	      objectClass = '[object Object]',
	      regexpClass = '[object RegExp]',
	      stringClass = '[object String]';
	
	  /** Used as the property descriptor for `__bindData__` */
	  var descriptor = {
	    'configurable': false,
	    'enumerable': false,
	    'value': null,
	    'writable': false
	  };
	
	  /** Used as the data object for `iteratorTemplate` */
	  var iteratorData = {
	    'args': '',
	    'array': null,
	    'bottom': '',
	    'firstArg': '',
	    'init': '',
	    'keys': null,
	    'loop': '',
	    'shadowedProps': null,
	    'support': null,
	    'top': '',
	    'useHas': false
	  };
	
	  /** Used to determine if values are of the language type Object */
	  var objectTypes = {
	    'boolean': false,
	    'function': true,
	    'object': true,
	    'number': false,
	    'string': false,
	    'undefined': false
	  };
	
	  /** Used as a reference to the global object */
	  var root = (objectTypes[typeof window] && window) || this;
	
	  /** Detect free variable `exports` */
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
	
	  /** Detect free variable `module` */
	  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
	
	  /** Detect the popular CommonJS extension `module.exports` */
	  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
	
	  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
	  var freeGlobal = objectTypes[typeof global] && global;
	  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	    root = freeGlobal;
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Gets an array from the array pool or creates a new one if the pool is empty.
	   *
	   * @private
	   * @returns {Array} The array from the pool.
	   */
	  function getArray() {
	    return arrayPool.pop() || [];
	  }
	
	  /**
	   * Checks if `value` is a DOM node in IE < 9.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a DOM node, else `false`.
	   */
	  function isNode(value) {
	    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
	    // methods that are `typeof` "string" and still can coerce nodes to strings
	    return typeof value.toString != 'function' && typeof (value + '') == 'string';
	  }
	
	  /**
	   * Releases the given array back to the array pool.
	   *
	   * @private
	   * @param {Array} [array] The array to release.
	   */
	  function releaseArray(array) {
	    array.length = 0;
	    if (arrayPool.length < maxPoolSize) {
	      arrayPool.push(array);
	    }
	  }
	
	  /**
	   * Slices the `collection` from the `start` index up to, but not including,
	   * the `end` index.
	   *
	   * Note: This function is used instead of `Array#slice` to support node lists
	   * in IE < 9 and to ensure dense arrays are returned.
	   *
	   * @private
	   * @param {Array|Object|string} collection The collection to slice.
	   * @param {number} start The start index.
	   * @param {number} end The end index.
	   * @returns {Array} Returns the new array.
	   */
	  function slice(array, start, end) {
	    start || (start = 0);
	    if (typeof end == 'undefined') {
	      end = array ? array.length : 0;
	    }
	    var index = -1,
	        length = end - start || 0,
	        result = Array(length < 0 ? 0 : length);
	
	    while (++index < length) {
	      result[index] = array[start + index];
	    }
	    return result;
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Used for `Array` method references.
	   *
	   * Normally `Array.prototype` would suffice, however, using an array literal
	   * avoids issues in Narwhal.
	   */
	  var arrayRef = [];
	
	  /** Used for native method references */
	  var errorProto = Error.prototype,
	      objectProto = Object.prototype,
	      stringProto = String.prototype;
	
	  /** Used to resolve the internal [[Class]] of values */
	  var toString = objectProto.toString;
	
	  /** Used to detect if a method is native */
	  var reNative = RegExp('^' +
	    String(toString)
	      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	      .replace(/toString| for [^\]]+/g, '.*?') + '$'
	  );
	
	  /** Native method shortcuts */
	  var fnToString = Function.prototype.toString,
	      hasOwnProperty = objectProto.hasOwnProperty,
	      push = arrayRef.push,
	      propertyIsEnumerable = objectProto.propertyIsEnumerable,
	      unshift = arrayRef.unshift;
	
	  /** Used to set meta data on functions */
	  var defineProperty = (function() {
	    // IE 8 only accepts DOM elements
	    try {
	      var o = {},
	          func = isNative(func = Object.defineProperty) && func,
	          result = func(o, o, o) && func;
	    } catch(e) { }
	    return result;
	  }());
	
	  /* Native method shortcuts for methods with the same name as other `lodash` methods */
	  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
	      nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
	      nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;
	
	  /** Used to avoid iterating non-enumerable properties in IE < 9 */
	  var nonEnumProps = {};
	  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
	  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
	  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
	  nonEnumProps[objectClass] = { 'constructor': true };
	
	  (function() {
	    var length = shadowedProps.length;
	    while (length--) {
	      var key = shadowedProps[length];
	      for (var className in nonEnumProps) {
	        if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
	          nonEnumProps[className][key] = false;
	        }
	      }
	    }
	  }());
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Creates a `lodash` object which wraps the given value to enable intuitive
	   * method chaining.
	   *
	   * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
	   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
	   * and `unshift`
	   *
	   * Chaining is supported in custom builds as long as the `value` method is
	   * implicitly or explicitly included in the build.
	   *
	   * The chainable wrapper functions are:
	   * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
	   * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
	   * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
	   * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
	   * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
	   * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
	   * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
	   * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
	   * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
	   * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
	   * and `zip`
	   *
	   * The non-chainable wrapper functions are:
	   * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
	   * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
	   * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
	   * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
	   * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
	   * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
	   * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
	   * `template`, `unescape`, `uniqueId`, and `value`
	   *
	   * The wrapper functions `first` and `last` return wrapped values when `n` is
	   * provided, otherwise they return unwrapped values.
	   *
	   * Explicit chaining can be enabled by using the `_.chain` method.
	   *
	   * @name _
	   * @constructor
	   * @category Chaining
	   * @param {*} value The value to wrap in a `lodash` instance.
	   * @returns {Object} Returns a `lodash` instance.
	   * @example
	   *
	   * var wrapped = _([1, 2, 3]);
	   *
	   * // returns an unwrapped value
	   * wrapped.reduce(function(sum, num) {
	   *   return sum + num;
	   * });
	   * // => 6
	   *
	   * // returns a wrapped value
	   * var squares = wrapped.map(function(num) {
	   *   return num * num;
	   * });
	   *
	   * _.isArray(squares);
	   * // => false
	   *
	   * _.isArray(squares.value());
	   * // => true
	   */
	  function lodash() {
	    // no operation performed
	  }
	
	  /**
	   * An object used to flag environments features.
	   *
	   * @static
	   * @memberOf _
	   * @type Object
	   */
	  var support = lodash.support = {};
	
	  (function() {
	    var ctor = function() { this.x = 1; },
	        object = { '0': 1, 'length': 1 },
	        props = [];
	
	    ctor.prototype = { 'valueOf': 1, 'y': 1 };
	    for (var key in new ctor) { props.push(key); }
	    for (key in arguments) { }
	
	    /**
	     * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.argsClass = toString.call(arguments) == argsClass;
	
	    /**
	     * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);
	
	    /**
	     * Detect if `name` or `message` properties of `Error.prototype` are
	     * enumerable by default. (IE < 9, Safari < 5.1)
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');
	
	    /**
	     * Detect if `prototype` properties are enumerable by default.
	     *
	     * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
	     * (if the prototype or a property on the prototype has been set)
	     * incorrectly sets a function's `prototype` property [[Enumerable]]
	     * value to `true`.
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');
	
	    /**
	     * Detect if functions can be decompiled by `Function#toString`
	     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.funcDecomp = !isNative(root.WinRTError) && reThis.test(function() { return this; });
	
	    /**
	     * Detect if `Function#name` is supported (all but IE).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.funcNames = typeof Function.name == 'string';
	
	    /**
	     * Detect if `arguments` object indexes are non-enumerable
	     * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.nonEnumArgs = key != 0;
	
	    /**
	     * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
	     *
	     * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
	     * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.nonEnumShadows = !/valueOf/.test(props);
	
	    /**
	     * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
	     *
	     * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
	     * and `splice()` functions that fail to remove the last element, `value[0]`,
	     * of array-like objects even though the `length` property is set to `0`.
	     * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
	     * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);
	
	    /**
	     * Detect lack of support for accessing string characters by index.
	     *
	     * IE < 8 can't access characters by index and IE 8 can only access
	     * characters by index on string literals.
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';
	  }(1));
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * The template used to create iterator functions.
	   *
	   * @private
	   * @param {Object} data The data object used to populate the text.
	   * @returns {string} Returns the interpolated text.
	   */
	  var iteratorTemplate = function(obj) {
	
	    var __p = 'var index, iterable = ' +
	    (obj.firstArg) +
	    ', result = ' +
	    (obj.init) +
	    ';\nif (!iterable) return result;\n' +
	    (obj.top) +
	    ';';
	     if (obj.array) {
	    __p += '\nvar length = iterable.length; index = -1;\nif (' +
	    (obj.array) +
	    ') {  ';
	     if (support.unindexedChars) {
	    __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
	     }
	    __p += '\n  while (++index < length) {\n    ' +
	    (obj.loop) +
	    ';\n  }\n}\nelse {  ';
	     } else if (support.nonEnumArgs) {
	    __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
	    (obj.loop) +
	    ';\n    }\n  } else {  ';
	     }
	
	     if (support.enumPrototypes) {
	    __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
	     }
	
	     if (support.enumErrorProps) {
	    __p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
	     }
	
	        var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == "prototype")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == "message" || index == "name"))'); }
	
	     if (obj.useHas && obj.keys) {
	    __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
	        if (conditions.length) {
	    __p += '    if (' +
	    (conditions.join(' && ')) +
	    ') {\n  ';
	     }
	    __p +=
	    (obj.loop) +
	    ';    ';
	     if (conditions.length) {
	    __p += '\n    }';
	     }
	    __p += '\n  }  ';
	     } else {
	    __p += '\n  for (index in iterable) {\n';
	        if (obj.useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }    if (conditions.length) {
	    __p += '    if (' +
	    (conditions.join(' && ')) +
	    ') {\n  ';
	     }
	    __p +=
	    (obj.loop) +
	    ';    ';
	     if (conditions.length) {
	    __p += '\n    }';
	     }
	    __p += '\n  }    ';
	     if (support.nonEnumShadows) {
	    __p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
	     for (k = 0; k < 7; k++) {
	    __p += '\n    index = \'' +
	    (obj.shadowedProps[k]) +
	    '\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
	            if (!obj.useHas) {
	    __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
	     }
	    __p += ') {\n      ' +
	    (obj.loop) +
	    ';\n    }      ';
	     }
	    __p += '\n  }    ';
	     }
	
	     }
	
	     if (obj.array || support.nonEnumArgs) {
	    __p += '\n}';
	     }
	    __p +=
	    (obj.bottom) +
	    ';\nreturn result';
	
	    return __p
	  };
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * The base implementation of `_.bind` that creates the bound function and
	   * sets its meta data.
	   *
	   * @private
	   * @param {Array} bindData The bind data array.
	   * @returns {Function} Returns the new bound function.
	   */
	  function baseBind(bindData) {
	    var func = bindData[0],
	        partialArgs = bindData[2],
	        thisArg = bindData[4];
	
	    function bound() {
	      // `Function#bind` spec
	      // http://es5.github.io/#x15.3.4.5
	      if (partialArgs) {
	        // avoid `arguments` object deoptimizations by using `slice` instead
	        // of `Array.prototype.slice.call` and not assigning `arguments` to a
	        // variable as a ternary expression
	        var args = slice(partialArgs);
	        push.apply(args, arguments);
	      }
	      // mimic the constructor's `return` behavior
	      // http://es5.github.io/#x13.2.2
	      if (this instanceof bound) {
	        // ensure `new bound` is an instance of `func`
	        var thisBinding = baseCreate(func.prototype),
	            result = func.apply(thisBinding, args || arguments);
	        return isObject(result) ? result : thisBinding;
	      }
	      return func.apply(thisArg, args || arguments);
	    }
	    setBindData(bound, bindData);
	    return bound;
	  }
	
	  /**
	   * The base implementation of `_.create` without support for assigning
	   * properties to the created object.
	   *
	   * @private
	   * @param {Object} prototype The object to inherit from.
	   * @returns {Object} Returns the new object.
	   */
	  function baseCreate(prototype, properties) {
	    return isObject(prototype) ? nativeCreate(prototype) : {};
	  }
	  // fallback for browsers without `Object.create`
	  if (!nativeCreate) {
	    baseCreate = (function() {
	      function Object() {}
	      return function(prototype) {
	        if (isObject(prototype)) {
	          Object.prototype = prototype;
	          var result = new Object;
	          Object.prototype = null;
	        }
	        return result || root.Object();
	      };
	    }());
	  }
	
	  /**
	   * The base implementation of `_.createCallback` without support for creating
	   * "_.pluck" or "_.where" style callbacks.
	   *
	   * @private
	   * @param {*} [func=identity] The value to convert to a callback.
	   * @param {*} [thisArg] The `this` binding of the created callback.
	   * @param {number} [argCount] The number of arguments the callback accepts.
	   * @returns {Function} Returns a callback function.
	   */
	  function baseCreateCallback(func, thisArg, argCount) {
	    if (typeof func != 'function') {
	      return identity;
	    }
	    // exit early for no `thisArg` or already bound by `Function#bind`
	    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
	      return func;
	    }
	    var bindData = func.__bindData__;
	    if (typeof bindData == 'undefined') {
	      if (support.funcNames) {
	        bindData = !func.name;
	      }
	      bindData = bindData || !support.funcDecomp;
	      if (!bindData) {
	        var source = fnToString.call(func);
	        if (!support.funcNames) {
	          bindData = !reFuncName.test(source);
	        }
	        if (!bindData) {
	          // checks if `func` references the `this` keyword and stores the result
	          bindData = reThis.test(source);
	          setBindData(func, bindData);
	        }
	      }
	    }
	    // exit early if there are no `this` references or `func` is bound
	    if (bindData === false || (bindData !== true && bindData[1] & 1)) {
	      return func;
	    }
	    switch (argCount) {
	      case 1: return function(value) {
	        return func.call(thisArg, value);
	      };
	      case 2: return function(a, b) {
	        return func.call(thisArg, a, b);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(thisArg, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(thisArg, accumulator, value, index, collection);
	      };
	    }
	    return bind(func, thisArg);
	  }
	
	  /**
	   * The base implementation of `createWrapper` that creates the wrapper and
	   * sets its meta data.
	   *
	   * @private
	   * @param {Array} bindData The bind data array.
	   * @returns {Function} Returns the new function.
	   */
	  function baseCreateWrapper(bindData) {
	    var func = bindData[0],
	        bitmask = bindData[1],
	        partialArgs = bindData[2],
	        partialRightArgs = bindData[3],
	        thisArg = bindData[4],
	        arity = bindData[5];
	
	    var isBind = bitmask & 1,
	        isBindKey = bitmask & 2,
	        isCurry = bitmask & 4,
	        isCurryBound = bitmask & 8,
	        key = func;
	
	    function bound() {
	      var thisBinding = isBind ? thisArg : this;
	      if (partialArgs) {
	        var args = slice(partialArgs);
	        push.apply(args, arguments);
	      }
	      if (partialRightArgs || isCurry) {
	        args || (args = slice(arguments));
	        if (partialRightArgs) {
	          push.apply(args, partialRightArgs);
	        }
	        if (isCurry && args.length < arity) {
	          bitmask |= 16 & ~32;
	          return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
	        }
	      }
	      args || (args = arguments);
	      if (isBindKey) {
	        func = thisBinding[key];
	      }
	      if (this instanceof bound) {
	        thisBinding = baseCreate(func.prototype);
	        var result = func.apply(thisBinding, args);
	        return isObject(result) ? result : thisBinding;
	      }
	      return func.apply(thisBinding, args);
	    }
	    setBindData(bound, bindData);
	    return bound;
	  }
	
	  /**
	   * The base implementation of `_.flatten` without support for callback
	   * shorthands or `thisArg` binding.
	   *
	   * @private
	   * @param {Array} array The array to flatten.
	   * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
	   * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
	   * @param {number} [fromIndex=0] The index to start from.
	   * @returns {Array} Returns a new flattened array.
	   */
	  function baseFlatten(array, isShallow, isStrict, fromIndex) {
	    var index = (fromIndex || 0) - 1,
	        length = array ? array.length : 0,
	        result = [];
	
	    while (++index < length) {
	      var value = array[index];
	
	      if (value && typeof value == 'object' && typeof value.length == 'number'
	          && (isArray(value) || isArguments(value))) {
	        // recursively flatten arrays (susceptible to call stack limits)
	        if (!isShallow) {
	          value = baseFlatten(value, isShallow, isStrict);
	        }
	        var valIndex = -1,
	            valLength = value.length,
	            resIndex = result.length;
	
	        result.length += valLength;
	        while (++valIndex < valLength) {
	          result[resIndex++] = value[valIndex];
	        }
	      } else if (!isStrict) {
	        result.push(value);
	      }
	    }
	    return result;
	  }
	
	  /**
	   * The base implementation of `_.isEqual`, without support for `thisArg` binding,
	   * that allows partial "_.where" style comparisons.
	   *
	   * @private
	   * @param {*} a The value to compare.
	   * @param {*} b The other value to compare.
	   * @param {Function} [callback] The function to customize comparing values.
	   * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
	   * @param {Array} [stackA=[]] Tracks traversed `a` objects.
	   * @param {Array} [stackB=[]] Tracks traversed `b` objects.
	   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	   */
	  function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
	    // used to indicate that when comparing objects, `a` has at least the properties of `b`
	    if (callback) {
	      var result = callback(a, b);
	      if (typeof result != 'undefined') {
	        return !!result;
	      }
	    }
	    // exit early for identical values
	    if (a === b) {
	      // treat `+0` vs. `-0` as not equal
	      return a !== 0 || (1 / a == 1 / b);
	    }
	    var type = typeof a,
	        otherType = typeof b;
	
	    // exit early for unlike primitive values
	    if (a === a &&
	        !(a && objectTypes[type]) &&
	        !(b && objectTypes[otherType])) {
	      return false;
	    }
	    // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
	    // http://es5.github.io/#x15.3.4.4
	    if (a == null || b == null) {
	      return a === b;
	    }
	    // compare [[Class]] names
	    var className = toString.call(a),
	        otherClass = toString.call(b);
	
	    if (className == argsClass) {
	      className = objectClass;
	    }
	    if (otherClass == argsClass) {
	      otherClass = objectClass;
	    }
	    if (className != otherClass) {
	      return false;
	    }
	    switch (className) {
	      case boolClass:
	      case dateClass:
	        // coerce dates and booleans to numbers, dates to milliseconds and booleans
	        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
	        return +a == +b;
	
	      case numberClass:
	        // treat `NaN` vs. `NaN` as equal
	        return (a != +a)
	          ? b != +b
	          // but treat `+0` vs. `-0` as not equal
	          : (a == 0 ? (1 / a == 1 / b) : a == +b);
	
	      case regexpClass:
	      case stringClass:
	        // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
	        // treat string primitives and their corresponding object instances as equal
	        return a == String(b);
	    }
	    var isArr = className == arrayClass;
	    if (!isArr) {
	      // unwrap any `lodash` wrapped values
	      var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
	          bWrapped = hasOwnProperty.call(b, '__wrapped__');
	
	      if (aWrapped || bWrapped) {
	        return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
	      }
	      // exit for functions and DOM nodes
	      if (className != objectClass) {
	        return false;
	      }
	      // in older versions of Opera, `arguments` objects have `Array` constructors
	      var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
	          ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;
	
	      // non `Object` object instances with different constructors are not equal
	      if (ctorA != ctorB &&
	            !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
	            ('constructor' in a && 'constructor' in b)
	          ) {
	        return false;
	      }
	    }
	    // assume cyclic structures are equal
	    // the algorithm for detecting cyclic structures is adapted from ES 5.1
	    // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
	    var initedStack = !stackA;
	    stackA || (stackA = getArray());
	    stackB || (stackB = getArray());
	
	    var length = stackA.length;
	    while (length--) {
	      if (stackA[length] == a) {
	        return stackB[length] == b;
	      }
	    }
	    var size = 0;
	    result = true;
	
	    // add `a` and `b` to the stack of traversed objects
	    stackA.push(a);
	    stackB.push(b);
	
	    // recursively compare objects and arrays (susceptible to call stack limits)
	    if (isArr) {
	      // compare lengths to determine if a deep comparison is necessary
	      length = a.length;
	      size = b.length;
	      result = size == length;
	
	      if (result || isWhere) {
	        // deep compare the contents, ignoring non-numeric properties
	        while (size--) {
	          var index = length,
	              value = b[size];
	
	          if (isWhere) {
	            while (index--) {
	              if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
	                break;
	              }
	            }
	          } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
	            break;
	          }
	        }
	      }
	    }
	    else {
	      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
	      // which, in this case, is more costly
	      forIn(b, function(value, key, b) {
	        if (hasOwnProperty.call(b, key)) {
	          // count the number of properties.
	          size++;
	          // deep compare each property value.
	          return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
	        }
	      });
	
	      if (result && !isWhere) {
	        // ensure both objects have the same number of properties
	        forIn(a, function(value, key, a) {
	          if (hasOwnProperty.call(a, key)) {
	            // `size` will be `-1` if `a` has more properties than `b`
	            return (result = --size > -1);
	          }
	        });
	      }
	    }
	    stackA.pop();
	    stackB.pop();
	
	    if (initedStack) {
	      releaseArray(stackA);
	      releaseArray(stackB);
	    }
	    return result;
	  }
	
	  /**
	   * Creates a function that, when called, either curries or invokes `func`
	   * with an optional `this` binding and partially applied arguments.
	   *
	   * @private
	   * @param {Function|string} func The function or method name to reference.
	   * @param {number} bitmask The bitmask of method flags to compose.
	   *  The bitmask may be composed of the following flags:
	   *  1 - `_.bind`
	   *  2 - `_.bindKey`
	   *  4 - `_.curry`
	   *  8 - `_.curry` (bound)
	   *  16 - `_.partial`
	   *  32 - `_.partialRight`
	   * @param {Array} [partialArgs] An array of arguments to prepend to those
	   *  provided to the new function.
	   * @param {Array} [partialRightArgs] An array of arguments to append to those
	   *  provided to the new function.
	   * @param {*} [thisArg] The `this` binding of `func`.
	   * @param {number} [arity] The arity of `func`.
	   * @returns {Function} Returns the new function.
	   */
	  function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
	    var isBind = bitmask & 1,
	        isBindKey = bitmask & 2,
	        isCurry = bitmask & 4,
	        isCurryBound = bitmask & 8,
	        isPartial = bitmask & 16,
	        isPartialRight = bitmask & 32;
	
	    if (!isBindKey && !isFunction(func)) {
	      throw new TypeError;
	    }
	    if (isPartial && !partialArgs.length) {
	      bitmask &= ~16;
	      isPartial = partialArgs = false;
	    }
	    if (isPartialRight && !partialRightArgs.length) {
	      bitmask &= ~32;
	      isPartialRight = partialRightArgs = false;
	    }
	    var bindData = func && func.__bindData__;
	    if (bindData && bindData !== true) {
	      // clone `bindData`
	      bindData = slice(bindData);
	      if (bindData[2]) {
	        bindData[2] = slice(bindData[2]);
	      }
	      if (bindData[3]) {
	        bindData[3] = slice(bindData[3]);
	      }
	      // set `thisBinding` is not previously bound
	      if (isBind && !(bindData[1] & 1)) {
	        bindData[4] = thisArg;
	      }
	      // set if previously bound but not currently (subsequent curried functions)
	      if (!isBind && bindData[1] & 1) {
	        bitmask |= 8;
	      }
	      // set curried arity if not yet set
	      if (isCurry && !(bindData[1] & 4)) {
	        bindData[5] = arity;
	      }
	      // append partial left arguments
	      if (isPartial) {
	        push.apply(bindData[2] || (bindData[2] = []), partialArgs);
	      }
	      // append partial right arguments
	      if (isPartialRight) {
	        unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
	      }
	      // merge flags
	      bindData[1] |= bitmask;
	      return createWrapper.apply(null, bindData);
	    }
	    // fast path for `_.bind`
	    var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
	    return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
	  }
	
	  /**
	   * Creates compiled iteration functions.
	   *
	   * @private
	   * @param {...Object} [options] The compile options object(s).
	   * @param {string} [options.array] Code to determine if the iterable is an array or array-like.
	   * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.
	   * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.
	   * @param {string} [options.args] A comma separated string of iteration function arguments.
	   * @param {string} [options.top] Code to execute before the iteration branches.
	   * @param {string} [options.loop] Code to execute in the object loop.
	   * @param {string} [options.bottom] Code to execute after the iteration branches.
	   * @returns {Function} Returns the compiled function.
	   */
	  function createIterator() {
	    // data properties
	    iteratorData.shadowedProps = shadowedProps;
	
	    // iterator options
	    iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';
	    iteratorData.init = 'iterable';
	    iteratorData.useHas = true;
	
	    // merge options into a template data object
	    for (var object, index = 0; object = arguments[index]; index++) {
	      for (var key in object) {
	        iteratorData[key] = object[key];
	      }
	    }
	    var args = iteratorData.args;
	    iteratorData.firstArg = /^[^,]+/.exec(args)[0];
	
	    // create the function factory
	    var factory = Function(
	        'baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' +
	        'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' +
	        'objectTypes, nonEnumProps, stringClass, stringProto, toString',
	      'return function(' + args + ') {\n' + iteratorTemplate(iteratorData) + '\n}'
	    );
	
	    // return the compiled function
	    return factory(
	      baseCreateCallback, errorClass, errorProto, hasOwnProperty,
	      indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto,
	      objectTypes, nonEnumProps, stringClass, stringProto, toString
	    );
	  }
	
	  /**
	   * Checks if `value` is a native function.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
	   */
	  function isNative(value) {
	    return typeof value == 'function' && reNative.test(value);
	  }
	
	  /**
	   * Sets `this` binding data on a given function.
	   *
	   * @private
	   * @param {Function} func The function to set data on.
	   * @param {Array} value The data array to set.
	   */
	  var setBindData = !defineProperty ? noop : function(func, value) {
	    descriptor.value = value;
	    defineProperty(func, '__bindData__', descriptor);
	  };
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Checks if `value` is an `arguments` object.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
	   * @example
	   *
	   * (function() { return _.isArguments(arguments); })(1, 2, 3);
	   * // => true
	   *
	   * _.isArguments([1, 2, 3]);
	   * // => false
	   */
	  function isArguments(value) {
	    return value && typeof value == 'object' && typeof value.length == 'number' &&
	      toString.call(value) == argsClass || false;
	  }
	  // fallback for browsers that can't detect `arguments` objects by [[Class]]
	  if (!support.argsClass) {
	    isArguments = function(value) {
	      return value && typeof value == 'object' && typeof value.length == 'number' &&
	        hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;
	    };
	  }
	
	  /**
	   * Checks if `value` is an array.
	   *
	   * @static
	   * @memberOf _
	   * @type Function
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
	   * @example
	   *
	   * (function() { return _.isArray(arguments); })();
	   * // => false
	   *
	   * _.isArray([1, 2, 3]);
	   * // => true
	   */
	  var isArray = nativeIsArray || function(value) {
	    return value && typeof value == 'object' && typeof value.length == 'number' &&
	      toString.call(value) == arrayClass || false;
	  };
	
	  /**
	   * A fallback implementation of `Object.keys` which produces an array of the
	   * given object's own enumerable property names.
	   *
	   * @private
	   * @type Function
	   * @param {Object} object The object to inspect.
	   * @returns {Array} Returns an array of property names.
	   */
	  var shimKeys = createIterator({
	    'args': 'object',
	    'init': '[]',
	    'top': 'if (!(objectTypes[typeof object])) return result',
	    'loop': 'result.push(index)'
	  });
	
	  /**
	   * Creates an array composed of the own enumerable property names of an object.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {Object} object The object to inspect.
	   * @returns {Array} Returns an array of property names.
	   * @example
	   *
	   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
	   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
	   */
	  var keys = !nativeKeys ? shimKeys : function(object) {
	    if (!isObject(object)) {
	      return [];
	    }
	    if ((support.enumPrototypes && typeof object == 'function') ||
	        (support.nonEnumArgs && object.length && isArguments(object))) {
	      return shimKeys(object);
	    }
	    return nativeKeys(object);
	  };
	
	  /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
	  var eachIteratorOptions = {
	    'args': 'collection, callback, thisArg',
	    'top': "callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)",
	    'array': "typeof length == 'number'",
	    'keys': keys,
	    'loop': 'if (callback(iterable[index], index, collection) === false) return result'
	  };
	
	  /** Reusable iterator options for `assign` and `defaults` */
	  var defaultsIteratorOptions = {
	    'args': 'object, source, guard',
	    'top':
	      'var args = arguments,\n' +
	      '    argsIndex = 0,\n' +
	      "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
	      'while (++argsIndex < argsLength) {\n' +
	      '  iterable = args[argsIndex];\n' +
	      '  if (iterable && objectTypes[typeof iterable]) {',
	    'keys': keys,
	    'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
	    'bottom': '  }\n}'
	  };
	
	  /** Reusable iterator options for `forIn` and `forOwn` */
	  var forOwnIteratorOptions = {
	    'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
	    'array': false
	  };
	
	  /**
	   * A function compiled to iterate `arguments` objects, arrays, objects, and
	   * strings consistenly across environments, executing the callback for each
	   * element in the collection. The callback is bound to `thisArg` and invoked
	   * with three arguments; (value, index|key, collection). Callbacks may exit
	   * iteration early by explicitly returning `false`.
	   *
	   * @private
	   * @type Function
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function} [callback=identity] The function called per iteration.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Array|Object|string} Returns `collection`.
	   */
	  var baseEach = createIterator(eachIteratorOptions);
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Assigns own enumerable properties of source object(s) to the destination
	   * object. Subsequent sources will overwrite property assignments of previous
	   * sources. If a callback is provided it will be executed to produce the
	   * assigned values. The callback is bound to `thisArg` and invoked with two
	   * arguments; (objectValue, sourceValue).
	   *
	   * @static
	   * @memberOf _
	   * @type Function
	   * @alias extend
	   * @category Objects
	   * @param {Object} object The destination object.
	   * @param {...Object} [source] The source objects.
	   * @param {Function} [callback] The function to customize assigning values.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Object} Returns the destination object.
	   * @example
	   *
	   * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
	   * // => { 'name': 'fred', 'employer': 'slate' }
	   *
	   * var defaults = _.partialRight(_.assign, function(a, b) {
	   *   return typeof a == 'undefined' ? b : a;
	   * });
	   *
	   * var object = { 'name': 'barney' };
	   * defaults(object, { 'name': 'fred', 'employer': 'slate' });
	   * // => { 'name': 'barney', 'employer': 'slate' }
	   */
	  var assign = createIterator(defaultsIteratorOptions, {
	    'top':
	      defaultsIteratorOptions.top.replace(';',
	        ';\n' +
	        "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
	        '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
	        "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
	        '  callback = args[--argsLength];\n' +
	        '}'
	      ),
	    'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
	  });
	
	  /**
	   * Assigns own enumerable properties of source object(s) to the destination
	   * object for all destination properties that resolve to `undefined`. Once a
	   * property is set, additional defaults of the same property will be ignored.
	   *
	   * @static
	   * @memberOf _
	   * @type Function
	   * @category Objects
	   * @param {Object} object The destination object.
	   * @param {...Object} [source] The source objects.
	   * @param- {Object} [guard] Allows working with `_.reduce` without using its
	   *  `key` and `object` arguments as sources.
	   * @returns {Object} Returns the destination object.
	   * @example
	   *
	   * var object = { 'name': 'barney' };
	   * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
	   * // => { 'name': 'barney', 'employer': 'slate' }
	   */
	  var defaults = createIterator(defaultsIteratorOptions);
	
	  /**
	   * Iterates over own and inherited enumerable properties of an object,
	   * executing the callback for each property. The callback is bound to `thisArg`
	   * and invoked with three arguments; (value, key, object). Callbacks may exit
	   * iteration early by explicitly returning `false`.
	   *
	   * @static
	   * @memberOf _
	   * @type Function
	   * @category Objects
	   * @param {Object} object The object to iterate over.
	   * @param {Function} [callback=identity] The function called per iteration.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Object} Returns `object`.
	   * @example
	   *
	   * function Shape() {
	   *   this.x = 0;
	   *   this.y = 0;
	   * }
	   *
	   * Shape.prototype.move = function(x, y) {
	   *   this.x += x;
	   *   this.y += y;
	   * };
	   *
	   * _.forIn(new Shape, function(value, key) {
	   *   console.log(key);
	   * });
	   * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
	   */
	  var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
	    'useHas': false
	  });
	
	  /**
	   * Iterates over own enumerable properties of an object, executing the callback
	   * for each property. The callback is bound to `thisArg` and invoked with three
	   * arguments; (value, key, object). Callbacks may exit iteration early by
	   * explicitly returning `false`.
	   *
	   * @static
	   * @memberOf _
	   * @type Function
	   * @category Objects
	   * @param {Object} object The object to iterate over.
	   * @param {Function} [callback=identity] The function called per iteration.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Object} Returns `object`.
	   * @example
	   *
	   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
	   *   console.log(key);
	   * });
	   * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
	   */
	  var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);
	
	  /**
	   * Creates a sorted array of property names of all enumerable properties,
	   * own and inherited, of `object` that have function values.
	   *
	   * @static
	   * @memberOf _
	   * @alias methods
	   * @category Objects
	   * @param {Object} object The object to inspect.
	   * @returns {Array} Returns an array of property names that have function values.
	   * @example
	   *
	   * _.functions(_);
	   * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
	   */
	  function functions(object) {
	    var result = [];
	    forIn(object, function(value, key) {
	      if (isFunction(value)) {
	        result.push(key);
	      }
	    });
	    return result.sort();
	  }
	
	  /**
	   * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
	   * length of `0` and objects with no own enumerable properties are considered
	   * "empty".
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {Array|Object|string} value The value to inspect.
	   * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
	   * @example
	   *
	   * _.isEmpty([1, 2, 3]);
	   * // => false
	   *
	   * _.isEmpty({});
	   * // => true
	   *
	   * _.isEmpty('');
	   * // => true
	   */
	  function isEmpty(value) {
	    var result = true;
	    if (!value) {
	      return result;
	    }
	    var className = toString.call(value),
	        length = value.length;
	
	    if ((className == arrayClass || className == stringClass ||
	        (support.argsClass ? className == argsClass : isArguments(value))) ||
	        (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
	      return !length;
	    }
	    forOwn(value, function() {
	      return (result = false);
	    });
	    return result;
	  }
	
	  /**
	   * Checks if `value` is a function.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
	   * @example
	   *
	   * _.isFunction(_);
	   * // => true
	   */
	  function isFunction(value) {
	    return typeof value == 'function';
	  }
	  // fallback for older versions of Chrome and Safari
	  if (isFunction(/x/)) {
	    isFunction = function(value) {
	      return typeof value == 'function' && toString.call(value) == funcClass;
	    };
	  }
	
	  /**
	   * Checks if `value` is the language type of Object.
	   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
	   * @example
	   *
	   * _.isObject({});
	   * // => true
	   *
	   * _.isObject([1, 2, 3]);
	   * // => true
	   *
	   * _.isObject(1);
	   * // => false
	   */
	  function isObject(value) {
	    // check if the value is the ECMAScript language type of Object
	    // http://es5.github.io/#x8
	    // and avoid a V8 bug
	    // http://code.google.com/p/v8/issues/detail?id=2291
	    return !!(value && objectTypes[typeof value]);
	  }
	
	  /**
	   * Checks if `value` is a string.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
	   * @example
	   *
	   * _.isString('fred');
	   * // => true
	   */
	  function isString(value) {
	    return typeof value == 'string' ||
	      value && typeof value == 'object' && toString.call(value) == stringClass || false;
	  }
	
	  /**
	   * Creates a shallow clone of `object` composed of the specified properties.
	   * Property names may be specified as individual arguments or as arrays of
	   * property names. If a callback is provided it will be executed for each
	   * property of `object` picking the properties the callback returns truey
	   * for. The callback is bound to `thisArg` and invoked with three arguments;
	   * (value, key, object).
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {Object} object The source object.
	   * @param {Function|...string|string[]} [callback] The function called per
	   *  iteration or property names to pick, specified as individual property
	   *  names or arrays of property names.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Object} Returns an object composed of the picked properties.
	   * @example
	   *
	   * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
	   * // => { 'name': 'fred' }
	   *
	   * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
	   *   return key.charAt(0) != '_';
	   * });
	   * // => { 'name': 'fred' }
	   */
	  function pick(object, callback, thisArg) {
	    var result = {};
	    if (typeof callback != 'function') {
	      var index = -1,
	          props = baseFlatten(arguments, true, false, 1),
	          length = isObject(object) ? props.length : 0;
	
	      while (++index < length) {
	        var key = props[index];
	        if (key in object) {
	          result[key] = object[key];
	        }
	      }
	    } else {
	      callback = lodash.createCallback(callback, thisArg, 3);
	      forIn(object, function(value, key, object) {
	        if (callback(value, key, object)) {
	          result[key] = value;
	        }
	      });
	    }
	    return result;
	  }
	
	  /**
	   * Creates an array composed of the own enumerable property values of `object`.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {Object} object The object to inspect.
	   * @returns {Array} Returns an array of property values.
	   * @example
	   *
	   * _.values({ 'one': 1, 'two': 2, 'three': 3 });
	   * // => [1, 2, 3] (property order is not guaranteed across environments)
	   */
	  function values(object) {
	    var index = -1,
	        props = keys(object),
	        length = props.length,
	        result = Array(length);
	
	    while (++index < length) {
	      result[index] = object[props[index]];
	    }
	    return result;
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Iterates over elements of a collection, returning an array of all elements
	   * the callback returns truey for. The callback is bound to `thisArg` and
	   * invoked with three arguments; (value, index|key, collection).
	   *
	   * If a property name is provided for `callback` the created "_.pluck" style
	   * callback will return the property value of the given element.
	   *
	   * If an object is provided for `callback` the created "_.where" style callback
	   * will return `true` for elements that have the properties of the given object,
	   * else `false`.
	   *
	   * @static
	   * @memberOf _
	   * @alias select
	   * @category Collections
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function|Object|string} [callback=identity] The function called
	   *  per iteration. If a property name or object is provided it will be used
	   *  to create a "_.pluck" or "_.where" style callback, respectively.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Array} Returns a new array of elements that passed the callback check.
	   * @example
	   *
	   * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
	   * // => [2, 4, 6]
	   *
	   * var characters = [
	   *   { 'name': 'barney', 'age': 36, 'blocked': false },
	   *   { 'name': 'fred',   'age': 40, 'blocked': true }
	   * ];
	   *
	   * // using "_.pluck" callback shorthand
	   * _.filter(characters, 'blocked');
	   * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
	   *
	   * // using "_.where" callback shorthand
	   * _.filter(characters, { 'age': 36 });
	   * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
	   */
	  function filter(collection, callback, thisArg) {
	    var result = [];
	    callback = lodash.createCallback(callback, thisArg, 3);
	
	    if (isArray(collection)) {
	      var index = -1,
	          length = collection.length;
	
	      while (++index < length) {
	        var value = collection[index];
	        if (callback(value, index, collection)) {
	          result.push(value);
	        }
	      }
	    } else {
	      baseEach(collection, function(value, index, collection) {
	        if (callback(value, index, collection)) {
	          result.push(value);
	        }
	      });
	    }
	    return result;
	  }
	
	  /**
	   * Iterates over elements of a collection, executing the callback for each
	   * element. The callback is bound to `thisArg` and invoked with three arguments;
	   * (value, index|key, collection). Callbacks may exit iteration early by
	   * explicitly returning `false`.
	   *
	   * Note: As with other "Collections" methods, objects with a `length` property
	   * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	   * may be used for object iteration.
	   *
	   * @static
	   * @memberOf _
	   * @alias each
	   * @category Collections
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function} [callback=identity] The function called per iteration.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Array|Object|string} Returns `collection`.
	   * @example
	   *
	   * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
	   * // => logs each number and returns '1,2,3'
	   *
	   * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
	   * // => logs each number and returns the object (property order is not guaranteed across environments)
	   */
	  function forEach(collection, callback, thisArg) {
	    if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
	      var index = -1,
	          length = collection.length;
	
	      while (++index < length) {
	        if (callback(collection[index], index, collection) === false) {
	          break;
	        }
	      }
	    } else {
	      baseEach(collection, callback, thisArg);
	    }
	    return collection;
	  }
	
	  /**
	   * Creates an array of values by running each element in the collection
	   * through the callback. The callback is bound to `thisArg` and invoked with
	   * three arguments; (value, index|key, collection).
	   *
	   * If a property name is provided for `callback` the created "_.pluck" style
	   * callback will return the property value of the given element.
	   *
	   * If an object is provided for `callback` the created "_.where" style callback
	   * will return `true` for elements that have the properties of the given object,
	   * else `false`.
	   *
	   * @static
	   * @memberOf _
	   * @alias collect
	   * @category Collections
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function|Object|string} [callback=identity] The function called
	   *  per iteration. If a property name or object is provided it will be used
	   *  to create a "_.pluck" or "_.where" style callback, respectively.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Array} Returns a new array of the results of each `callback` execution.
	   * @example
	   *
	   * _.map([1, 2, 3], function(num) { return num * 3; });
	   * // => [3, 6, 9]
	   *
	   * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
	   * // => [3, 6, 9] (property order is not guaranteed across environments)
	   *
	   * var characters = [
	   *   { 'name': 'barney', 'age': 36 },
	   *   { 'name': 'fred',   'age': 40 }
	   * ];
	   *
	   * // using "_.pluck" callback shorthand
	   * _.map(characters, 'name');
	   * // => ['barney', 'fred']
	   */
	  function map(collection, callback, thisArg) {
	    var index = -1,
	        length = collection ? collection.length : 0,
	        result = Array(typeof length == 'number' ? length : 0);
	
	    callback = lodash.createCallback(callback, thisArg, 3);
	    if (isArray(collection)) {
	      while (++index < length) {
	        result[index] = callback(collection[index], index, collection);
	      }
	    } else {
	      baseEach(collection, function(value, key, collection) {
	        result[++index] = callback(value, key, collection);
	      });
	    }
	    return result;
	  }
	
	  /**
	   * Reduces a collection to a value which is the accumulated result of running
	   * each element in the collection through the callback, where each successive
	   * callback execution consumes the return value of the previous execution. If
	   * `accumulator` is not provided the first element of the collection will be
	   * used as the initial `accumulator` value. The callback is bound to `thisArg`
	   * and invoked with four arguments; (accumulator, value, index|key, collection).
	   *
	   * @static
	   * @memberOf _
	   * @alias foldl, inject
	   * @category Collections
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function} [callback=identity] The function called per iteration.
	   * @param {*} [accumulator] Initial value of the accumulator.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {*} Returns the accumulated value.
	   * @example
	   *
	   * var sum = _.reduce([1, 2, 3], function(sum, num) {
	   *   return sum + num;
	   * });
	   * // => 6
	   *
	   * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
	   *   result[key] = num * 3;
	   *   return result;
	   * }, {});
	   * // => { 'a': 3, 'b': 6, 'c': 9 }
	   */
	  function reduce(collection, callback, accumulator, thisArg) {
	    var noaccum = arguments.length < 3;
	    callback = lodash.createCallback(callback, thisArg, 4);
	
	    if (isArray(collection)) {
	      var index = -1,
	          length = collection.length;
	
	      if (noaccum) {
	        accumulator = collection[++index];
	      }
	      while (++index < length) {
	        accumulator = callback(accumulator, collection[index], index, collection);
	      }
	    } else {
	      baseEach(collection, function(value, index, collection) {
	        accumulator = noaccum
	          ? (noaccum = false, value)
	          : callback(accumulator, value, index, collection)
	      });
	    }
	    return accumulator;
	  }
	
	  /**
	   * Converts the `collection` to an array.
	   *
	   * @static
	   * @memberOf _
	   * @category Collections
	   * @param {Array|Object|string} collection The collection to convert.
	   * @returns {Array} Returns the new converted array.
	   * @example
	   *
	   * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
	   * // => [2, 3, 4]
	   */
	  function toArray(collection) {
	    if (collection && typeof collection.length == 'number') {
	      return (support.unindexedChars && isString(collection))
	        ? collection.split('')
	        : slice(collection);
	    }
	    return values(collection);
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Creates an object composed from arrays of `keys` and `values`. Provide
	   * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
	   * or two arrays, one of `keys` and one of corresponding `values`.
	   *
	   * @static
	   * @memberOf _
	   * @alias object
	   * @category Arrays
	   * @param {Array} keys The array of keys.
	   * @param {Array} [values=[]] The array of values.
	   * @returns {Object} Returns an object composed of the given keys and
	   *  corresponding values.
	   * @example
	   *
	   * _.zipObject(['fred', 'barney'], [30, 40]);
	   * // => { 'fred': 30, 'barney': 40 }
	   */
	  function zipObject(keys, values) {
	    var index = -1,
	        length = keys ? keys.length : 0,
	        result = {};
	
	    if (!values && length && !isArray(keys[0])) {
	      values = [];
	    }
	    while (++index < length) {
	      var key = keys[index];
	      if (values) {
	        result[key] = values[index];
	      } else if (key) {
	        result[key[0]] = key[1];
	      }
	    }
	    return result;
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Creates a function that, when called, invokes `func` with the `this`
	   * binding of `thisArg` and prepends any additional `bind` arguments to those
	   * provided to the bound function.
	   *
	   * @static
	   * @memberOf _
	   * @category Functions
	   * @param {Function} func The function to bind.
	   * @param {*} [thisArg] The `this` binding of `func`.
	   * @param {...*} [arg] Arguments to be partially applied.
	   * @returns {Function} Returns the new bound function.
	   * @example
	   *
	   * var func = function(greeting) {
	   *   return greeting + ' ' + this.name;
	   * };
	   *
	   * func = _.bind(func, { 'name': 'fred' }, 'hi');
	   * func();
	   * // => 'hi fred'
	   */
	  function bind(func, thisArg) {
	    return arguments.length > 2
	      ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
	      : createWrapper(func, 1, null, null, thisArg);
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Creates a function that returns `value`.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @param {*} value The value to return from the new function.
	   * @returns {Function} Returns the new function.
	   * @example
	   *
	   * var object = { 'name': 'fred' };
	   * var getter = _.constant(object);
	   * getter() === object;
	   * // => true
	   */
	  function constant(value) {
	    return function() {
	      return value;
	    };
	  }
	
	  /**
	   * Produces a callback bound to an optional `thisArg`. If `func` is a property
	   * name the created callback will return the property value for a given element.
	   * If `func` is an object the created callback will return `true` for elements
	   * that contain the equivalent object properties, otherwise it will return `false`.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @param {*} [func=identity] The value to convert to a callback.
	   * @param {*} [thisArg] The `this` binding of the created callback.
	   * @param {number} [argCount] The number of arguments the callback accepts.
	   * @returns {Function} Returns a callback function.
	   * @example
	   *
	   * var characters = [
	   *   { 'name': 'barney', 'age': 36 },
	   *   { 'name': 'fred',   'age': 40 }
	   * ];
	   *
	   * // wrap to create custom callback shorthands
	   * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
	   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
	   *   return !match ? func(callback, thisArg) : function(object) {
	   *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
	   *   };
	   * });
	   *
	   * _.filter(characters, 'age__gt38');
	   * // => [{ 'name': 'fred', 'age': 40 }]
	   */
	  function createCallback(func, thisArg, argCount) {
	    var type = typeof func;
	    if (func == null || type == 'function') {
	      return baseCreateCallback(func, thisArg, argCount);
	    }
	    // handle "_.pluck" style callback shorthands
	    if (type != 'object') {
	      return property(func);
	    }
	    var props = keys(func),
	        key = props[0],
	        a = func[key];
	
	    // handle "_.where" style callback shorthands
	    if (props.length == 1 && a === a && !isObject(a)) {
	      // fast path the common case of providing an object with a single
	      // property containing a primitive value
	      return function(object) {
	        var b = object[key];
	        return a === b && (a !== 0 || (1 / a == 1 / b));
	      };
	    }
	    return function(object) {
	      var length = props.length,
	          result = false;
	
	      while (length--) {
	        if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
	          break;
	        }
	      }
	      return result;
	    };
	  }
	
	  /**
	   * This method returns the first argument provided to it.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @param {*} value Any value.
	   * @returns {*} Returns `value`.
	   * @example
	   *
	   * var object = { 'name': 'fred' };
	   * _.identity(object) === object;
	   * // => true
	   */
	  function identity(value) {
	    return value;
	  }
	
	  /**
	   * A no-operation function.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @example
	   *
	   * var object = { 'name': 'fred' };
	   * _.noop(object) === undefined;
	   * // => true
	   */
	  function noop() {
	    // no operation performed
	  }
	
	  /**
	   * Creates a "_.pluck" style function, which returns the `key` value of a
	   * given object.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @param {string} key The name of the property to retrieve.
	   * @returns {Function} Returns the new function.
	   * @example
	   *
	   * var characters = [
	   *   { 'name': 'fred',   'age': 40 },
	   *   { 'name': 'barney', 'age': 36 }
	   * ];
	   *
	   * var getName = _.property('name');
	   *
	   * _.map(characters, getName);
	   * // => ['barney', 'fred']
	   *
	   * _.sortBy(characters, getName);
	   * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
	   */
	  function property(key) {
	    return function(object) {
	      return object[key];
	    };
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  lodash.assign = assign;
	  lodash.bind = bind;
	  lodash.constant = constant;
	  lodash.createCallback = createCallback;
	  lodash.defaults = defaults;
	  lodash.filter = filter;
	  lodash.forEach = forEach;
	  lodash.forIn = forIn;
	  lodash.forOwn = forOwn;
	  lodash.functions = functions;
	  lodash.keys = keys;
	  lodash.map = map;
	  lodash.pick = pick;
	  lodash.property = property;
	  lodash.toArray = toArray;
	  lodash.values = values;
	  lodash.zipObject = zipObject;
	
	  // add aliases
	  lodash.collect = map;
	  lodash.each = forEach;
	  lodash.extend = assign;
	  lodash.methods = functions;
	  lodash.object = zipObject;
	  lodash.select = filter;
	
	  /*--------------------------------------------------------------------------*/
	
	  lodash.identity = identity;
	  lodash.isArguments = isArguments;
	  lodash.isArray = isArray;
	  lodash.isEmpty = isEmpty;
	  lodash.isFunction = isFunction;
	  lodash.isObject = isObject;
	  lodash.isString = isString;
	  lodash.noop = noop;
	  lodash.reduce = reduce;
	
	  lodash.foldl = reduce;
	  lodash.inject = reduce;
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * The semantic version number.
	   *
	   * @static
	   * @memberOf _
	   * @type string
	   */
	  lodash.VERSION = '2.4.1';
	
	  /*--------------------------------------------------------------------------*/
	
	  // some AMD build optimizers like r.js check for condition patterns like the following:
	  if (true) {
	    // Expose Lo-Dash to the global object even when an AMD loader is present in
	    // case Lo-Dash is loaded with a RequireJS shim config.
	    // See http://requirejs.org/docs/api.html#config-shim
	    root._ = lodash;
	
	    // define as an anonymous module so, through path mapping, it can be
	    // referenced as the "underscore" module
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return lodash;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  // check for `exports` after `define` in case a build optimizer adds an `exports` object
	  else if (freeExports && freeModule) {
	    // in Node.js or RingoJS
	    if (moduleExports) {
	      (freeModule.exports = lodash)._ = lodash;
	    }
	    // in Narwhal or Rhino -require
	    else {
	      freeExports._ = lodash;
	    }
	  }
	  else {
	    // in a browser or Rhino
	    root._ = lodash;
	  }
	}.call(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(41)(module), (function() { return this; }())))

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var newq = __webpack_require__(2);
	var Gate = __webpack_require__(25);
	var defineProperty = __webpack_require__(26);
	
	module.exports = function walkCollection(promiseFn) {
	  return function(array, cb, options) {
	    options = _.pick(options, 'concurrency');
	
	    var gate = options.concurrency ? new Gate(options) : {
	      add: function(fn) {
	        return fn();
	      }
	    };
	
	    // create an array with each promises affected by the operation
	    var $$unsynced = _.map(array, function(val, i) {
	      // return a new promise for each item
	      return newq.when(val)[promiseFn](function(val) {
	        return gate.add(function() {
	          // call user callback
	          return newq.when(cb.call(null, val, i, array.length));
	        });
	      });
	    });
	
	    // create a promise synchronizing everything
	    var res = newq.all($$unsynced);
	
	    // save the unsynced array of promises in the result
	    defineProperty(res, '$$unsynced', $$unsynced);
	
	    // return the promise
	    return res;
	  };
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var decorate = __webpack_require__(24);
	var globals = __webpack_require__(1);
	
	module.exports = function autoDecorate(name) {
	  return !(name in globals.$delegate) ? null : function() {
	    return decorate(globals.$delegate[name].apply(globals.$delegate, arguments));
	  };
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var globals = __webpack_require__(1);
	var callNewQ = __webpack_require__(27);
	var defineProperty = __webpack_require__(26);
	
	var aliases = {
	  'catch': 'caught',
	  'finally': 'lastly',
	  'return': ['thenReturn', 'returns'],
	  'throw': ['thenThrow']
	};
	
	function Promise($qPromise, parent) {
	  defineProperty(this, '$$state', $qPromise.$$state);
	
	  _.each(_.methods($qPromise), function(name) {
	    defineProperty(this, '$$' + name, $qPromise[name]);
	  }, this);
	
	  if (parent && parent.$$boundTo)
	    defineProperty(this, '$$boundTo', parent.$$boundTo);
	
	  defineProperty(this, '$$arrayListeners', []);
	
	  this.then = $qPromise.then = this.then.bind(this);
	}
	
	module.exports = function decorate($qPromise, parent) {
	  return new Promise($qPromise, parent);
	};
	
	Promise.prototype = {
	  // call newQ.all if unsynced, does nothing otherwise
	  all: callNewQ('all'),
	  any: callNewQ('any'),
	  bind: __webpack_require__(28),
	  call: __webpack_require__(29),
	  'catch': __webpack_require__(30),
	  delay: __webpack_require__(31),
	  done: __webpack_require__(32),
	  each: callNewQ('each'),
	  filter: callNewQ('filter'),
	  'finally': function() {
	    return this.$$finally.apply(this, arguments);
	  },
	  get: __webpack_require__(33),
	  map: callNewQ('map'),
	  nodeify: __webpack_require__(34),
	  props: callNewQ('props'),
	  reduce: callNewQ('reduce'),
	  'return': __webpack_require__(35),
	  some: callNewQ('some'),
	  spread: __webpack_require__(36),
	  tap: __webpack_require__(37),
	  then: __webpack_require__(38),
	  'throw': __webpack_require__(39),
	  timeout: __webpack_require__(40),
	
	  constructor: Promise
	};
	
	defineProperty(Promise.prototype, '$$callArrayListeners', function(array) {
	  _.each(this.$$arrayListeners, function(listener) {
	    listener(array);
	  });
	});
	
	_.each(aliases, function(targets, method) {
	  if (!_.isArray(targets))
	    targets = [targets];
	
	  if (globals.$options.compatibilityAliases) {
	    _.each(targets, function(target) {
	      Promise.prototype[target] = Promise.prototype[method];
	    });
	  }
	
	  if (globals.$options.disableES5Methods)
	    delete Promise.prototype[method];
	});


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var globals = __webpack_require__(1);
	
	var Gate = module.exports = function Gate(options) {
	  this.$options = _.defaults(options, {
	    concurrency: 1,
	    maxQueue: 0
	  });
	  this.$fns = [];
	};
	
	Gate.prototype.add = function(fn) {
	  // if (this.$options.maxQueue > 0 && this.$fns.length - this.$options.concurrency >= this.$options.maxQueue)
	  //     return def.reject(new Error('Max queue size reached'));
	
	  var def = globals.$defer();
	
	  var $fn = function() {
	    fn()
	      ['finally'](function() {
	        this.$fns.splice(this.$fns.indexOf($fn), 1);
	
	        if (this.$fns.length >= this.$options.concurrency)
	          this.$fns[this.$options.concurrency - 1]();
	      }.bind(this))
	
	      .then(function(val) {
	        def.resolve(val);
	      }, function(err) {
	        def.reject(err);
	      })
	    ;
	  }.bind(this);
	
	  if (this.$fns.push($fn) <= this.$options.concurrency)
	    $fn();
	
	  return def.promise;
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = function defineProperty(obj, name, value) {
	  if (Object.defineProperty) {
	    try {
	      Object.defineProperty(obj, name, {
	        value: value
	      });
	    }
	    catch (e) {}
	  }
	
	  if (obj[name] !== value)
	    obj[name] = value;
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bindMethods = __webpack_require__(42);
	var newQ = __webpack_require__(2);
	var defineProperty = __webpack_require__(26);
	
	module.exports = function callNewQ(method) {
	  /* jshint -W040 */
	  function execute(args, arr) {
	    var res = newQ[method].apply(null, [arr].concat(args));
	    defineProperty(res, '$$boundTo', this.$$boundTo);
	    return res;
	  }
	  /* jshint +W040 */
	
	  return function() {
	    var args = bindMethods.call(this, arguments);
	
	    // chain if not synced
	    if (this.$$unsynced) {
	      // create new promise with next($$unsynced, args…)
	      return execute.call(this, args, this.$$unsynced);
	    }
	
	    var then = this.then(function(val) {
	      if (then.$$promiseResult)
	        return then.$$promiseResult;
	
	      var res = execute.call(this, args, val);
	
	      if (then.$$arrayListeners.length && res.$$unsynced)
	        then.$$callArrayListeners(res.$$unsynced);
	
	      return res;
	    }.bind(this));
	
	    this.$$arrayListeners.push(function(array) {
	      defineProperty(this, '$$promiseResult', execute.call(this, args, array));
	
	      if (then.$$arrayListeners.length && this.$$promiseResult.$$unsynced)
	        then.$$callArrayListeners(this.$$promiseResult.$$unsynced);
	    }.bind(this));
	
	    return then;
	  };
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var defineProperty = __webpack_require__(26);
	
	module.exports = function(bound) {
	  defineProperty(this, '$$boundTo', bound);
	  return this;
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	
	module.exports = function() {
	  var args = _.toArray(arguments);
	  var method = args.shift();
	
	  return this.then(function(val) {
	    return val[method].apply(val, args);
	  });
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var newq = __webpack_require__(2);
	var _ = __webpack_require__(3);
	
	function checkErrorsAndPredicates(errorsAndPredicates, err) {
	  var any = !errorsAndPredicates.length;
	  _.each(errorsAndPredicates, function(test) {
	    if (!_.isFunction(test))
	      throw new Error('Invalid argument.');
	
	    if (test instanceof Error || test.prototype instanceof Error) {
	      any = any || err instanceof test;
	
	      return !any;
	    }
	
	    any = any || test(err);
	    return !any;
	  });
	  return any;
	}
	
	module.exports = function() {
	  var errorsAndPredicates = _.toArray(arguments);
	  var callback = errorsAndPredicates.pop();
	
	  return this.$$catch(function(err) {
	    if (!_.isFunction(callback) || !checkErrorsAndPredicates(errorsAndPredicates, err))
	      return newq.reject(err);
	
	    return callback.call(this, err);
	  });
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var globals = __webpack_require__(1);
	
	module.exports = function(ms) {
	  return this.then(function(val) {
	    var def = globals.$defer(this);
	    setTimeout(def.resolve, ms, val);
	    return def.promise;
	  }.bind(this));
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var newQ = __webpack_require__(2);
	
	module.exports = function() {
	  return this
	    .then.apply(this, arguments)
	    .$$catch(function(err) {
	      setTimeout(function() {
	        throw err;
	      });
	    })
	    .$$finally(function() {
	      return newQ.reject(new Error('Do not chain anything after calling done()!'));
	    })
	  ;
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = function(prop) {
	  return this.then(function(val) {
	    return val[prop];
	  });
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	var newq = __webpack_require__(2);
	
	module.exports = function(cb, options) {
	  cb = cb || _.noop;
	  options = options || {};
	
	  return this.then(
	    function(args) {
	      var a = args;
	
	      if (!options.spread || !_.isArray(a))
	        a = [null, a];
	      else
	        a = [null].concat(a);
	
	      cb.apply(this, a);
	
	      return args;
	    },
	
	    function(err) {
	      cb.call(this, err);
	      return newq.reject(err);
	    }
	  );
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	
	module.exports = function(val) {
	  return this.then(_.constant(val));
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	
	module.exports = function(fn) {
	  return this.then(function(value) {
	    // given value might not be an array
	    if (!_.isArray(value))
	      value = [value];
	
	    return fn.apply(this, value);
	  });
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var newQ = __webpack_require__(2);
	
	module.exports = function(fn) {
	  return this.then(function(value) {
	    // returns only when fn(value) promise chain is fully resolved
	    return newQ.when(fn.call(this, value)).returns(value);
	  });
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bindMethods = __webpack_require__(42);
	var decorate = __webpack_require__(24);
	
	// Then is special because it needs the previous then to work
	module.exports = function() {
	  // convert the promise to newQ
	  return decorate(this.$$then.apply(this, bindMethods.call(this, arguments)), this);
	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var newq = __webpack_require__(2);
	
	module.exports = function(err) {
	  return this.then(function() {
	    return newq.reject(err);
	  });
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var globals = __webpack_require__(1);
	var newq = __webpack_require__(2);
	
	module.exports = function(ms, msg) {
	  var def = globals.$defer(this);
	  var to = setTimeout(function() {
	    def.reject(new newq.TimeoutError(msg || 'Timed out after ' + ms + ' ms'));
	  }, ms);
	
	  this
	    .then(function(val) {
	      def.resolve(val);
	    }, function(err) {
	      def.reject(err);
	    })
	    ['finally'](clearTimeout.bind(null, to))
	  ;
	
	  return def.promise;
	};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(3);
	
	module.exports = function bindMethods(array) {
	  return _.map(array, function(arg) {
	    if (!_.isFunction(arg))
	      return arg;
	    return arg.bind(this.$$boundTo || this);
	  }, this);
	};


/***/ }
/******/ ])
});

//# sourceMappingURL=angular-extend-promises.js.map