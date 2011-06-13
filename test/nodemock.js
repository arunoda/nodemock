/**

	The MIT License
	
	Copyright (c) 2011 Arunoda Susiripala
	
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

 */


//NodeMock argument check
var nm = require("../lib/nodemock");

exports.testArgumentSimple = function(test) {
	
	var mock = nm.mock("foo").takes(10, "Hello", true, [1, 4, 5], {"a": "aa", "b": "bb"});
	test.doesNotThrow(function(){
		mock.foo(10, "Hello", true, [1, 4, 5], {"a": "aa", "b": "bb"});
	});
	
	test.throws(function() {
		mock.foo(11, "Hello", true, [1, 4, 5], {"a": "aa", "b": "bb"});
	});
	
	test.throws(function() {
		mock.foo(10, "Hello1", true, [1, 4, 5], {"a": "aa", "b": "bb"});
	});
	
	test.throws(function() {
		mock.foo(10, "Hello", false, [1, 4, 8], {"a": "aa", "b": "bb"});
	});
	
	test.throws(function() {
		mock.foo(10, "Hello", true, [1, 4, 5], {"a": "aa", "b": "gh"});
	});
	
	test.throws(function() {
		mock.foo(10, "Hello", true, [1, 4, 5], {"a": "aa", "c": "gh"});
	});
	
	test.done();
};

exports.testWithJustReturn = function(test) {
	
	var mock = nm.mock("foo").returns(false);
	test.ok(!mock.foo());
	
	test.done();
};

exports.testArgumentsDeep = function(test) {
	
	var mock = nm.mock("foo").takes([10, 20, {a: "aa", b: [10, 20]}]);
	
	test.doesNotThrow(function() {
		mock.foo([10, 20, {a: "aa", b: [10, 20]}]);
	});
	
	test.throws(function() {
		mock.foo([10, 21, {a: "aa", b: [10, 20]}]);
	});
	
	test.throws(function() {
		mock.foo([10, 20, {a: "aa3", b: [10, 20]}]);
	});
	
	test.throws(function() {
		mock.foo([10, 20, {a: "aa", b: [10, 20, 30]}]);
	});
	
	test.done();
};

//Nodemock Return Check

exports.testReturn = function(test) {
	
	var mock = nm.mock("foo").returns(10);
	test.equal(mock.foo(), 10);
	
	test.done();
};

//Nodemock Callback Tests

exports.testCallbackCorrect = function(test) {
	
	var mock = nm.mock("foo").takes(10, function(){}).calls(1, [10, 20]);
	test.expect(2);
	mock.foo(10, function(a, b) {
		test.equals(a, 10);
		test.equals(b, 20);
	});
	
	test.done();
};

exports.testCallbackNoArgsDefined = function(test) {
	
	var mock = nm.mock("foo").calls(1, [10, 20]);

	test.throws(function() {
		mock.foo(10, function(a, b) {
			test.equals(a, 10);
			test.equals(b, 20);
		});
	});
	
	test.done();
};

exports.testCallbackSurplusArgs = function(test) {
	
	var mock = nm.mock("foo").takes(10, function(){}).calls(1, [10, 20, 30, 40]);
	test.expect(2);
	mock.foo(10, function(a, b) {
		test.equals(a, 10);
		test.equals(b, 20);
	});
	
	test.done();
};

exports.testCallbackLessArgs = function(test) {
	
	var mock = nm.mock("foo").takes(10, function(){}).calls(1, [10]);
	test.expect(2);
	mock.foo(10, function(a, b) {
		test.equals(a, 10);
		test.equals(b, undefined);
	});
	
	test.done();
};

exports.testCallbackNoArgs = function(test) {
	
	var mock = nm.mock("foo").takes(10, function(){}).calls(1, []);
	test.expect(2);
	mock.foo(10, function(a, b) {
		test.equals(a, undefined);
		test.equals(b, undefined);
	});
	
	test.done();
};

exports.testCallbackNullArgs = function(test) {
	
	var mock = nm.mock("foo").takes(10, function(){}).calls(1, null);
	test.expect(2);
	mock.foo(10, function(a, b) {
		test.equals(a, undefined);
		test.equals(b, undefined);
	});
	
	test.done();
};

