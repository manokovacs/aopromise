'use strict';

var Promise = require('bluebird');
var aop = require('../');
var AspectFrame = aop.AspectFrame;
var LoggerAspect = require('./aspects/LoggerAspect');
var BenchmarkAspect = require('./aspects/BenchmarkAspect');
var MemoizeAspect = require('./aspects/MemoizeAspect');

// quick start


// Have your aspect registered once
aop.register('logger', BeforeAfterLoggerAspect); // see definition below


// take a sync or promise-returning function
function addition(a, b) {
	console.log('adding', a, 'and', b);
	return a + b;
}

// Add you aspect using chaining
var loggedAdder = aop()
	.logger('AdditionFunction')
	.fn(addition);


// You may also use this syntax. The result is identical
loggedAdder = aop(addition, new BeforeAfterLoggerAspect('AdditionFunction')); // aspect declared below


// calling wrapped functions
loggedAdder(3, 4);
// outputs
// AdditionFunction was called with [ 3, 4 ]
// adding 3 and 4
// AdditionFunction returned with 7


/**
 * Defining aspect. Using AspectFrame for factory.
 */
function BeforeAfterLoggerAspect(funcName) {
	return new aop.AspectFrame(
		function (preOpts) {
			console.log(funcName || preOpts.originalFunction.name, 'was called with', preOpts.args);
		},
		function (postOpts) {
			console.log(funcName || postOpts.originalFunction.name, 'returned with', postOpts.result);
		}
	);
}


/**
 * Declaring aspect. Using AspectFrame for factory.
 */
function BeforeAfterLoggerAspect(funcName) {
	return new aop.AspectFrame(
		function (preOpts) {
			console.log(funcName || preOpts.originalFunction.name, 'was called with', preOpts.args);
		},
		function (postOpts) {
			console.log(funcName || postOpts.originalFunction.name, 'returned with', postOpts.result);
		}
	);
}



// interruption
function OnlyNumberArgumentsAspect() {
	return new aop.AspectFrame(
		function (preOpts) {
			// we are cloning the args with the slice function, since it is effective immutable
			for (var i in preOpts.args) {
				if (typeof(preOpts.args[i]) !== 'number') {
					return Promise.reject('Argument #' + i + ' is not a number (' + typeof(e) + ' was given)');
				}
			}
			;
			return Promise.resolve();
		}
	);
}

var numberOnlyFunc = aop(
	function () {
		console.log('This function surely called with numbers only', arguments);
	},
	new OnlyNumberArgumentsAspect()
);

// will run ok
numberOnlyFunc(1, 2, 3).then(function () {
	console.log('ok, numbers only');
}).catch(console.log);

// output error
numberOnlyFunc(1, 'oh-oh, not good, noooot good', 3).then(function () {
	console.log('ok, numbers only');
}).catch(console.log);


// replacing arguments

function AddExtraArgumentAspect(extraArgument) {
	return new aop.AspectFrame(
		function (preOpts) {
			// we are cloning the args with the slice function, since it is effective immutable
			var _args = preOpts.args.slice();
			_args.push(extraArgument);
			return Promise.resolve({newArgs: _args});
		}
	);
}

aop(
	function () {
		console.log('function called with', arguments);
	},
	new AddExtraArgumentAspect('additionArgValue')
)('normalArgument');


