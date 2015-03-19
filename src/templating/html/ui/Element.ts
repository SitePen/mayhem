import BindDirection = require('../../../binding/BindDirection');
import binding = require('../../../binding/interfaces');
import Container = require('../../../ui/dom/Container');
import domConstruct = require('dojo/dom-construct');
import has = require('../../../has');
import ProxyBinding = require('../binding/ProxyBinding');
import ui = require('../../../ui/interfaces');
import Widget = require('../../../ui/dom/Widget');

var Node:Node;
if (has('dom-addeventlistener')) {
	Node = (<any> window).Node;
}
else {
	Node = <any> {
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2,
		TEXT_NODE: 3,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_FRAGMENT_NODE: 11
	};
}

var BIND:RegExp = /^bind ([0-9]+)$/;
var BIND_ATTRIBUTE:RegExp = /<!--bind ([0-9]+)-->/g;
var CHILD:RegExp = /^child ([0-9]+)$/;
var EVENT_ATTRIBUTE:RegExp = /^on-(.*)$/;
var PLACEHOLDER:RegExp = /^placeholder (.*)$/;

function createPlaceholderSetter(property:string, placeholderNode:Node):(value:Widget) => void {
	property = '_' + property;
	return function (value:Widget):void {
		var oldValue:Widget = this[property];
		oldValue && oldValue.detach();

		if (value) {
			placeholderNode.parentNode.insertBefore(value.detach(), placeholderNode);
			value.set({
				isAttached: this.get('isAttached'),
				parent: this
			});
		}

		this._placeholders[property] = this[property] = value;
	};
}

interface ElementListener {
	node: Element;
	listener: (event: ui.UiEvent) => void;
}

// TODO: This is using Container to manage some of the children lifecycle but the actual container APIs aren’t generally
// applicable, so it should probably be extending MultiNodeWidget and using Container like a mixin
/**
 * The Element class generates a Widget representing a string of arbitrary, data-bound HTML from the Mayhem HTML
 * templating engine. This class is designed to work only with the construction format defined in the html.pegjs
 * Element rule.
 */
class ElementWidget extends Container {
	static inheritsModel:boolean = true;

	get:ElementWidget.Getters;
	on:ElementWidget.Events;
	set:ElementWidget.Setters;

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

	/**
	 * A map of event names to arrays of event listeners, used to force events to fire on the innermost targets first.
	 */
	private _eventQueues:HashMap<ElementListener[]>;

	/**
	 * A map of widgets currently assigned to the different placeholder properties within the ElementWidget.
	 */
	private _placeholders:{ [id:string]:Widget; };

	_initialize():void {
		super._initialize();
		this._bindingHandles = [];
		this._eventQueues = {};
		this._placeholders = {};

		this.observe('model', function (value:{}) {
			value = value || {};
			var handle:binding.IBindingHandle;
			for (var i = 0; (handle = this._bindingHandles[i]); ++i) {
				handle.setSource(value);
			}
		});
	}

	/**
	 * @override
	 */
	_childrenGetter():Widget[] {
		return this._children;
	}
	_childrenSetter(value:Widget[]):void {
		// Children can only be set at construction time on this widget
		for (var i = 0, child:Widget; (child = value[i]); ++i) {
			child.set({
				isAttached: this.get('isAttached'),
				parent: this
			});
		}

		this._children = value;
	}

