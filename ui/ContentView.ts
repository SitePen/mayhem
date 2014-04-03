/// <amd-dependency path="./renderer!ContentView" />

import Container = require('./Container');
import has = require('../has');
import Placeholder = require('./Placeholder');
import PlacePosition = require('./PlacePosition');
import ui = require('./interfaces');
import util = require('../util');

var Renderer:any = require('./renderer!ContentView');

class ContentView extends Container implements ui.IContentView {
	placeholders:{ [name:string]: ui.IPlaceholder; };

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
			var self = this;
			return {
				remove: function ():void {
					this.remove = function ():void {};
					placeholder.empty();
					// TODO: the router uses this handle to empty placeholder, not remove it entirely
					// self.placeholders[position] = placeholder = null;
				}
			};
		}
		return super.add(item, position);
	}

	addPlaceholder(name:string, placeholder?:ui.IPlaceholder, reference?:any, position:PlacePosition = PlacePosition.AFTER):void {
		placeholder || (placeholder = new Placeholder());
		this.placeholders[name] = placeholder;
		this._renderer.add(this, placeholder, reference, position);
	}

	clear():void {
		this.empty();
		super.clear();
	}

	empty():void {
		var placeholders = this.placeholders;
		for (var name in placeholders) {
			placeholders[name].empty();
		}

		super.empty();
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
