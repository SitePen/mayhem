import array = require('dojo/_base/array');
import Dialog = require('mayhem/ui/Dialog');
import Image = require('mayhem/ui/Image');
import Iterator = require('mayhem/ui/Iterator');
import Template = require('mayhem/templating/Template');
import Text = require('mayhem/ui/Text');
import when = require('dojo/when');

class Sprite extends Image {}

class PartEditor extends Dialog {
	_header:Text;
	_gallery:Iterator;
	_part:string;

	constructor(kwArgs?:any) {
		super(kwArgs);

		this._header = new Text({ 'class': 'title' });
		this._gallery = new Iterator({
			each: 'model',
			selection: true,
			template: Template.create(<any> {
				kwArgs: {
					src: { $bind: 'model.src' }
				}
			}, Sprite)
		});

		this.add(this._header);
		this.add(this._gallery);

		this._gallery.observe('selectedItem', (id:string) => {
			if (id != null) {
				this.get('mediator').get('monster').set(this.get('part') + 'Id', id);
				this.trigger('dismiss');
			}
		});
	}

	_partSetter(part:string):void {
		// Toggle dialog
		if (!part || !this.get('hidden')) {
			this._part = null;
			this.trigger('dismiss');
		}
		else {
			this._part = part;
			// Titlecase part string for header title
			this._header.set('text', part.charAt(0).toUpperCase() + part.substring(1));
			// Get source for parts gallery from mediator
			this._gallery.set('source', this.get('app').get(part + 'Store'));

			// TODO: delay attaching trigger events until after trigger is finished
			setTimeout(() => this.trigger('show'));
		}
	}
}

PartEditor.prototype.className = 'part-editor';

export = PartEditor;
