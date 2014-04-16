import Dialog = require('framework/ui/Dialog');
import Image = require('framework/ui/Image');
import Iterator = require('framework/ui/Iterator');
import Template = require('framework/templating/Template');
import Text = require('framework/ui/Text');

class Sprite extends Image {}

class Picker extends Dialog {
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
		this.set('hidden', !part);
	}

	_render():void {
		super._render();

		this.add(this.header);
		this.add(this.gallery);
	}
}

Picker.prototype.className = 'picker';

export = Picker;
