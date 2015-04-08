import { deepCreate } from '../util';
import Model from './Model';
import Promise from '../Promise';

class PersistentModel extends Model {
	protected static nonDataKeys: HashMap<boolean> = deepCreate(Model.nonDataKeys, {
		autoSave: true,
		store: true
	});

	/**
	 * Sets the default data store for this type of model.
	 */
	static setDefaultStore(store: dstore.ICollection<PersistentModel>) {
		// This function isn't just a property mutator due to TS#1520
		store.Model = this;
		this.prototype.store = store;
	}

	/**
	 * Finds all objects matching the given filtering query from the underlying default data store.
	 */
	static findAll(query: any): dstore.ICollection<PersistentModel> {
		return this.prototype.store.filter(query);
	}

	/**
	 * Gets the object with the specified ID from the underlying default data store.
	 */
	static get(id: any): Promise<PersistentModel> {
		return Promise.resolve(this.prototype.store.get(id));
	}

	/**
	 * Causes the model to save every time a property is set.
	 */
	autoSave: boolean;

	get autoValidate(): boolean {
		// If autoSave is enabled, validation will be performed when the save call occurs,
		// so ignore the autoValidate setting
		return this.autoSave ? false : this._autoValidate;
	}
	set autoValidate(value: boolean) {
		this._autoValidate = value;
	}
	private _autoValidate: boolean;

	/**
	 * The data store that this model belongs to.
	 */
	store: dstore.ICollection<PersistentModel>;

	set values(values: {}) {
		this.superSet('values', values);

		if (this.autoSave) {
			this.save();
		}
	}

	protected initialize() {
		super.initialize();
		this.autoSave = false;
		this._scenario = 'insert';
	}

	/**
	 * Deletes the object from its data store.
	 */
	delete(): Promise<any> {
		var store = this.store;
		var self = this;
		return Promise.resolve(store.remove(store.getIdentity(this))).then(function <T>(returnValue: T): T {
			self.scenario = 'insert';
			return returnValue;
		});
	}

	// Required by dstore interface
	_restore(Ctor: new (...args: any[]) => PersistentModel): PersistentModel {
		return new Ctor(this);
	}

	/**
	 * Saves the object to its data store.
	 */
	save(skipValidation?: boolean): Promise<void> {
		var self = this;

		function save() {
			return Promise.resolve(self.store.put(self)).then(function () {
				self.commit();
				self.scenario = 'update';
			});
		}

		if (skipValidation) {
			return save();
		}
		else {
			return this.validate().then(function (isValid) {
				if (isValid) {
					return save();
				}
				else {
					throw new Error('Could not save model; validation failed');
				}
			});
		}
	}
}

module PersistentModel {
	export interface KwArgs extends Model.KwArgs {
		autoSave?: boolean;
		store?: dstore.ICollection<PersistentModel>;
	}
}

export default PersistentModel;
