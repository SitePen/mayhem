import binding = require('../../../binding/interfaces');
import MultiNodeWidget = require('../../../ui/dom/MultiNodeWidget');
import util = require('../../../util');
import View = require('../../../ui/dom/View');

class Conditional extends MultiNodeWidget {
	private _conditionBindings:binding.IBinding<boolean>[];
	private _conditionObserveHandle:IHandle;
	private _conditions:Conditional.ICondition[];
	private _currentView:View;

	get:Conditional.Getters;
	on:Conditional.Events;
	set:Conditional.Setters;

	constructor(kwArgs?:HashMap<any>) {
		this._conditionBindings = [];

		util.deferSetters(this, [ 'conditions' ], '_render');
		super(kwArgs);

		var self = this;
		this.observe('model', function (newValue:Object, oldValue:Object):void {
			self._createConditionBindings(newValue);
			self._evaluateConditions();
		});
	}

	_conditionsSetter(value:Conditional.ICondition[]):void {
		this._conditions = value;
		this._createConditionBindings(this.get('model'));
		this._evaluateConditions();
	}

	_createConditionBindings(model:Object):void {
		model = model || {};
		var binder = this.get('app').get('binder');

		for (var i = 0, binding:binding.IBinding<boolean>; (binding = this._conditionBindings[i]); i++) {
			binding.destroy();
		}
		this._conditionBindings = [];

		var condition:Conditional.ICondition;
		for (i = 0; (condition = this._conditions[i]); i++) {
			if (condition.condition.$bind !== undefined) {
				this._conditionBindings[i] = binder.createBinding<boolean>(model, condition.condition.$bind);
			}
			else {
				this._conditionBindings[i] = binder.createBinding<boolean>(condition, 'condition');
			}
		}
	}

	_evaluateConditions():void {
		this._conditionObserveHandle && this._conditionObserveHandle.remove();

		var self = this;
		function observeCondition(changes:binding.IChangeRecord<boolean>):void {
			if (Boolean(changes.value) !== Boolean(changes.oldValue)) {
				self._evaluateConditions();
			}
		}

		var handles:IHandle[] = [];
		for (var i = 0, binding:binding.IBinding<boolean>; (binding = this._conditionBindings[i]); i++) {
			handles.push(binding.observe(observeCondition));
			if (binding.get()) {
				this._currentView && this._currentView.detach();

				var view = this._conditions[i].consequent;
				this._lastNode.parentNode.insertBefore(view.detach(), this._lastNode);
				view.set({
					isAttached: this.get('attached'),
					parent: this,
					model: null
				});
				break;
			}
		}
		this._conditionObserveHandle = util.createCompositeHandle.apply(undefined, handles);
		handles = null;
	}
}

module Conditional {
	export interface ICondition {
		condition:any;
		consequent:View;
	}

	export interface Events extends View.Events {}
	export interface Getters extends View.Getters {
		(key:'model'):Object;
		(key:'conditions'):Conditional.ICondition[];
	}
	export interface Setters extends View.Setters {
		(key:'model', value:Object):void;
		(key:'conditions', value:Conditional.ICondition[]):void;
	}
}

export = Conditional;
