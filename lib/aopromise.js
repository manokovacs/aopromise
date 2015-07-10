'use strict';

var extend = require('extend');

var AspectPack = require('./AspectPack');
var Builder = require('./Builder');

var aopromise = module.exports = wrapper;
aopromise.wrap = wrapper;
aopromise.AspectPack = AspectPack;
aopromise.AspectFrame = require('./AspectFrame');
aopromise.register = Builder.register;
aopromise.unregister = Builder.unregister;


function wrapper(fn, aspectPack) {
	if (arguments.length === 0) {
		return new Builder(wrapper);
	}

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
			.then(function (preOutput) {
				data = extend(data, preOutput);
				finalArgs = preOutput.newArgs || args;
				argsReplaced = !!preOutput.newArgs;
				var finalFn = preOutput.newFunction || fn;
				functionReplaced = !!preOutput.newFunction;
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
					.then(function (postOutput) {
						if (postOutput.hasOwnProperty('newResult')) {
							return postOutput.newResult;
						} else {
							return result;
						}
					});
			});
	}
}

