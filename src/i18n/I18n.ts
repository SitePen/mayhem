import Base = require('../Base');
import currencyFormatter = require('dojo/currency');
import dateFormatter = require('dojo/date/locale');
import has = require('../has');
import IntlMessageFormat = require('./IntlMessageFormat');
import numberFormatter = require('dojo/number');
import Promise = require('../Promise');
import util = require('../util');

type MessageFunction = (kwArgs: {}) => string;
type Bundle = HashMap<string | MessageFunction | IntlMessageFormat<{}>>;

// TODO: Use node.d.ts
declare var process: any;

function mergeBundle(locale: string, id: string, target: I18n.Dictionary, source: Bundle) {
	for (var key in source) {
		// dojo/i18n adds an extra key specifying the locale, which is not actually a message
		if (key === '$locale') {
			continue;
		}

		var message = source[key];

		if (typeof message === 'string') {
			message = new IntlMessageFormat<{}>(<string> message, locale);
			message = (<IntlMessageFormat<{}>> message).format.bind(message);
		}
		else if (message && (<IntlMessageFormat<{}>> message).format) {
			message = (<IntlMessageFormat<{}>> message).format.bind(message);
		}
		else if (typeof message !== 'function') {
			throw new Error(`Dictionary key ${key} in bundle ${id} does not contain a valid message`);
		}

		target[key] = <MessageFunction> message;
	}
}

// TODO: At some point, should support multiple locale preferences
class I18n extends Base {
	private loadedBundleIds: HashMap<boolean>;

	/**
	 * The current locale in use by the I18n system. Use `switchToLocale` to switch locales.
	 * @readonly
	 */
	locale: string;

	/**
	 * The current set of translatable messages available for use.
	 */
	messages: I18n.Dictionary;

	/**
	 * A list of message bundle IDs that will be preloaded when the component is started for the first time.
	 */
	preload: string[];

	/**
	 * The default system locale.
	 */
	protected get systemLocale(): string {
		var locale: string;

		if (has('host-browser')) {
			locale = navigator.language;
		}
		else if (has('host-node') && process.env.LANG) {
			locale = process.env.LANG && process.env.LANG.split('.')[0];
		}

		if (!locale) {
			locale = 'en-us';
		}

		return locale;
	}

	protected initialize() {
		super.initialize();
		this.loadedBundleIds = {};
		this.locale = this.systemLocale;
		this.messages = {};
		this.preload = [];
	}

	_formatCurrencyDependencies() {
		return [ 'locale' ];
	}
	formatCurrency(amount: number, options: currencyFormatter.IFormatOptions = {}): string {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.locale;
		}

		return currencyFormatter.format(amount, options);
	}

	_formatDateDependencies() {
		return [ 'locale' ];
	}
	formatDate(date: Date, options: dateFormatter.IFormatOptions = {}): string {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.locale;
		}

		return dateFormatter.format(date, options);
	}

	_formatNumberDependencies() {
		return [ 'locale' ];
	}
	formatNumber(number: number, options: numberFormatter.IFormatOptions = {}): string {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.locale;
		}

		return numberFormatter.format(number, options);
	}

	loadBundle(id: string): Promise<void> {
		if (this.loadedBundleIds[id]) {
			return Promise.resolve<void>(undefined);
		}

		this.loadedBundleIds[id] = true;

		var locale = this.locale;
		var bundleId = 'dojo/i18n!' + id.replace('/nls/', '/nls/' + locale + '/');

		var self = this;
		return util.getModule(bundleId).then(function (bundle: Bundle) {
			mergeBundle(locale, bundleId, self.messages, bundle);
		});
	}

	_parseCurrencyDependencies() {
		return [ 'locale' ];
	}
	parseCurrency(amount: string, options: currencyFormatter.IParseOptions = {}): number {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.locale;
		}

		return currencyFormatter.parse(amount, options);
	}

	_parseDateDependencies() {
		return [ 'locale' ];
	}
	parseDate(date: string, options: dateFormatter.IFormatOptions = {}): Date {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.locale;
		}

		return dateFormatter.parse(date, options);
	}

	_parseNumberDependencies() {
		return [ 'locale' ];
	}
	parseNumber(number: string, options: numberFormatter.IParseOptions = {}): number {
		if (!options.locale) {
			options = Object.create(options);
			options.locale = this.locale;
		}

		return numberFormatter.parse(number, options);
	}

	run(): Promise<void> {
		var preload = this.preload;
		for (var i = 0, j = preload.length; i < j; ++i) {
			this.loadedBundleIds[preload[i]] = true;
		}

		return this.switchToLocale(this.locale);
	}

	switchToLocale(locale: string): Promise<void> {
		this.locale = null;

		var bundleIds = Object.keys(this.loadedBundleIds).map(function (bundleId) {
			return 'dojo/i18n!' + bundleId.replace('/nls/', '/nls/' + locale + '/');
		});

		var self = this;
		return util.getModules(bundleIds.concat([
			'dojo/i18n!dojo/cldr/nls/' + locale + '/gregorian',
			'dojo/i18n!dojo/cldr/nls/' + locale + '/currency',
			'dojo/i18n!dojo/cldr/nls/' + locale + '/number'
		])).then(function (bundles: Bundle[]) {
			var allMessages: I18n.Dictionary = {};

			for (var i = 0, j = bundles.length - 3; i < j; ++i) {
				mergeBundle(locale, bundleIds[i], allMessages, bundles[i]);
			}

			self.messages = allMessages;
			self.locale = locale;
		});
	}
}

module I18n {
	export type Dictionary = HashMap<(values: {}) => string>;
}

export = I18n;
