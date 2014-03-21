class Application {
	_properties:any = {
		binder: {
			_removeCount: 0,
			_bindCount: 0,
			_setSourceCount: 0,
			_source: <any> null,
			_bindArgs: <any> null,

			bind(bindArgs:any) {
				var self = this;
				this._bindCount++;
				this._bindArgs = bindArgs;
				return {
					remove() {
						self._removeCount++;
					},
					setSource(mediator:any) {
						self._setSourceCount++;
						self._source = mediator;
					}
				}
			}
		}
	};

	get(key:string):any {
		return this._properties[key];
	}
}

export = Application
