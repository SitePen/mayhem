import Memory from 'dstore/Memory';
import Store from 'dstore/Store';
import { addUnloadCallback, debounce } from '../../util';

interface DomStorage<T> extends Memory<T> {
	key: string;
	target: Storage;
	filter(query: string | {} | { (item: T, index: number): boolean; }): DomStorage<T>;
	sort(property: string | { (a: T, b: T): number; }, descending?: boolean): DomStorage<T>;
	track(): DomStorage<T>;
}

var DomStorage: {
	new <T>(kwArgs?: DomStorage.KwArgs): DomStorage<T>;
	prototype: DomStorage<any>;
} = Memory.createSubclass<any>({
	key: 'dstore',
	target: null,

	constructor(kwArgs?: DomStorage.KwArgs) {
		if (!this.target && typeof localStorage === 'undefined') {
			throw new Error('No storage is available in the current environment');
		}

		this.setTarget(this.key, this.target || localStorage);
		var self = this;
		this._unloadHandle = addUnloadCallback(function () {
			self._persist();
		});
	},

	_bouncePersist: debounce(function () {
		this._persist();
	}, 1000),

	destroy(): void {
		this.destroy = function () {};
		this._persist();
		this._unloadHandle.remove();
	},

	fetchSync(): dstore.FetchArray<any> {
		this.storage._loaded || this._load();
		return this.inherited(arguments);
	},

	getSync<T>(id: any): T {
		this.storage._loaded || this._load();
		return this.inherited(arguments);
	},

	_load(): void {
		this.storage._loaded = true;
		Memory.prototype.setData.call(this, JSON.parse(this.target.getItem(this.key)) || []);
	},

	_persist(): void {
		this.target.setItem(this.key, JSON.stringify(this.storage.fullData));
	},

	putSync<T>(object: T): T {
		this.storage._loaded || this._load();
		var putObject: T = this.inherited(arguments);
		this._bouncePersist();
		return putObject;
	},

	removeSync(): boolean {
		this.storage._loaded || this._load();
		var isRemoved: boolean = this.inherited(arguments);
		this._bouncePersist();
		return isRemoved;
	},

	setData(): void {
		this.inherited(arguments);
		this._bouncePersist();
	},

	setTarget(key: string, target?: Storage): void {
		if (target) {
			this.target = target;
		}
		this.key = key;

		// Reload the data immediately if the target changes after it has already been loaded once since any
		// observers need to be notified of the new data set
		this.storage._loaded && this._load();
	}
});

module DomStorage {
	export interface KwArgs extends Store.KwArgs {
		key?: string;
		target?: string;
	}
}

export = DomStorage;
