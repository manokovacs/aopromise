'use strict';

var Promise = require('bluebird');

function AspectFrame(pre, post) {
	this.pre = function (options) {
		if (pre) {
			var promiseRes = pre(options);
			return promiseRes ? promiseRes : Promise.resolve();
		}
		return Promise.resolve();
	};
	this.post = function (options) {
		if (post) {
			var promiseRes = post(options);
			return promiseRes ? promiseRes : Promise.resolve();
		}
		return Promise.resolve();
	};
}


module.exports = AspectFrame;