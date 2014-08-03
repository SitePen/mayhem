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
		}

		this[property] = value;
	};
}

class Element extends Container {
	get:Element.Getters;
	on:Element.Events;
	set:Element.Setters;

	private _bindingHandles:binding.IBindingHandle[];
	private _content:any[];
	// TODO fix inheritance of _model
	private _model:Object;

	_initialize():void {
		super._initialize();
		this._bindingHandles = [];
		this._model = {};
	}

	destroy():void {
		super.destroy();

		var handle:binding.IBindingHandle;
		while ((handle = this._bindingHandles.pop())) {
			handle.remove();
		}

		this._bindingHandles = this._model = null;
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
				else if (part.$child) {
					htmlContent += '<!--child ' + part.$child + '-->';
				}
				else if (part.$placeholder) {
					htmlContent += '<!--placeholder ' + part.$placeholder + '-->';
				}
				else if (part.$bind) {
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
					var nodeValue:string = attribute.nodeValue;
					if ((result = BIND_ATTRIBUTE.exec(nodeValue))) {
						var lastIndex:number = 0;

						var compositeBinding:any[] = [];

						do {
							compositeBinding.push(nodeValue.slice(lastIndex, result.index));
							compositeBinding.push({ $bind: result[1] });
							lastIndex = result.index + result[0].length;
						} while ((result = BIND_ATTRIBUTE.exec(attribute.nodeValue)));

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
			else if (node.parentNode !== content && node.parentNode.nextSibling) {
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

	_modelSetter(value:Object):void {
		for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindingHandles[i]); ++i) {
			binding.setSource(value);
		}

		this._model = value;
	}
}

module Element {
	export interface Events extends Container.Events {}
	export interface Getters extends Container.Getters {}
	export interface Setters extends Container.Setters {}
}

export = Element;
