var Rx = require('rx');
var _  = require('lodash');

var observableProto = Rx.Observable.prototype;

function add_impl() {
	
	var list  = _.toArray(arguments);
	var names = _.initial(list);
	var impl  = _.last(list);
	
	_.forEach(names, function(name) {
		observableProto[name] = impl;
	});
};

// 
// Combine from both sources until either source completes.
// 
add_impl(
	'combineUntil',
	function(second, selector) {
		
	var finalA, finalB, finished;
	
	finalA = this.finalValue();
	finalB = second.finalValue();
	
	finished = Rx.Observable.amb(finalA, finalB);
	
	return this
		.combineLatest(second, selector)
		.takeUntil(finished);
});


// 
// Combine from both sources until the source Observable completes.
// 
add_impl(
	'combineUntilFirst',
	function(second, selector) {
		return this
			.combineLatest(second, selector)
			.takeUntil(this.finalValue());
	});

// 
// Combine from both sources until the second Observable completes.
// 
add_impl(
	'combineUntilSecond',
	function(second, selector) {
		return this
			.combineLatest(second, selector)
			.takeUntil(second.finalValue());
	});

// 
// Combines both sources into a Tuple[a, b]
// 
add_impl(
	'combinePair',
	'combineTuple',
	'combineAsPair',
	'combineAsTuple',
	function(second) {
		return this.combineLatest(second, tuple);
	});

// 
// Combines both sources into a Tuple[a, b] until either source completes.
// 
add_impl(
	'combinePairUntil',
	'combineTupleUntil',
	'combineAsPairUntil',
	'combineAsTupleUntil',
	function(second) {
		return this.combineUntil(second, tuple);
	});

// 
// Combines both sources into a Tuple[a, b] until the source Observable completes.
// 
add_impl(
	'combinePairUntilFirst',
	'combineTupleUntilFirst',
	'combineAsPairUntilFirst',
	'combineAsTupleUntilFirst',
	function(second) {
		return this.combineUntilFirst(second, tuple);
	});

// 
// Combines both sources into a Tuple[a, b] until the second Observable completes.
// 
add_impl(
	'combinePairUntilSecond',
	'combineTupleUntilSecond',
	'combineAsPairUntilSecond',
	'combineAsTupleUntilSecond',
	function(second) {
		return this.combineUntilSecond(second, tuple);
	});

// 
// Combines both sources, but only takes values from the source Observable.
// 
add_impl(
	'combineFirst',
	'combineTakeFirst',
	function(second) {
		return this.combineLatest(second, first);
	});

// 
// Combines both sources, but only takes values from the second Observable.
// 
add_impl(
	'combineSecond',
	'combineTakeSecond',
	function(second) {
		return this.combineLatest(second, last);
	});

// 
// Combines both sources, merging the results into a
// variable-length Array of values. For example, if
// each source dispatches a Tuple[a, b], `combineMultiple`
// will dispatch an Array of 4 values, [a1, b1, a2, b2].
// 
add_impl(
	'combineAll',
	'combineMerge', 
	'combineMultiple',
	function(second) {
		return this.combineLatest(second, merge);
	});

// 
// Scans the source values into an Array.
// 
add_impl(
	'asList',
	'asArray',
	'scanList',
	function() {
		return this.scan([], function(list, item){
			return list.concat([item]);
		});
	});

// 
// Scans the source values into an Array with Array.prototype.concat,
// which means if a source value is an Array, the source Array's
// values will be inserted into the emitted Array.
// 
add_impl(
	'scanConcat',
	function() {
		return this.scan([], function(list, items) {
			return list.concat(items);
		});
	});

//
// Selects a value from a sequence. If the source value is an Array,
// the source value is applied to the selector as arguments with
// func.apply. The optional `count` and `parent` values are appended
// to the end of the arguments list.
// 
// Example:
// 
// Rx.Observable.returnValue(["Hey", {name: Paul}])
//     .multiSelect(function(message, user) {
//          return message + " " + user.name;
//     })
//     .subscribe(function(customized_greeting){
//          console.log(customized_greeting); // prints "Hey Paul"
//     });
//
add_impl(
	'multiSelect',
	'selectMulti',
	'selectMultiple',
	function(selector, thisArg) {
		
		return this.select(function(value, count, parent) {
			
			var args, result, results;
			
			args = _.isArray(value) ? value : [value];
			
			return selector.apply(thisArg, args.concat(count, this));
		}, thisArg);
	});

