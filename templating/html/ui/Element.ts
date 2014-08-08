import arrayUtil = require('dojo/_base/array');
import BindDirection = require('../../../binding/BindDirection');
import binding = require('../../../binding/interfaces');
import Container = require('../../../ui/dom/Container');
import domConstruct = require('dojo/dom-construct');
import has = require('../../../has');
import Widget = require('../../../ui/dom/Widget');

var BIND:RegExp = /^bind (.*)$/;
var BIND_ATTRIBUTE:RegExp = /<!--bind (.*?)-->/g;
var CHILD:RegExp = /^child ([0-9]+)$/;
var PLACEHOLDER:RegExp = /^placeholder (.*)$/;

function createPlaceholderSetter(property:string, placeholderNode:Node):(value:Widget) => void {
	property = '_' + property;
	return function (value:Widget):void {
		var oldValue:Widget = this[property];
		oldValue && oldValue.detach();

		if (value) {
			placeholderNode.parentNode.insertBefore(value.detach(), placeholderNode);
			value.set({
				isAttached: this._isAttached,
				parent: this
			});
		}

		this._placeholders[property] = this[property] = value;
	};
}

// TODO: This is using Container to manage some of the children lifecycle but the actual container APIs aren’t generally
// applicable, so it should probably be extending MultiNodeWidget and using Container like a mixin
/**
 * The Element class generates a Widget representing a string of arbitrary, data-bound HTML from the Mayhem HTML
 * templating engine. This class is designed to work only with the construction format defined in the html.pegjs Element
 * rule.
 */
class Element extends Container {
	get:Element.Getters;
	on:Element.Events;
	set:Element.Setters;

	private _bindingHandles:binding.IBindingHandle[];

	/**
	 * An array of raw content consisting of HTML strings and one of three special objects:
	 *
	 * * `$bind` objects representing data bindings;
	 * * `$child` objects representing placeholders for positioned child widgets that existed within the HTML template;
	 * * `$placeholder` objects representing placeholders for named placeholders
	 *
	 * This property is only designed to be set at construction time.
	 */
	private _content:any[];

	// TODO: _model actually comes from the templating engine
	private _model:Object;

	/**
	 * A map of widgets currently assigned to the different placeholder properties within the Element.
	 */
	private _placeholders:{ [id:string]:Widget; };

	_initialize():void {
		super._initialize();
		this._bindingHandles = [];
		this._model = {};
		this._placeholders = {};
	}

	/**
	 * @override
	 */
	_childrenSetter(value:Widget[]):void {
		// Children can only be set at construction time on this widget
		for (var i = 0, child:Widget; (child = value[i]); ++i) {
			child.set('parent', this);
		}

		this._children = value;
	}

	destroy():void {
		var placeholder:Widget;
		for (var key in this._placeholders) {
			placeholder = this._placeholders[key];
			placeholder && placeholder.destroy();
		}

		this._placeholders = null;
		super.destroy();
	}

	_isAttachedSetter(value:boolean):void {
		super._isAttachedSetter(value);

		var placeholders:{ [id:string]:Widget; } = this._placeholders;
		for (var key in placeholders) {
			placeholders[key] && placeholders[key].set('isAttached', value);
		}
	}

	_render():void {
		var self = this;
		var binder:binding.IBinder = this._app.get('binder');

		function generateContent(source:any[]):Node {
			var htmlContent:string = '';

			for (var i:number = 0, j:number = source.length, part:any; i < j; ++i) {
				part = source[i];
				if (typeof part === 'string') {
					htmlContent += part;
				}
				else if (part.$child !== undefined) {
					htmlContent += '<!--child ' + part.$child + '-->';
				}
				else if (part.$placeholder !== undefined) {
					htmlContent += '<!--placeholder ' + part.$placeholder + '-->';
				}
				else if (part.$bind !== undefined) {
					htmlContent += '<!--bind ' + part.$bind + '-->';
				}
			}

			return domConstruct.toDom(htmlContent);
		}

		function processNode(node:Node):void {
			var result:RegExpExecArray;
			if (node.nodeType === Node.COMMENT_NODE) {
				if ((result = PLACEHOLDER.exec(node.nodeValue))) {
					self['_' + result[1] + 'Setter'] = createPlaceholderSetter(result[1], node);
				}
				else if ((result = CHILD.exec(node.nodeValue))) {
					node.parentNode.replaceChild(self._children[result[1]].detach(), node);
				}
				else if ((result = BIND.exec(node.nodeValue))) {
					var newNode:Text = document.createTextNode('');
					node.parentNode.replaceChild(newNode, node);

					self._bindingHandles.push(binder.bind({
						source: self._model,
						sourcePath: result[1],
						target: newNode,
						targetPath: 'nodeValue',
						direction: BindDirection.ONE_WAY
					}));
				}
				// else it is just a normal HTML comment
			}
			else if (node.nodeType === Node.ELEMENT_NODE) {
				for (var i:number = 0, attribute:Attr; (attribute = node.attributes[i]); ++i) {
					var nodeValue:string = attribute.value;
					if ((result = BIND_ATTRIBUTE.exec(nodeValue))) {
						var lastIndex:number = 0;

						var compositeBinding:any[] = [];

						do {
							compositeBinding.push(nodeValue.slice(lastIndex, result.index));
							compositeBinding.push({ path: result[1] });
							lastIndex = result.index + result[0].length;
						} while ((result = BIND_ATTRIBUTE.exec(nodeValue)));

						compositeBinding.push(nodeValue.slice(lastIndex));

						self._bindingHandles.push(binder.bind({
							source: self._model,
							// TODO: Loosen restriction on sourcePath in binding interfaces?
							sourcePath: <any> compositeBinding,
							target: attribute,
							targetPath: 'value',
							direction: BindDirection.ONE_WAY
						}));
					}
				}
			}
		}

		var content:Node = generateContent(this._content);
		var node:Node = content;
		var nextNode:Node;
		while (node) {
			// Some nodes are replaced by `processNode`, so we have to find the next node first, before any
			// replacements occur and `node` becomes orphaned
			if (node.firstChild) {
				nextNode = node.firstChild;
			}
			else if (node.nextSibling) {
				nextNode = node.nextSibling;
			}
			else if (node.parentNode && node.parentNode !== content && node.parentNode.nextSibling) {
				nextNode = node.parentNode.nextSibling;
			}
			else {
				nextNode = null;
			}

			processNode(node);
			node = nextNode;
		}

		super._render();
		this._fragment.insertBefore(content, this._lastNode);
	}
}

module Element {
	export interface Events extends Container.Events {}
	export interface Getters extends Container.Getters {
		(key:'model'):Object;
	}
	export interface Setters extends Container.Setters {
		(key:'model', value:Object):void;
	}
}

export = Element;
