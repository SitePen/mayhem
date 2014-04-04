/// <reference path="./intern" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import ObservableArray = require('../ObservableArray');

// Defining this function because the ObservableArray constructor
// does not actually return something that is instanceof ObservableArray
function assertIsObservableArray(obj:any) {
	assert.instanceOf(obj, Array);
	assert.isFunction(obj.observe);
}

registerSuite({
	name: 'ObservableArray',

	'#concat' () {
		var observableArray:ObservableArray<any> = new ObservableArray([ 1, 2, 3 ]),
			numericResult:ObservableArray<any> = observableArray.concat(4, 5, 6, [ 7, 8 ]),
			mixedResult:ObservableArray<any> = numericResult.concat([ [ 9, 10 ] ]);

		assertIsObservableArray(numericResult);
		assert.deepEqual(numericResult, new ObservableArray([ 1, 2, 3, 4, 5, 6, 7, 8 ]));
		assertIsObservableArray(mixedResult);
		assert.deepEqual(mixedResult, new ObservableArray([ 1, 2, 3, 4, 5, 6, 7, 8, [ 9, 10 ] ]));
	},

	'#every' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]);

		assert.isFalse(observableArray.every((x) => x > 1));
		assert.isFalse(observableArray.every((x) => x > 2));
		assert.isFalse(observableArray.every((x) => x > 3));
		assert.isTrue(observableArray.every((x) => x < 4));
	},

	
	'#filter' () {
		var observableArray = new ObservableArray([ 1, 2, 3, 4, 5, 6, 7 ]),
			filterResults = observableArray.filter((x) => x % 3 == 0),
			expectedResults = new ObservableArray([ 3, 6 ]);

		assertIsObservableArray(filterResults);
		assert.deepEqual(filterResults, expectedResults);
	},

	'#forEach' () {
		var observableArray = new ObservableArray([ 7, 8, 9 ]),
			expectedResults = [
				{ value: 7, index: 0, array: observableArray },
				{ value: 8, index: 1, array: observableArray },
				{ value: 9, index: 2, array: observableArray }
			],
			results:any[] = [];

		observableArray.forEach((x, i, a) => { 
			results.push({ value: x, index: i, array: a });
		});

		assert.deepEqual(results, expectedResults);
	},

	'#get' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]);	

		for (var i = 0; i < observableArray.length; ++i) {
			assert.strictEqual(observableArray.get(i), i + 1);
		}

		assert.isUndefined(observableArray.get(-1));
		assert.isUndefined(observableArray.get(observableArray.length));
	},

	'#set' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]),
			observations:any = [];

		observableArray.observe((index, removedItems, addedItems) => {
			observations.push({
				index: index,
				removedItems: removedItems,
				addedItems: addedItems
			});
		});

		for (var i = 0, newValue:number; i < observableArray.length; ++i) {
			newValue = 7 + i;
			observableArray.set(i, newValue);
			assert.strictEqual(observableArray.get(i), newValue);
		}

		assert.deepEqual(observations, [
			{ index: 0, removedItems: [ 1 ], addedItems: [ 7 ] },
			{ index: 1, removedItems: [ 2 ], addedItems: [ 8 ] },
			{ index: 2, removedItems: [ 3 ], addedItems: [ 9 ] }
		]);
	},

	'#indexOf' () {
		var observableArray = new ObservableArray([ 1, 2, 3, 1, 2, 3 ]);	

		assert.strictEqual(observableArray.indexOf(2), 1);
		assert.strictEqual(observableArray.indexOf(2, 2), 4);
		assert.strictEqual(observableArray.indexOf(7), -1);
		assert.strictEqual(observableArray.indexOf(1, 4), -1);
	},

	'#join' () {
		var observableArray:ObservableArray<any> = new ObservableArray([ 1, 'two', [ 'three', 4 ], {} ]);	

		assert.equal(observableArray.join(), '1,two,three,4,[object Object]');
		assert.equal(observableArray.join(''), '1twothree,4[object Object]');
		assert.equal(observableArray.join('||'), '1||two||three,4||[object Object]');
	},

	'#lastIndexOf' () {
		var observableArray = new ObservableArray([ 1, 2, 3, 1, 2, 3 ]);	

		assert.strictEqual(observableArray.lastIndexOf(2), 4);
		assert.strictEqual(observableArray.lastIndexOf(2, 3), 1);
		assert.strictEqual(observableArray.lastIndexOf(7), -1);
		assert.strictEqual(observableArray.lastIndexOf(3, 1), -1);
	},

	'#map' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]),
			iterationArguments:any[] = [];

		var results:any[] = observableArray.map((item, index, array) => {
			iterationArguments.push({
				item: item, index: index, array: array
			});
			return item.toString();
		});

		assert.deepEqual(iterationArguments, [
			{ item: 1, index: 0, array: observableArray },
			{ item: 2, index: 1, array: observableArray },
			{ item: 3, index: 2, array: observableArray }
		]);
		assert.deepEqual(results, new ObservableArray([ '1', '2', '3' ]));
	},

	'#pop' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]),
			popResults:number[] = [];

		assert.strictEqual(observableArray.length, 3);
		popResults.push(observableArray.pop());
		assert.strictEqual(observableArray.length, 2);
		popResults.push(observableArray.pop());
		assert.strictEqual(observableArray.length, 1);
		popResults.push(observableArray.pop());
		assert.strictEqual(observableArray.length, 0);
		assert.deepEqual(popResults, [ 3, 2, 1 ]);
	},

	'#push' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]);

		assert.strictEqual(observableArray.length, 3);
		observableArray.push(4);
		assert.strictEqual(observableArray.length, 4);
		observableArray.push(5);
		assert.strictEqual(observableArray.length, 5);
		observableArray.push(6);
		assert.strictEqual(observableArray.length, 6);
		assert.deepEqual(observableArray, new ObservableArray([ 1, 2, 3, 4, 5, 6 ]));
	},

	'#reduce' () {
		var observableArray = new ObservableArray([ 2, 4, 8 ]),
			iterationArguments:any[] = [];
	
		var result = observableArray.reduce((memo, item, index, array) => {
			iterationArguments.push({
				memo: memo, item: item, index: index, array: array
			});
			return memo * item;
		}, 1);
		assert.strictEqual(result, 64);
		assert.deepEqual(iterationArguments, [
			{ memo: 1, item: 2, index: 0, array: observableArray },
			{ memo: 2, item: 4, index: 1, array: observableArray },
			{ memo: 8, item: 8, index: 2, array: observableArray }
		]);
	},

	'#reduceRight' () {
		var observableArray = new ObservableArray([ 2, 4, 8 ]),
			iterationArguments:any[] = [];
	
		var result = observableArray.reduceRight((memo, item, index, array) => {
			iterationArguments.push({
				memo: memo, item: item, index: index, array: array
			});
			return memo * item;
		}, 1);
		assert.strictEqual(result, 64);
		assert.deepEqual(iterationArguments, [
			{ memo: 1, item: 8, index: 2, array: observableArray },
			{ memo: 8, item: 4, index: 1, array: observableArray },
			{ memo: 32, item: 2, index: 0, array: observableArray }
		]);
	},

	'#reverse' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]),
			observations:any[] = [];

		observableArray.observe((index, removals, additions) => {
			// convert additions to a vanilla array so we can do a deepEqual assertion with the expected observations
			observations.push({
				index: index, removals: removals, additions: additions.toArray()
			});
		});
		observableArray.reverse();
		
		assert.deepEqual(observableArray.toArray(), [ 3, 2, 1 ]);
		assert.deepEqual(observations, [{
			index: 0, removals: [ 1, 2, 3 ], additions: [ 3, 2, 1 ]
		}]);
	},

	'#shift' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]),
			shiftResults:number[] = [];

		assert.strictEqual(observableArray.length, 3);
		shiftResults.push(observableArray.shift());
		assert.strictEqual(observableArray.length, 2);
		shiftResults.push(observableArray.shift());
		assert.strictEqual(observableArray.length, 1);
		shiftResults.push(observableArray.shift());
		assert.strictEqual(observableArray.length, 0);
		assert.deepEqual(shiftResults, [ 1, 2, 3 ]);
	},

	'#slice' () {
		var observableArray = new ObservableArray([ 1, 2, 3, 4, 5, 6 ]);

		assert.deepEqual(observableArray.slice(2), new ObservableArray([ 3, 4, 5, 6 ]));
		assert.deepEqual(observableArray.slice(2, 5), new ObservableArray([ 3, 4, 5 ]));
	},

	'#some' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]);

		assert.isTrue(observableArray.some((x) => x == 1));
		assert.isTrue(observableArray.some((x) => x == 2));
		assert.isTrue(observableArray.some((x) => x == 3));
		assert.isFalse(observableArray.some((x) => x == 4));
	},

	'#sort' () {
		var observableArray = new ObservableArray([ 3, 2, 1 ]),
			observations:any[] = [];

		var handle = observableArray.observe((index, removals, additions) => {
			// convert additions to a vanilla array so we can do a deepEqual assertion with the expected observations
			observations.push({
				index: index, removals: removals, additions: additions.toArray()
			});
		});
		observableArray.sort((a, b) => (a == b) ? 0 : ((a < b) ? -1 : 1));
		handle.remove();

		assert.deepEqual(observableArray, new ObservableArray([ 1, 2, 3 ]));
		assert.deepEqual(observations, [{
			index: 0, removals: [ 3, 2, 1 ], additions: [ 1, 2, 3]
		}]);
	},

	'#splice' () {
		var observableArray = new ObservableArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]),
			observations:any[] = [];

		observableArray.observe((index, removals, additions) => {
			// converting removals to Array to allow deepEqual comparison with expected observations
			observations.push({
				index: index, removals: removals.toArray(), additions: additions
			});
		});

		// remove one item from beginning
		assert.deepEqual(observableArray.splice(0, 1).toArray(), [ 1 ]);
		assert.deepEqual(observableArray.toArray(), [ 2, 3, 4, 5, 6, 7, 8, 9 ]);

		// remove two items from beginning
		assert.deepEqual(observableArray.splice(0, 2).toArray(), [ 2, 3 ]);
		assert.deepEqual(observableArray.toArray(), [ 4, 5, 6, 7, 8, 9 ]);

		// remove two items from beginning and add two items
		assert.deepEqual(observableArray.splice(0, 2, 1, 2).toArray(), [ 4, 5 ]);
		assert.deepEqual(observableArray.toArray(), [ 1, 2, 6, 7, 8, 9 ]);

		// remove two items from middle
		assert.deepEqual(observableArray.splice(2, 2).toArray(), [ 6, 7 ]);
		assert.deepEqual(observableArray.toArray(), [ 1, 2, 8, 9 ]);

		// add two items to middle
		assert.deepEqual(observableArray.splice(2, 0, 11, 12).toArray(), []);
		assert.deepEqual(observableArray.toArray(), [ 1, 2, 11, 12, 8, 9 ]);

		// remove two items from middle and add three items
		assert.deepEqual(observableArray.splice(2, 2, 13, 14, 15).toArray(), [ 11, 12 ]);
		assert.deepEqual(observableArray.toArray(), [ 1, 2, 13, 14, 15, 8, 9 ]);

		// remove one item from end
		assert.deepEqual(observableArray.splice(-1, 1).toArray(), [ 9 ]);
		assert.deepEqual(observableArray.toArray(), [ 1, 2, 13, 14, 15, 8 ]);

		// remove two items from end
		assert.deepEqual(observableArray.splice(-2, 2).toArray(), [ 15, 8 ]);
		assert.deepEqual(observableArray.toArray(), [ 1, 2, 13, 14 ]);

		// remove two items from end and add two items
		assert.deepEqual(observableArray.splice(-2, 2, 16, 17).toArray(), [ 13, 14 ]);
		assert.deepEqual(observableArray.toArray(), [ 1, 2, 16, 17 ]);

		assert.deepEqual(observations, [
			{ index: 0, removals: [ 1 ], additions: [] },
			{ index: 0, removals: [ 2, 3 ], additions: [] },
			{ index: 0, removals: [ 4, 5 ], additions: [ 1, 2 ] },
			{ index: 2, removals: [ 6, 7 ], additions: [] },
			{ index: 2, removals: [], additions: [ 11, 12 ] },
			{ index: 2, removals: [ 11, 12 ], additions: [ 13, 14, 15 ] },
			{ index: 6, removals: [ 9 ], additions: [] },
			{ index: 4, removals: [ 15, 8 ], additions: [] },
			{ index: 2, removals: [ 13, 14 ], additions: [ 16, 17 ] },
		]);
	},

	'#toArray' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]);

		var result = observableArray.toArray();

		assert.notStrictEqual(observableArray, result);
		assert.isArray(result);
		// Check for absence of `observe` to infer vanilla Array
		assert.notProperty(result, 'observe');
		assert.deepEqual(new ObservableArray(result), observableArray);
	},

	'#unshift' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]);

		assert.strictEqual(observableArray.length, 3);
		observableArray.unshift(4);
		assert.strictEqual(observableArray.length, 4);
		observableArray.unshift(5);
		assert.strictEqual(observableArray.length, 5);
		observableArray.unshift(6);
		assert.strictEqual(observableArray.length, 6);
		assert.deepEqual(observableArray, new ObservableArray([ 6, 5, 4, 1, 2, 3 ]));
	},

	'#observe' () {
		var observableArray = new ObservableArray([ 1, 2, 3 ]),	
			observations:any[] = [],
			handle = observableArray.observe((index, removals, additions) => {
				observations.push({ index: index, removals: removals, additions: additions });
			});
		
		observableArray.set(2, 4);
		observableArray.set(2, 5);
		handle.remove();
		observableArray.set(2, 6);

		assert.deepEqual(observations, [
			{ index: 2, removals: [ 3 ], additions: [ 4 ] },
			{ index: 2, removals: [ 4 ], additions: [ 5 ] }
		]);
	}
});
