define([
	'dojo/_base/lang', 'dojo/AdapterRegistry', './DefaultBindingExpression' /*=====, ./api/DataBindingExpression =====*/
], function (lang, AdapterRegistry, DefaultBindingExpression /*=====, DataBindingExpression =====*/) {
	var registry = new AdapterRegistry();

	var originalRegister = lang.hitch(registry, registry.register);
	registry.register = function (name, DataBindingExpression, override) {
		// summary:
		//		Register a DataBindingExpression
		// name: String
		//		The name of the registration
		// DataBindingExpression: DataBindingExpression
		//		The DataBindingExpression to register
		// override: boolean
		//		Whether to give the registrant highest or lowest precedence

		function check(rawExpression) {
			return DataBindingExpression.isMatch(rawExpression);
		}
		function wrap(rawExpression) {
			return new DataBindingExpression(rawExpression);
		}
		var directReturn = false;
		originalRegister(name, check, wrap, directReturn, override);
	};

	registry.register("default", DefaultBindingExpression);

	return registry;
});