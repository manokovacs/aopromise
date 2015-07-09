# aopromise
Node.js [Aspect oriented programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) toolkit for *Promise-base* apps. 
It adds a simplified framework where you need are just providing a prepended and an appended function and aopromise will 
execute your aspects in the right order, exposing
the necessary contextual information about the wrapped function. Aspects may read and manipulate arguments, prevent
function execution, or even replace the function to be executed.
It is suitable for implementing
* invocation logger
* pre-authorization
* argumentum validator
* memoize
* benchmark
* circuit-breaker
* timeout handler

Due to the asynchronous nature of many aspects, the library works only with synchronous functions or Promise-returning functions. 

[Examples](https://github.com/manokovacs/aopromise/tree/master/examples)

## Quick start
```javascript
var aop = require('aopromise');


// Have your aspect registered once
aop.register('logger', BeforeAfterLoggerAspect); // see definition below


// take a sync or promise-returning function
function addition(a, b) {
	console.log('adding', a, 'and', b);
	return a + b;
}

// Add you aspect using chaining
var loggedAdder = aop()
	.logger('AdditionFunction')
	.fn(addition);



// You may also use this syntax. The result is identical
loggedAdder = aop(addition, new BeforeAfterLoggerAspect('AdditionFunction')); // aspect declared below


// calling wrapped functions
loggedAdder(3, 4);
// outputs
// AdditionFunction was called with [ 3, 4 ]
// adding 3 and 4
// AdditionFunction returned with 7


/**
 * Defining aspect. Using AspectFrame for factory.
 */
function BeforeAfterLoggerAspect(funcName) {
	return new aop.AspectFrame(
		function (preOpts) {
			console.log(funcName || preOpts.originalFunction.name, 'was called with', preOpts.args);
		},
		function (postOpts) {
			console.log(funcName || postOpts.originalFunction.name, 'returned with', postOpts.result);
		}
	);
}

```
## API
The aopromise API gives you API to register aspects and wrap functions with selected and configured aspects. To use
chaining, first, you need to register the *constructor functions* of your aspects. They will be called with _new_ operator, when used.

```
javascript
// sample aspects. They might be also available pretty soon
aop.register('logger', LoggerAspect);
aop.register('preauth', RoleBasedAuthorizerAspect);
aop.register('memoize', MemoizeAspect);
```
A registered aspect is now can be used on the builder's interfaces. You can create a builder by invoking _aopromise_ without
any arguments. When you finished adding aspects, call _fn(...)_ with your function as argument.

```
javascript
var getUserAop = aop()
    .logger() // it will be logged
    .preauth('ROLE_ADMIN') // function is preauthorized
    .memoize() // caches the result for given argument
    .fn(function getUser(userId){
    // ...
    });

getUserAop(123).then(function(){/*...*/});
```

```
javascript

```

## Aspects
Aspects are orthogonal functionalities to your business logic. Boilerplates that are usually wrap your actually code. Your
aspects may intercept the execution of the original function and apply custom logic, change arguments or the function itself.

### Creating aspects
An aspect consist of an optional pre() and post() function. You may define either or both (or none, but that would be just silly). 
Pre and post functions of aspects must return promises, if defined, so chain execution would work.

#### AspectFrame
For convenience, you can use AspectPack class to create aspects easily. AspectFrame makes is simpler to create aspect and
make sure you don't forget to return a promise: it returns a resolved promise if you don't have any return value.
```javascript
var aop = require('aopromise');

function MyAspect(argumentForMyAspect){
	return new aop.AspectFrame(
		function (preOpts) {
			// your pre
		},
		function (postOpts) {
			// your post
		}
	);
}
```
Pre and post methods are optional, of course. 
```javascript
function MyAspectWithPreOnly(){
	return new aop.AspectFrame(function(){});
}
// or 
function MyAspectWithPostOnly(){
	return new aop.AspectFrame(null, function(){});
}
```

### Accessing arguments and result
Aspects receive contextual information about the exection. Pre methods receive the arguments, passed by invoker function.
 Post methods can additionally access the result. The example below demonstrate what properties the aspects may read at runtime.
```javascript
var aop = require('aopromise');

function BeforeAfterLoggerAspect(funcName){
	return new aop.AspectFrame(
		function (preOpts) {
			console.log(funcName, 'was called with', preOpts.args);
		},
		function (postOpts) {
			console.log(funcName, 'returned with',                              postOpts.result);
			console.log(funcName, 'was called with',                            preOpts.args);
			console.log(funcName, 'was originally called with',                 preOpts.originalArgs);
			console.log('Arguments replaced by any of the aspect.pre methods?', postOpts.argsReplaced);
			console.log('Function replaced by any of the aspect.pre methods?',  postOpts.functionReplaced);
		}
	);
}

```

### Manipulating the function invocation
You may want to create aspects that affect the execution of the wrapped function. Aspects may
* interrupt execution
* replace arguments
* replace executed function
 
#### Interrupt execution
Aspect's pre() function may decide to interrupt execution of the wrapped function. This might be useful when creating
validation or authorization aspects.

```javascript
function OnlyNumberArgumentsAspect() {
	return new aop.AspectFrame(
		function (preOpts) {
			// we are cloning the args with the slice function, since it is effective immutable
			for (var i in preOpts.args) {
				if (typeof(preOpts.args[i]) !== 'number') {
					return Promise.reject('Argument #' + i + ' is not a number (' + typeof(e) + ' was given)');
				}
			}
			;
			return Promise.resolve();
		}
	);
}

var numberOnlyFunc = aop(
	function () {
		console.log('This function surely called with numbers only', arguments);
	},
	new OnlyNumberArgumentsAspect()
);

// will run ok
numberOnlyFunc(1, 2, 3).then(function () {
	console.log('ok, numbers only');
}).catch(console.log);

// output error
numberOnlyFunc(1, 'oh-oh, not good, noooot good', 3).then(function () {
	console.log('ok, numbers only');
}).catch(console.log);

```

#### Replacing arguments
Aspect's pre() function may replace the arguments before the wrapped function is called by resolving the returned promise
with a parameter object, having a _newArgs_ property.
```javascript
function AddExtraArgumentAspect(extraArgument) {
	return new aop.AspectFrame(
		function (preOpts) {
			// we are cloning the args with the slice function, since it is effective immutable
			var _args = preOpts.args.slice();
			_args.push(extraArgument);
			return Promise.resolve({newArgs: _args});
		}
	);
}

aop(
	function(){
		console.log('function called with', arguments);
	},
	new AddExtraArgumentAspect('additionArgValue')
)('normalArgument');

```

#### Replacing function
@TODO

### Sharing data between _pre_ and _post_
@TODO


