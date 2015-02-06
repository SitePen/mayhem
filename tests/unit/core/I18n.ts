import Application = require('mayhem/Application');
import aspect = require('dojo/aspect');
import assert = require('intern/chai!assert');
import I18n = require('mayhem/I18n');
import has = require('mayhem/has');
import registerSuite = require('intern!object');

var app:Application;
var i18n:I18n;
var handle:IHandle;
var globalListener:any;

declare var process:any;

registerSuite({
	name: 'mayhem/I18n',

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
		i18n = new I18n({ app });
		return i18n.run();
	},

	afterEach() {
		i18n.destroy();
	},

	'#formatCurrency'() {
		this.skip('TODO');
	},

	'#formatDate'() {
		this.skip('TODO');
	},

	'#formatNumber'() {
		this.skip('TODO');
	},

	'#parseCurrency'() {
		this.skip('TODO');
	},

	'#parseDate'() {
		this.skip('TODO');
	},

	'#parseNumber'() {
		this.skip('TODO');
	},

	'#messages'() {
		this.skip('TODO');
	}
});
