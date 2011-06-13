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
	
	var currentMockFunction = null;
	
	var entries = {};
	
	var mockFunction = function(method, avoid) {
		
		function getValidEntry(args) {
			
			var matchingEntries = [];
			
			for(var index in entries[method]) {
				entry = entries[method][index];
				
				//if the entry is for matching we'll do it later
				if(entry.match) {
					matchingEntries.push(entry);
				}
				if(deepObjectCheck(entry.args, args)) {
					entry.executed ++;
					return entry;
				}
				//increasing executed numbers for that entry
			}
			
			//start matching
			return false;
		}
		
		return function() {
			//check for argument length
			var entry;
			
			if(!this[method]) {
				throw new Error("Mock function '" + method + "()' is not defined");
				
			} else if(!(entry =  getValidEntry(arguments))) {
				
				var expected = "";
				entries[method].forEach(function(entry) {
					expected += "\n\t" + getParamString(entry.args);
				});
				expected += "\n";
				throw new Error(
						"Arguments content passed: " + getParamString(arguments) + 
						" is not tally with expected: " + expected + " in method: '" + method + "()'");
			
			} else if(entry.shouldFail) {
				throw new Error("You should not call: '" + method+ "()' with params: " + getParamString(arguments) + " on this object");
			}
			
			//calling the callback
			if(entry.callbackIndex != null) {
				var func = arguments[entry.callbackIndex];
				entry.callback = func;
				
				if(entry.callbackArgs) {
					if(typeof(func) == "function") {
						func.apply(this, entry.callbackArgs || []);
					} else {
						throw new Error("Expected callback is not defined as callback");
					}
				}
			}
			
			return entry.returns;
		};
	};
	
	this.takes = function() {
		var entry = getCurrentEntry();
		entry.args = arguments;
		return this;
	};
	
	this.matches = function() {
		var entry = getCurrentEntry();
		entry.args = arguments;
		entry.match = true;
		return this;
	};
	
	this.times = function(expected) {
		var entry = getCurrentEntry();
		entry.expectedExecutions = expected;
		return this;
	};
	
	this.returns = function(value) {
		var entry = getCurrentEntry();
		entry.returns = value;
		return this;
	};
	
	this.ctrl = function(index, obj) {
		var entry = getCurrentEntry();
		entry.callbackIndex = index;
		entry.callbackArgs = false;
		
		obj.trigger = function() {
			if(entry.callback) {
				entry.callback.apply(this, arguments);
			} else {
				throw new Error("There is no callback to control");
			}
		};
		
		return this;
	};
	
	this.calls = function() {
		
		if(typeof(arguments[0]) == "number") {
			var entry = entries[currentMockFunction][entries[currentMockFunction].length - 1];
			
			entry.callbackIndex = arguments[0];
			if(arguments[1] && (arguments[1] instanceof Array)) {
				entry.callbackArgs = arguments[1];
			}
			
			return this;
		} else if(arguments[0] instanceof Object) {
			
		} else {
			throw new Error("First arg of the calls() should be the index of the callback");
		}
	};
	
	this.assert = function() {
		
		var success = true;
		for(var method in entries) {
			var entriesForMethod = entries[method];
			entriesForMethod.forEach(function(entry) {
				if(entry.executed != entry.expectedExecutions) {
					success = false;
					console.error(
							"method call for: '" + method + "()' with params: " + getParamString(entry.args) + " executed " +
							entry.executed + " times. (but excepted " + entry.expectedExecutions + " times)");
				}
			});
		}
		
		return success;
	};
	
	//Assign the mocking function
	this.mock = function(method) {
		
		if(method) {
			//let the current mocking method be this
			currentMockFunction = method;
			
			if(!this[method]) {
				
				entries[currentMockFunction] = [];
				//assign the mock method
				this[method] = mockFunction(method);
			}
			
			entries[currentMockFunction].push({
				args: [],
				callback: null,
				callbackIndex: null,
				callbackArgs: [],
				returns: undefined,
				executed: 0,
				expectedExecutions: 1,
				shouldFail: false,
				match: false //match instead of checking it deaply
			});
		}
		
		return this;
	};
	
	/**
	 * After this call when someone calls on this this object is'll
	 * throw an exception
	 */
	this.fail = function() {
		var entry = getCurrentEntry();
		entry.shouldFail = true;
		return this;
	};
	
	function getCurrentEntry() {
		return entries[currentMockFunction][entries[currentMockFunction].length - 1];
	}
	
	function deepObjectCheck(expected, actual) {
		
		if(expected && actual && (expected.length != actual.length)) return false;
		
		for(var key in expected) {
			
			var actualType = typeof(actual[key]);
			var expectedType = typeof(expected[key]);
			
			if(actualType != expectedType) return false;
			if(actualType == "function") {
				continue;
			} else if(actualType == "object") {
				if(!deepObjectCheck(expected[key]	,actual[key])) return false;
			} else {
				if(actual[key] != expected[key]) return false;
			}
		}
		
		return true;
	};
	
	function getParamString(params) {
		
		var paramString = "(";
		for(var index in params) {
			var param = params[index];
			if(param instanceof Function) {
				paramString += "function() {}, ";
			} else if(param instanceof RegExp) {
				paramString += param.toString() + ", ";
			} else {
				paramString += JSON.stringify(param) + ", ";
			}
		}
		
		paramString = paramString.substring(0, paramString.length -2) + ")";
		return paramString;
	};
	
	
	//initialize the mocking
	this.mock(methodName);
	
}

//Supporting NodeJS CommonJS module system
if(typeof(exports) != "undefined") {
	exports.mock = function(methodName) {
		return new NodeMock(methodName);
	};
	
	exports.fail = function() {
		return new NodeMock();
	};
}