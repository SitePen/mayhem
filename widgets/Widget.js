var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../StatefulEvented', 'dojo/_base/lang', '../util'], function(require, exports, StatefulEvented, lang, util) {
    var uid = 0;

    var Widget = (function (_super) {
        __extends(Widget, _super);
        function Widget(kwArgs) {
            _super.call(this, kwArgs);

            if (!this.id) {
                this.id = 'Widget' + (++uid);
            }
        }
        Widget.prototype._mediatorGetter = function () {
            return this._mediator || this.parent.mediator;
        };

        Widget.prototype._mediatorSetter = function (value) {
            this._mediator = value;
            // TODO: Reset all bindings to mediator
        };

        Widget.prototype.bind = function (propertyName, binding) {
            var bindings = this._bindings, handle = this.app.dataBindingRegistry({
                source: this._mediator,
                sourceBinding: binding,
                target: this,
                targetBinding: propertyName
            });

            bindings.push(handle);
            return {
                remove: function () {
                    this.remove = function () {
                    };
                    handle.remove();
                    util.spliceMatch(bindings, handle);
                }
            };
        };

        Widget.prototype.destroy = function () {
            var binding;
            for (var i = 0; (binding = this._bindings); ++i) {
                binding.remove();
            }

            this._bindings = this._mediator = this.app = null;
        };
        return Widget;
    })(StatefulEvented);
});
