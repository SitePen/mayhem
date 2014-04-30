/// <reference path="../../../../dojo.d.ts" />

import ItemController = require('mayhem/controller/ItemController');
import MonsterModel = require('../../models/Monster');
import Observable = require('mayhem/Observable');
import when = require('dojo/when');

// Hack to allow transactional monster editing
class MonsterCopy extends Observable {
	constructor(options:any) {
		var source:MonsterModel = options.source;
		super({
			app: options.app,
			source: source,
			bodyId: source.get('bodyId'),
			eyesId: source.get('eyesId'),
			mouthId: source.get('mouthId')
		});
	}

	_bodyGetter():any {
		return this.get('app').get('bodyStore').get(this.get('bodyId'));
	}

	_dirtyGetter():boolean {
		// Compare monster copy values to source model
		var source = this.get('source');
		return source.get('bodyId') !== this.get('bodyId')
			|| source.get('eyesId') !== this.get('eyesId')
			|| source.get('mouthId') !== this.get('mouthId');
	}

	_eyesGetter():any {
		return this.get('app').get('eyesStore').get(this.get('eyesId'));
	}

	_mouthGetter():any {
		return this.get('app').get('mouthStore').get(this.get('mouthId'));
	}
}

class MonsterController extends ItemController {}

MonsterController.observers({
	model: function (model:any):void {
		var viewModel = this.get('viewModel');
		viewModel.set('editing', false);

		if (model) {
			when(model, (model:MonsterModel):void => {
				this.get('viewModel').set({
					source: model,
					monster: new MonsterCopy({ source: model, app: this.get('app') })
				});
			});
		}
		else {
			this.get('viewModel').set({
				source: null,
				monster: null
			});
		}
	},
	routeState: function (routeState:any):void {
		this.set('model', routeState ? this.get('store').get(routeState.monsterId) : null);

		///this.get('app').set('monsterId', routeState ? routeState.monsterId : null);
	}
});

export = MonsterController;
