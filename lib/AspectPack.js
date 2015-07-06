'use strict';

var Promise = Promise || require('bluebird');
var extend = require('extend');

function AspectPack(aspects) {

	var aspectsReverse = aspects.slice().reverse();

	this.pre = function (options) {
		return runAspect(aspects, 'pre', options);
	};
	this.post = function (options) {
		return runAspect(aspectsReverse, 'post', options);
	};

	function runAspect(aspects, side, options) {
		var promise = Promise.resolve();
		var resData = {};
		aspects.forEach(function (aspect) {
			if (aspect[side]) {
				promise = promise.then(function () {
					return aspect[side](options).then(function (res) {
						if (typeof res === "object") {
							resData = extend(true, resData, res);
						}
					});
				});
			}
		});
		return promise.then(function () {
			return resData;
		});
	}
}

module.exports = AspectPack;