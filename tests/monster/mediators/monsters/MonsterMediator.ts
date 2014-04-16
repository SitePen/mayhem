import Mediator = require('framework/data/Mediator');
import util = require('framework/util');
import when = require('dojo/when');

class MonsterMediator extends Mediator {
	_backgrounds:any; // IStore<BackgroundModel>
	_monsters:any; // IStore<MonsterModel>

	constructor(kwArgs?:any) {
		util.deferSetters(this, [ 'selectedBackground' ], '_backgroundsSetter');
		util.deferSetters(this, [ 'routeState' ], '_monstersSetter');

		super(kwArgs);

		var app = this.get('app'),
			collections = app.get('collections');

		collections.getCollection('monsters').then((value:any):void => {
			this.set('monsters', value);
		});

		collections.getCollection('backgrounds').then((store:any):void => {
			when(store.fetch()).then(():void => {
				this.set('backgrounds', store);

				// Pick a random background to start with
				app.set('selectedBackground', store.get(Math.floor(Math.random() * 5)));
			});
		});
	}

	private _addNotification(text:string):void {
		// this.get('notifications').push(text);
		console.log('MONSTER NOTIFICATION ::', text);
	}

	cancelMonster():void {
		// TODO: reset monster state
		this._navToGallery();
	}

	closeMonster():void {
		this._saveConfirmation();
	}

	private _isDirty():boolean {
		// debugger
		return true
	}

	private _navToGallery():void {
		this.set('dialog', null);
		this.get('app').set('selectedMonster', null);
	}

	private _saveConfirmation():void {
		// TODO: dirty checkstring
		if (this._isDirty()) {
			this.set('dialog', 'save');
		}
		else {
			this._navToGallery();
		}
		
	}

	sendToTwitter():void {
		this.set('dialog', null);
		// TODO: tweet
		this._addNotification('Monster shared via Twitter');
	}

	sendToFacebook():void {
		this.set('dialog', null);
		// TODO: bookface
		this._addNotification('Monster shared via Facebook');
	}

	shareMonster():void {
		this.set('dialog', 'share');
	}

	saveMonster():void {
		// TODO: this.save()
		this._addNotification('Monster Saved');
		this._navToGallery();
	}

	_monstersChange():void {
		this.set('readonly', true);
	}

	_monstersSetter(store:any):void {
		this._monsters = store;
	}

	_backgroundsSetter(store:any):void {
		this._backgrounds = store;
	}

	_routeStateSetter(routeState:any):void {
		this._routeState = routeState;
		var id = '' + routeState.monsterId;
		this.get('app').set('selectedMonster', id);
		when(this.get('monsters').get(id)).then((model:any):void => {
			this.set('monster', model);
		});
	}
}

MonsterMediator.schema(():any => {
	return {
		editable: MonsterMediator.property<boolean>({
			get: function ():boolean {
				return !this.get('model').get('readonly');
			},
			dependencies: [ 'readonly' ]
		}),
		shareLink: MonsterMediator.property<string>({
			get: function ():string {
				// TODO: make real
				return 'http://bit.ly/' + (Math.floor(Math.random() * 1e10)).toString(36);
			},
			dependencies: [ 'monster' ]
		}),

		showSaveDialog: MonsterMediator.property<boolean>({
			get: function ():boolean {
				return this.get('model').get('dialog') === 'save';
			},
			dependencies: [ 'dialog' ]
		}),

		showShareDialog: MonsterMediator.property<boolean>({
			get: function ():boolean {
				return this.get('model').get('dialog') === 'share';
			},
			dependencies: [ 'dialog' ]
		})
	};
});

MonsterMediator.defaults({
	backgrounds: undefined,
	monsters: undefined,
	monster: undefined,
	readonly: true,
	dialog: undefined,
	pickMonsterPart: undefined,
	routeState: undefined
});

export = MonsterMediator;
