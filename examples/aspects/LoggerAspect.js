'use strict';
var AspectFrame = require('../../').AspectFrame;

module.exports = LoggerAspect;

function LoggerAspect(options) {
	return new AspectFrame(
		function (preOpts) {
			console.log(options || '', preOpts.originalFunction.name, 'was called with', preOpts.args);
		},
		function (postOpts) {
			console.log(options || '', postOpts.originalFunction.name, 'returned with', postOpts.result);
		}
	)
}

