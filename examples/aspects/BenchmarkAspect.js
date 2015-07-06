'use strict';
var AspectFrame = require('../../').AspectFrame;
var Promise = require('bluebird');

function BenchmarkAspect() {
	return new AspectFrame(
		function () {
			return Promise.resolve({_startTime: process.hrtime()});
		},
		function (opts) {
			var diff = process.hrtime(opts._startTime);
			console.log('Futasido: ' + (diff[0] + diff[1] / 1e9));
		}
	);
}

module.exports = BenchmarkAspect;