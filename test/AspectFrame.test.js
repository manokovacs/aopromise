'use strict';
var aopromise = require('../');
var sinon = require('sinon');
var should = require('should');
var aop = aopromise.wrap;
var AspectPack = aopromise.AspectPack;
var AspectFrame = aopromise.AspectFrame;
module.exports = {};

describe('AspectFrame', function () {
	it('should call pre callback at .pre()', function () {
		var cb = sinon.spy();
		new AspectFrame(cb).pre();
		cb.calledOnce.should.be.true();
	});
	it('should call post callback at .post()', function () {
		var cb = sinon.spy();
		new AspectFrame(null, cb).post();
		cb.calledOnce.should.be.true();
	});
	it('should call pre and post callback at .pre() and .post()', function () {
		var pre = sinon.spy();
		var post = sinon.spy();
		var aspectFrame = new AspectFrame(pre, post);
		aspectFrame.pre();
		aspectFrame.post();
		pre.calledOnce.should.be.true();
		post.calledOnce.should.be.true();
	});

	it('should .pre() should always return promise', function () {
		new AspectFrame().pre().should.have.property('then');
	});
});
