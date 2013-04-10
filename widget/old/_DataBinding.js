define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/on",
	"dijit/registry"
], function (lang, declare, on, registry) {
	var SINGLE_BIND_RE = /^\s*\$b\{([^}]+)\}\s*$/,
		BIND_RE = /\$b\{([^}]+)\}/;

	function isTextAreaBinding(/*DomNode*/ node) {
		//	summary:
		//		Returns whether or not the given node is a binding inside a text area.
		return node.parentNode &&
			node.parentNode.nodeName.toUpperCase() === "TEXTAREA";
	}

	function isInputValueBinding(node) {
		//	summary:
		//		Returns whether or not the given node is binding inside an input value.
		return node.name &&
			node.name.toLowerCase() === "value" &&
			node.ownerElement &&
			node.ownerElement.nodeName.toUpperCase() === "INPUT";
	}

	function isFormWidgetBinding(node) {
		//	summary:
		//		Returns whether or not the given node is binding inside a form widget.

		if (!node.name || node.name.toLowerCase() !== "value" || !node.ownerElement) {
			return false;
		}

		var widget = registry.getEnclosingWidget(node.ownerElement);
		return widget && "value" in widget;
	}

	return declare(null, {
		//	summary:
		//		A widget mixin that attributes and text nodes to be bound to
		//		objects attached to the widget using a $b{bound.object.property}
		//		syntax. This mixin is mostly useful only when working with
		//		templated widgets.
		//	example:
		//		In this example, the value of the label will change any time
		//		`this.nameLabel` is updated, the value of the input field will
		//		change any time `this.model.name` is updated, and the value
		//		of `this.model.name` will be updated whenever the input field
		//		changes:
		//		| <div>
		//		|	<label>$b{nameLabel}</label>: <input value="$b{model.name}">
		//		| </div>
		//	example:
		//		You can also bind boolean values to checkboxes:
		//		| <input type="checkbox" value="$b{model.isBoolean}">

		//	_dataBindings: Handle[]
		//		An array of watch handles for all the data objects that are bound by this widget.
		_dataBindings: [],

		buildRendering: function () {
			//	summary:
			//		Adds data binding based on strings placed in the DOM.

			function bind(/*string*/ fromKey, /*DomNode*/ toNode) {
				//	summary:
				//		Binds an object at `this[fromKey]` to the value of the
				//		node at `toNode`.

				var bindKey = fromKey.split("."),
					watchHandles = [],
					nodeHandles = [];

				function updateNode() {
					//	summary:
					//		Updates the value of the bound node.

					var newValue = arguments[2];
					toNode = self._updateBoundNode(toNode, fromKey, newValue) || toNode;
				}

				function updateValue(/*Event*/ event) {
					//	summary:
					//		Updates the value of the bound object.
					//	event:
					//		DOM event.

					var target = event.target,
						object = lang.getObject(bindKey.slice(0, -1).join("."), false, self),
						key = bindKey[bindKey.length - 1],
						value = target.value;

					if (object) {
						// Inference against the string type instead of the boolean type allows for the current value
						// to be null/undefined and still use the correct value
						if (typeof object.get(key) !== "string" && (target.type === "checkbox" || target.type === "radio")) {
							value = target.checked;
						}

						self._updateBoundObject(object, key, value);
					}
				}

				function rebind(/*dojo/Stateful*/ object, /*number*/ i) {
					//	summary:
					//		Rebinds object watchers when an intermediate object
					//		in the bound chain has been modified.
					//	object:
					//		The new object bound to the key at index i.
					//	i:
					//		The index of the key that has changed.

					// Stop watching any objects that are no longer part of the bound object chain
					watchHandles.splice(i).forEach(function (handle) { handle.remove(); });

					// If any of the intermediate objects between `object` and the key we are actually binding
					// change, we need to rebind the entire object chain from the changed object
					for (var key; (key = bindKey[i]) && i < bindKey.length - 1; ++i) {
						// If the watched key changes, rebind that object
						watchHandles.push(object.watch(key, lang.partial(function (i, key, oldValue, newValue) {
							rebind(newValue, i + 1);
						}, i)));

						// If there is no object here, we cannot rebind any further; presumably, at some point in
						// the future, an object might exist here
						if (!(object = object.get(key))) {
							break;
						}
					}

					// This is the final object in the chain, the one on which we are actually looking for values
					if (object) {
						// If the values on this final object change we only need to update the value, not rebind
						// any intermediate objects
						watchHandles.push(object.watch(key, updateNode));

						// And of course we want to update the bound value immediately, now that one exists
						updateNode(key, null, object.get(key));
					}
				}

				// If the node is an attribute of a form element, or is a text node inside a form element
				// (like text area), add two-way binding; this needs to be done before object-to-node binding
				// because we do checks on the content for textarea binds

				// Only perform two-way binding on text areas if the only data in the text area is the data binding
				// key
				if (isTextAreaBinding(toNode) && SINGLE_BIND_RE.test(toNode.parentNode.value)) {
					nodeHandles.push(on(toNode.parentNode, "change", updateValue));
				}
				else if (isFormWidgetBinding(toNode)) {
					nodeHandles.push(registry.getEnclosingWidget(toNode.ownerElement).on("change", function () {
						updateValue({ target: toNode.ownerElement });
					}));
				}
				else if (isInputValueBinding(toNode)) {
					nodeHandles.push(on(toNode.ownerElement, "change", updateValue));
				}

				// If the node is a text node and its value is not changed from the $b{}, it will be processed
				// infinitely, so just empty out the node's value
				toNode.nodeValue = "";

				// Perform the object-to-node binding
				rebind(self, 0);

				dataBindings.push({
					remove: function () {
						var handle;
						while ((handle = watchHandles.pop())) {
							handle.remove();
						}
						while ((handle = nodeHandles.pop())) {
							handle.remove();
						}

						toNode = nodeHandles = watchHandles = null;
					}
				});
			}

			function processNode(/*DomNode*/ node) {
				//	summary:
				//		Walks the widget's DOM, finding and applying data
				//		binding to attributes and text nodes where it is
				//		specified.
				//	node:
				//		A DOM node to inspect for data bindings.

				var bindKey;

				if (node.nodeType === Node.ELEMENT_NODE) {
					var i,
						child;

					for (i = 0; (child = node.attributes[i]); ++i) {
						processNode(child);
					}

					// Note that the list of childNodes will grow if data-bound nodes are discovered, so do not
					// try to replace this with any sort of forEach that fixes the iterator maximum
					for (i = 0; (child = node.childNodes[i]); ++i) {
						processNode(child);
					}
				}
				else if (node.nodeType === Node.ATTRIBUTE_NODE) {
					if ((bindKey = SINGLE_BIND_RE.exec(node.nodeValue))) {
						bind(bindKey[1], node);
					}
				}
				else if (node.nodeType === Node.TEXT_NODE) {
					if ((bindKey = BIND_RE.exec(node.nodeValue))) {
						var bindNode = node.splitText(bindKey.index);
						bindNode.splitText(bindKey[0].length);
						bind(bindKey[1], bindNode);
					}
				}
			}

			var self = this,
				dataBindings = this._dataBindings = [];
			this.inherited(arguments);
			processNode(this.domNode);
		},

		_updateBoundObject: function (/*dojo/Stateful*/ object, /*string*/ key, /*string*/ value) {
			//	summary:
			//		Updates the object `object` with the value given in `value`.
			//	object:
			//		The object to be updated.
			//	node:
			//		The key of the bound data.
			//	value:
			//		The value from the bound node.

			if (typeof object.get(key) === "number" && !isNaN(value)) {
				value = +value;
			}
			else if (typeof object.get(key) === "boolean" && (value === "true" || value === "false")) {
				value = value === "true";
			}

			object.set(key, value);
		},

		_updateBoundNode: function (/*DomNode*/ node, /*string*/ key, /*any*/ value) {
			//	summary:
			//		Updates the node `node` with the value given in `value`.
			//	node:
			//		A DOM node to be updated.
			//	key:
			//		The key of the bound data.
			//	value:
			//		The value from the bound data object.
			//	returns: DomNode?
			//		If the originally bound node needs to be replaced (for example, if a text node needs to be
			//		replaced with an Element to display HTML), the replacement node should be returned so that
			//		the next time a bound value is changed, the correct node that now exists in the DOM will be
			//		provided instead of the no longer used original node.

			if (isTextAreaBinding(node)) {
				node.parentNode.value = value;
			}
			else if (isFormWidgetBinding(node)) {
				registry.getEnclosingWidget(node.ownerElement).set("value", value);
			}
			else if (isInputValueBinding(node)) {
				var ownerElement = node.ownerElement;

				if (ownerElement.type === "checkbox" || ownerElement.type === "radio") {
					node.ownerElement.checked = value;
				}
				else {
					node.ownerElement.value = value;
				}
			}

			node.nodeValue = value;
		},

		destroy: function () {
			//	summary:
			//		Ensures all data bindings are removed from objects that were
			//		data bound by this widget.

			if (this._destroyed) {
				return;
			}

			var handle;
			while ((handle = this._dataBindings.pop())) {
				handle.remove();
			}

			this.inherited(arguments);
		}
	});
});