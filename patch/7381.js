define([ "dijit/_WidgetBase", "dojo/_base/array" ], function (_WidgetBase, array) {
	_WidgetBase.extend({
		_applyAttributes: function(){
			// summary:
			//		Fixes setters not being called when defined values are falsy by removing the
			//		conditional that used to exist in Step 2.

			// Get list of attributes where this.set(name, value) will do something beyond
			// setting this[name] = value.  Specifically, attributes that have:
			//		- associated _setXXXAttr() method/hash/string/array
			//		- entries in attributeMap (remove this for 2.0);
			var ctor = this.constructor,
				list = ctor._setterAttrs;
			if(!list){
				list = (ctor._setterAttrs = []);
				for(var attr in this.attributeMap){
					list.push(attr);
				}

				var proto = ctor.prototype;
				for(var fxName in proto){
					if(fxName in this.attributeMap){ continue; }
					var setterName = "_set" + fxName.replace(/^[a-z]|-[a-zA-Z]/g, function(c){ return c.charAt(c.length-1).toUpperCase(); }) + "Attr";
					if(setterName in proto){
						list.push(fxName);
					}
				}
			}

			// Call this.set() for each property that was either specified as parameter to constructor,
			// or is in the list found above.	For correlated properties like value and displayedValue, the one
			// specified as a parameter should take precedence.
			// Particularly important for new DateTextBox({displayedValue: ...}) since DateTextBox's default value is
			// NaN and thus is not ignored like a default value of "".

			// Step 1: Save the current values of the widget properties that were specified as parameters to the constructor.
			// Generally this.foo == this.params.foo, except if postMixInProperties() changed the value of this.foo.
			var params = {};
			for(var key in this.params || {}){
				params[key] = this[key];
			}

			// Step 2: Call set() for each property that wasn't passed as a parameter to the constructor
			array.forEach(list, function(attr){
				if(attr in params){
					// skip this one, do it below
				}else{
					this.set(attr, this[attr]);
				}
			}, this);

			// Step 3: Call set() for each property that was specified as parameter to constructor.
			// Use params hash created above to ignore side effects from step #2 above.
			for(key in params){
				this.set(key, params[key]);
			}
		}
	});
});