Note: this project is now deprecated and no longer maintanined 
==================================================================

Changes were recently merged in Nodemock and therefore this fork is no longer necessary. Please refer to the new home of the [Nodemock](https://github.com/realistschuckle/nodemock) information from now on.

Mockingbird - A NodeMock fork
=============================

Mockingbird is a fork of NodeMock 0.2.17 that introduces specific capabilities that allow mocking functions
to accept and return values based on functions and not just static values. These capabilities are for now 
(as of version 0.3.0 of Mockingbird) the only differences with NodeMock though more features are planned to be
added in the future.

The documentation below is an udpated version of NodeMock's, and the names Mockingbird and NodeMock are
used interchangeably.

A simple Yet Powerful Mocking Framework for NodeJs
==================================================

[NodeMock](https://github.com/arunoda/nodemock) is aimple Yet Powerful Mocking Framework for NodeJs

NodeMock is a very simple to use mocking framework which can be used to 
mock functions in JavaScript objects. 
NodeMock creates mock methods in less code with more expressive manner

Features
--------
Besides it's simplicity it supports following features

* Does not need an existing object to create the mock
* Verify arguments (we check deeply on objects and arrays to check the validity)
* Allow a return to be sent
* Assertion to check whether all the rules executed
* Callbacks can also be executed with providing arguments
* Multiple mock functions in one object
* Alter a mock function later on
* Method chaining allows creating mocks super easy
* Fail support added when calling method that should not be called
* Mock support to call a single method more than once
* Repetitive support
* Ignore methods from mocking behaviour
* Ability to provide functions to determine valid input for mocked functions
* Ability to provide functions to generate output from mocked functions
	
Testing
-------
Mockingbird can be used with any testing framework. And we've used it with Nodeunit and it's a perfect match.
[See Examples](https://github.com/arunoda/nodemock/blob/master/test/nodemock.js "Nodemock with Nodeunit")

Install
-------
Use npm:

```npm install mockingbird```

Usage
------

### Load the Module

```javascript
var mockingbird = require("mockingbird");
```

### Creating a mock function with taking arguments and return value

```javascript
var mocked = mockingbird.mock("foo").takes(10, [10, 20, 30]).returns(98);

mocked.foo(10, [10, 20, 30]); // this will return 98

mocked.foo(10); //throws execption
```
	
### Creating a mock function that takes variable parameters

```javascript
var mocked = mockingbird.mock("foo").takes(function(args) {
	return(args % 2 == 0) 
});
mocked.foo(4)	// works

mocked.foo(5)	// fails
```

### Creating a mock function that takes variable parameters and returns dynamic values

```javascript
var mocked = mockingbird.mock("foo").takesF(function(args) {
	return(args % 2 == 0) 
}).returnsF(function(args) {
	return(args * 2)
});
mocked.foo(4)	// returns 8

mocked.foo(5)	// fails
```

### Creating a mock with callback support

```javascript
var mocked = mockingbird.mock("foo").takes(20, function(){}).calls(1, [30, 40]);

mocked.foo(20, function(num, arr) {
	console.log(num); //prints 30
	console.log(arr); //prints 40
});

/*
	When you invoke foo() nodemock will calls the callback(sits in argument index 1 - as specified)
	with the parameters 30 and 40 respectively. 
*/
```

### Controlling callbacks
With the asynchronous nature of NodeJS(and brower with AJAX too) it'll be great if we can control the execution of the callback in the testing environment. And `ctrl()` of nodemock helps that

```javascript
var ctrl = {};
var mocked = mockingbird.mock('foo').takes(10, function() {}).ctrl(1, ctrl);
//where ever in your codebase
ctrl.trigger(10, 20); // you can call this as many as you want
```
	
### Add multiple mock functions

```javascript
var mocked = mockingbird.mock("foo").takes(10).returns(30);
mocked.foo(10); //gives 30

mocked.mock("bar").takes(true).returns(40);
mocked.bar(true); // gives 40
```
	
### Assertion Support

```javascript
var mocked = mockingbird.mock("foo").takes(20);
var mocked = mockingbird.mock("bar").takes(40);

mocked.foo(20);
mocked.bar(40);

//check whether what we've defined is actually executed
mocked.assert(); //returns true
```
	
### Fails when calls any method in the mock object

```javascript	
var mocked = mockingbird.fail();
mocked.foo(); //thorws an exception
mocked.bar(); //throws an exception
```
	
### Fails when calls some particular method in the mock object

```javascript
var mocked = mockingbird.mock("foo").fail();
mocked.mock("bar").takes(10);
mocked.foo(); //thorws an exception
mocked.bar(10); //works perfectly
```

### calls a single mocked method, multiple times

```javascript	
var mocked = mockingbird.mock("foo").takes(10, 20).times(2);

mocked.foo(10, 20);
mocked.foo(10, 20);
```

### calls a single mocked method, multiple times with different returns

```javascript
var mocked = mockingbird.mock("foo").takes(10, 20).returns(100);
mocked.mock('foo').takes(10, 20).returns(200);

mocked.foo(10, 20); //returns 100
mocked.foo(10, 20); //returns 200
```
	
### mock a single method more than once

```javascript
var mocked = mockingbird.mock("foo").takes(10, 20);
mocked.mock("foo").takes(20, 30);
mocked.mock("foo").takes(500);

mocked.foo(10, 20);
mocked.foo(20, 30)
mocked.foo(500);

//check whether everything has done
mocked.assert(); //returns true
```

### reset the mock

```javascript	
var mocked = mockingbird.mock('foo').returns(100);
mocked.foo(); //returns 100
mocked.assert(); //returns true
	
mocked.reset();

mocked.mock('doo').returns(300);
mocked.doo(); //returns 300
mock.assert() //returns true
```

### ignore method
Sometime we need to ignore some methods going through mocking rules. But we need to have those methods but doing nothing.

```javascript
var mocked = mock.ignore('hello');
mocked.mock('foo').returns(100);

mock.foo(); //returns 100
mock.hello(); //do nothing but the method exists

mock.assert(); // return true, assert have nothing to do with ignored methods
```

API Documentation
-----------------

### Construction ###

Creating a object with mock function "foo":
	
```javascript
var mocked = require('mockingbird').mock('foo');
```
		
Ater or create a new mock method and add rules to it as usual:

```javascript
mocked.mock(methodName)
```		
		
### Rules ###

#### takes(arg1, args2, ...)
Specify arguments of the function and verify then when calling:

```javascript 
mocked.takes(arg1, args2, ...)
```

#### takesF(function)

As opposed to takes(), in which we can only specify static values, takesF() (note the "F" in the
name to indicate that it takes a function) allows client code to provide a predicate that determines
whether the mocked function should accept ("take") the value and allowing mock code to be a bit more dynamic.

The given function will be provided with a single parameter, the current parameter.

```javascript
mocked.takesF(function)
```

#### takesAll()

A shorthand function that tells the mock function to accept any input.

```javascript
mocked.takesAll()
```

#### returns(returnValue)

Specify the return value of the function

```javascript		
mocked.returns(returnValue)
```

#### returnsF(function)

Similar to takesF(), returnsF() allows to provide a function that will dynamically generate values that will
be returned from mock calls. The function will be provided with the parameters that were passed to the mock call.

```javascript
mocked.returnsF(function)
```


#### calls(callbackPosition, argumentsArray)

Calls a callback at the arguments in index `callbackPosition` with the arguments specified in the "argumentsArray"

when using this you've to define a function signature as a callback in the argument list for a callback at index 2 .takes() function will be as, mocked.takes(10, 20, function(){})	

```javascript
mocked.calls(callbackPosition, argumentsArray)		 
```

#### fail()

If calls at very begining afterword any call on the mocked objects will fail
Otherwise current mock method will fails someone called that. 

```javascript
mocked.fail()
```

#### times(count)
We can rule the mocked method to be called multiple times with same parameters
Finally we can check that using above assert method;

```javascript
mocked.times(repeatCount);
```

#### reset()

Reset all the rules and mocks created. And bring mocked object into a stage when it's created

```javascript
mocked.reset()
```

#### ignore()
Ignore Some methods from the mocking behaviour

```javascript
mocked.ignore()
```
	
### Confirm ###

#### assert()
Checks whether rules we've defined using other methods were executed. 
If all the rules were executed return true, otherwise false.

```javascript
	mocked.assert();
```

#### assertThrows()

Same as the mocked.assert() but throws an execption if rules breaks.

```javascript
mocked.assertThrows();
```

Reasons for the fork
--------------------
A pull request was submitted to the original maintainer of NodeMock but as no response has been received yet and as these changes may be useful to other Node.js projects, the fork was released.
		
Roadmap
-------
The following features are currently in the roadmap:

* Allow mock functions to execute an unlimited number of times, instead of limiting it to 1 execution by default or a defined number with times()
* Automatic mocking of all methods in a given object

License
-------
The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Copyright
---------
Copyright (c) 2011 Arunoda Susiripala

Modifications in the fork, Copyright (c) 2013 Oscar Renalias