add_impl(
	'mulitScan',
	'scanMulti',
	'scanMultiple',
	function(memoOrSelector, selector) {
		
		if(typeof selector !== 'function') scanner = memoOrSelector;
		
		return this.scan(memoOrSelector, function(memo, value) {
			
			var args = [memo].concat(_.isArray(value) ? value : [value]);
			
			return scanner.apply(this, args);
		});
	});

//
// Concatonates source and selected values from a sequence, emitting an
// Array of all the values. If the source or selected value is an Array,
// the contents are concatonated into a single Array.
// For example:
// 
// Rx.Observable.returnValue([1, 2])
//     .selectConcat(function() { return [3, 4] })
//     .subscribe(function(values){
//         console.log(values); // prints [1, 2, 3, 4]
//     });
// 
add_impl(
	'concatSelect',
	'selectConcat',
	function(selector, thisArg) {
		
		return this.select(function(value, count, parent) {
			
			var args, result, results;
			
			args = _.isArray(value) ? value : [value];
			
			result = selector.apply(thisArg, args.concat(count, this));
			
			results = args.concat(result);
			
			return results;
		}, thisArg);
});

// Selects the field chain from each source value.
// A field chain can be a string or a list of arguments.
// 
// For example:
// 
// Rx.Observable
//     .returnValue({ coords: { global: {x: 10 } } })
//     .pluck('coords', 'global', 'x')
//     .subscribe(function(x_value) {
//         console.log(x_value); // prints 10
//     });
// 
// The arguments to `pluck` could also be in these formats:
// pluck('coords.global.x')
// pluck('coords.global', 'x')
// pluck('coords', 'global.x')
// ...etc.
//
add_impl(
	'pluck',
	'field',
	'valueOf',
	'property',
	'selectField',
	'selectValueAt',
	'selectProperty',
	function() {
		return this.select(chain(_.toArray(arguments))(_.identity));
	});

// Invokes the function chain for each source value.
// Uses each source value as the invocation context.
// 
// If the value in the chain isn't a function, the value is
// selected for instead.
// 
// All arguments after the method_chain are used as arguments
// for each function in the chain, in the order they're specified.
// 
// Arrays are applied to their corresponding function as arguments.
// 
// If a function in the chain doesn't accept arguments but others
// further down the chain do, pass an empty Array to use as a placeholder.
// 
// If a function is returned by one of the functions in the chain,
// passing 'call' in the method_chain will invoke it as part of the chain.
// 
// Example:
// 
// Rx.Observable.returnValue({
//     bottomRight: function(rect) {
//         return function() {
//             return {
//                 x: function(padding) { return rect.x + rect.width + padding; },
//                 y: function(padding) { return rect.y + rect.height + padding; }
//             };
//         }
//     }
// })
// .invoke("bottomRight.call.y", {x: 10, width: 50, y: 15, height: 85}, [], 10)
// .subscribe(function(bottom_with_offset) {
//     console.log(bottom_with_offset); // prints 110
// })
// 
add_impl(
	'invoke',
	'callMethod',
	'callFunction',
	'callProperty',
	function(methods) {
		return this.select(chain(methods)(
			_.identity,
			_.tail(arguments)
		));
	});

// 
// Filters for source values whose fields match the specified value.
// The first argument is the field to match, remaining arguments are
// treated as a field chain.
// 
// Example:
// 
// Rx.Observable
//     .returnValue({ coords: { global: { x: 10 } } })
//     .whereEqualTo(10, 'coords.global', 'x')
//     .subscribe(function(obj) {
//         console.log(obj.coords.global.x); // prints 10
//     });
// 
add_impl(
	'whereEqual',
	'whereEquals',
	'whereEqualTo',
	function(value_to_match) {
		return this.where(chain(_.tail(arguments))(function(final_value) {
			return final_value === value_to_match;
		}));
	});

// 
// Filters for source values whose fields *don't* match the specified value.
// The first argument is the field to match against, remaining arguments are
// treated as a field chain.
// 
// Example:
// 
// Rx.Observable
//     .returnValue({ coords: { global: { x: 10 } } })
//     .whereEqualTo(10, 'coords.global', 'x')
//     .subscribe(function(obj) {
//         console.log(obj.coords.global.x); // prints 10
//     });
// 
add_impl(
	'whereNot',
	'whereNotEqualTo',
	function(value_to_not_match) {
		return this.where(chain(_.tail(arguments))(function(final_value) {
			return final_value !== value_to_not_match;
		}));
	});

