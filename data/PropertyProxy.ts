import data = require('./interfaces');
import Proxy = require('../Proxy');

class PropertyProxy<T> extends Proxy implements data.IProperty<T> {
	get:data.IPropertyGet<T>;
	set:data.IPropertySet<T>;

	validate():IPromise<boolean> {
		return (<any>this)._target.validate();
	}
}

export = PropertyProxy;
