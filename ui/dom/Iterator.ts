import array = require('dojo/_base/array');
import dom = require('./interfaces');
import DomElementRenderer = require('./_Element');
import List = require('dgrid/List');
import OnDemandList = require('dgrid/OnDemandList');
import util = require('../../util');
import View = require('../View');
import WidgetFactory = require('../../templating/WidgetFactory');

class IteratorRenderer extends DomElementRenderer {
	destroy(widget:dom.IIterator):void {
		widget._list && widget._list.destroy();
		widget._list = widget._source = null;
	}

	initialize(widget:dom.IIterator):void {
		widget.observe('source', (source:any, previous:any) => {
			// Remove old source observer, if applicable
			if (source !== previous) {
				widget._sourceObserverHandle && widget._sourceObserverHandle.remove();
			}
			this._renderList(widget);
			if (source instanceof Array) {
				// Resize and force refresh on the list
				var lastLength = widget._listLength || 0,
					listLength = widget._listLength = source.length;
				this._updateList(widget, listLength - lastLength);
				// Observe our source if it's an ObservableArray
				if (typeof source.observe === 'function') {
					widget._sourceObserverHandle = source.observe((index:number, removals:any[], additions:any[]) => {
						this._updateList(widget, additions.length - removals.length);
					});
				}
			}
			else {
				widget._list.set('store', source);
			}
		});

		widget.observe('template', (template:any) => {
			// Set constructor since it comes in without one (to avoid being constructed during processing)
			// TODO: pass reference to constructor in options
			// TODO: reinstantiate and replace all widgets with new templates (reusing old mediators)
			widget._factory = new WidgetFactory(template, View);
		});
	}

	private _renderList(widget:dom.IIterator):void {
		var list = widget._list,
			source = widget.get('source'),
			arraySource = source instanceof Array,
			onDemand = list instanceof OnDemandList;

		// No need to render if we already have the right kind of list
		if ((arraySource && list && !onDemand) || (!arraySource && onDemand)) {
			return;
		}
		// Clean up list and detach all widgets
		array.forEach(util.getObjectKeys(widget._widgetIndex), (key:string) => {
			widget._widgetIndex[key].detach();
		});
		list && list.destroy();
		if (source instanceof Array) {
			list = widget._list = new List();
			var _insertRow:any = list.insertRow;
			list.insertRow = (object:any, parent:any, beforeNode:Node, i:number, options?:any):HTMLElement => {
				var child = widget.getWidgetByKey(i);
				child.detach();
				return _insertRow.call(list, child._fragment, parent, beforeNode, i, options);
			};
			list.renderRow = (element:any):HTMLElement => element;
		}
		else {
			list = widget._list = new OnDemandList();
			list.renderRow = (record:any):HTMLElement => {
				var child = widget.getWidgetByKey(record[source.idProperty]);
				return child._fragment;
			};
		}
		list.set('showHeader', false);
		var className:string = list.domNode.className;
		this._replace(widget, list.domNode);
		widget.get('classList').add(className);
	}

	private _replace(widget:dom.IIterator, newRoot:HTMLElement):void {
		var oldRoot = widget._fragment;
		if (oldRoot && oldRoot.parentNode) {
			oldRoot.parentNode.replaceChild(newRoot, oldRoot);
		}
		widget._firstNode = widget._lastNode = widget._fragment = newRoot;
	}

	private _updateList(widget:dom.IIterator, change:number):void {
		var scopeField = widget.get('each'),
			source = widget.get('source'),
			sourceLength = source.length;
		if (change > 0) {
			// If array is larger than before add the necessary rows to our list
			widget._list.renderArray(source.toArray ? source.toArray() : source);
		}
		else if (change < 0) {
			// If it's smaller, we need to detach any extra widgets
			change = -change;
			for (var i = 0; i < change; ++i) {
				widget._widgetIndex[sourceLength + i].detach();
			}
		}
		// Notify all scoped mediators of their current values
		for (var i = 0, len = sourceLength; i < len; ++i) {
			widget._mediatorIndex[i]['_notify'](source[i], null, scopeField);
		}
	}
}

export = IteratorRenderer;
