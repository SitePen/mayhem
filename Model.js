define(["require", "exports", './has', 'dojo/_base/array', 'dojo/when', 'dojo/Deferred', './util', './Mediator', './ModelProxty', './validators/ValidationError'], function(require, exports, has, array, when, Deferred, util, Mediator, ModelProxty, ValidationError) {
    // class User extends Model {
    // 	username:core.IModelProxty<string> = new ModelProxty<string>({
    // 		label: 'Username',
    // 		validators: [ {
    // 			validate: function (model:core.IModel, key:string, proxty:ModelProxty<string>):IPromise<boolean> {
    // 				model.addError(key, new ValidationError('You broke it!', { name: proxty.label }));
    // 				return when(false);
    // 			}
    // 		} ]
    // 	});
    // 	firstName:core.IModelProxty<string> = new ModelProxty<string>({
    // 		default: 'Joe',
    // 		validators: []
    // 	});
    // 	lastName:core.IModelProxty<string> = new ModelProxty<string>({
    // 		default: 'Bloggs',
    // 		validators: []
    // 	});
    // }
    // class UserMediator extends Mediator {
    // 	fullName:core.IModelProxty<string> = new ModelProxty<string>({
    // 		get: function () {
    // 			return this.get('firstName') + ' ' + this.get('lastName');
    // 		},
    // 		dependencies: [ 'firstName', 'lastName' ]
    // 	});
    // }
    var Model = (function () {
        function Model() {
            this.isExtensible = true;
            this.scenario = 'insert';
        }
        Model.prototype.get = function (key) {
            return this[key] && this[key].get();
        };

        Model.prototype.set = function (key, value) {
            if (!(key in this)) {
                if (this.isExtensible) {
                    this[key] = new ModelProxty({});
                } else if (has('debug')) {
                    console.warn('Not setting undefined property "' + key + '" on model');
                    return;
                }
            }

            this[key].set(value);
        };

        Model.prototype._getProxtyMap = function () {
            var key, proxtyMap = {};
            for (key in this) {
                if (this[key] instanceof ModelProxty) {
                    proxtyMap[key] = this[key];
                }
            }
            return proxtyMap;
        };

        Model.prototype.addError = function (field, error) {
            this[field].addError(error);
        };

        Model.prototype.getErrors = function (field) {
            if (field) {
                return this[field].getErrors();
            }

            // grab errors from all proxties
            var proxtyMap = this._getProxtyMap(), keys = util.getObjectKeys(proxtyMap), errors = [];
            array.forEach(util.getObjectKeys(proxtyMap), function (key) {
                var value = proxtyMap[key];

                // FIXME is typescript getting the spread op?
                // errors.push(...value.getErrors());
                Array.prototype.push.apply(errors, value.getErrors());
            });
            return errors;
        };

        Model.prototype.clearErrors = function () {
            var proxtyMap = this._getProxtyMap();

            // TODO should we have a clearErrors call on ModelProxties?
            array.forEach(util.getObjectKeys(proxtyMap), function (key) {
                proxtyMap[key].clearErrors();
            });
        };

        Model.prototype.isValid = function () {
            return !this.getErrors().length;
        };

        Model.prototype.validate = function (fields) {
            this.clearErrors();

            var self = this, dfd = new Deferred(), proxtyMap = this._getProxtyMap(), keys = util.getObjectKeys(proxtyMap), i = 0;

            validateNextField();
            return dfd.promise;

            function validateNextField() {
                function runNextValidator() {
                    var validator = proxty.validators[j++];

                    // end of list of validators for this field reached
                    if (!validator) {
                        return validateNextField();
                    }

                    var value = proxty.get();

                    if (validator.options) {
                        // Simply skip validators that are defined as allowing empty fields when the value is
                        // empty (null, undefined, or empty string)
                        if (validator.options.allowEmpty && (value == null || value.toString() === '')) {
                            return runNextValidator();
                        }

                        // Skip validators that are limited to certain scenarios and do not match the currently
                        // defined model scenario
                        var scenarios = validator.options.scenarios;
                        if (scenarios && length && array.indexOf(scenarios, this.scenario) === -1) {
                            return runNextValidator();
                        }
                    }

                    // If a validator returns false, we stop processing any other validators on this field;
                    // if there is an error, validation processing halts
                    var validationResult = validator.validate(self, key, value);
                    when(validationResult).then(function () {
                        runNextValidator();
                    }, function (error) {
                        dfd.reject(error);
                    });
                }

                var key = keys[i++], proxty = proxtyMap[key], j = 0;

                if (!proxty || !proxty.validators) {
                    dfd.resolve(undefined);
                } else if (fields && array.indexOf(fields, key) === -1) {
                    validateNextField();
                } else {
                    runNextValidator();
                }
            }
        };

        // TODO stubs
        Model.prototype.remove = function () {
        };
        Model.prototype.save = function (skipValidation) {
            return when(undefined);
        };
        return Model;
    })();

    
    return Model;
});
//# sourceMappingURL=Model.js.map
