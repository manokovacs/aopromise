'use strict';


var Wrapper = require('./Wrapper');
var Builder = require('./Builder');

var wrapper = new Wrapper();

var aopromise = module.exports = wrapper.wrap;
aopromise.wrap = wrapper.wrap;
aopromise.AspectPack = require('./AspectPack');
aopromise.AspectFrame = require('./AspectFrame');
aopromise.Wrapper = Wrapper;
aopromise.register = Builder.register;
aopromise.unregister = Builder.unregister;


