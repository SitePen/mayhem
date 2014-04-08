/// <reference path="../../dojo" />

import core = require('../../interfaces');

/**
 * Destroy a given destroyable, silently ignoring any errors
 */
export function destroy(destroyable:core.IDestroyable):any {
	if (destroyable) {
		try {
			destroyable.destroy();
		} catch (e) {
			// ignored
		}
	}
	return null;
}

export function createDestroyable() {
	return {
		_destroyed: false,
		destroy() {
			this._destroyed = true;
		}
	}
}

export function createRemovable() {
	return {
		_removed: false,
		remove() {
			this._removed = true;
		}
	}
}

export function createView() {
	return {
		destroyed: false,
		destroy() {
			this.destroyed = true;
		},
		set(key:string, value:any) {
			this[key] = value;
		}
	};
}
