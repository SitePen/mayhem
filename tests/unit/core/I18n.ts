import Application = require('mayhem/Application');
import assert = require('intern/chai!assert');
import I18n = require('mayhem/i18n/I18n');
import registerSuite = require('intern!object');

var app: Application;
var i18n: I18n;

registerSuite({
	name: 'mayhem/i18n/I18n',

	setup() {
		app = new Application({
			components: {
				binder: null,
				i18n: null
			}
		});

		return app.run();
	},

	teardown() {
		app.destroy();
		app = i18n = null;
	},

	beforeEach() {
		i18n = new I18n({ app, locale: 'en-us' });
		return i18n.run();
	},

	afterEach() {
		i18n.destroy();
	},

	'#formatCurrency'() {
		assert.strictEqual(i18n.formatCurrency(25, { currency: 'USD' }), '$25.00');
		assert.strictEqual(i18n.formatCurrency(25, { currency: 'GBP' }), '£25.00');
		assert.strictEqual(i18n.formatCurrency(25, { currency: 'JPY' }), '¥25');

		return i18n.switchToLocale('es').then(function () {
			assert.strictEqual(i18n.formatCurrency(12.20, { currency: 'USD' }), '12,20\xa0$');
			assert.strictEqual(i18n.formatCurrency(12.20, { currency: 'GBP' }), '12,20\xa0GBP');
			assert.strictEqual(i18n.formatCurrency(25, { currency: 'JPY' }), '25\xa0JPY');
		});
	},

	'#formatDate'() {
		var date = new Date(1970, 0, 2, 12, 34, 56);

		assert.strictEqual(i18n.formatDate(date), '1/2/70, 12:34 PM');
		assert.strictEqual(i18n.formatDate(date, { formatLength: 'medium' }), 'Jan 2, 1970, 12:34:56 PM');

		return i18n.switchToLocale('es').then(function () {
			assert.strictEqual(i18n.formatDate(date), '2/1/70 12:34');
			assert.strictEqual(i18n.formatDate(date, { formatLength: 'medium' }), '2/1/1970 12:34:56');
		});
	},

	'#formatNumber'() {
		assert.strictEqual(i18n.formatNumber(25), '25');
		assert.strictEqual(i18n.formatNumber(25, { places: 2 }), '25.00');

		return i18n.switchToLocale('es').then(function () {
			assert.strictEqual(i18n.formatNumber(25), '25');
			assert.strictEqual(i18n.formatNumber(25, { places: 2 }), '25,00');
		});
	},

	'#parseCurrency'() {
		assert.strictEqual(i18n.parseCurrency('$12.34', { currency: 'USD' }), 12.34);
		assert.strictEqual(i18n.parseCurrency('£12.34', { currency: 'GBP' }), 12.34);
		assert.strictEqual(i18n.parseCurrency('¥25', { currency: 'JPY' }), 25);
		assert.isTrue(isNaN(i18n.parseCurrency('12,20\xa0$', { currency: 'USD' })));

		return i18n.switchToLocale('es').then(function () {
			assert.isTrue(isNaN(i18n.parseCurrency('$12.34', { currency: 'USD' })));
			assert.strictEqual(i18n.parseCurrency('12,20\xa0$', { currency: 'USD' }), 12.20);
			assert.strictEqual(i18n.parseCurrency('12,20\xa0GBP', { currency: 'GBP' }), 12.20);
			assert.strictEqual(i18n.parseCurrency('25\xa0JPY', { currency: 'JPY' }), 25);
		});
	},

	'#parseDate'() {
		var shortDate = Number(new Date(1970, 0, 2, 12, 34, 0));
		var fullDate = Number(new Date(1970, 0, 2, 12, 34, 56));

		assert.strictEqual(Number(i18n.parseDate('1/2/70, 12:34 PM')), shortDate);
		assert.strictEqual(Number(i18n.parseDate('Jan 2, 1970, 12:34:56 PM', { formatLength: 'medium' })), fullDate);

		return i18n.switchToLocale('es').then(function () {
			assert.strictEqual(Number(i18n.parseDate('2/1/70 12:34')), shortDate);
			assert.strictEqual(Number(i18n.parseDate('2/1/1970 12:34:56', { formatLength: 'medium' })), fullDate);
		});
	},

	'#parseNumber'() {
		assert.strictEqual(i18n.parseNumber('12.34'), 12.34);
		assert.isTrue(isNaN(i18n.parseNumber('12,34')));

		return i18n.switchToLocale('es').then(function () {
			assert.strictEqual(i18n.parseNumber('12,34'), 12.34);
			assert.isTrue(isNaN(i18n.parseNumber('12.34')));
		});
	},

	'#messages'() {
		return i18n.loadBundle(require.toAbsMid('../../support/nls/test')).then(function () {
			assert.strictEqual(i18n.get('messages')['asString']({ number: 0 }), 'en zero');
			assert.strictEqual(i18n.get('messages')['asString']({ number: 1 }), 'en 1');
			assert.strictEqual(i18n.get('messages')['asFunction']({ number: 0 }), 'en 0');
			assert.strictEqual(i18n.get('messages')['asFunction']({ number: 1 }), 'en 1');
			assert.strictEqual(i18n.get('messages')['asObject']({ number: 0 }), 'en 0');
			assert.strictEqual(i18n.get('messages')['asObject']({ number: 1 }), 'en 1');

			return i18n.switchToLocale('es').then(function () {
				assert.strictEqual(i18n.get('messages')['asString']({ number: 0 }), 'es cero');
				assert.strictEqual(i18n.get('messages')['asString']({ number: 1 }), 'es 1');
				assert.strictEqual(i18n.get('messages')['asFunction']({ number: 0 }), 'es 0');
				assert.strictEqual(i18n.get('messages')['asFunction']({ number: 1 }), 'es 1');
				assert.strictEqual(i18n.get('messages')['asObject']({ number: 0 }), 'es 0');
				assert.strictEqual(i18n.get('messages')['asObject']({ number: 1 }), 'es 1');

				return i18n.switchToLocale('ja');
			}).then(function () {
				assert.strictEqual(i18n.get('messages')['asString']({ number: 0 }), 'ROOT zero');
				assert.strictEqual(i18n.get('messages')['asString']({ number: 1 }), 'ROOT 1');
				assert.strictEqual(i18n.get('messages')['asFunction']({ number: 0 }), 'ROOT 0');
				assert.strictEqual(i18n.get('messages')['asFunction']({ number: 1 }), 'ROOT 1');
				assert.strictEqual(i18n.get('messages')['asObject']({ number: 0 }), 'ROOT 0');
				assert.strictEqual(i18n.get('messages')['asObject']({ number: 1 }), 'ROOT 1');
			});
		});
	}
});
