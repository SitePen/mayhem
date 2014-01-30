import widgets = require('../../../ui/interfaces');
import core = require('../../../interfaces');
import Placeholder = require('../../../ui/dom/Placeholder');
import domUtil = require('../../../ui/dom/util');
import array = require('dojo/_base/array');


class Conditional extends Placeholder {

	private _predicateTerms:Array<string[]>;
	private _clauseWidgets:widgets.IDomWidget[];
	private _observerMap:IHandle[]; // TODO: clean up
	private _parser:any;

	constructor(kwArgs:any) {
		this._parser = kwArgs.parser;
		kwArgs.parser = undefined;
		
		this._predicateTerms = [];
		this._clauseWidgets = [];
		this._observerMap = [];

		var conditions = kwArgs.conditions;
		kwArgs.conditions = null;
		var alternate = kwArgs.alternate;
		kwArgs.alternate = null;

		super(kwArgs);

		// Instantiate all conditional widgets, and alternate, regardless of predicate status
		if (conditions) {
			array.forEach(conditions, (condition:any, i:number) => {
				this._clauseWidgets.push(this._parser.constructWidget(condition.content));
				this._interpretCondition(condition.condition, i);
			});
			kwArgs.conditions = undefined;
		}
		if (alternate) {
			this._clauseWidgets.push(this._parser.constructWidget(alternate));
			kwArgs.alternate = undefined;
		}

		this._evaluateConditions();
	}

	// Interprets binding in conditional heads and set up watchers
	private _interpretCondition(condition:any[], predicateIndex:number):void {
		var mediator:core.IMediator = this.get('mediator');
		var terms:string[] = [];
		array.forEach(condition, (term:any, i:number) => {
			var field:string = term.binding;
			if (!field) {
				terms[i] = term.toString();
				return;
			}
			this._observerMap[field] = mediator.observe(field, (newValue:any) => {
				terms[i] = JSON.stringify(newValue);
				this._evaluateConditions();
			});
			// TODO: prob not necessary w/ debounce
			terms[i] = JSON.stringify(mediator.get(field));
		});
		this._predicateTerms[predicateIndex] = terms;
	}

	// Evaluate predicate condition and switch currently attached widget if necessary
	private _evaluateConditions():void {
		// TODO use debounce in util
		var i:number,
			length:number,
			widget:widgets.IDomWidget,
			terms:string[],
			success:boolean,
			current:Node = this.firstNode;
		for (i = 0, length = this._clauseWidgets.length; i < length; ++i) {
			widget = this._clauseWidgets[i];
			terms = this._predicateTerms[i];
			success = terms && eval(terms.join(''));
			// Evaluate predicate terms if they exist, otherwise its the alternate clause
			if (success || !terms) {
				this.content !== widget && this.set('content', widget);
				return;
			}
		}
	}

}

export = Conditional;
