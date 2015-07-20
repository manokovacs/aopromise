'use strict';
var aopromise = require('../');
var sinon = require('sinon');
var should = require('should');
var aop = aopromise.wrap;
var AspectPack = aopromise.AspectPack;
var AspectFrame = aopromise.AspectFrame;
var Promise = require('bluebird');


describe('AspectPack', function () {
	var InitAspect;
	var CactherAspect;
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

	beforeEach(function () {
		InitAspect = function (initResult) {
			this.init = sinon.spy(function () {
				return initResult;
			});
		};
		CactherAspect = function (reReject) {
			this.catch = sinon.spy(function () {
				return reReject ? Promise.reject() : Promise.resolve();
			});
		};
	});


	it('should fail gracefully if aspect does not return promise in pre', function (done) {
		new AspectPack([new BadPreAspect()]).pre()
			.then(function () {
				done(new Error('should not pass'));
			})
			.catch(function (err) {
				should(err.message).equal('Aspect pre() did not return promise.');
				done();
			});
	});

	it('should fail gracefully if aspect does not return promise in post', function (done) {
		new AspectPack([new BadPostAspect()]).post()
			.then(function () {
				done(new Error('should not pass'));
			})
			.catch(function (err) {
				should(err.message).equal('Aspect post() did not return promise.');
				done();
			});
	});

	it('should call aspect init if init called', function () {
		var initAspect = new InitAspect();
		new AspectPack([initAspect]).init();
		initAspect.init.calledOnce.should.be.true();
	});

	it('should return merged result of multiple inits', function () {
		var initAspect1 = new InitAspect({a: 123, b: 456            });
		var initAspect2 = new InitAspect({a: 444, c: 555    });
		var merged = new AspectPack([initAspect1, initAspect2]).init();
		initAspect1.init.calledOnce.should.be.true();
		initAspect2.init.calledOnce.should.be.true();
		merged.should.have.property('a');
		merged.should.have.property('b');
		merged.should.have.property('c');
		merged.a.should.equal(444);
		merged.b.should.equal(456);
		merged.c.should.equal(555);
	});


	it('should call catch on aspect if called catch', function (done) {
		var catcherAspect1 = new CactherAspect(true);
		var catcherAspect2 = new CactherAspect(true);
		new AspectPack([catcherAspect1, catcherAspect2]).catch()
			.finally(function () {
				catcherAspect1.catch.calledOnce.should.be.true();
				catcherAspect2.catch.calledOnce.should.be.true();
			})
			.catch(function () {
				done()
			});
	});

	it('should call catch on aspect if the previous is rerejected', function (done) {
		var catcherAspect1 = new CactherAspect(true);
		var catcherAspect2 = new CactherAspect(false);
		new AspectPack([catcherAspect1, catcherAspect2]).catch()
			.finally(function () {
				catcherAspect2.catch.calledOnce.should.be.true();
				catcherAspect1.catch.calledOnce.should.be.false();
			})
			.then(function () {
				done()
			})
			.catch(done)
		;
	});
});