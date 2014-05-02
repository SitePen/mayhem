/// <reference path="../../dojo" />

import array = require('dojo/_base/array');
import ContentView = require('../ContentView');
import Deferred = require('dojo/Deferred');
import dgrid = require('./util/dgrid');
import dom = require('./interfaces');
import _ElementRenderer = require('./_Element');
import Event = require('../../Event');
import Template = require('../../templating/Template');
import util = require('../../util');
import when = require('dojo/when');


class IteratorRenderer extends _ElementRenderer {
	destroy(widget:dom.IIterator):void {
		widget._impl && widget._impl.destroy();
		widget._impl = null;
	}

	private _getSelectionMode(value:any):string {
		// Use 'single' selection mode when truthy but not specified
		if (value) {
			return typeof value === 'string' ? value : 'single';
		}
	}

	private _implIsOnDemand(widget:dom.IIterator):boolean {
		// Duck test based on a property specific to OnDemandList
		return !!(widget._impl && widget._impl['farOffRemoval']);
	}

	private _getWidgetByKey(widget:dom.IIterator, key:string):dom.IContentWidget {
		var child = widget._widgetIndex[key];
		if (child) {
			return child;
		}
		var model = widget._getModelByKey(key);
		child = widget._widgetIndex[key] = <dom.IContentWidget> new widget._ViewCtor();
		child.set('model', model);
		child.set('parent', widget);
		return child;
	}

	initialize(widget:dom.IIterator):void {
		super.initialize(widget);

		// TODO: multiselect support
		widget.observe('selectedItem', (item:any):void => {
			var list:any = widget._impl;
			if (!list) {
				return;
			}

			// Silently clear our list impl's selection
			// TODO: can we do this silently in dgrid?
			list.allSelected = false;
			for (var id in list.selection) {
				list._select(id, null, false);
			}
			list._lastSelected = null;
			// Silently select each value in our selected array
			// for (var i = 0, len = items.length; i < len; ++i) {
			// 	list._select(items[i] || '', null, true);
			// }
			item != null && list._select(item, null, true);
			widget.emit(new Event({
				type: 'selection',
				cancelable: true,
				bubbles: true,
				target: widget
			}));
		});

		widget.observe('allowSelectAll', (value:boolean) => {
			widget._impl && widget._impl.set('allowSelectAll', value);
		});

		widget.observe('allowTextSelection', (value:boolean) => {
			widget._impl && widget._impl.set('allowTextSelection', value);
		});

		widget.observe('source', (source:any, previous:any) => {
			widget._sourceObserverHandle && widget._sourceObserverHandle.remove();

			when(this._renderList(widget), ():void => {
				if (source instanceof Array) {
					// Resize and force refresh on the list
					var lastLength = widget._sourceLength || 0,
						sourceLength = widget._sourceLength = source.length;
					this._updateList(widget, sourceLength - lastLength);
					// Observe our source if it's an ObservableArray
					if (typeof source.observe === 'function') {
						widget._sourceObserverHandle = source.observe((index:number, removals:any[], additions:any[]) => {
							this._updateList(widget, additions.length - removals.length);
						});
					}
				}
				else {
					widget._impl.set('store', source);
				}
			});
		});

		widget.observe('template', (template:any) => {
			// Wipe out old view constructor template and resolve the new one
			widget._ViewCtor = null;
			when(template, (ViewCtor:any) => {
				widget._ViewCtor = ViewCtor;
			});
			// TODO: reinstantiate and replace all widgets with new templates (reusing old models)
		});

		// TODO: two-way bind property to impl list
		widget.observe('selection', (value:any) => {
			widget._impl && widget._impl.set('selectionMode', this._getSelectionMode(value));
		});
	}

	private _renderList(widget:dom.IIterator):IPromise<void> {
		var list = widget._impl,
			source = widget.get('source'),
			arraySource = source instanceof Array,
			currentlyOnDemand = this._implIsOnDemand(widget);

		// No need to render if we already have the right kind of list
		if ((arraySource && list && !currentlyOnDemand) || (!arraySource && currentlyOnDemand)) {
			return;
		}
		// Clean up list and detach all widgets
		array.forEach(util.getObjectKeys(widget._widgetIndex), (key:string) => {
			var item = widget._widgetIndex[key];
			item._renderer.detach(item);
		});

		list && list.destroy();

		var ImplCtor = source instanceof Array ? dgrid.EagerList : dgrid.LazyList;
		list = widget._impl = new ImplCtor({ id: widget.get('id') });
		list._onNotification = function() {
			console.log('list notification:', arguments)
		}

		if (arraySource) {
			var _insertRow:any = list.insertRow;
			list.insertRow = (object:any, parent:any, beforeNode:Node, i:number, options?:any):HTMLElement => {
				var child = this._getWidgetByKey(widget, '' + i);
				child._renderer.detach(child);
				return _insertRow.call(list, child._outerFragment, parent, beforeNode, i, options);
			};
			list.renderRow = (element:any):HTMLElement => element;
		}
		else {
			list.renderRow = (record:any):HTMLElement => {
				var idProperty = widget.get('source').idProperty,
					id = record.get ? record.get(idProperty) : record[idProperty];
				return this._getWidgetByKey(widget, id)._outerFragment;
			};
		}

		// Initialize some list properties and add event listeners
		list.set('selectionMode', this._getSelectionMode(widget.get('selection')));
		list.set('allowSelectAll', widget.get('allowSelectAll'));
		list.set('allowTextSelection', widget.get('allowTextSelection'));


		// TODO: widget selected property as ObservableArray?
		list.on('dgrid-select,dgrid-deselect', util.debounce(() => {
			var selection = widget._impl.selection,
				items:string[] = [];
			for (var key in selection) {
				selection[key] && items.push(key);
			}
			widget.set('selectedItem', items.length === 1 ? items[0] : null);
		}));

		var className = list.domNode.className;
		this._replace(widget, list.domNode);
		widget.classList.add(className);

		// Wait on iterator's template which could be a promise
		return when(widget.get('template'));
	}

	private _replace(widget:dom.IIterator, newRoot:HTMLElement):void {
		var oldRoot = widget._outerFragment;
		if (oldRoot && oldRoot.parentNode) {
			oldRoot.parentNode.replaceChild(newRoot, oldRoot);
		}
		widget._firstNode = widget._lastNode = widget._outerFragment = newRoot;
	}

	private _updateList(widget:dom.IIterator, change:number):void {
		var scopeField = widget.get('each'),
			source = widget.get('source'),
			sourceLength = source.length,
			child:dom.IContentWidget;
		if (change > 0) {
			// If array is larger than before add the necessary rows to our list
			widget._impl.renderArray(source.toArray ? source.toArray() : source);
		}
		else if (change < 0) {
			// If it's smaller, we need to detach any extra widgets
			change = -change;
			for (var i = 0; i < change; ++i) {
				child = widget._widgetIndex[sourceLength + i];
				child._renderer.detach(child);
			}
		}
		// Notify all scoped models of their current values
		for (var i = 0, len = sourceLength; i < len; ++i) {
			widget._modelIndex[i]['_notify'](source[i], null, scopeField);
		}
	}
}

export = IteratorRenderer;
