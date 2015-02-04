import currencyFormatter = require('dojo/currency');
import dateFormatter = require('dojo/date/locale');
import numberFormatter = require('dojo/number');
import Observable = require('./Observable');
import Promise = require('./Promise');
import util = require('./util');

interface Dictionary {
	[translationId:string]: (...args:any[]) => string;
}

class Intl extends Observable {
	_loadedBundles:HashMap<boolean>;
	currentLocale:string;
	locales:string[];
	messages:HashMap<string>;

	_localeData() {

	}

	formatCurrency(amount:number, options:Intl.NumberFormatOptions):string {
		return
	}

	formatDate(date:Date, options:Intl.DateTimeFormatOptions):string {
		return dateFormatter.format(date, options);
	}

	formatNumber(number:number, options:Intl.NumberFormatOptions):string {
		return;
	}

	loadBundle(id:string):Promise<void> {
		if (this._loadedBundles[id]) {
			return Promise.resolve<void>(undefined);
		}

		this._loadedBundles[id] = true;
		return new Promise(function (resolve:Promise.IResolver<void>, reject:Promise.IRejecter) {

		});
	}

	parseDate(date:string, options:Intl.DateTimeFormatOptions):Date {
		return dateFormatter.parse(date, options);
	}

	parseNumber(number:string, options:Intl.NumberFormatOptions):number {
		return;
	}

	switchToLocale(locale:string):Promise<void> {
		this.currentLocale = null;

		var bundleIds = Object.keys(this._loadedBundles).map(function (bundleId:string) {
			return bundleId.replace('nls/', 'nls/' + locale + '/');
		});

		var self = this;
		return util.getModules(bundleIds.concat([
			'dojo/i18n!dojo/cldr/nls/' + locale + '/gregorian',
			'dojo/i18n!dojo/cldr/nls/' + locale + '/currency'
		])).then(function () {
			var dict = self.messages;
			for (var i = 0, j = arguments.length - 2; i < j; ++i) {

			}

		});
	}
}

export = Intl;
