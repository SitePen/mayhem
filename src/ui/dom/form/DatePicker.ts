import DijitDateTextBox = require('dijit/form/DateTextBox');
import DijitWidget = require('../DijitWidget');
import IDatePicker = require('../../form/DatePicker');
import util = require('../../../util');

class DatePicker extends DijitWidget implements IDatePicker {
	static Ctor = DijitDateTextBox;
	static setupMap = util.deepCreate(DijitWidget.setupMap, {
		properties: {
			placeholder: 'placeHolder',
			readOnly: 'readOnly',
			value: 'value'
		}
	});

	get:DatePicker.Getters;
	on:DatePicker.Events;
	set:DatePicker.Setters;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	protected _max:Date;
	/**
	 * @get
	 * @set
	 * @protected
	 */
	protected _min:Date;
	/**
	 * @get
	 * @set
	 * @protected
	 */
	protected _value:Date;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'min', 'max' ], '_render');
		super(kwArgs);
	}

	protected _maxGetter():Date {
		return this._max;
	}
	protected _maxSetter(date:Date):void {
		this._max = date;
		var constraints:{
			min?:Date;
			max?:Date;
		} = {
			max: this._max
		};
		if (this._min) {
			constraints.min = this._min;
		}
		this._widget.set('constraints', constraints);
	}

	protected _minGetter():Date {
		return this._min;
	}
	protected _minSetter(date:Date):void {
		this._min = date;
		var constraints:{
			min?:Date;
			max?:Date;
		} = {
			min: this._min
		};
		if (this._max) {
			constraints.max = this._max;
		}
		this._widget.set('constraints', constraints);
	}
}

module DatePicker {
	export interface Events extends DijitWidget.Events, IDatePicker.Events {}
	export interface Getters extends DijitWidget.Getters, IDatePicker.Getters {}
	export interface Setters extends DijitWidget.Setters, IDatePicker.Setters {}
}

export = DatePicker;
