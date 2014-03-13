import configure = require('./util/configure');
import dijit = require('./interfaces');
import _WidgetBase = require('./_WidgetBase');

class _Widget extends _WidgetBase implements dijit.IWidget { // _Container
	get:dijit.IWidgetGet;
	set:dijit.IWidgetSet;

	add(item:dijit.IWidgetBase, position:any):IHandle {
		position || (position = 0);
		if (typeof position === 'number' && position >= 0) {
			this.attach(item);
			this.get('children')[position] = item;
			// TODO: test for addChild (dijit/_Container)
			this.get('_dijit').addChild(item.get('_dijit'), position);

			var self = this;
			return {
				remove: function ():void {
					this.remove = function ():void {};
					self.remove(item);
					item = self = null;
				}
			};
		}
		super.add(item, position);
	}
}

configure(_Widget, {
	Base: _WidgetBase
});

export = _Widget;
