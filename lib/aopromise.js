'use strict';

var extend = require('extend');

var AspectPack = require('./AspectPack');
var aopromise = {
	wrap: wrapper,
	AspectPack: AspectPack,
	AspectFrame: require('./AspectFrame')
};


function wrapper(fn, aspectPack) {
	if (!(aspectPack instanceof AspectPack)) {
		var wrapperArgs = Array.prototype.slice.call(arguments);
		wrapperArgs.shift();
		aspectPack = new AspectPack(wrapperArgs);
	}

	return function () {
		var args = Array.prototype.slice.call(arguments);
		var data;
		var runner = function () {
			return fn.apply(this, args);
		};
		data = {args: args, runner: runner, originalFunction: fn};
		return aspectPack.pre(data)
			.then(function (preOptions) {
				data = extend(data, preOptions);
				var finalArgs = preOptions.newArguments || args;
				var finalFn = preOptions.newFunction || fn;
				return finalFn.apply(this, finalArgs);
			})
			.then(function (result) {
				data = extend(data, {result: result});
				return aspectPack.post(data)
					.then(function () {
						return result;
					});
			});
	}
}

module.exports = aopromise;