import currencyFormatter = require('dojo/currency');
import dateFormatter = require('dojo/date/locale');
import lang = require('dojo/_base/lang');
import numberFormatter = require('dojo/number');
import Observable = require('./Observable');
import Promise = require('./Promise');
import util = require('./util');

type Bundle = HashMap<any>;
type Dictionary = HashMap<IntlMessageFormat<any>>;

function mergeBundle(locale:string, id:string, target:Dictionary, source:HashMap<any>) {
	for (var key in source) {
		var message = source[key];

		if (message.format) {
			message = message.format.bind(message);
		}
		else if (typeof message === 'string') {
			message = new IntlMessageFormat<any>(message, locale);
			message = message.format.bind(message);
		}
		else if (typeof message !== 'function') {
			throw new Error(`Dictionary key ${key} in bundle ${id} does not contain a valid message`);
		}

		target[key] = message;
	}

}

class I18n extends Observable {
	// TODO: At some point, should support multiple locale preferences
	protected _currentLocale:string;
	private _loadedBundles:HashMap<boolean>;
	protected _messages:Dictionary;

	get:I18n.Getters;
	set:I18n.Setters;

	_initialize() {
		super._initialize();
		this._currentLocale = navigator.language || 'en-us';
	}

	formatCurrency(amount:number, options:Intl.NumberFormatOptions = {}):string {
		var dojoOptions:currencyFormatter.IFormatOptions;
		dojoOptions = Object.create(options);
		dojoOptions.locale = this.get('currentLocale');

		return currencyFormatter.format(amount, options);
	}

	// <any> due to bug in TS1.4 intl.d.ts, TS#1951
	formatDate(date:Date, options:Intl.DateTimeFormatOptions = <any> {}):string {
		var dojoOptions:dateFormatter.IFormatOptions;
		dojoOptions = Object.create(options);
		dojoOptions.locale = this.get('currentLocale');

		return dateFormatter.format(date, options);
	}

	formatNumber(number:number, options:Intl.NumberFormatOptions = {}):string {
		var dojoOptions:numberFormatter.IFormatOptions;
		dojoOptions = Object.create(options);
		dojoOptions.locale = this.get('currentLocale');

		return numberFormatter.format(number, options);
	}

	loadBundle(id:string):Promise<void> {
		if (this._loadedBundles[id]) {
			return Promise.resolve<void>(undefined);
		}

		this._loadedBundles[id] = true;

		var locale = this.get('currentLocale');
		var bundleId = id.replace('/nls/', `/nls/${locale}`);

		var self = this;
		return util.getModule(bundleId).then(function (bundle:Bundle) {
			mergeBundle(locale, bundleId, self._messages, bundle);
		});
	}

	parseCurrency(amount:string, options:currencyFormatter.IParseOptions = {}):number {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('currentLocale');
		}

		return currencyFormatter.parse(amount, options);
	}

	parseDate(date:string, options:dateFormatter.IFormatOptions = {}):Date {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('currentLocale');
		}

		return dateFormatter.parse(date, options);
	}

	parseNumber(number:string, options:numberFormatter.IParseOptions = {}):number {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('currentLocale');
		}

		return numberFormatter.parse(number, options);
	}

	switchToLocale(locale:string):Promise<void> {
		this.set('currentLocale', null);

		var bundleIds = Object.keys(this._loadedBundles).map(function (bundleId:string) {
			return bundleId.replace('nls/', 'nls/' + locale + '/');
		});

		var self = this;
		return util.getModules(bundleIds.concat([
			'dojo/i18n!dojo/cldr/nls/' + locale + '/gregorian',
			'dojo/i18n!dojo/cldr/nls/' + locale + '/currency'
		])).then(function () {
			var allMessages:Dictionary = {};

			for (var i = 0, j = arguments.length - 2; i < j; ++i) {
				mergeBundle(locale, bundleIds[i], allMessages, arguments[i]);
			}

			self._messages = allMessages;
			self._notify('messages', allMessages, undefined);
			self.set('currentLocale', locale);
		});
	}
}

module I18n {
	export interface Getters extends Observable.Getters {
		(key:'currentLocale'):string;
		(key:'messages'):Dictionary;
	}

	export interface Setters extends Observable.Setters {
		(key:'currentLocale', value:string):void;
	}
}

export = I18n;
