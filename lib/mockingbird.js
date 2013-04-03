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
	
	var self = this;
	var currentMockFunction = null;
	
	var entries = {};
	
	var mockFunction = function(method, avoid) {
		
		function getValidEntry(args) {
			
			//Iterate over to find a entry matching argument list
			for(var index in entries[method]) {
				var entry = entries[method][index];
		
				var doArgsMatch = entry.executed === false && entry.args && deepObjectCheck(entry.args, args);
				var areArgsValid = entry.executed === false && entry.checkArgs && entry.checkArgs.apply(this, args);
				var isEntryValid = (doArgsMatch || areArgsValid);

				if(isEntryValid) {
					//increasing executed numbers for that entry
					entry.executed = true;
					return entry;
				}
			}
			
			return false;
		}
		
		return function() {
			//check for argument length
			var entry;
			
			if(!self[method]) {
				throw new Error("Mock function '" + method + "()' is not defined");
				
			} else if(!(entry =  getValidEntry(arguments))) {

				var expected = "";
				var alreadyExecuted = false;
				for(var key in entries[method]) {
					var currentEntry = entries[method][key];
					if(entry.executed === false) {
						expected += "\n\t" + getParamString(currentEntry.args);
					} else if(deepObjectCheck(currentEntry.args, arguments)) {
						alreadyExecuted = true;
					}
				}

				expected += "\n";
				
				if(alreadyExecuted) {
					throw new Error('method: ' + method + getParamString(arguments) + ' already executed');
				} else {
					throw new Error(
						"Arguments content passed: " + getParamString(arguments) + 
						" is not tally with takesAll function or expected arguments: " + expected + " in method: '" + method + "()'");
				}
			
			} else if(entry.shouldFail) {
				throw new Error("You should not call: '" + method+ "()' with params: " + getParamString(arguments) + " on this object");
			}
			
			//calling the callback
			if(entry.callbackIndex !== null) {
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
			
			if(entry.returnsF) 
				return(entry.returnsF.apply(this, arguments));
			else
				return entry.returns;
		};
	};
	
	this.takes = function() {
		var entry = getCurrentEntry();
		entry.args = arguments;
		return this;
	};

	this.takesF = function(checkArgsFunction) {
		if (typeof(checkArgsFunction) !== 'function') 
			throw new Error("Error: argument is not a function.");

		var entry = getCurrentEntry();
		entry.checkArgs = checkArgsFunction;
		return this;
	};

	this.takesAll = function() {
		return(this.takesF(function() { return true; }));
	};	
		
	this.times = function(expected) {
		var entry = getCurrentEntry();
		for(var lc = 0; lc < expected - 1; lc++) {
			addEntry(cloneEntry(entry));
		}
		return this;
	};
	
	this.returns = function(value) {
		var entry = getCurrentEntry();
		entry.returns = value;
		return this;
	};

	this.returnsF = function(returnFunction) {
		var entry = getCurrentEntry();
		entry.returnsF = returnFunction;
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
	
	/* jshint -W083 */
	this.assert = function() {
		
		var success = true;
		for(var method in entries) {
			var entriesForMethod = entries[method];
			entriesForMethod.forEach(function(entry) {
				if(!entry.shouldFail && entry.executed === false) {
					success = false;
					console.error(
						"method call for: '" + method + "()' with params: " + getParamString(entry.args) + " was not executed!\n"
					);
				}
			});
		}
		
		return success;
	};

	this.assertThrows = function() {
		var success = this.assert();
		if(!success) {
			throw new Error('Nodemock rules breaked!');
		}	
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
			
			addEntry({
				args: [],
				callback: null,
				callbackIndex: null,
				callbackArgs: [],
				returns: undefined,
				executed: false, // whether the mock entry executed or not
				shouldFail: false
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

	/**
		cleanup all the rules and the mock methods
	*/
	this.reset = function() {
		entries = {};
		currentMockFunction = null;
		
		var bypass = {
			'takes': true,
			'takesF': true,
			'takesAll': true,
			'times': true,
			'returns': true,
			'ctrl': true,
			'calls': true,
			'assert': true,
			'assertThrows': true,
			'mock': true,
			'fail': true,
			'reset': true,
			'ignore': true
		};

		for(var key in this) {
			if(!bypass[key]) {
				delete this[key];
			}
		}	
	};

	//ignore the mock
	this.ignore = function(method) {
		
		this[method] = function() {};
	};

	//method for cloning entry
	function cloneEntry(entry) {
		var clone = {};
		for(var key in entry) {
			clone[key] = entry[key];
		}
		return clone;
	}
	
	function getCurrentEntry() {
		return entries[currentMockFunction][entries[currentMockFunction].length - 1];
	}

	function addEntry(entry) {
		entries[currentMockFunction].push(entry);
	}
	
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
		
		if(params[0]) {
			return paramString.substring(0, paramString.length -2) + ")";
		} else {
			return '()';
		}
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
	}
	
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

	exports.ignore = function(method) {
		var nm = new NodeMock();
		nm.ignore(method);
		return nm;
	};
}
