import ContentView = require('framework/ui/ContentView');
import DomElementRenderer = require('framework/ui/dom/_Element');
import Image = require('framework/ui/Image');
import Iterator = require('framework/ui/Iterator');
import Template = require('framework/templating/Template');
import Text = require('framework/ui/Text');
import util = require('framework/util');

class Sprite extends Image {}

class Picker extends ContentView {
	header:Text;
	gallery:Iterator;

	constructor(kwArgs?:any) {
		this._deferProperty('part', '_render');
		super(kwArgs);
	}

	_initialize():void {
		super._initialize();

		this.header = new Text({ 'class': 'title' });
		this.gallery = new Iterator({
			selection: true,
			each: 'model',
			template: Template.create(<any> {
				kwArgs: {
					src: { $bind: 'model.src' }
				}
			}, Sprite)
		});

		// this.gallery.selectedItemChanged = (value:any) => {
		// 	console.log('SELECTED PART CHANGED', arguments);
		// 	this.set('part', null);
		// };
	}

	_partSetter(part:string):void {
		if (part) {
			// Titlecase part string for header title
			this.header.set('text', part.charAt(0).toUpperCase() + part.substring(1));
			// Get source for parts gallery from mediator
			this.gallery.set('source', this.get('mediator').get(part + 'Store'));
		}
		this.set('visible', !!part);
	}

	_render():void {
		super._render();

		// Start out invisible until we know which body part to pick
		this.set('visible', false);

		this.add(this.header);
		this.add(this.gallery);
	}
}

Picker.prototype.className = 'picker';
Picker.prototype._renderer = new DomElementRenderer();

export = Picker;
