define([
	'dojo/_base/declare',
	'dojo/Deferred',
	'dojo/when',
	'./BaseRoute',
	'require'
], function (declare, Deferred, when, BaseRoute, require) {
	return declare(BaseRoute, {
		view: null,
		controller: null,
		router: null,

		_resolveModuleId: function (property) {
			var value = this[property];

			if (value === null) {
				return 'framework/' + property.charAt(0).toUpperCase() + property.slice(1);
			}

			return value.charAt(0) === '/' ? value.slice(1) :
				this.router.get(property + 'Path') + '/' +
				value.charAt(0).toUpperCase() + value.slice(1) + property.charAt(0).toUpperCase() + property.slice(1);
		},

		enter: function () {
			var self = this,
				dfd = new Deferred();

			require([
				this._resolveModuleId('view'),
				this._resolveModuleId('controller')
			], function (View, Controller) {
				return when(self._instantiateComponents(View, Controller)).then(function () {
					dfd.resolve();
				}, function () {
					dfd.reject();
				});
			});

			return dfd.promise;
		},

		exit: function () {

		},

		_instantiateComponents: function (View, Controller) {
			var controller = this._controllerInstance = new Controller();
			this._viewInstance = new View({ parentView: this.parentView, controller: controller });
			return this._viewInstance.startup();
		}
	});
});