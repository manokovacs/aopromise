'use strict';
var aopromise = require('../');
var sinon = require('sinon');
var should = require('should');
var aop = aopromise.wrap;
var Builder = require('../lib/Builder');
var AspectFrame = require('../lib/AspectFrame');

describe('Builder', function () {
	it('adds aspect to wrapper', function (end) {
		var pre1 = sinon.spy();
		var pre2 = sinon.spy();
		new Builder(function (fn, aspectPack) {
			aspectPack.pre({})
				.then(function () {
					pre1.calledOnce.should.be.true();
					pre2.calledOnce.should.be.true();
					end();
				}).catch(end);
		})
			.aspect(new AspectFrame(pre1))
			.aspect(new AspectFrame(pre2))
			.fn(function () {

			});
	});
});