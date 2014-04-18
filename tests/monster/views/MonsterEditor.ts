import array = require('dojo/_base/array');
import Monster = require('./Monster');
import PartEditor = require('./PartEditor');
import when = require('dojo/when');

class MonsterEditor extends Monster {
	_partEditor:PartEditor;

	constructor(kwArgs:any = {}) {
		this._partEditor = new PartEditor();

		super(kwArgs);

		this.add(this._partEditor);
	}

	_backgroundChanged(model:any):void {
		when(model, (model:any) => {
			this.style.set('backgroundImage', 'url("' + model.get('src') + '")');
		});
	}

	_initialize():void {
		super._initialize();

		// Watch for setting of each part sprite and add edit action
		array.forEach([ 'body', 'eyes', 'mouth' ], (partType:string):void => {
			this.observe(partType + 'Sprite', (sprite:any) => {
				sprite.set({
					role: 'button',
					onPress: ():void => this._editPart(partType)
				});
			});
		});
	}

	_editPart(partType:string):void {
		if (this.get('editing')) {
			this._partEditor.set('part', partType);
		}
	}
}

MonsterEditor.prototype.className = 'monster editor';

export = MonsterEditor;
