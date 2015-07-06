'use strict';

var extend = require('extend');

var AspectPack = require('./AspectPack');
var aopromise = wrapper;
aopromise.wrap = wrapper;
aopromise.AspectPack = AspectPack;
aopromise.AspectFrame = require('./AspectFrame');


function wrapper(fn, aspectPack) {
	if (!(aspectPack instanceof AspectPack)) {
		var wrapperArgs = Array.prototype.slice.call(arguments);
		wrapperArgs.shift();
		aspectPack = new AspectPack(wrapperArgs);
	}

	return function () {
		var args, data, finalArgs, argsReplaced, functionReplaced, runner;
		args = Array.prototype.slice.call(arguments);
		Object.freeze(args);
		runner = function () {
			return fn.apply(this, args);
		};
		data = {args: args, runner: runner, originalFunction: fn};
		return aspectPack.pre(data)
			.then(function (preOptions) {
				data = extend(data, preOptions);
				finalArgs = preOptions.newArgs || args;
				argsReplaced = !!preOptions.newArgs;
				var finalFn = preOptions.newFunction || fn;
				functionReplaced = !!preOptions.newFunction;
				return finalFn.apply(this, finalArgs);
			})
			.then(function (result) {
				data = extend(data, {
					result: result,
					argsReplaced: argsReplaced,
					args: finalArgs,
					functionReplaced: functionReplaced
				});
				if (argsReplaced) {
					data.originalArgs = args;
				}
				return aspectPack.post(data)
					.then(function (postOptions) {
						return result;
					});
			});
	}
}

module.exports = aopromise;