/// <reference path="../../dojo" />

/**
 * Destroy/close/remove a given handle, silently ignoring any errors
 */
export function destroy(handle:any):any {
	if (!handle) {
		return null;
	}

	try {
		if (handle.destroy) {
			handle.destroy();
		}
		else if (handle.remove) {
			handle.remove();
		}
		else if (handle.close) {
			handle.close();
		}
	} catch (e) {
		// ignored
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