exports.testCallbackWithoutArgs = function(test) {
	
	var mock = nm.mock("foo").takes(10, function(){}).calls(1);
	test.expect(2);
	mock.foo(10, function(a, b) {
		test.equals(a, undefined);
		test.equals(b, undefined);
	});
	
	test.done();
};

exports.testMockAgain = function(test) {
	
	var mock = nm.mock("foo").takes(10, 20).returns(30);
	test.doesNotThrow(function() {
		test.equal(mock.foo(10, 20), 30);
	});
	
	mock.mock("bar").takes(10).returns(40);
	test.doesNotThrow(function() {
		test.equal(mock.bar(10), 40);
	});
	
	test.doesNotThrow(function() {
		test.equal(mock.foo(10, 20), 30);
	});
	test.done();
};

exports.testFailNoAnyMockMethod = function(test) {
	
	var mock = nm.fail();
	test.throws(function() {
		mock.foo();
	});
	test.done();
};

exports.testFailOneMockMethod = function(test) {
	
	var mock = nm.mock("foo").fail();
	mock.mock("bar").takes(10, 20);
	test.throws(function() {
		mock.foo();
	});
	
	test.doesNotThrow(function() {
		mock.bar(10, 20);
	});
	test.done();
};

exports.testMultipleEntriesForOneMethod = function(test) {
	var mock = nm.mock("foo").takes(10, 20).returns(30);
	mock.mock("foo").takes(10, 30).returns(40);
	
	test.doesNotThrow(function() {
		test.ok(mock.foo(10, 20) == 30);
		test.ok(mock.foo(10, 30) == 40);
	});
	
	test.throws(function() {
		mock.foo(10);
		mock.foo(10, 20);
		mock.bar(10, 30);
	});
	
	test.done();
};

exports.testAssertFailsSameMethod = function(test) {
	
	var mock = nm.mock("foo").takes(10, 20).returns(30);
	mock.mock("foo").takes(10, 30).returns(40);
	
	mock.foo(10,20);
	test.ok(!mock.assert());
	test.done();
};

exports.testAssertFailsManyMethod = function(test) {
	
	var mock = nm.mock("foo").takes(10, 20).returns(30);
	mock.mock("bar").takes(10, 30).returns(40);
	
	mock.foo(10,20);
	test.ok(!mock.assert());
	test.done();
};

exports.testAssertOK = function(test) {
	
	var mock = nm.mock("foo").takes(10, 20).returns(30);
	mock.mock("foo").takes(10, 30).returns(40);
	mock.mock("bar").returns(30);
	
	mock.foo(10,20);
	mock.foo(10,30);
	mock.bar();
	test.ok(mock.assert());
	test.done();
};

exports.testTimes = function(test) {
	
	var mock = nm.mock("foo").takes(10, 20).times(2);
	mock.foo(10, 20);
	mock.foo(10, 20);
	test.ok(mock.assert());

	mock = nm.mock("bar").takes(10).times(2);
	mock.bar(10);
	test.ok(!mock.assert());
	
	test.done();
};

exports.testCtrl = function(test) {
	
	test.expect(2);
	var ctrl = {};
	var mock = nm.mock("foo").takes(10, 20, function() {}).ctrl(2, ctrl);
	
	mock.foo(10, 20, function(bb) {
		test.ok(bb = 20);
	});
	
	ctrl.trigger(20);
	ctrl.trigger(20);
	
	test.done();
};

exports.testPartialCompareBug1 = function (test){
	
	test.throws(function (){
		var mock = nm.mock('foo').takes({hi: 1, bye: 2000},2,3)
		mock.foo({},2,3) //should throw because bye: 2000 is not present
	})
	
	test.done()
}

exports.testPartialCompareBug2 = function (test){
	
	test.throws(function (){
		var mock = nm.mock('foo').takes({hi: 1, bye: 2000},2,3)
		mock.foo({hi: 1},2,3) //should throw because bye: 2000 is not present
		mock.foo({},2,3) //should throw because bye: 2000 is not present
	})
	
	test.done()
}

exports.testPartialCompare = function (test){
	
	test.doesNotThrow(function (){
		var mock = nm.mock('foo').takes({hi: 1},2,3)
		mock.foo({hi: 1, bye: 2000},2,3) //should throw because bye: 2000 is not present
	})
	
	test.throws(function (){
		var mock = nm.mock('foo').takes({hi: 1},2,3)
		mock.foo({},2,3) //should throw because bye: 2000 is not present
	})
	
	test.done()
	
}