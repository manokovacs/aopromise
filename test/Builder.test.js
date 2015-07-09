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

	it('should allow to use registered aspect', function (end) {
		var pre1 = sinon.spy();
		var pre2 = sinon.spy();
		Builder.register('aspect1', function () {
			return new AspectFrame(pre1);
		});
		Builder.register('aspect2', function () {
			return new AspectFrame(pre2);
		});

		var builder = new Builder(function (fn, aspectPack) {
			aspectPack.pre({})
				.then(function () {
					pre1.calledOnce.should.be.true();
					pre2.calledOnce.should.be.true();
					end();
				}).catch(end);
		});
		builder
			.aspect1()
			.aspect2()
			.fn(function () {

			});
		Builder.unregister('aspect1');
		Builder.unregister('aspect2');
	});

	it('should remove registered call aspect', function (end) {
		var pre1 = sinon.spy();
		Builder.register('aspect1', function () {
			return new AspectFrame(pre1);
		});

		new Builder().aspect1();
		Builder.unregister('aspect1');

		try {
			new Builder().aspect1();
			end(new Error('aspect1 should be have been removed'));
		} catch (err) {
			end();
		}
	});
});