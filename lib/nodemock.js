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


function NodeMock(methodName) {
	
	var args = [];
	var returnValue = undefined;
	var callbackIndex = null;
	var callbackArgs = null;
	
	var mockFunction = function() {
		
		//check for argument length
		if(args.length != arguments.length) {
			throw 	"Number of Arguments passed(" + arguments.length + 
					") is not tally with expected(" + args.length +
					") in '" + methodName + "()'";
		} 
		
		//check for argument content
		if(!deepObjectCheck(args, arguments)) {
			throw "Arguments content passed is not tally with expected";
		}
		
		//calling the callback
		if(callbackIndex != null) {
			var func = arguments[callbackIndex];
			if(typeof(func) == "function") {
				func.apply(this, callbackArgs);
			} else {
				throw "Expected callback is not defined as callback";
			}
		}
		
		return returnValue;
	};
	
	this[methodName] = mockFunction;
	
	this.takes = function() {
		args = arguments;
		return this;
	};
	
	this.returns = function(value) {
		returnValue = value;
		return this;
	};
	
	this.calls = function() {
		callbackIndex = Array.prototype.shift.call(arguments);
		callbackArgs = arguments;
		return this;
	};
	
	var deepObjectCheck = function(expected, actual) {
		
		if(expected.length != actual.length) return false;
		
		for(var key in expected) {
			
			var actualType = typeof(actual[key]);
			var expectedType = typeof(expected[key]);
			
			if(actualType != expectedType) return false;
			if(actualType == "function") {
				continue;
			} else if(actualType == "object") {
				if(!deepObjectCheck(actual[key], expected[key])) return false;
			} else {
				if(actual[key] != expected[key]) return false;
			}
		}
		
		return true;
	};
}

//Supporting NodeJS CommonJS module system
if(typeof(exports) != "undefined") {
	exports.mock = function(methodName) {
		return new NodeMock(methodName);
	};
}