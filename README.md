rx-js-extras
============

A few RxJS extension methods to make working with Observables easier.

```javascript
var _  = require('underscore');
var Rx = require('rx');

var observableProto = Rx.Observable.prototype;

// 
// Combine from both sources until either source completes.
// 
observableProto.combineUntil = function(second, selector) {};

// 
// Combine from both sources until the source Observable completes.
// 
observableProto.combineUntilFirst = function(second, selector) {};

// 
// Combine from both sources until the second Observable completes.
// 
observableProto.combineUntilSecond = function(second, selector) {};

// 
// Combines both sources into a Tuple[a, b]
// 
observableProto.combinePair    =
observableProto.combineTuple   = 
observableProto.combineAsPair  =
observableProto.combineAsTuple = function(second) {};

// 
// Combines both sources into a Tuple[a, b] until either source completes.
// 
observableProto.combinePairUntil    =
observableProto.combineTupleUntil   =
observableProto.combineAsPairUntil  =
observableProto.combineAsTupleUntil = function(second) {};

// 
// Combines both sources into a Tuple[a, b] until the source Observable completes.
// 
observableProto.combinePairUntilFirst    =
observableProto.combineTupleUntilFirst   =
observableProto.combineAsPairUntilFirst  =
observableProto.combineAsTupleUntilFirst = function(second) {};

// 
// Combines both sources into a Tuple[a, b] until the second Observable completes.
// 
observableProto.combinePairUntilSecond    =
observableProto.combineTupleUntilSecond   =
observableProto.combineAsPairUntilSecond  =
observableProto.combineAsTupleUntilSecond = function(second) {};

// 
// Combines both sources, but only takes values from the source Observable.
// 
observableProto.combineFirst     =
observableProto.combineTakeFirst = function(second) {};

// 
// Combines both sources, but only takes values from the second Observable.
// 
observableProto.combineSecond     =
observableProto.combineTakeSecond = function(second) {};

// 
// Combines both sources, merging the results into a
// variable-length Array of values. For example, if
// each source dispatches a Tuple[a, b], `combineMultiple`
// will dispatch an Array of 4 values, [a1, b1, a2, b2].
// 
observableProto.combineAll      = 
observableProto.combineMerge    = 
observableProto.combineMultiple = function(second) {};

// 
// Scans the source values into an Array.
// 
observableProto.asList   =
observableProto.asArray  =
observableProto.scanList = function() {};

// 
// Scans the source values into an Array with Array.prototype.concat,
// which means if a source value is an Array, the source Array's
// values will be inserted into the emitted Array.
// 
observableProto.scanConcat = function() {};

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
observableProto.multiSelect    =
observableProto.selectMulti    =
observableProto.selectMultiple = function(selector, thisArg) {};

observableProto.mulitScan    =
observableProto.scanMulti    =
observableProto.scanMultiple = function(memoOrSelector, selector) {};

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
observableProto.concatSelect =
observableProto.selectConcat = function(selector, thisArg) {};

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
observableProto.pluck          =
observableProto.field          =
observableProto.valueOf        =
observableProto.property       =
observableProto.selectField    =
observableProto.selectValueAt  =
observableProto.selectProperty = function() {};

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
//     console.log(bottom); // prints 110
// })
// 
observableProto.invoke       =
observableProto.callMethod   =
observableProto.callFunction =
observableProto.callProperty = function(methods) {};

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
observableProto.whereEquals  =
observableProto.whereFieldIs =
observableProto.whereValueIs =
observableProto.whereEqualTo = function(value_to_match) {};

// 
// Filters for source values whose values at the field_or_method chain
// match the specified value.
// 
// Additional arguments are treated as arguments for the methods in the chain.
// See observableProto.invoke for more information on method chains.
// 
observableProto.whereInvoke       =
observableProto.whereCallProperty = function(value_to_match, fields_or_methods) {};

// 
// Filters for source values that are greater than (>) the specified value.
// Additional arguments are treated as a field chain.
// 
observableProto.gt               =
observableProto.greaterThan      =
observableProto.whereGT          =
observableProto.whereGreaterThan = function(smaller_value) {};

// 
// Filters for source values that are greater than or equal to (>=) the specified value.
// Additional arguments are treated as a field chain.
// 
observableProto.gte                       =
observableProto.whereGTE                  =
observableProto.greaterThanOrEqualTo      =
observableProto.whereGreaterThanOrEqualTo = function(smaller_or_equal_value) {};

// 
// Filters for source values that are less than (<) the specified value.
// Additional arguments are treated as a field chain.
// 
observableProto.lt            =
observableProto.whereLT       =
observableProto.lessThan      =
observableProto.whereLessThan = function(larger_value) {};

// 
// Filters for source values that are less than or equal to (<=) the specified value.
// Additional arguments are treated as a field chain.
// 
observableProto.lte                    =
observableProto.whereLTE               = 
observableProto.lessThanOrEqualTo      =
observableProto.whereLessThanOrEqualTo = function(larger_or_equal_value) {};

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
observableProto.subscribeWithLast = function(onNextOrObserver, onError, onCompleted) {};

// 
// Applies source values to the onNext function as an arguments list with func.apply.
// 
observableProto.subscribeMulti    =
observableProto.subscribeMultiple = function(onNextOrObserver, onError, onCompleted) {};

// 
// Applies source values to the onNext function as an arguments list with func.apply
// and calls the onCompleted function with the last emitted value.
// 
observableProto.subscribeMultiWithLast    =
observableProto.subscribeMultipleWithLast = function(onNextOrObserver, onError, onCompleted) {}
```
