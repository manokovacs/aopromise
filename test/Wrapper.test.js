'use strict';
var sinon = require('sinon');
var should = require('should');
var wrapper = new (require('../lib/Wrapper'));
var Pack = require('../lib/AspectPack');
var Promise = require('bluebird');

describe('Wrapper.wrap', function () {
	it('should call pre and post with function and args on AspectPack', function (end) {
		var res = 'rezz';
		var fn = sinon.spy(function () {
			return res;
		});
		var arg1 = 123, arg2 = '456';
		var pack = new Pack([]);
		pack.pre = sinon.spy(function (opts) {
			opts.args[0].should.equal(arg1);
			opts.args[1].should.equal(arg2);
			opts.originalFunction.should.equal(fn);
			return Promise.resolve({});
		});
		pack.post = sinon.spy(function (opts) {
			opts.args[0].should.equal(arg1);
			opts.args[1].should.equal(arg2);
			opts.originalFunction.should.equal(fn);
			opts.result.should.equal(res);
			return Promise.resolve({});
		});

		var afn = wrapper.wrap(fn, pack);

		afn(arg1, arg2)
			.then(function () {
				fn.calledOnce.should.be.true();
				fn.calledWith(arg1, arg2).should.be.true();
				pack.pre.calledOnce.should.be.true();
				pack.post.calledOnce.should.be.true();
				end();
			})
			.catch(end);

	});

	it('should call post with originalArgs if args changed on AspectPack', function (end) {
		var res = 'rezz';
		var fn = sinon.spy(function () {
			return res;
		});
		var arg1 = 123, arg2 = '456', arg1b = '789', arg2b = 999;
		var pack = new Pack([]);
		pack.pre = sinon.spy(function (opts) {
			return Promise.resolve({newArgs: [arg1b, arg2b]});
		});
		pack.post = sinon.spy(function (opts) {
			opts.args[0].should.equal(arg1b);
			opts.args[1].should.equal(arg2b);
			opts.originalArgs[0].should.equal(arg1);
			opts.originalArgs[1].should.equal(arg2);
			opts.result.should.equal(res);
			return Promise.resolve({});
		});

		var afn = wrapper.wrap(fn, pack);

		afn(arg1, arg2)
			.then(function () {
				fn.calledOnce.should.be.true();
				fn.calledWith(arg1b, arg2b).should.be.true();
				pack.pre.calledOnce.should.be.true();
				pack.post.calledOnce.should.be.true();
				end();
			})
			.catch(end);

	});

	it('should call init on AspectPack with originalFunction on wrap', function () {
		function someFunc() {
		}

		var pack = new Pack([]);
		pack.init = sinon.spy(function (opts) {
			opts.should.have.property('originalFunction');
			opts.originalFunction.name.should.equal('someFunc');
			return {};
		});

		wrapper.wrap(someFunc, pack);

		pack.init.calledOnce.should.be.true();

	});

	it('should use newFunction returned by AspectPack.init', function (end) {
		function someFunc() {
		}

		function newFunc() {
		}

		var pack = new Pack([]);
		pack.init = sinon.spy(function (opts) {
			opts.originalFunction.name.should.equal('someFunc');
			return {newFunction: newFunc};
		});
		pack.pre = sinon.spy(function (opts) {
			opts.originalFunction.name.should.equal('newFunc');
			return Promise.resolve({});
		});

		wrapper.wrap(someFunc, pack)().then(function () {
			pack.init.calledOnce.should.be.true();
			pack.pre.calledOnce.should.be.true();
			end();
		}).catch(end);


	});
});