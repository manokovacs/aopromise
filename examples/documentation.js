'use strict';

var Promise = require('bluebird');
var aopromise = require('../');
var AspectFrame = aopromise.AspectFrame;
var aop = aopromise.wrap;
var LoggerAspect = require('./aspects/LoggerAspect');
var BenchmarkAspect = require('./aspects/BenchmarkAspect');
var MemoizeAspect = require('./aspects/MemoizeAspect');

// quick start

function BeforeAfterLoggerAspect(funcName) {
	return new AspectFrame(
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
