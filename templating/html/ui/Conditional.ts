import MultiNodeWidget = require('../../../ui/dom/MultiNodeWidget');
import View = require('../../../ui/dom/View');

class Conditional extends MultiNodeWidget {
	private _conditions:Conditional.ICondition[];
	private _currentView:View;

	get:Conditional.Getters;
	on:Conditional.Events;
	set:Conditional.Setters;

	_conditionsSetter(value:Conditional.ICondition[]):void {
		this._conditions = value;
		this._currentView && this._currentView.detach();

		for (var i = 0, condition:Conditional.ICondition; (condition = value[i]); ++i) {
			console.log(condition);
		}
	}
}

module Conditional {
	export interface ICondition {
		condition:any;
		consequent:View;
	}

	export interface Events extends MultiNodeWidget.Events {}
	export interface Getters extends MultiNodeWidget.Getters {
		(key:'conditions'):Conditional.ICondition[];
	}
	export interface Setters extends MultiNodeWidget.Setters {
		(key:'conditions', value:Conditional.ICondition[]):void;
	}
}

export = Conditional;
