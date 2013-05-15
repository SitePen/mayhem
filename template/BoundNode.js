define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'dojo/dom-construct',
	'./peg/expressionParser',
	'dbind/bind',
	'dojo/date/locale'
], function (lang, declare, domConstruct, expressionParser, bind, dateLocale) {
	return declare(null, {
		baseFragment: null,

		fragment: null,
		beginMarker: null,
		endMarker: null,

		postscript: function (view, options) {
			options = options || {};
			this._create(view, options);
			this._bind(view, options);
		},

		_create: function (/*view, options*/) {
			// summary:
			//		Create a template node.
			// view:
			// 		The view for which the node is being created.

			var fragment = this.fragment || (this.fragment = document.createDocumentFragment()),
				beginMarker = this.beginMarker = document.createComment('begin-' + this.id),
				endMarker = this.endMarker = document.createComment('end-' + this.id);

			domConstruct.place(beginMarker, fragment, 'first');
			domConstruct.place(endMarker, fragment, 'last');
		},

		_bind: function (/*view*/) {
			// Do nothing in base class.
		},

		placeAt: function (referenceNode, position) {
			// Remove nodes into the fragment so they can be easily placed.
			this.remove();

			domConstruct.place(this.fragment, referenceNode, position);
		},

		remove: function () {
			// Remove nodes into fragment if they aren't already there.
			if (!this.fragment.contains(this.beginMarker)) {
				var range = document.createRange();
				range.setStartBefore(this.beginMarker);
				range.setEndAfter(this.endMarker);
				this.fragment = range.extractContents();

				// TODO: Support IE8 which doesn't support ranges. The below code should work but hasn't been tested yet.
				/*
				// TODO: Is there a simpler way to do this?
				var beginMarker = this.beginMarker,
					endMarker = this.endMarker,
					lastNode = endMarker.previousSibling;

				domConstruct.place(endMarker, referenceNode, position);

				var destination = endMarker.parentNode,
					currentNode = beginMarker,
					nextSibling;
				do {
					nextSibling = currentNode.nextSibling;
					destination.insertBefore(currentNode, endMarker);
				} while (currentNode !== lastNode && (currentNode = nextSibling));
				*/
			}
		},

		bindingHelperFunctions: {
			// TODO: Implement date function
			date: function (format) {
				return dateLocale.format(new Date(), { selector: 'date', datePattern: format });
			}
		},

		_applyBindingExpression: function (expression, view, callback) {
			// TODO: Move this to compiler where it can be parsed and saved with the AST during application builds.
			// TODO: This ternary expression is a hack to make progress. Definitely move all expression parsing to the compiler.
			var result = typeof expression === 'string' ? expressionParser.parse(expression) : expression,
				// Revisit what the context should be. This is a mess.
				supplementalReferences = lang.mixin({}, this.bindingHelperFunctions, {
					app: view.app,
					// TODO: Support relative paths to createPath
					router: view.app.router
				}),
				context = lang.delegate(view.viewModel, supplementalReferences),
				resolveObject = function (references) {
					return lang.getObject(references.join('.'), false, context);
				},
				object;

			if (result.type === 'function-call') {
				var name = result.name;

				object = resolveObject(name.references);

				callback = (function (funcToCall, callback) {
					return function (value) { callback(funcToCall(value)); };
				})(lang.hitch(object, name.target), callback);

				result = result.argument;
			}

			var type = result.type;
			if (type === 'dot-expression') {
				var identifiers = result.references,
					targetProperty = result.target;

				object = resolveObject(identifiers);

				if (object && targetProperty in object) {
					bind(object).get(targetProperty).getValue(callback);
				}
				else {
					callback(new Error(identifiers.join('.') + '.' + targetProperty + ' is undefined'));
				}
			}
			else if (type === 'number' || type === 'string') {
				callback(result.value);
			}
			else {
				throw new Error('Unrecognized data binding expression type: ' + type);
			}
		},

		destroy: function () {
			// TODO
			this.remove();
		}
	});
});