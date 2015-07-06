'use strict';
var AspectPack = require('./AspectPack');

module.exports = Builder;

function Builder(wrapper) {
	var aspects = [];
	var self = this;
	self.aspect = function (aspect) {
		aspects.push(aspect);
		return self;
	};
	self.fn = function (func) {
		return wrapper(func, new AspectPack(aspects));
	};
}

Builder.register = function (name, AspectClass) {
	Builder.prototype[name] = (function () {
		function F(args) {
			return AspectClass.apply(this, args);
		}

		F.prototype = AspectClass.prototype;
		return function () {
			return new F(arguments);
		}
	})();
};