// 
// Filters for source values whose values at the fields_or_method chain
// match the specified value.
// 
// Additional arguments are treated as arguments for the methods in the chain.
// See 'invoke' for more information on method chains.
// 
add_impl(
	'whereInvoke',
	'whereCallProperty',
	function(value_to_match, fields_or_methods) {
		return this.where(chain(fields_or_methods)(function(final_value){
			return final_value === value_to_match;
		}, _.tail(_.tail(arguments))));
	});

// 
// Filters for source values whose values at the fields_or_method chain
// *don't* match the specified value.
// 
// Additional arguments are treated as arguments for the methods in the chain.
// See 'invoke' for more information on method chains.
// 
add_impl(
	'whereInvokeNot',
	'whereCallPropertyNot',
	function(value_to_not_match, fields_or_methods) {
		return this.where(chain(fields_or_methods)(function(final_value){
			return final_value !== value_to_not_match;
		}, _.tail(_.tail(arguments))));
	});

// 
// Filters for source values that are greater than (>) the specified value.
// Additional arguments are treated as a field chain.
// 
add_impl(
	'gt',       
	'greaterThan',
	'whereGT',
	'whereGreaterThan',
	function(smaller_value) {
		return this.where(chain(_.tail(arguments))(function(final_value){
			return final_value > smaller_value;
		}));
	});

// 
// Filters for source values that are greater than or equal to (>=) the specified value.
// Additional arguments are treated as a field chain.
// 
add_impl(
	'gte',               
	'whereGTE',          
	'greaterThanOrEqualTo',
	'whereGreaterThanOrEqualTo',
	function(smaller_or_equal_value) {
		return this.where(chain(_.tail(arguments))(function(final_value){
			return final_value >= smaller_or_equal_value;
		}));
	});

// 
// Filters for source values that are less than (<) the specified value.
// Additional arguments are treated as a field chain.
// 
add_impl(
	'lt',    
	'whereLT',
	'lessThan',
	'whereLessThan',
	function(larger_value) {
		return this.where(chain(_.tail(arguments))(function(final_value){
			return final_value < larger_value;
		}));
	});

// 
// Filters for source values that are less than or equal to (<=) the specified value.
// Additional arguments are treated as a field chain.
// 
add_impl(
	'lte',            
	'whereLTE',        
	'lessThanOrEqualTo',
	'whereLessThanOrEqualTo',
	function(larger_or_equal_value) {
		return this.where(chain(_.tail(arguments))(function(final_value){
			return final_value <= larger_or_equal_value;
		}));
	});

// 
// Optionally dispatches the last value from the Observable sequence to the supplied
// onCompleted function. Rather than tracking the values in local state or using aggregate,
// takeLast, or publishLast, it's easier to do this. YMMV.
// 
// If onCompleted takes no arguments, it's invoked like normal.
// If onCompleted takes one argument, the last value is passed as the single argument.
// If onCompleted takes multiple arguments and the last value is an Array, the lastValue is
// applied to the function as a list of arguments.
// Otherwise the onComplete function is passed the last value as a single argument.
// 
add_impl(
	'subscribeWithLast',
	function(onNextOrObserver, onError, onCompleted) {
		
		var self = this;
		var lastValue = void(0);
		
	return this
		.doAction(function(val){ lastValue = val; })
		.subscribe(onNextOrObserver, onError, function() {
			
			if(onCompleted === void(0)) return;
			if(onCompleted === null) return;
			if(typeof onCompleted !== 'function') return;
			if(lastValue === void(0)) return onCompleted.call(self);
			if(onCompleted.length === 1) return onCompleted.call(self, lastValue);
			if(_.isArray(lastValue)) return onCompleted.apply(self, lastValue);
			
			onCompleted.call(self, lastValue);
		});
});

// 
// Applies source values to the onNext function as an arguments list with func.apply.
// 
add_impl(
	'subscribeMulti',
	'subscribeMultiple',
	function(onNextOrObserver, onError, onCompleted) {
		
		var context, isObserver, onNext;
		
		isObserver = (typeof onNextOrObserver === 'function') === false;
		context = isObserver ? onNextOrObserver : null;
		
		onNext = (function(next) {
			return function(value) {
				return (next.length === 1) ?
					next.call(context, value) :
					next.apply(context, _.isArray(value) ?
						value :
						[value]
					);
			}
		})(
			isObserver ?
				onNextOrObserver.onNext :
				onNextOrObserver
		);
		
		onError = isObserver ?
			_.bind(onNextOrObserver.onError, onNextOrObserver) :
			onError;
		
		onCompleted = isObserver ? 
			_.bind(onNextOrObserver.onCompleted, onNextOrObserver) :
			onCompleted;
		
		return this.subscribe(onNext, onError, onCompleted);
	});

