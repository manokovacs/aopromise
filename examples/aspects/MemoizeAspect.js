'use strict';
var Promise = require('bluebird');
var AspectFrame = require('../../').AspectFrame;
var crypto = require('crypto');

function MemoizeAspect(options) {
	var promiseMemory = {};
	return new AspectFrame(
		function (preOpts) {
			return Promise.resolve({newFunction: function(){
				var hash = crypto.createHash('sha1').update(JSON.stringify(preOpts.args)).digest('hex');
				if (typeof promiseMemory[hash] !== 'undefined') {
					return promiseMemory[hash];
				} else {
					// we are storing the promise as cached value, so no double calculation
					return promiseMemory[hash] = preOpts.runner();
				}
			}});
		}
	)
}

module.exports = MemoizeAspect;