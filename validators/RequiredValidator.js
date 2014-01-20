define(["require", "exports", './ValidationError'], function(require, exports, ValidationError) {
    var i18n = {
        required: 'TODO field required error message'
    };

    var RequiredValidator = (function () {
        function RequiredValidator() {
        }
        // TODO we need a way to define return as boolean | IPromise<boolean> (union types?)
        RequiredValidator.prototype.validate = function (model /*IModel*/ , key, value) {
            if (value == null || value == "") {
                model.addError(key, new ValidationError(i18n.required));
            }
            return undefined;
        };
        return RequiredValidator;
    })();

    
    return RequiredValidator;
});
//# sourceMappingURL=RequiredValidator.js.map
