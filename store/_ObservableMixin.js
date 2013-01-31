define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/when"
], function (declare, lang, arrayUtil, when) {
	return declare(null, {
		//	summary:
		//		dojo/store/Observable implemented as a store mixin.

		_observeUpdaters: [],
		_observeRevision: 0,
		_observeInMethod: false,

		constructor: function () {
			function attachNotifyMethod(/*string*/ method, /*Function*/ action) {
				//	summary:
				//		Attaches notify to a method of the store that should
				//		trigger a notification, if the method exists.

				var oldMethod = self[method];

				if (!oldMethod) {
					return;
				}

				self[method] = function (value) {
					if (this._observeInMethod) {
						// if one method calls another (like add() calling put()) we don't want two events
						return oldMethod.apply(this, arguments);
					}

					this._observeInMethod = true;
					try {
						var results = oldMethod.apply(this, arguments);
						when(results).then(function (results) {
							action((typeof results === "object" && results) || value);
						});
						return results;
					}
					finally {
						this._observeInMethod = false;
					}
				};
			}

			this._observeUpdaters = [];

			var self = this;
			attachNotifyMethod("put", function (object) {
				self.notify(object, self.getIdentity(object));
			});

			attachNotifyMethod("add", function (object) {
				self.notify(object);
			});

			attachNotifyMethod("remove", function (id) {
				self.notify(undefined, id);
			});
		},

		notify: function (object, existingId) {
			//	summary:
			//		Notifies observers of a change to the store.
			//		A Comet-driven store could directly call notify to notify
			//		observers when data has changed on the backend.

			this._observeRevision++;
			var updaters = this._observeUpdaters.slice();
			for(var i = 0, l = updaters.length; i < l; i++){
				updaters[i](object, existingId);
			}
		},

		query: function (query, options) {
			//	summary:
			//		Creates an observable query result set.

			options = options || {};
			var results = this.inherited(arguments);
			if (results && results.forEach) {
				var nonPagedOptions = lang.mixin({}, options);
				delete nonPagedOptions.start;
				delete nonPagedOptions.count;

				var queryExecutor = this.queryEngine && this.queryEngine(query, nonPagedOptions),
					queryRevision = this._observeRevision,
					listeners = [],
					queryUpdater,
					self = this;

				results.observe = function (listener, includeObjectUpdates) {
					if (listeners.push(listener) === 1) {
						// first listener was added, create the query checker and updater
						self._observeUpdaters.push(queryUpdater = function(changed, existingId){
							when(results, function (resultsArray) {
								/*jshint maxcomplexity:14 */
								var atEnd = resultsArray.length !== options.count,
									i,
									l,
									listener;

								if(++queryRevision !== self._observeRevision){
									throw new Error("Query is out of date, you must observe() the query prior to any data modifications");
								}

								var removedObject,
									removedFrom = -1,
									insertedInto = -1;

								if (existingId !== undefined) {
									// remove the old one
									for (i = 0, l = resultsArray.length; i < l; i++) {
										var object = resultsArray[i];
										if (self.getIdentity(object) === existingId) {
											removedObject = object;
											removedFrom = i;
											// if it was changed and we don't have a queryExecutor, we shouldn't
											// remove it because updated objects would be eliminated
											if (queryExecutor || !changed) {
												resultsArray.splice(i, 1);
											}
											break;
										}
									}
								}

								if (queryExecutor) {
									// add the new one
									if (changed &&
											// if a matches function exists, use that (probably more efficient)
											(queryExecutor.matches ? queryExecutor.matches(changed) : queryExecutor([changed]).length)) {

										var firstInsertedInto = removedFrom > -1 ?
												// put back in the original slot so it doesn't move unless it
												// needs to (relying on a stable sort below)
												removedFrom :
												resultsArray.length;

										// add the new item
										resultsArray.splice(firstInsertedInto, 0, changed);

										// sort it
										insertedInto = arrayUtil.indexOf(queryExecutor(resultsArray), changed);

										// we now need to push the change back into the original results array.

										// remove the inserted item from the previous index
										resultsArray.splice(firstInsertedInto, 1);

										if ((options.start && insertedInto === 0) ||
											(!atEnd && insertedInto === resultsArray.length)) {
											// if it is at the end of the page, assume it goes into the prev or next page
											insertedInto = -1;
										}else{
											// and insert into the results array with the correct index
											resultsArray.splice(insertedInto, 0, changed);
										}
									}
								}
								else if (changed) {
									// we don't have a queryEngine, so we can't provide any information
									// about where it was inserted or moved to. If it is an update, we leave its
									// position alone, other we at least indicate a new object
									if (existingId !== undefined) {
										// an update, keep the index the same
										insertedInto = removedFrom;
									}
									else if (!options.start) {
										// a new object
										insertedInto = self.defaultIndex || 0;
										resultsArray.splice(insertedInto, 0, changed);
									}
								}
								if ((removedFrom > -1 || insertedInto > -1) &&
										(includeObjectUpdates || !queryExecutor || (removedFrom !== insertedInto))) {
									var copyListeners = listeners.slice();
									for (i = 0;listener = copyListeners[i]; i++) {
										listener(changed || removedObject, removedFrom, insertedInto);
									}
								}
							});
						});
					}

					var handle = {};
					handle.remove = handle.cancel = function () {
						// remove this listener
						var index = arrayUtil.indexOf(listeners, listener);
						// check to make sure we haven't already called cancel
						if (index > -1) {
							listeners.splice(index, 1);
							if (!listeners.length) {
								// no more listeners, remove the query updater too
								self._observeUpdaters.splice(arrayUtil.indexOf(self._observeUpdaters, queryUpdater), 1);
							}
						}
					};
					return handle;
				};
			}

			return results;
		}
	});
});
