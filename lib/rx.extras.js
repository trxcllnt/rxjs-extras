var _  = require('underscore');
var Rx = require('rx');

var observableProto = Rx.Observable.prototype;

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

function chain(fields) {
	
	fields = _.flatten(arguments);
	fields = _.map(fields, split('.'));
	
	return function(selector, args) {
		return function(value) {
			return selector(_.reduce(fields, function(value, field) {
				
				var methodOrValue = value[field];
				
				if(typeof methodOrValue === 'function') {
					var xs = args.shift();
					return methodOrValue.apply(value, _.isArray(xs) ? xs : [xs]);
				}
				
				return methodOrValue;
			}, value));
		}
	}
}

// Combine from both sources until either source completes.
observableProto.combineUntil = function(second, selector) {
	
	var finalA, finalB, finished;
	
	finalA = this.finalValue();
	finalB = second.finalValue();
	
	finished = Rx.Observable.amb(finalA, finalB);
	
	return this
		.combineLatest(second, selector)
		.takeUntil(finished);
}

// Combine from both sources until the source Observable completes.
observableProto.combineUntilFirst = function(second, selector) {
	return this
		.combineLatest(second, selector)
		.takeUntil(this.finalValue());
}

// Combine from both sources until the second Observable completes.
observableProto.combineUntilSecond = function(second, selector) {
	return this
		.combineLatest(second, selector)
		.takeUntil(second.finalValue());
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

// Combines both sources, merging the results into a
// variable-length Array of values. For example, if
// each source dispatches a Tuple[a, b], `combineMultiple`
// will dispatch an Array of 4 values, [a1, b1, a2, b2].
observableProto.combineAll      = 
observableProto.combineMerge    = 
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

// Selects a value by applying the source Array values to the
// selector function as arguments. The optional count and parent
// arguments are appended to the end of the arguments list.
observableProto.multiSelect    =
observableProto.selectMulti    =
observableProto.selectMultiple = function(selector, thisArg) {
	
	return this.select(function(value, count, parent) {
		
		var args, result, results;
		
		args = _.isArray(value) ? value : [value];
		
		return selector.apply(thisArg, args.concat(count, this));
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

// Selects the field chain from each source value.
// A field chain can be a string or a list of arguments.
// 
// For example:
// 
// Rx.Observable
//    .returnValue({ coords: { global: {x: 10 } } })
//    .pluck('coords', 'global', 'x')
//    .subscribe(function(x_value) {
//       console.log(x_value); // prints 10
//    });
// 
// The arguments to pluck could be in any format:
// pluck('coords.global.x')
// pluck('coords.global', 'x')
// pluck('coords', 'global.x')
// ...etc.
//
observableProto.pluck          =
observableProto.selectP        =
observableProto.selectProp     =
observableProto.selectField    =
observableProto.selectProperty = function() {
	return this.select(chain(arguments)(_.identity));
}

// Invokes the function chain for each source value.
// Uses each source value as the invocation context.
// 
// If the value in the chain isn't a function, the value is
// selected for instead.
// 
// Arguments passed after method_name are applied to the method
// during invocation.
observableProto.invoke       =
observableProto.callProperty = function(method_chain) {
	return this.select(chain(method_chain)(
		_.identity,
		_.tail(arguments)
	));
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
	return this.where(chain(_.tail(arguments))(function(final_value){
		return final_value === value_to_match;
	}));
}

// Filters for source values where the return value of the 
// specified method_name matches the specified value.
// Like Rx.Observable.callProperty, if the value at the method
// name isn't a function, the value is directly compared to the
// specified matcher value.
observableProto.whereInvoke       =
observableProto.whereCallProperty = function(value_to_match, methods) {
	return this.where(chain(methods)(function(final_value){
		return final_value === value_to_match;
	}, _.tail(_.tail(arguments))));
}

observableProto.gt               =
observableProto.GT               =
observableProto.greaterThan      =
observableProto.whereGT          =
observableProto.whereGreaterThan = function(smaller_value) {
	return this.where(chain(_.tail(arguments))(function(final_value){
		return final_value > smaller_value;
	}));
}

observableProto.gte                       =
observableProto.GTE                       =
observableProto.greaterThanOrEqualTo      =
observableProto.whereGTE                  =
observableProto.whereGreaterThanOrEqual   =
observableProto.whereGreaterThanOrEqualTo = function(smaller_or_equal_value) {
	return this.where(chain(_.tail(arguments))(function(final_value){
		return final_value >= smaller_value;
	}));
}

observableProto.lt            =
observableProto.LT            =
observableProto.lessThan      =
observableProto.whereLT       =
observableProto.whereLessThan = function(larger_value) {
	return this.where(chain(_.tail(arguments))(function(final_value){
		return final_value < larger_value;
	}));
}

observableProto.lte                    =
observableProto.LTE                    =
observableProto.lessThanOrEqualTo      =
observableProto.whereLTE               = 
observableProto.whereLessThanOrEqual   = 
observableProto.whereLessThanOrEqualTo = function(larger_or_equal_value) {
	return this.where(chain(_.tail(arguments))(function(final_value){
		return final_value <= larger_value;
	}));
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
			if(typeof onCompleted !== 'function') return;
			if(lastValue === void(0)) return onCompleted.call(self);
			if(onCompleted.length === 1) return onCompleted.call(self, lastValue);
			if(_.isArray(lastValue)) return onCompleted.apply(self, lastValue);
			
			onCompleted.call(self, lastValue);
		});
}

// Applies variable-length Array inputs to a variable-length onNext subscription.
observableProto.subscribeMulti    =
observableProto.subscribeMultiple = function(onNextOrObserver, onError, onCompleted) {
	
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
	
	return this.forEach(onNext, onError, onCompleted);
}

module.exports = Rx;