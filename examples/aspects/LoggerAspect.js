'use strict';
var AspectFrame = require('../../').AspectFrame;

module.exports = LoggerAspect;

function LoggerAspect(options) {
	return new AspectFrame(
		function (preOpts) {
			console.log('pre', options || '');
		},
		function (postOpts) {
			console.log('post', options || '');
		}
	)
}

