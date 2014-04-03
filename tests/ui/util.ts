/// <reference path="../../dojo" />

import core = require('../../interfaces');
import lang = require('dojo/_base/lang');
import Deferred = require('dojo/Deferred');

export function configureLoader(config:{ map:{ [key:string]: string }; undef?: string[] }, restore?:boolean) {
	var undefs = [];
	config = lang.clone(config);

	if (config.undef) {
		for (var i = 0; i < config.undef.length; i++) {
			undefs.push(config.undef[i]);
			require.undef(config.undef[i]);
		}
	}

	if (config.map) {
		for (var mid in config.map) {
			undefs.push(mid);
			require.undef(mid);
			if (restore) {
				config.map[mid] = undefined;
			}
		}

		require.config({ map: { '*': config.map } });
	}

	return {
		restore() {
			var dfd:IDeferred<void> = new Deferred<void>();
			configureLoader(config, true);
			require(undefs, function () {
				dfd.resolve(true);
			});
			return dfd.promise;
		}
	}
}

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