// 
// Applies source values to the onNext function as an arguments list with func.apply
// and calls the onCompleted function with the last emitted value.
// 
add_impl(
	'subscribeMultiWithLast',
	'subscribeMultipleWithLast',
	function(onNextOrObserver, onError, onCompleted) {
		
		var self = this;
		var lastValue = void(0);
		
		return this
			.doAction(function(val){ lastValue = val; })
			.subscribeMultiple(onNextOrObserver, onError, function() {
				
				if(onCompleted === void(0)) return;
				if(onCompleted === null) return;
				if(typeof onCompleted !== 'function') return;
				if(lastValue === void(0)) return onCompleted.call(self);
				if(onCompleted.length === 1) return onCompleted.call(self, lastValue);
				if(_.isArray(lastValue)) return onCompleted.apply(self, lastValue);
				
				onCompleted.call(self, lastValue);
			});
	});

var globalCache = {};
function globalCacheSelector() { return globalCache; };

// 
// Memoizes an Observable sequence based on a key. New subscriptions for 
// sequences that have already been subscribed to are replayed the events
// from the original sequence.
// 
// Accepts an optional cacheSelector to supply a specific cache implementation.
// Also accepts an optional durationSelector, which supplies an Observable that
// emits a value to invalidate the cache for the key.
// 
add_impl(
	'memoize',
	function(keySelector, cacheSelector, durationSelector) {
		
		if(cacheSelector === void(0)) cacheSelector = globalCacheSelector;
		if(durationSelector === void(0)) durationSelector = function() { return Rx.Observable.never(); };
		
		var source = this;
		
		return Rx.Observable.createWithDisposable(function(observer) {
			
			var key = keySelector();
			var cache = cacheSelector();
			
			if(cache.hasOwnProperty(key) === false) cache[key] = source.replay().refCount();
			
			var subscriptions = new Rx.CompositeDisposable();
			
			var cacheObservable = Rx.Observable.switchCase(keySelector, cache);
			var durationObservable = durationSelector(key);
			
			var durationSubscription = durationObservable.take(1).subscribe(function(){}, null, function(){
				delete cache[key];
			});
			
			var switchSubscription = cacheObservable.subscribe(observer);
			
			subscriptions.add(durationSubscription);
			subscriptions.add(switchSubscription);
			
			return subscriptions;
		});
	});

var cookieCache = {};
function cookiesKeySelector() { return 'cookies'; };
function cookiesCacheSelector() { return cookieCache; };

Rx.Observable.cookies = function(durationSelector) {
	
	return Rx.Observable.createWithDisposable(function(observer) {
		
		var cookie = document.cookie;
		var values = cookie.split(/;\s*/);
		
		return Rx.Observable
			.fromArray(values)
			.select(function(value) {
				
				var index = value.indexOf('=');
				
				return [
					value.substring(0, index),
					value.substring(index + 1)
				]
			})
			.subscribe(observer);
	})
	.memoize(cookiesKeySelector, cookiesCacheSelector, durationSelector)
}

module.exports = Rx;

function tuple(a, b) {
	return [a, b];
};
function first() {
	return arguments[0];
};
function last() {
	return arguments[arguments.length - 1];
};
function merge() {
	return _.flatten(arguments, true);
};
function split(separator) {
	return function(str) {
		return str.split(separator);
	}
};

function chain() {
	
	var fields;
	
	fields = _.flatten(_.toArray(arguments));
	fields = _.flatten(_.map(fields, split('.')));
	
	return function(selector, chain_args_list) {
		
		if(chain_args_list === void(0)) chain_args_list = [];
		
		return function(value) {
			
			var args_list = chain_args_list.concat()
			
			return selector(_.reduce(fields, function(value, field) {
				
				var methodOrValue = value[field];
				
				if(typeof methodOrValue === 'function') {
					
					var args = args_list.shift();
					
					if(args === void(1)) args = [];
					
					return methodOrValue.apply(value, _.isArray(args) ? args : [args]);
				}
				
				return methodOrValue;
			}, value));
		}
	}
};
