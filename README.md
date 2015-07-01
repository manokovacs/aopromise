# aopromise
Node.js Aspect oriented programming toolkit for Promise-base apps.

## Quick start
```javascript
function BeforeAfterLoggerAspect(funcName){
	return new AspectFrame(
		function (preOpts) {
			console.log(funcName, 'was called with', preOpts.args);
		},
		function (postOpts) {
			console.log(funcName, 'returned with', postOpts.result);
		}
	);
}

function addition(a, b){
	console.log('adding', a, 'and', b);
	return a+b;
}

// wrapping function with aspect
var loggedAdder = aop(addition, new BeforeAfterLoggerAspect('AdditionFunction'));
// calling wrapped function
loggedAdder(3, 4);

```
outputs

```
AdditionFunction was called with [ 3, 4 ]
adding 3 and 4
AdditionFunction returned with 7
```

## Aspects
Aspects are ortogonal functionalities to your business logic. Boilerplate codes that are usually wrap your code.
