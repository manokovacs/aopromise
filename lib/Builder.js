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
Builder._registeredAspects = {};
Builder.register = function (name, AspectClass) {
	function F(args) {
		return AspectClass.apply(this, args);
	}

	F.prototype = AspectClass.prototype;

	Builder.prototype[name] = function () {
		this.aspect(new F(arguments));
		return this;
	};

	Builder._registeredAspects[name] = 1;
};

Builder.unregister = function (name) {
	delete Builder.prototype[name];
	delete Builder._registeredAspects[name];
};

Builder.unregisterAll = function () {
	for (var regedAspect in Builder._registeredAspects) {
		Builder.unregister(regedAspect);
	}
};
