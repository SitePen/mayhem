import currencyFormatter = require('dojo/currency');
import dateFormatter = require('dojo/date/locale');
import has = require('./has');
import IntlMessageFormat = require('./i18n/IntlMessageFormat');
import lang = require('dojo/_base/lang');
import numberFormatter = require('dojo/number');
import Observable = require('./Observable');
import Promise = require('./Promise');
import util = require('./util');
type Bundle = HashMap<any>;

declare var process:any;

function mergeBundle(locale:string, id:string, target:I18n.Dictionary, source:HashMap<any>) {
	for (var key in source) {
		// dojo/i18n adds an extra key specifying the locale, which is not actually a message
		if (key === '$locale') {
			continue;
		}

		var message = source[key];

		if (message && message.format) {
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
	private _loadedBundles:HashMap<boolean>;
	protected _locale:string;
	protected _messages:I18n.Dictionary;
	protected _preload:string[];

	get:I18n.Getters;
	set:I18n.Setters;

	_initialize() {
		super._initialize();
		this._loadedBundles = {};
		this._locale = this._getDefaultLocale();
		this._messages = {};
		this._preload = [];
	}

	_formatCurrencyDependencies() {
		return [ 'locale' ];
	}
	formatCurrency(amount:number, options:currencyFormatter.IFormatOptions = {}):string {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('locale');
		}

		return currencyFormatter.format(amount, options);
	}

	_formatDateDependencies() {
		return [ 'locale' ];
	}
	formatDate(date:Date, options:dateFormatter.IFormatOptions = {}):string {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('locale');
		}

		return dateFormatter.format(date, options);
	}

	_formatNumberDependencies() {
		return [ 'locale' ];
	}
	formatNumber(number:number, options:numberFormatter.IFormatOptions = {}):string {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('locale');
		}

		return numberFormatter.format(number, options);
	}

	protected _getDefaultLocale():string {
		var locale:string = null;

		if (has('host-browser')) {
			locale = navigator.language;
		}
		else if (has('host-node') && process.env.LANG) {
			locale = process.env.LANG.split('.')[0];
		}

		if (!locale) {
			locale = 'en-us';
		}

		return locale;
	}

	loadBundle(id:string):Promise<void> {
		if (this._loadedBundles[id]) {
			return Promise.resolve<void>(undefined);
		}

		this._loadedBundles[id] = true;

		var locale = this.get('locale');
		var bundleId = 'dojo/i18n!' + id.replace('/nls/', '/nls/' + locale + '/');

		var self = this;
		return util.getModule(bundleId).then(function (bundle:Bundle) {
			mergeBundle(locale, bundleId, self._messages, bundle);
		});
	}

	_parseCurrencyDependencies() {
		return [ 'locale' ];
	}
	parseCurrency(amount:string, options:currencyFormatter.IParseOptions = {}):number {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('locale');
		}

		return currencyFormatter.parse(amount, options);
	}

	_parseDateDependencies() {
		return [ 'locale' ];
	}
	parseDate(date:string, options:dateFormatter.IFormatOptions = {}):Date {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('locale');
		}

		return dateFormatter.parse(date, options);
	}

	_parseNumberDependencies() {
		return [ 'locale' ];
	}
	parseNumber(number:string, options:numberFormatter.IParseOptions = {}):number {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.get('locale');
		}

		return numberFormatter.parse(number, options);
	}

	run() {
		var preload = this.get('preload');
		for (var i = 0, j = preload.length; i < j; ++i) {
			this._loadedBundles[preload[i]] = true;
		}

		return this.switchToLocale(this.get('locale'));
	}

	switchToLocale(locale:string):Promise<void> {
		this.set('locale', null);

		var bundleIds = Object.keys(this._loadedBundles).map(function (bundleId:string) {
			return 'dojo/i18n!' + bundleId.replace('/nls/', '/nls/' + locale + '/');
		});

		var self = this;
		return util.getModules(bundleIds.concat([
			'dojo/i18n!dojo/cldr/nls/' + locale + '/gregorian',
			'dojo/i18n!dojo/cldr/nls/' + locale + '/currency',
			'dojo/i18n!dojo/cldr/nls/' + locale + '/number'
		])).then(function (bundles: any[]) {
			var allMessages:I18n.Dictionary = {};

			for (var i = 0, j = bundles.length - 3; i < j; ++i) {
				mergeBundle(locale, bundleIds[i], allMessages, bundles[i]);
			}

			self._messages = allMessages;
			self._notify('messages', allMessages, undefined);
			self.set('locale', locale);
		});
	}
}

module I18n {
	export type Dictionary = HashMap<(values:{}) => string>;

	export interface Getters extends Observable.Getters {
		(key:'locale'):string;
		(key:'messages'):I18n.Dictionary;
		(key:'preload'):string[];
	}

	export interface Setters extends Observable.Setters {
		(key:'locale', value:string):void;
		(key:'preload', value:string[]):void;
	}
}

export = I18n;
