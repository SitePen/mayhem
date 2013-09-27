/// <reference path="../interfaces.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="../binding/interfaces.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../Component'], function(require, exports, __Component__) {
    var Component = '../Component';

    var Widget = (function (_super) {
        __extends(Widget, _super);
        function Widget() {
            _super.apply(this, arguments);
        }
        Widget.prototype._mediatorGetter = function () {
            return this._mediator || this.parent.mediator;
        };

        Widget.prototype._mediatorSetter = function (value) {
            this._mediator = value;
            for (var k in this._bindings) {
                this._bindings[k].forEach(function (binding) {
                    binding.to = value;
                });
            }
        };

        Widget.prototype.bind = function (propertyName, binding) {
            var handle = this.app.dataBindingRegistry({
                from: this,
                property: propertyName,
                // where it goes depends on the syntax!
                // foo -> mediator.foo
                // mediator.foo -> mediator.foo
                // model.foo -> mediator.model.foo
                // app.foo -> mediator.app.foo
                to: this.get('mediator'),
                binding: binding
            });
            this._bindings.push(handle);
            return handle;
        };
        return Widget;
    })(Component);
});
