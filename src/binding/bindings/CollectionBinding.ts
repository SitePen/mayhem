import Binding = require('../Binding');
import binding = require('../interfaces');
import util = require('../../util');

class CollectionBinding extends Binding<dstore.ICollection<any>> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		var collection:dstore.ICollection<any> = <any> kwArgs.object;

		return collection
			&& typeof collection.fetch === 'function'
			&& typeof collection.track === 'function'
			&& typeof collection.filter === 'function'
			&& kwArgs.path === '*';
	}

	private _handle:IHandle;
	private _object:dstore.ICollection<any>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var collection:dstore.ICollection<any> = this._object = (<any> kwArgs.object).track();
		var self = this;

		// TODO: Hack(?) to make indexes show up
		collection.fetchRange({ start: 0, length: 0 });

		this._handle = util.createCompositeHandle(
			collection.on('add', function (event:dstore.ChangeEvent<any>):void {
				// undefined index means that the add event doesn't match our filtered collection
				if (event.index !== undefined) {
					self.notify({ index: event.index, added: [ event.target ] });
				}
			}),
			collection.on('update', function (event:dstore.ChangeEvent<any>):void {
				if (event.index !== event.previousIndex) {
					if (event.previousIndex !== undefined) {
						self.notify({ index: event.previousIndex, removed: [ event.target ] });
					}

					if (event.index !== undefined) {
						self.notify({ index: event.index, added: [ event.target ] });
					}
				}
			}),
			collection.on('delete', function (event:dstore.ChangeEvent<any>):void {
				// undefined index means that the delete event doesn't match our filtered collection
				if (event.previousIndex !== undefined) {
					self.notify({ index: event.previousIndex, removed: [ event.target ] });
				}
			}),
			this._object.tracking
		);
	}

	getObject():{} {
		return this._object;
	}

	destroy():void {
		super.destroy();

		this._handle.remove();
		this._handle = this._object = null;
	}
}

export = CollectionBinding;
