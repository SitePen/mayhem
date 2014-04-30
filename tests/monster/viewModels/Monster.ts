/// <reference path="../../../dojo.d.ts" />

import Mediator = require('mayhem/data/Mediator');
import topic = require('dojo/topic');

class MonsterViewModel extends Mediator {
	private _dialog:string;

	cancel():void {
		// TODO: abort monster state
		this.navigateToGallery();
	}

	close():void {
		// TODO: dirty checking
		this.get('dirty') ? this.set('dialog', 'save') : this.navigateToGallery();
	}

	commit():void {
		this.set('dialog', null);
		if (this.get('dirty')) {
			// Set properties from copy on original
			var source = this.get('source'),
				copy = this.get('monster');
			source.set('bodyId', copy.get('bodyId'));
			source.set('eyesId', copy.get('eyesId'));
			source.set('mouthId', copy.get('mouthId'));

			topic.publish('notification', 'Monster Saved');
		}
	}

	private _dirtyGetter():boolean {
		return this.get('editing') && this.get('monster').get('dirty');
	}

	navigateToGallery():void {
		this.set('dialog', null);
		this.get('app').set('monsterId', null);
	}

	saveAndClose():void {
		this.commit();
		this.navigateToGallery();
	}

	sendToTwitter():void {
		this.set('dialog', null);
		// TODO: tweet
		topic.publish('notification', 'Monster shared via Twitter');
	}

	sendToFacebook():void {
		this.set('dialog', null);
		// TODO: bookface
		topic.publish('notification', 'Monster shared via Facebook');
	}

	share():void {
		this.set('dialog', 'share');
	}
}

MonsterViewModel.schema(():any => {
	return {
		saveDialogHidden: MonsterViewModel.property<boolean>({
			get: function ():boolean {
				return this.get('model').get('dialog') !== 'save';
			},
			set: function (value:boolean):void {
				var model = this.get('model');
				if (model.get('dialog') === 'save') {
					model.set('dialog', null);
				}
			},
			dependencies: [ 'dialog' ]
		}),

		shareDialogHidden: MonsterViewModel.property<boolean>({
			get: function ():boolean {
				return this.get('model').get('dialog') !== 'share';
			},
			set: function (value:boolean):void {
				var model = this.get('model');
				if (model.get('dialog') === 'share') {
					model.set('dialog', null);
				}
			},
			dependencies: [ 'dialog' ]
		})
	}
});

MonsterViewModel.defaults({
	isExtensible: true
});

MonsterViewModel.set({
	dialog: null,
	editing: false
})

export = MonsterViewModel;