	destroy():void {
		var placeholder:Widget;
		for (var key in this._placeholders) {
			placeholder = this._placeholders[key];
			placeholder && placeholder.destroy();
		}

		this._eventQueues = null;
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
		var model = this.get('model') || {};
		var bindings:Array<{ $bind:any; direction:number; }> = [];

		function addEvent(node:Node, eventName:string, listener:(event:ui.UiEvent) => void) {
			function getElement(event: ui.UiEvent) {
				if ('key' in event) {
					return document.activeElement;
				}
				else if ('clientX' in event) {
					return document.elementFromPoint(
						(<ui.PointerEvent> event).clientX,
						(<ui.PointerEvent> event).clientY
					);
				}
			}

			function runListeners(target:Element, event:ui.UiEvent) {
				var newEvent:ElementWidget.ElementPointerEvent;
				newEvent = Object.create(event);
				newEvent.preventDefault = function () {
					event.preventDefault();
				};
				newEvent.stopPropagation = function () {
					event.stopPropagation();
				};
				newEvent.targetNode = target;
				newEvent.bubbles = (eventName !== 'pointerenter' && eventName !== 'pointerleave');
				newEvent.type = eventName;

				var currentListeners = listeners.slice(0);
				for (var i = 0, entry:ElementListener; (entry = currentListeners[i]); ++i) {
					if (
						target === entry.node ||
						(newEvent.bubbles && !newEvent.propagationStopped && (<HTMLElement> entry.node).contains(<HTMLElement> target))
					) {
						newEvent.currentTargetNode = entry.node;
						entry.listener.call(self, newEvent);
					}
				}
			}

			var listeners = self._eventQueues[eventName];

			if (!listeners) {
				listeners = self._eventQueues[eventName] = [];

				if (
					eventName === 'pointerout' ||
					eventName === 'pointerleave' ||
					eventName === 'pointerover' ||
					eventName === 'pointerenter'
				) {
					var lastElement: Element;

					if (eventName === 'pointerleave') {
						self.on('pointermove', function (event:ui.PointerEvent) {
							var newElement = getElement(event);
							if (lastElement && !(<HTMLElement> lastElement).contains(<HTMLElement> newElement)) {
								runListeners(lastElement, event);
							}

							lastElement = newElement;
						});
					}
					else if (eventName === 'pointerout') {
						self.on('pointermove', function (event:ui.PointerEvent) {
							var newElement = getElement(event);
							if (
								lastElement &&
								!(<HTMLElement> lastElement).contains(<HTMLElement> newElement) &&
								// Pointer movements across interior widget boundaries will be picked up by the
								// listeners for pointerover and pointerout on this widget, so should not be dispatched
								// by this pointermove handler
								!(<any> lastElement)['widget']
							) {
								runListeners(lastElement, event);
							}

							lastElement = newElement;
						});
					}
					else if (eventName === 'pointerenter') {
						self.on('pointermove', function (event:ui.PointerEvent) {
							var newElement = getElement(event);
							if (newElement && !(<HTMLElement> newElement).contains(<HTMLElement> lastElement)) {
								runListeners(newElement, event);
							}

							lastElement = newElement;
						});
					}
					else if (eventName === 'pointerover') {
						self.on('pointermove', function (event:ui.PointerEvent) {
							var newElement = getElement(event);
							if (
								newElement &&
								!(<HTMLElement> newElement).contains(<HTMLElement> lastElement) &&
								// Pointer movements across interior widget boundaries will be picked up by the
								// listeners for pointerover and pointerout on this widget, so should not be dispatched
								// by this pointermove handler
								!(<any> newElement)['widget']
							) {
								runListeners(newElement, event);
							}

							lastElement = newElement;
						});
					}

					if (eventName === 'pointerout' || eventName === 'pointerleave') {
						self.on('pointerleave', function (event:ui.PointerEvent) {
							if (lastElement) {
								runListeners(lastElement, event);
								lastElement = null;
							}
						});

						// Need to watch for Mayhem’s own pointerout events since they may be caused by widgets and we
						// want to know about that
						if (eventName === 'pointerout') {
							self.on('pointerout', function (event:ui.PointerEvent) {
								// TODO: It would seem to be a bug if we receive an event with no target or a target
								// with no firstNode, so the defensiveness of this method is probably not so necessary.
								var oldNode = event.target && (<Widget> event.target).get('firstNode');

								if (oldNode) {
									runListeners(<Element> oldNode, event);
								}
							});
						}
					}
					else {
						self.on('pointerenter', function (event:ui.PointerEvent) {
							var newElement = getElement(event);
							if (newElement) {
								runListeners(newElement, event);
								lastElement = newElement;
							}
						});

						// Need to watch for Mayhem’s own pointerover events since they may be caused by widgets and we
						// want to know about that
						if (eventName === 'pointerover') {
							self.on('pointerover', function (event:ui.PointerEvent) {
								// TODO: It would seem to be a bug if we receive an event with no target or a target
								// with no firstNode, so the defensiveness of this method is probably not so necessary.
								var newNode = event.target && (<Widget> event.target).get('firstNode');

								if (newNode) {
									runListeners(<Element> newNode, event);
								}
							});
						}
					}
				}
				else {
					self.on(eventName, function (event:ui.PointerEvent) {
						var target = getElement(event);
						if (!target) {
							return;
						}

						runListeners(target, event);
					});
				}
			}

			// the parser adds events in descending order, but event listeners need to be called in lowest-to-highest
			// order (to match bubbling), so the listeners are unshifted here instead of pushed
			listeners.unshift({ node: <Element> node, listener });
		}

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
					bindings.push(part);
					htmlContent += '<!--bind ' + (bindings.length - 1) + '-->';
				}
			}

			var domContent:Node;

			if (has('dom-firstchild-empty-bug')) {
				htmlContent = '&shy;' + htmlContent;
				domContent = domConstruct.toDom(htmlContent);
				var shyNode:Node = domContent.childNodes[0];
				if (shyNode.nodeType === 3 && shyNode.nodeValue.charAt(0) === '\u00AD') {
					shyNode.nodeValue = shyNode.nodeValue.slice(1);
				}
			}
			else {
				domContent = domConstruct.toDom(htmlContent);
				// if htmlContent contains only a single node, toDom will give us just that node, but we always need
				// a fragment for processing or else there will be no parent node to replace inside
				if (domContent.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
					var fragment = document.createDocumentFragment();
					fragment.appendChild(domContent);
					domContent = fragment;
				}
			}

			return domContent;
		}

		function processNode(node:Node):void {
			var result:RegExpExecArray;
			if (node.nodeType === Node.COMMENT_NODE) {
				if ((result = PLACEHOLDER.exec(node.nodeValue))) {
					// TS7017
					(<any> self)['_' + result[1] + 'Setter'] = createPlaceholderSetter(result[1], node);
				}
				else if ((result = CHILD.exec(node.nodeValue))) {
					// TS7017
					node.parentNode.replaceChild(self._children[<any> result[1]].detach(), node);
				}
				else if ((result = BIND.exec(node.nodeValue))) {
					var newNode:Text = document.createTextNode('');
					node.parentNode.replaceChild(newNode, node);

					self._bindingHandles.push(binder.bind({
						source: model,
						sourcePath: bindings[Number(result[1])].$bind,
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
					if ((result = EVENT_ATTRIBUTE.exec(attribute.name))) {
						(function (nodeValue:string):void {
							var boundEvent:RegExpExecArray = BIND_ATTRIBUTE.exec(nodeValue);
							// Since we do not call `exec` until it returns nothing, we are responsible for resetting
							// the RegExp, otherwise the next match will start from this match’s `lastIndex` and fail
							BIND_ATTRIBUTE.lastIndex = 0;
							var binding:ProxyBinding<Function>;

							// TODO: This is a hack to work around that binding in an HTML attribute without quotes
							// generates invalid HTML in the first version of the templating engine
							if (boundEvent) {
								if (boundEvent[0].length !== nodeValue.length) {
									throw new Error('Illegal event binding to ' + attribute.name + ': ' +
										(<HTMLElement> node).outerHTML);
								}

								binding = new ProxyBinding<any>({
									binder: binder,
									object: model,
									path: bindings[Number(boundEvent[1])].$bind
								});

								self._bindingHandles.push(binding);
							}

							var eventName:string = result[1].toLowerCase().replace(/-(.)/g, function (_:string, character:string):string {
								return character.toUpperCase();
							});

							addEvent(node, eventName, function (event:ui.UiEvent) {
								if (binding) {
									return binding.get().call(binding.getObject(), event);
								}
								else {
									// TODO: Use `get`?
									// TS7017
									return (<any> self)[nodeValue](event);
								}
							});
						})(nodeValue);
					}
					else if ((result = BIND_ATTRIBUTE.exec(nodeValue))) {
						var lastIndex:number = 0;

						// If a binding is the sole value in an attribute, we can skip the overhead of making a
						// composite binding and also enable two-way data binding to DOM properties that are two-way,
						// like input values
						if (result.index === 0 && result[0].length === nodeValue.length) {
							var kwArgs = {
								source: model,
								sourcePath: bindings[Number(result[1])].$bind,
								target: <any> attribute,
								targetPath: 'value',
								direction: bindings[Number(result[1])].direction
							};

							// Assume attempts to bind to two-way DOM attributes are actually attempts to bind to their
							// active values, not their default values (which is what the DOM attribute nodes represent)
							for (var defaultDomKey in { value: true, checked: true }) {
								if (attribute.name === defaultDomKey && defaultDomKey in node) {
									kwArgs.target = node;
									kwArgs.targetPath = defaultDomKey;

									// For anyone looking at the DOM in dev tools
									attribute.value = '{' + kwArgs.sourcePath + '}';
									if (kwArgs.direction === BindDirection.TWO_WAY) {
										attribute.value = '{' + attribute.value + '}';
									}
									break;
								}
							}

							self._bindingHandles.push(binder.bind(kwArgs));

							// Since we do not call `exec` until it returns nothing, we are responsible for resetting
							// the RegExp, otherwise the next match will start from this match’s `lastIndex` and fail
							BIND_ATTRIBUTE.lastIndex = 0;
						}
						else {
							var compositeBinding:any[] = [];

							do {
								compositeBinding.push(nodeValue.slice(lastIndex, result.index));
								compositeBinding.push({ path: bindings[Number(result[1])].$bind });
								lastIndex = result.index + result[0].length;
							} while ((result = BIND_ATTRIBUTE.exec(nodeValue)));

							compositeBinding.push(nodeValue.slice(lastIndex));

							self._bindingHandles.push(binder.bind({
								source: model,
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
			else if (node.parentNode) {
				var maybeNextNode:Node = node;
				nextNode = null;

				// the next node may be back up through multiple parents
				while (maybeNextNode.parentNode && maybeNextNode.parentNode !== content) {
					maybeNextNode = maybeNextNode.parentNode;
					if (maybeNextNode.nextSibling) {
						nextNode = maybeNextNode.nextSibling;
						break;
					}
				}
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

module ElementWidget {
	export interface Events extends Container.Events {}
	export interface Getters extends Container.Getters {
		(key:'model'):Object;
	}
	export interface Setters extends Container.Setters {
		(key:'model', value:Object):void;
	}

	export interface ElementPointerEvent extends ui.PointerEvent {
		currentTargetNode: Element;
		targetNode: Element;
	}
}

export = ElementWidget;
