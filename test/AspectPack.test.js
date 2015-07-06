'use strict';
var aopromise = require('../');
var sinon = require('sinon');
var should = require('should');
var aop = aopromise.wrap;
var AspectPack = aopromise.AspectPack;
var AspectFrame = aopromise.AspectFrame;

describe('AspectPack', function () {
	var BadPreAspect = function () {
		this.pre = function () {
			// not returning promise
		}
	};
	var BadPostAspect = function () {
		this.post = function () {
			// not returning promise
		}
	};

	it('fails gracefully if aspect does not return promise in pre', function (end) {
		new AspectPack([new BadPreAspect()]).pre()
			.then(function () {
				end(new Error('should not pass'));
			})
			.catch(function (err) {
				should(err.message).equal('Aspect pre() did not return promise.');
				end();
			});
	});

	it('fails gracefully if aspect does not return promise in post', function (end) {
		new AspectPack([new BadPostAspect()]).post()
			.then(function () {
				end(new Error('should not pass'));
			})
			.catch(function (err) {
				should(err.message).equal('Aspect post() did not return promise.');
				end();
			});
	});
});