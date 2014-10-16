import Observable = require('mayhem/Observable');
import Proxy = require('mayhem/data/Proxy');
import Todo = require('../models/Todo');
import WebApplication = require('mayhem/WebApplication');

class Index extends Observable {
	get:Index.Getters;
	set:Index.Setters;

	_app:WebApplication;

	_routeStateSetter(state:{ show?:string; }):void {
		this.set('todo', new Todo());

		var collection = Todo.store;

		if (state.show !== 'all') {
			collection = collection.filter({ isCompleted: state.show === 'complete' });
		}

		this.set('todos', Index.TodoViewModel.forCollection(collection));
	}

	saveNewTodo():void {
		var self = this;
		this.get('todo').save().then(function ():void {
			self.set('todo', new Todo());
		});
	}
}

module Index {
	export interface Getters extends Observable.Getters {
		(key:'todo'):Todo;
		(key:'todos'):dstore.ICollection<Index.TodoViewModel>;
	}

	export interface Setters extends Observable.Setters {
		(key:'todo', value:Todo):void;
		(key:'todos', value:dstore.ICollection<Index.TodoViewModel>):void;
	}
}

module Index {
	export class TodoViewModel extends Proxy<Todo> {
		get:Index.TodoViewModel.Getters;
		set:Index.TodoViewModel.Setters;

		_classGetter():string {
			return this.get('isCompleted') ? 'completed' : '';
		}

		_isCompletedSetter(value:boolean):void {
			var oldClass = this.get('class');
			this._target.set('isCompleted', value);
			this._notify('class', this.get('class'), oldClass);
		}
	}

	export module TodoViewModel {
		export interface Getters extends Todo.Getters, Proxy.Getters {
			(key:'class'):string;
		}

		export interface Setters extends Todo.Setters, Proxy.Setters {}
	}
}

export = Index;
