'use strict';

var Promise = require('bluebird');
var aopromise = require('../');
var aop = aopromise.wrap;
var AspectPack = aopromise.AspectPack;
var LoggerAspect = require('./aspects/LoggerAspect');
var BenchmarkAspect = require('./aspects/BenchmarkAspect');
var MemoizeAspect = require('./aspects/MemoizeAspect');


function myFunc(num) {
	var obj = {some: 'data'};
	for (var i = 0; i < num * 100000; i++) { // relatively slow
		JSON.parse(JSON.stringify(obj));
	}
	console.log('myFunc body executed ' + num);
	return Promise.resolve(num * num);
}

var loggedMyFunc = aop(myFunc, new AspectPack([new LoggerAspect('log')]));
var doubleLoggedMyFunc = aop(myFunc, new LoggerAspect('outer'), new LoggerAspect('inner'));
var memoizedMyFunc = aop(myFunc, new MemoizeAspect());
var loggedAndMemoizedMyFunc = aop(myFunc, new LoggerAspect(), new MemoizeAspect());
var memoizedAndLoggedMyFunc = aop(myFunc, new MemoizeAspect(), new LoggerAspect());
var benchmarkedAndloggedAndMemoizedMyFunc = aop(myFunc, new BenchmarkAspect(), new LoggerAspect(), new MemoizeAspect());

Promise.resolve().then(function () {
	console.log('--- LOGGED ---');
	return loggedMyFunc(2);

}).then(function () {
	console.log('--- MEMOIZED ---');
	return memoizedMyFunc(3).then(console.log)
		.then(function () {
			return memoizedMyFunc(3).then(console.log)
		});
}).then(function () {
	console.log('--- DOUBLE LOGGED ---');
	return doubleLoggedMyFunc(4);
}).then(function () {
	console.log('--- LOGGED AND MEMOIZED---');
	return loggedAndMemoizedMyFunc(5).then(console.log)
		.then(function () {
			return loggedAndMemoizedMyFunc(5).then(console.log)
		});
}).then(function () {
	console.log('--- MEMOIZED AND LOGGED ---');
	return memoizedAndLoggedMyFunc(6).then(console.log)
		.then(function () {
			return memoizedAndLoggedMyFunc(6).then(console.log)
		});
}).then(function () {
	console.log('--- BENCHMARKED AND LOGGED AND MEMOIZED ---');
	console.log('--- second execution should be faster   ---');
	return benchmarkedAndloggedAndMemoizedMyFunc(7).then(console.log)
		.then(function () {
			// should be much faster due to memorize
			return benchmarkedAndloggedAndMemoizedMyFunc(7).then(console.log)
		});
});