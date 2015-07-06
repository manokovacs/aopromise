'use strict';
var Promise = Promise || require('bluebird');
var aopromise = require('../');
var sinon = require('sinon');
var should = require('should');
var aop = aopromise.wrap;
var AspectPack = aopromise.AspectPack;
var AspectFrame = aopromise.AspectFrame;
module.exports = {};

var syncAspect = function (pre, post) {
	return new AspectFrame(
		function () {
			pre();
		},
		function (opts) {
			post();
		}
	);
};

describe('Integration test of aopromise', function () {
	var a = 1, b = 'b', c = [1, 2, 3], re = 'rezult';
	it('calls original function with arguments and returns result', function (end) {
		aop(function (_a, _b, _c) {
			_a.should.equal(a);
			_b.should.equal(b);
			_c.should.equal(c);
			return re;
		}, new AspectFrame())(a, b, c).then(function (res) {
			res.should.equal(re);
			end();
		}).catch(end);
	});
	it('aspect pre and post are called', function (end) {
		var pre = sinon.spy();
		var post = sinon.spy();

		aop(function () {
			return Promise.resolve();
		}, new AspectFrame(pre, post))()
			.then(function () {
				pre.calledOnce.should.be.true();
				post.calledOnce.should.be.true();
				end();
			}).catch(end);
	});

	it('passes \'args\' to the aspect', function (end) {
		var pre = sinon.spy(function (preOpts) {
			preOpts.args[0].should.equal(a);
			preOpts.args[1].should.equal(b);
			preOpts.args[2].should.equal(c);
		});
		var post = sinon.spy(function (postOpts) {
			postOpts.args[0].should.equal(a);
			postOpts.args[1].should.equal(b);
			postOpts.args[2].should.equal(c);
		});

		aop(function () {
			return Promise.resolve();
		}, new AspectFrame(pre, post))(a, b, c)
			.then(function () {
				pre.calledOnce.should.be.true();
				post.calledOnce.should.be.true();
				end();
			}).catch(end);
	});

	it('uses newArgument returned by pre as arguments of the original function', function (end) {
		var x = 5, y = 'xxx';
		var pre = sinon.spy(function (preOpts) {
			preOpts.args[0].should.equal(a);
			preOpts.args[1].should.equal(b);
			preOpts.args[2].should.equal(c);
			return Promise.resolve({newArgs: [x, y]});
		});
		var main = sinon.spy(function (arg1, arg2) {
			arg1.should.equal(x);
			arg2.should.equal(y);
		});

		var post = sinon.spy(function (postOpts) {
			postOpts.should.have.property('originalArgs');
			postOpts.originalArgs[0].should.equal(a);
			postOpts.originalArgs[1].should.equal(b);
			postOpts.originalArgs[2].should.equal(c);
			postOpts.argsReplaced.should.be.true();
			postOpts.args[0].should.equal(x);
			postOpts.args[1].should.equal(y);
		});

		aop(main, new AspectFrame(pre, post))(a, b, c)
			.then(function () {
				pre.calledOnce.should.be.true();
				main.calledOnce.should.be.true();
				post.calledOnce.should.be.true();
				end();
			}).catch(end);
	});


	it('uses newFunction as replacement function returned by .pre()', function (end) {
		var originalFn = sinon.spy();
		var replaceFn = sinon.spy();
		var pre = sinon.spy(function (preOpts) {
			return Promise.resolve({newFunction: replaceFn});
		});

		var post = sinon.spy(function (postOpts) {
			postOpts.functionReplaced.should.be.true();
		});
		aop(originalFn, new AspectFrame(pre, post))()
			.then(function () {
				pre.calledOnce.should.be.true();
				originalFn.called.should.be.false();
				replaceFn.calledOnce.should.be.true();
				post.calledOnce.should.be.true();
				end();
			}).catch(end);
	});

	it('calls async in order', function (end) {
		var callLog = '';
		var asyncMethodFactory = function (counter) {
			return function () {
				return new Promise(function (res, rej) {
					setTimeout(function () {
						callLog += counter;
						res();
					}, 1);
				});
			};
		};
		aop(function () {
				callLog += 3;
			},
			new AspectFrame(asyncMethodFactory(1), asyncMethodFactory(5)),
			new AspectFrame(asyncMethodFactory(2), asyncMethodFactory(4))
		)()
			.then(function () {
				callLog.should.equal('12345');
				end();
			}).catch(end);


	});

	it('prevents further execution if aspect rejects', function (end) {
		var err = 'error';
		var preOuter = sinon.spy(function () {
			return Promise.reject(err);
		});
		var preInner = sinon.spy();
		var func = sinon.spy();
		var postInner = sinon.spy();
		var postOuter = sinon.spy();
		aop(func,
			new AspectFrame(preOuter, postOuter),
			new AspectFrame(preInner, postInner)
		)()
			.then(function () {
				end(new Error('Execution should continue with catch'));
			})
			.catch(function (_err) {
				err.should.equal(_err);
				preOuter.calledOnce.should.be.true();
				preInner.called.should.be.false();
				func.called.should.be.false();
				postInner.called.should.be.false();
				postOuter.called.should.be.false();
				end();
			});
	});

	it('propagates inner aspect error', function (end) {
		var err = 'error';
		var preOuter = sinon.spy();
		var preInner = sinon.spy(function () {
			return Promise.reject(err);
		});
		var func = sinon.spy();
		var postInner = sinon.spy();
		var postOuter = sinon.spy();
		aop(func,
			new AspectFrame(preOuter, postOuter),
			new AspectFrame(preInner, postInner)
		)()
			.then(function () {
				end(new Error('Execution should continue with catch'));
			})
			.catch(function (_err) {
				err.should.equal(_err);
				preOuter.calledOnce.should.be.true();
				preInner.calledOnce.should.be.true();
				func.called.should.be.false();
				postInner.called.should.be.false();
				postOuter.called.should.be.false();
				end();
			});
	});

	xit('lets outer aspect to clean up on error', function (end) {
		var err = 'error';
		var clean = true;
		var preOuter = sinon.spy(function () {
			clean = false;
		});
		var preInner = sinon.spy(function () {
			return Promise.reject(err);
		});
		var func = sinon.spy();
		var postInner = sinon.spy();
		var postOuter = sinon.spy(function () {
			Promise.resolve()
				.catch(function (err) {
					clean = true; // cleaning up
					return Promise.reject(err);
				});
		});
		aop(func,
			new AspectFrame(preOuter, postOuter),
			new AspectFrame(preInner, postInner)
		)()
			.then(function () {
				end(new Error('Execution should continue with catch'));
			})
			.catch(function (_err) {
				try {
					err.should.equal(_err);
					preOuter.calledOnce.should.be.true();
					preInner.calledOnce.should.be.true();
					func.called.should.be.false();
					postInner.called.should.be.false();
					postOuter.called.should.be.false();
					clean.should.be.true();
					end();
				} catch (e) {
					end(e);
				}
			});
	});

});