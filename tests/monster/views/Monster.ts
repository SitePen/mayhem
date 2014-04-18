import array = require('dojo/_base/array');
import ContentView = require('framework/ui/ContentView');
import Image = require('framework/ui/Image');
import Layout = require('framework/ui/Layout');
import when = require('dojo/when');

class Sprite extends Image {}
Sprite.prototype.className = 'part';

class Monster extends Layout {
	constructor(kwArgs:any = {}) {
		super(kwArgs);

		array.forEach([ 'body', 'eyes', 'mouth' ], (part:string):void => {
			var sprite = new Sprite({ 'class': part });
			this.set(part + 'Sprite', sprite);
			this.add(sprite);

			var partIdKey = part + 'Id';
			this.bind({
				sourceBinding: 'monster.' + partIdKey,
				targetBinding: partIdKey
			});

			this.own(this.observe(partIdKey, (id:any):void => {
				when(this.get('app').get(part + 'Store').get(id), (model:any):void => {
					sprite.set('src', model.get('src'));
				});
			}));
		});
	}
}

Monster.prototype.className = 'monster';

export = Monster;
