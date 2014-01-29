import widgets = require('../interfaces');
import core = require('../../interfaces');
import DomPlaceholder = require('./Placeholder');
import domUtil = require('./util');
import array = require('dojo/_base/array');


class DomConditional extends DomPlaceholder {

	private _predicates:Function[];
	private _clauseWidgets:widgets.IDomWidget[];
	private _observers:IHandle[]; // TODO: clean up
	private _parser:any;

	// Interprets binding in conditional heads and set up watchers
	private _interpretCondition(condition:any[], predicateIndex:number):string[] {
		var mediator:core.IMediator = this.get('mediator');
		var terms:string[] = [];
		array.forEach(condition, (term:any, i:number) => {
			var field:string = term.binding;
			if (!field) {
				terms[i] = term.toString();
				return;
			}
			this._observers[field] = mediator.observe(field, (newValue:any) => {
				terms[i] = JSON.stringify(newValue);
				this._predicates[predicateIndex] = function () {
					return eval(terms.join(''));
				};
				setTimeout(() => this._evaluateConditions());
			});
			terms[i] = JSON.stringify(mediator.get(field));
		});
		this._predicates[predicateIndex] = function () {
			return eval(terms.join(''));
		};
		return terms;
	}

	// Evaluate predicate condition and switch currently attached widget if necessary
	private _evaluateConditions():void {
		// TODO: debounce?
		var i:number,
			length:number,
			widget:widgets.IDomWidget,
			predicate:Function,
			current:Node = this.firstNode;
		for (i = 0, length = this._clauseWidgets.length; i < length; ++i) {
			widget = this._clauseWidgets[i];
			predicate = this._predicates[i];
			// If predicate exists test predicate, otherwise its the alternate clause
			if (predicate && predicate() || !predicate) {
				this.set('content', widget);
				return;
			}
		}
	}

	constructor(kwArgs:any) {
		this._parser = kwArgs.parser;
		kwArgs.parser = undefined;
		this._predicates = [];
		this._clauseWidgets = [];
		this._observers = [];

		var conditions = kwArgs.conditions;
		kwArgs.conditions = null;
		var alternate = kwArgs.alternate;
		kwArgs.alternate = null;

		super(kwArgs);

		// Instantiate all conditional widgets, and alternate, regardless of predicate status
		if (conditions) {
			array.forEach(conditions, (condition:any, i:number) => {
				this._clauseWidgets.push(this._parser.constructWidget(condition.content));
				return this._interpretCondition(condition.condition, i);
			});
			kwArgs.conditions = undefined;
		}
		if (alternate) {
			this._clauseWidgets.push(this._parser.constructWidget(alternate));
			kwArgs.alternate = undefined;
		}

		this._evaluateConditions();
	}

}

export = DomConditional;
