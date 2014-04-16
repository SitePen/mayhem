import Mediator = require('framework/data/Mediator');
import MonsterModel = require('../models/Monster');

class MonstersMediator extends Mediator {
	_monsters:any;

	constructor(kwArgs?:any) {
		super(kwArgs);

		var app = this.get('app');

		app.observe('selectedMonster', (id) => {
			var router:any = (<any> this.get('routeState')).route.get('router');
			if (id !== null) {
				router.go('monsters/monster', { monsterId: id });
			}
			else {
				router.go('monsters');
			}
		});

		app.get('collections').getCollection('monsters').then((store:any):void => {
			
			// Seed with random monsters
			var total = {
				monsters: 100,
				bodies: 15,
				eyes: 12,
				mouths: 8
			};
			
			
			for (var i = 0; i < total.monsters; ++i) {
				store.put(new MonsterModel({
					id: i,
					bodyId: Math.floor(Math.random() * total.bodies),
					eyesId: Math.floor(Math.random() * total.eyes),
					mouthId: Math.floor(Math.random() * total.mouths)
				}));
			}

			this.set('monsters', store);
		});
	}
}

MonstersMediator.defaults({
	routeState: undefined,
	monsters: undefined,
	selectedMonster: undefined,
	selectedBackground: undefined,
	notifications: undefined
});

export = MonstersMediator;
