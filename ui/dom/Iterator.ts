import array = require('dojo/_base/array');
import _Element = require('./_Element');
import List = require('dgrid/List');
import OnDemandList = require('dgrid/OnDemandList');
import ui = require('../interfaces');
import util = require('../../util');

class Iterator extends _Element {
	renderList(widget:ui.IIteratorImpl):void {
		var list = widget._impl.list,
			source = widget.get('source'),
			arraySource = source instanceof Array,
			eagerList = list && !(list instanceof OnDemandList);

		// Bail on list rendering if it's already been rendered (and it's the right kind)
		if ((arraySource && eagerList) || (!arraySource && !eagerList)) {
			return;
		}
		// Clean up list and detach all widgets
		array.forEach(util.getObjectKeys(widget._widgetIndex), (key:string) => {
			widget._widgetIndex[key].detach();
		});
		list && list.destroy();
		if (source instanceof Array) {
			list = widget._impl.list = new List();
			var _insertRow:any = list.insertRow;
			list.insertRow = (object:any, parent:any, beforeNode:Node, i:number, options?:any):HTMLElement => {
				var widget = widget._getWidgetByKey(i);
				widget.detach();
				return _insertRow.call(list, widget.get('fragment'), parent, beforeNode, i, options);
			};
			list.renderRow = (element:any):HTMLElement => element;
		}
		else {
			list = widget._impl.list = new OnDemandList();
			list.renderRow = (record:any):HTMLElement => {
				var widget = widget._getWidgetByKey(record[source.idProperty]);
				return <HTMLElement> widget.get('fragment');
			};
		}
		list.set('showHeader', false);
		var className:string = list.domNode.className;
		debugger
		//TODO this._replace(this, { root: list.domNode });
		widget.get('classList').add(className);
	}

	updateList(widget:ui.IIteratorImpl, change:number):void {
		var scopeField = widget.get('each'),
			source = widget.get('source'),
			sourceLength = source.length;
		if (change > 0) {
			// If array is larger than before add the necessary rows to our list
			widget._impl.list.renderArray(source.toArray ? source.toArray() : source);
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
			widget._mediatorIndex[i]._notify(source[i], null, scopeField);
		}
	}
}

export = Iterator;
