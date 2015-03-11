import binding = require('../../../binding/interfaces');
import html = require('../../html');
import MultiNodeWidget = require('../../../ui/dom/MultiNodeWidget');
import util = require('../../../util');
import View = require('../../../ui/dom/View');

class Conditional extends MultiNodeWidget {
	static inheritsModel:boolean = true;

	private _conditionBindings:binding.IBinding<boolean>[];
	private _conditionObserveHandle:IHandle;
	private _conditions:Conditional.ICondition[];
	private _currentView:View;

	private _modelObserver:IHandle;

	get:Conditional.Getters;
	on:Conditional.Events;
	set:Conditional.Setters;

	_initialize():void {
		super._initialize();
		this._conditionBindings = [];
	}

	private _bindConditions():void {
		var binding:binding.IBinding<boolean>;
		while ((binding = this._conditionBindings.pop())) {
			binding.destroy();
		}

		// We only need to know if the model changed if this widget is active
		if (!this._modelObserver) {
			var self = this;
			this._modelObserver = this.observe('model', function ():void {
				self._bindConditions();
			});
		}

		var model = this.get('model');
		if (!model) {
			// TODO: Show `else`
			return;
		}

		var binder = this.get('app').get('binder');
		for (var i:number = 0, condition:Conditional.ICondition; (condition = this._conditions[i]); ++i) {
			if (condition.condition.$bind !== undefined) {
				this._conditionBindings[i] = binder.createBinding<boolean>(model, condition.condition.$bind);
			}
			else {
				this._conditionBindings[i] = binder.createBinding<boolean>(condition, 'condition');
			}
		}

		this._evaluateConditions();
	}

	destroy():void {
		this._conditionObserveHandle && this._conditionObserveHandle.remove();
		this._conditionObserveHandle = null;
		super.destroy();
	}

	private _evaluateConditions():void {
		this._conditionObserveHandle && this._conditionObserveHandle.remove();

		var self = this;
		function observeCondition(changes:binding.IChangeRecord<boolean>):void {
			if (!('oldValue' in changes) || Boolean(changes.value) !== Boolean(changes.oldValue)) {
				self._evaluateConditions();
			}
		}

		this._currentView && this._currentView.detach();
		this._currentView = null;

		var handles:IHandle[] = [];
		for (var i = 0, binding:binding.IBinding<boolean>; (binding = this._conditionBindings[i]); ++i) {
			handles.push(binding.observe(observeCondition));
			if (binding.get()) {
				var view = this._currentView = this._conditions[i].consequent;
				this._lastNode.parentNode.insertBefore(view.detach(), this._lastNode);
				view.set({
					isAttached: this.get('isAttached'),
					parent: this
				});
				if ((<html.TemplatingAwareWidgetConstructor> view.constructor).inheritsModel) {
					view.set('model', this.get('model'));
				}
				break;
			}
		}

		this._conditionObserveHandle = util.createCompositeHandle.apply(undefined, handles);
	}

	_conditionsGetter():Conditional.ICondition[] {
		return this._conditions;
	}
	_conditionsSetter(value:Conditional.ICondition[]) {
		this._conditions = value;
		if (this.get('isAttached')) {
			this._bindConditions();
		}
	}

	/**
	 * @protected
	 */
	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean):void {
		this._isAttached = value;

		if (value) {
			this._bindConditions();
		}
		else {
			this._conditionObserveHandle && this._conditionObserveHandle.remove();
			this._modelObserver && this._modelObserver.remove();
			this._conditionObserveHandle = this._modelObserver = null;
		}
	}
}

module Conditional {
	export interface ICondition {
		condition:any;
		consequent:View;
	}

	export interface Events extends View.Events {}
	export interface Getters extends View.Getters {
		(key:'model'):{};
		(key:'conditions'):Conditional.ICondition[];
	}
	export interface Setters extends View.Setters {
		(key:'model', value:{}):void;
		(key:'conditions', value:Conditional.ICondition[]):void;
	}
}

export = Conditional;
