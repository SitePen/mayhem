/// <reference path="../../../dojo.d.ts" />

import array = require('dojo/_base/array');
import ListController = require('framework/controller/ListController');
import Mediator = require('framework/data/Mediator');
import MonsterModel = require('../models/Monster');
import ObservableArray = require('framework/ObservableArray');
import topic = require('dojo/topic');
import util = require('framework/util');
import when = require('dojo/when');
import whenAll = require('dojo/promise/all');

class MonstersController extends ListController {}

MonstersController.observers({
	app: function(app:any):void {
		app.observe('monsterId', (id:number) => {
			var childView = this.get('view').placeholders['default'];
			if (id == null) {
				childView.set('hidden', true);
				app.get('router').go('monsters');
			}
			else {
				app.get('router').go('monsters/monster', { monsterId: id });
				childView.set('hidden', false);
			}
		});

		// Create an observable array to hold notifications
		var notifications = new ObservableArray<string>();
		app.set('notifications', notifications);

		topic.subscribe('notification', (text:string) => {
            notifications.push(text);
            // Remove our notification after a specified time
            setTimeout(() => {
            	util.spliceMatch(notifications, text);
            }, 5000);
        });
	},
	routeState: function (routeState:any):void {
		console.log('SELECTED MONSTER ID:', this.get('app').get('monsterId'), 'ROUTE STATE:', routeState);
	},
	store: function (store:any):void {
		this.set('model', store);
	},

	// Add extraneous stores as global app data
	// TOOD: should we be able to do this with store manager?
	backgroundStore: function (store:any):void {
		var app = this.get('app');
		app.set('backgroundStore', store);
		app.set('background', store.get(Math.floor(Math.random() * 5)));
	},
	bodyStore: function (store:any):void {
		this.get('app').set('bodyStore', store);
	},
	eyesStore: function (store:any):void {
		this.get('app').set('eyesStore', store);
	},
	mouthStore: function (store:any):void {
		this.get('app').set('mouthStore', store);
	}
});

export = MonstersController;
