/// <amd-dependency path="mayhem/templating/html!app/views/Index.html" />

import IndexViewModel = require('../viewModels/Index');
import Observable = require('mayhem/Observable');
import WebApplication = require('mayhem/WebApplication');

var IndexView = require<any>('mayhem/templating/html!../views/Index.html');

class Route extends Observable {
	get: Route.Getters;
	set: Route.Setters;

	protected _viewModel: IndexViewModel;
	protected _view: any;

	destroy(): void {
		super.destroy();
		this._view && this._view.destroy();
		this._viewModel && this._viewModel.destroy();
	}

	enter(): void {
		return this.update();
	}

	update(): void {
		var app = <any> this.get('app');
		var viewModel = this._viewModel = new IndexViewModel({});
		var index = this._view;
		index = this._view = new IndexView({
			app: app,
			model: viewModel
		});

		app.get('ui').set('view', index);
	}
}

module Route {
	export interface Getters extends Observable.Getters {
		(key: 'app'): WebApplication;
	}

	export interface Setters extends Observable.Setters { }
}

export = Route;
