var _  = require('underscore');
var Rx = require('rx');

var observableProto = Rx.Observable.prototype;
var originalObservableSubscribe = observableProto.subscribe;

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
	return _.flatten.apply(_, _.toArray(arguments).concat(true));
};
function split(separator) {
	return function(str) {
		return str.split(separator);
	}
};

function make_chain_walker(chain) {
	
	chain = _.flatten(arguments);
	chain = _.map(chain, split('.'));
		
	return function(selector, args) {
		return function(value) {
			
			value = _.reduce(chain, function(value, field) {
				var methodOrValue = value[field];
				return typeof methodOrValue === 'function' ?
					methodOrValue.apply(value, args) :
					methodOrValue;
			}, value);
			
			return selector(value);
		}
	}
}

module.exports = function(replace_default_subscribe) {
	
	if(replace_default_subscribe === void(0)) replace_default_subscribe = false;
	
	// Combine from both sources until either source completes.
	observableProto.combineUntil = function(second, selector) {
		
		var finalA, finalB, finished;
		
		finalA = this.finalValue();
		finalB = this.finalValue();
		
		finished = Rx.Observable.merge(finalA, finalB);
		
		return this.combineLatest(second, selector).takeUntil(finished);
	}

	// Combine from both sources until the source Observable completes.
	observableProto.combineUntilFirst = function(second, selector) {
		var finished = this.finalValue();
		
		return this.combineLatest(second, selector).takeUntil(finished);
	}

	// Combine from both sources until the second Observable completes.
	observableProto.combineUntilSecond = function(second, selector) {
		var finished = second.finalValue();
		
		return this.combineLatest(second, selector).takeUntil(finished);
	}

	// Combines both sources into a Tuple[a, b]
	observableProto.combinePair    =
	observableProto.combineTuple   = 
	observableProto.combineAsPair  =
	observableProto.combineAsTuple = function(second) {
		return this.combineLatest(second, tuple);
	}

	// Combines both sources into a Tuple[a, b] until either source completes.
	observableProto.combinePairUntil    =
	observableProto.combineTupleUntil   =
	observableProto.combineAsPairUntil  =
	observableProto.combineAsTupleUntil = function(second) {
		return this.combineUntil(second, tuple);
	}

	// Combines both sources into a Tuple[a, b] until the source Observable completes.
	observableProto.combinePairUntilFirst    =
	observableProto.combineTupleUntilFirst   =
	observableProto.combineAsPairUntilFirst  =
	observableProto.combineAsTupleUntilFirst = function(second) {
		return this.combineUntilFirst(second, tuple);
	}

	// Combines both sources into a Tuple[a, b] until the second Observable completes.
	observableProto.combinePairUntilSecond    =
	observableProto.combineTupleUntilSecond   =
	observableProto.combineAsPairUntilSecond  =
	observableProto.combineAsTupleUntilSecond = function(second) {
		return this.combineUntilSecond(second, tuple);
	}

	// Combines both sources, but only takes values from the source Observable.
	observableProto.combineFirst     =
	observableProto.combineTakeFirst = function(second) {
		return this.combineLatest(second, first);
	}

	// Combines both sources, but only takes values from the second Observable.
	observableProto.combineSecond     =
	observableProto.combineTakeSecond = function(second) {
		return this.combineLatest(second, last);
	}

	// Combines both sources, merging the results into a variable-length Array of values.
	// For example, if each source dispatches a Tuple[a, b], `combineMultiple` will
	// dispatch an Array of 4 values, [a1, b1, a2, b2].
	observableProto.combineAll      = 
	observableProto.combineMultiple = function(second) {
		return this.combineLatest(second, merge);
	}
	
	observableProto.asList   =
	observableProto.asArray  =
	observableProto.scanList =
	observableProto.scanArray = function() {
		return this.scan([], function(list, item){
			list.push(item);
			return list;
		});
	}

	// Selects a value by optionally applying variable-length input Array values to
	// the selector function. The optional count and parent arguments are appended
	// to the end of the argumnts list.
	observableProto.multiSelect    =
	observableProto.selectMulti    =
	observableProto.selectMultiple = function(selector, thisArg) {
		
		return this.select(function(value, count, parent) {
			
			var args, result, results;
			
			args = _.isArray(value) ? value : [value];
			
			return selector.length === 1 ?
				selector.call(thisArg, value) :
				selector.apply(thisArg, args.concat(count, this));
			
		}, thisArg);
	}

	// Selects a value or values from the source sequence, emitting
	// a variable-length Array of the input values concatonated with
	// the selected values.
	// For example:
	// 
	// Rx.Observable.returnValue([1, 2])
	//	  .selectConcat(function() { return [3, 4] })
	//    .subscribe(function(values){
	//        console.log(values); // prints [1, 2, 3, 4]
	//  });
	observableProto.concatSelect =
	observableProto.selectConcat = function(selector, thisArg) {
		
		return this.select(function(value, count, parent) {
			
			var args, result, results;
			
			args = _.isArray(value) ? value : [value];
			
			result = selector.length === 1 ?
				selector.call(thisArg, value) :
				selector.apply(thisArg, args.concat(count, this));
			
			results = args.concat(result);
			
			return results;
		}, thisArg);
	}
	
	// Selects the field value from each source value.
	observableProto.pluck          =
	observableProto.selectField    =
	observableProto.selectProperty = function(field) {
		return this.select(function(value) {
			return value[field];
		});
	}
	
	// Selects the field chain from each source value.
	// A field chain can be specified as a string, or a list
	// of arguments.
	// 
	// For example:
	// Rx.Observable
	//    .returnValue({ coords: { global: {x: 10 } } })
	//    .selectFields('coords.global', 'x')
	//    .subscribe(function(x_value) {
	//       console.log(value); // prints 10
	//    });
	// 
	observableProto.pluckChain    =
	observableProto.pluckMulti    =
	observableProto.pluckMultiple =
	observableProto.selectFields  = function() {
		
		var fields = _.flatten(_.map(arguments, split('.')));
		
		return this.select(function(value) {
			
			var chain = fields.slice();
			
			while(chain.length > 0) value = value[chain.shift()];
			
			return value;
		});
	}
	
	// Invokes the function at method_name for each source value.
	// Uses each source value as the invocation context.
	// 
	// If the value at method_name isn't a function, value value is
	// selected instead.
	// 
	// Extra arguments passed after method_name are applied to
	// the method during invocation.
	//
	// TODO: Use these aliases also?
	// observableProto.callFunction = 
	// observableProto.callMethod   = 
	observableProto.invoke       =
	observableProto.callProperty = function(method_name) {
		
		var args = _.tail(arguments);
		
		return this.select(function(value) {
			
			var method = value[method_name];
			
			return typeof method == 'function' ?
				method.apply(value, args) :
				method;
		});
	}
	
	// Filters for source values whose fields match the specified value.
	// The first argument is the field to match. Remaining arguments are
	// treated as a field chain. For example:
	// Rx.Observable
	//    .returnValue({ coords: { global: { x: 10 } } })
	//    .whereField(10, 'coords.global', 'x')
	//    .subscribe(function(obj) {
	//       console.log(obj.coords.global.x); // prints 10
	//    });
	// 
	
	observableProto.whereField   =
	observableProto.whereEqual   =
	observableProto.whereFields  =
	observableProto.whereEquals  =
	observableProto.whereEqualTo = function(value_to_match) {
		
		var args, matcher;
		
		args = _.tail(arguments);
		matcher = make_chain_walker(args)(function(final_value) {
			return final_value === value_to_match;
		});
		
		return this.where(matcher);
	}
	
	// Filters for source values where the return value of the 
	// specified method_name matches the specified value.
	// Like Rx.Observable.callProperty, if the value at the method
	// name isn't a function, the value is directly compared to the
	// specified matcher value.
	observableProto.whereInvoke       =
	observableProto.whereCallProperty = function(value_to_match, method_or_field_chain) {
		
		var args, matcher;
		
		args = _.tail(_.tail(arguments));
		matcher = make_chain_walker(method_or_field_chain)(function(final_value) {
			return final_value === value_to_match;
		}, args);
		
		return this.where(matcher);
	}
	
	observableProto.gt               =
	observableProto.GT               =
	observableProto.greaterThan      =
	observableProto.whereGT          =
	observableProto.whereGreaterThan = function(smaller_value) {
		
		var args, matcher;
		
		args = _.tail(arguments);
		matcher = make_chain_walker(args)(function(final_value) {
			return final_value > smaller_value;
		});
		
		return this.where(matcher);
	}
	
	observableProto.gte                       =
	observableProto.GTE                       =
	observableProto.greaterThanOrEqualTo      =
	observableProto.whereGTE                  =
	observableProto.whereGreaterThanOrEqual   =
	observableProto.whereGreaterThanOrEqualTo = function(smaller_or_equal_value) {
		
		var args, matcher;
		
		args = _.tail(arguments);
		matcher = make_chain_walker(args)(function(final_value){
			return final_value >= smaller_or_equal_value;
		});
		
		return this.where(matcher);
	}
	
	observableProto.lt            =
	observableProto.LT            =
	observableProto.lessThan      =
	observableProto.whereLT       =
	observableProto.whereLessThan = function(larger_value) {
		
		var args, matcher;
		
		args = _.tail(arguments);
		matcher = make_chain_walker(args)(function(final_value){
			return final_value < larger_value;
		});
		
		return this.where(matcher);
	}
	
	observableProto.lte                    =
	observableProto.LTE                    =
	observableProto.lessThanOrEqualTo      =
	observableProto.whereLTE               = 
	observableProto.whereLessThanOrEqual   = 
	observableProto.whereLessThanOrEqualTo = function(larger_or_equal_value) {
		
		var args, matcher;
		
		args = _.tail(arguments);
		matcher = make_chain_walker(args)(function(final_value){
			return final_value <= larger_or_equal_value;
		});
		
		return this.where(matcher);
	}
	
	// Optionally dispatches the last value from the Observable sequence to the supplied
	// onCompleted function.
	// If onCompleted takes no arguments, it's invoked like normal.
	// If onCompleted takes one argument, the last value is passed as the single argument.
	// If onCompleted takes multiple arguments and the last value is an Array, the lastValue is
	// applied to the function as a list of arguments.
	// Otherwise the onComplete function is passed the last value as a single argument.
	observableProto.subscribeWithLast = function(onNextOrObserver, onError, onCompleted) {
		
		var self = this;
		var lastValue = void(0);
		
		return this
			.doAction(function(val){ lastValue = val; })
			.subscribe(onNextOrObserver, onError, function() {
				
				if(onCompleted === void(0)) return;
				if(onCompleted === null) return;
				if(typeof onCompleted != 'function') return;
				
				if(lastValue === void(0) || onCompleted.length === 0) return onCompleted.call(self);
				
				if(onCompleted.length === 1) return onCompleted.call(self, lastValue);
				
				if(_.isArray(lastValue)) return onCompleted.apply(self, lastValue);
				
				onCompleted.call(self, lastValue);
			});
	}
	
	// Applies variable-length Array inputs to a variable-length onNext subscription.
	observableProto.subscribeMulti    =
	observableProto.subscribeMultiple = function(onNextOrObserver, onError, onCompleted) {
		
		var self, context, isObserver, onNext;
		
		self = this;
		isObserver = (typeof onNextOrObserver === 'function') === false;
		context = isObserver ? onNextOrObserver : null;
		
		onNext = (function(next) {
			return function(value) {
				
				if(next.length === 1) return next.call(context, value);
				
				value = _.isArray(value) ? value : [value];
				
				next.apply(context, value);
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
		
		return this.forEach(onNext, onError, onCompleted);
	}
	
	// This probably breaks backwards-compatability.
	if(replace_default_subscribe) {
		observableProto.subscribe = observableProto.subscribeMultiple;
	}
	
	return Rx;
}