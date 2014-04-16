import array = require('dojo/_base/array');
import ContentView = require('framework/ui/ContentView');
import _ElementRenderer = require('framework/ui/dom/_Element');
import Image = require('framework/ui/Image');
import util = require('framework/util');
import when = require('dojo/when');

class Monster extends ContentView {
	body:Image;
	mouth:Image;
	eyes:Image;

	constructor(kwArgs?:any) {
		this._deferProperty('monster', '_render');
		super(kwArgs);
	}

	_render():void {
		super._render();

		array.forEach([ 'body', 'mouth', 'eyes' ], (part:string):void => {
			this.add(this[part] = new Image({ 'class': part }));

			this.bind({
				sourceBinding: 'monster.' + part + 'Src',
				target: this[part],
				targetBinding: 'src'
			});

			this[part].on('press', () => {
				this.get('readonly') || this.get('mediator').set('pickMonsterPart', part);
			});
		});

		this.on('press', () => {
			console.log('TODO: change bg')
		});
	}

	_backgroundChanged(model:any):void {
		when(model, (model:any) => {
			// TODO: require.toUrl
			this.style.set('background', 'url("' + model.get('src') + '")');
		})
	}
}

Monster.prototype.className = 'monster';
Monster.prototype._renderer = new _ElementRenderer();

export = Monster;
