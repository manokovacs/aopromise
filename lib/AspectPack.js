'use strict';

var Promise = Promise || require('bluebird');
var extend = require('extend');

module.exports = function AspectPack(aspects) {

	var aspectsReverse = aspects.slice().reverse();

	this.pre = function (options) {
		return runAspects(aspects, 'pre', options);
	};
	this.post = function (options) {
		return runAspects(aspectsReverse, 'post', options);
	};

	function runAspects(aspects, side, options) {
		var promise = Promise.resolve();
		var resData = {};
		aspects.forEach(function (aspect) {
			if (aspect[side]) {
				promise = promise.then(function () {
					var aspectResPromise = aspect[side](options);
					try {
						return aspectResPromise.then(function (res) {
							if (typeof res === "object") {
								resData = extend(true, resData, res);
							}
						});
					} catch (err) { // yeah, not so promise
						return Promise.reject(new Error("Aspect " + side + "() did not return promise."));
					}
				});
			}
		});
		return promise.then(function () {
			return resData;
		});
	}
};
