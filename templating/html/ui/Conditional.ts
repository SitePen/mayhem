import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import domUtil = require('../../../ui/dom/util');
import Processor = require('../../html');
import Placeholder = require('./Placeholder');
import util = require('../../../util');
import widgets = require('../../../ui/interfaces');

class Conditional extends Placeholder {
	alternate:any;
	private _alternateWidget:widgets.IDomWidget;
	conditions:any;
	private _conditionWidgets:widgets.IDomWidget[];
	private _predicateTerms:Array<string[]>;

	constructor(kwArgs:any) {
		this._predicateTerms = [];
		this._conditionWidgets = [];
		util.deferSetters(this, [ 'conditions', 'alternate' ], 'render');
		super(kwArgs);

		this.on('conditionChanged', util.debounce(this._evaluateConditions));
		this._evaluateConditions();
	}

	private _alternateSetter(alternate:any):void {
		this.alternate = alternate;
		this._alternateWidget = this._constructWidget(alternate);
	}

	private _conditionsSetter(conditions:any):void {
		this.conditions = conditions;
		// TODO clean up old condition widgets if present
		this._conditionWidgets = [];
		this._predicateTerms = [];

		var i:number = 0,
			length:number = conditions.length,
			condition:any,
			mediator:core.IMediator = this.get('mediator');

		for (; i < length; ++i) {
			condition = conditions[i];
			this._conditionWidgets[i] = this._constructWidget(condition.content);
			this._predicateTerms[i] = this._interpretCondition(condition.condition);
		}
	}

	private _constructWidget(node:any):widgets.IDomWidget {
		return Processor.widgetFromAst(node, this.app, this.get('mediator'), this);
	}

	// Evaluate predicate condition and switch currently attached widget if necessary
	private _evaluateConditions():void {
		var i:number = 0,
			length:number = this._conditionWidgets.length,
			widget:widgets.IDomWidget,
			terms:string[],
			current:widgets.IDomWidget = this.get('content');
		for (; i < length; ++i) {
			widget = this._conditionWidgets[i];
			terms = this._predicateTerms[i];
			// Evaluate predicate terms if they exist and have a widget available
			if (widget && terms && eval(terms.join(''))) {
				current !== widget && this.set('content', widget);
				return;
			}
		}
		// Set content to alterante widget (or nothing at all if no else clause)
		widget = this._alternateWidget;
		current !== widget && this.set('content', widget);
	}

	// Interpret binding in conditional heads and create relevant observers
	private _interpretCondition(condition:any[]):string[] {
		var mediator:core.IMediator = this.get('mediator'),
			terms:string[] = [];
		array.forEach(condition, (item:any, i:number) => {
			// If not a binding object toString and set in term array
			if (!item || !item.binding) {
				terms[i] = item.toString();
				return;
			}
			// TODO: drip drip
			mediator.observe(item.binding, (newValue:any) => {
				terms[i] = JSON.stringify(newValue);
				this.emit('conditionChanged');
			});
			terms[i] = JSON.stringify(mediator.get(item.binding));
		});
		return terms;
	}

}

export = Conditional;
