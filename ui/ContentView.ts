/// <amd-dependency path="./renderer!ContentView" />

import Container = require('./Container');
import has = require('../has');
import ui = require('./interfaces');
import util = require('../util');

var Renderer:any = require('./renderer!ContentView');

class ContentView extends Container implements ui.IContentView {
	placeholders:{ [name:string]: ui.IPlaceholder; };
	/* protected */ _values:ui.IContentViewValues;

	constructor(kwArgs?:any) {
		this.placeholders = {};
		util.deferMethods(this, [ 'setContent' ], '_render');
		super(kwArgs);
	}

	get:ui.IContentViewGet;
	set:ui.IContentViewSet;

	add(item:ui.IWidget, placeholder:string):IHandle;
	add(item:ui.IWidget, position?:any):IHandle;
	add(item:ui.IWidget, position?:any):IHandle {
		if (typeof position === 'string') {
			var placeholder:ui.IPlaceholder = this.placeholders[position];

			if (has('debug') && !placeholder) {
				throw new Error('Unknown placeholder "' + position + '"');
			}

			placeholder.set('currentChild', item);
			return {
				remove: function ():void {
					this.remove = function ():void {};
					placeholder.set('currentChild', null);
					placeholder = null;
				}
			};
		}
		return super.add(item, position);
	}

	clear():void {
		// TODO: detach children, placeholders
		this._renderer.clear(this);
	}

	setContent(content:any):void {
		this._renderer.setContent(this, content);
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

ContentView.prototype._renderer = new Renderer();

export = ContentView;
