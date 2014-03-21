import Container = require('./Container');
import has = require('../has');
import ui = require('./interfaces');
import util = require('../util');

class View extends Container implements ui.IView {
	placeholders:{ [name:string]: ui.IPlaceholder; };
	/* protected */ _values:ui.IViewValues;

	constructor(kwArgs?:any) {
		this.placeholders = {};
		util.deferSetters(this, [ 'content' ], '_render');
		super(kwArgs);
	}

	get:ui.IViewGet;
	set:ui.IViewSet;

	add(item:ui.IWidget, placeholder:string):IHandle;
	add(item:ui.IWidget, position?:any):IHandle;
	add(item:ui.IWidget, position?:any):IHandle {
		if (typeof position === 'string') {
			var placeholder:ui.IPlaceholder = this.placeholders[position];

			if (has('debug') && !placeholder) {
				throw new Error('Unknown placeholder "' + position + '"');
			}

			placeholder.set('content', item);
			return {
				remove: function ():void {
					this.remove = function ():void {};
					placeholder.set('content', null);
					placeholder = null;
				}
			};
		}
		return super.add(item, position);
	}

	attachToWindow(target:any):IHandle {
		this.detach();

		this._renderer.attachToWindow(this, target);
		this.set('attached', true);

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self.detach();
				self = null;
			}
		};
	}

	clear():void {
		// TODO: detach children, placeholders
		this._renderer.clear(this);
	}

	/* protected */ _contentSetter(content:Node):void {
		this._renderer.setBody(this, content);
	}

	destroy():void {
		for (var name in this.placeholders) {
			var placeholder = this.placeholders[name];
			placeholder.empty();
			placeholder.destroy();
		}

		super.destroy();
	}
}

export = View;
