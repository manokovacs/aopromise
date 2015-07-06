'use strict';

var Promise = require('bluebird');
var aop = require('../');
var AspectFrame = aop.AspectFrame;
var LoggerAspect = require('./aspects/LoggerAspect');
var BenchmarkAspect = require('./aspects/BenchmarkAspect');
var MemoizeAspect = require('./aspects/MemoizeAspect');

// quick start

function BeforeAfterLoggerAspect(funcName) {
	return new aop.AspectFrame(
		function (preOpts) {
			console.log(funcName, 'was called with', preOpts.args);
		},
		function (postOpts) {
			console.log(funcName, 'returned with', postOpts.result);
		}
	);
}

function addition(a, b) {
	console.log('adding', a, 'and', b);
	return a + b;
}

// wrapping function with aspect
var loggedAdder = aop(addition, new BeforeAfterLoggerAspect('AdditionFunction'));
// calling wrapped function
loggedAdder(3, 4);


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


