'use strict';

var Promise = require('bluebird');
var extend = require('extend');

module.exports = function AspectPack(aspects) {

	var aspectsReverse = aspects.slice().reverse();

	this.pre = function (options) {
		return runAspects(aspects, 'pre', options);
	};
	this.post = function (options) {
		return runAspects(aspectsReverse, 'post', options);
	};

	this.init = function (options) {
		var res = {};
		aspects.forEach(function (aspect) {
			if (aspect['init']) {
				var aspectRes = aspect.init(options);
				if (typeof aspectRes === 'object') {
					res = extend(true, res, aspectRes);
				}
			}
		});
		return res;
	};

	this.catch = function (err) {
		var rejectedPromise = Promise.reject(err);
		aspectsReverse.forEach(function (aspect) {
			if (aspect['catch']) {
				rejectedPromise = rejectedPromise.catch(aspect.catch);
			}
		});
		return rejectedPromise
	};

	function runAspects(aspects, side, options) {
//		return Promise.reduce(aspects, function (totalRes, aspect) {
//			if (!aspect[side]) return totalRes;
//			var aspectResPromise = aspect[side](options);
//			try {
//				return aspectResPromise.then(function (res) {
//					if (typeof res === "object") {
//						totalRes = extend(true, totalRes, res);
//					}
//					return totalRes;
//				});
//			} catch (err) { // yeah, not so promise
//				return Promise.reject(new Error("Aspect " + side + "() did not return promise."));
//			}
//		}, {});
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
