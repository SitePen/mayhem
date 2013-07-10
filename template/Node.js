define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'dojo/dom-construct',
	'dbind/bind',
	'dojo/date/locale'
], function (lang, declare, domConstruct, bind, dateLocale) {

	// Helper functions that can be called in data binding expressions.
	var bindingHelperFunctions = {
		date: function (format) {
			return dateLocale.format(new Date(), { selector: 'date', datePattern: format });
		}
	};

	/*=====
	var __TemplateNodeArgs = {
		// summary:
		//		kwArgs for template node construction

		// view: framework/View
		//		The view to associate with the template node

		// bindingContext: Object?
		//		The context to bind to. If not provided, a default is created.
	};
	=====*/

	return declare(null, {
		// summary:
		//		The base class for all template nodes.

		// fragment: DomFragment
		//		The DOM fragment associated with this instance
		fragment: null,

		// beginMarker: DomNode
		//		A DOM comment marking the beginning of the DOM nodes owned by this template node.
		beginMarker: null,

		// endMarker: DomNode
		//		A DOM comment marking the end of the DOM nodes owned by this template node.
		endMarker: null,

		constructor: function (/*kwArgs*/) {
			// summary:
			//		Create the template node.
			// kwArgs: __TemplateNodeArgs
			//		The view associated with this template node

			// Do nothing
		},

		postscript: function (/*__TemplateNodeArgs*/ kwArgs) {
			// summary:
			//		Complete template node instantiation.
			// kwArgs:
			//		The construction args

			if (!kwArgs.bindingContext) {
				// Create a default binding context
				kwArgs = lang.delegate(kwArgs, {
					bindingContext: this._createDefaultBindingContext(kwArgs.view)
				});
			}

			this._create(kwArgs);
		},

		_create: function (/*kwArgs*/) {
			// summary:
			//		Create a template node.
			// kwArgs: __TemplateNodeArgs
			// 		The create arguments

			var fragment = this.fragment || (this.fragment = document.createDocumentFragment()),
				beginMarker = this.beginMarker = document.createComment('begin-' + this.id),
				endMarker = this.endMarker = document.createComment('end-' + this.id);

			domConstruct.place(beginMarker, fragment, 'first');
			domConstruct.place(endMarker, fragment, 'last');
		},

		_createDefaultBindingContext: function (/*framework/View*/ view) {
			// summary:
			//		Create the default data binding context from the view.
			// view:
			//		The view used to create the default context.
			// returns: Object
			//		The binding context

			return lang.delegate(
				view.binder,
				lang.mixin({}, bindingHelperFunctions, {
					app: view.app,
					router: view.app.router
				})
			);
		},

		placeAt: function (/*DomNode*/ referenceNode, /*String?*/ position) {
			// summary:
			//		Place the template node.
			// referenceNode
			//		A reference point for the placement
			// position:
			//		A relative position specifier

			// Remove nodes into the fragment so they can be easily placed.
			this.remove();

			domConstruct.place(this.fragment, referenceNode, position);
		},

		remove: function () {
			// summary:
			//		Remove the template node from its current location

			// Remove nodes into fragment if they aren't already there.
			if (!this.fragment.contains(this.beginMarker)) {
				var range = document.createRange();
				range.setStartBefore(this.beginMarker);
				range.setEndAfter(this.endMarker);
				this.fragment = range.extractContents();
				range.detach();

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

		startup: function () {
			// summary:
			//		Start the template node.

			// Do nothing
		},

		destroy: function () {
			// summary:
			//		Destroy the template node.

			// TODO: Remove data bindings.

			this.remove();
		}
	});
});
