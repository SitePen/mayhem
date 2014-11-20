import Observable = require('mayhem/Observable');
import WebApplication = require('mayhem/WebApplication');

class Index extends Observable {
	get:Index.Getters;
	set:Index.Setters;

	protected _app:WebApplication;

	protected _textGetter():string {
		return 'Index View';
	}
}

module Index {
	export interface Getters extends Observable.Getters {}
	export interface Setters extends Observable.Setters {}
}

export = Index;
