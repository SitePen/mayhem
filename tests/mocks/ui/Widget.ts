import Widget = require('../../../ui/Widget');
import MockRenderer = require('./Renderer');
class MockWidget extends Widget {}
MockWidget.prototype._renderer = new MockRenderer();
export = MockWidget;

// function createMediator() {
// 	return {
// 		source: <any> null,
// 		scopeField: <any> null,
// 		_notify(newVal:any, oldVal:any, scopeField:any) {
// 			this.source = newVal;
// 			this.scopeField = scopeField;
// 		}
// 	}
// }

// class MockWidget {
// 	static createdCount = 0;

// 	source:any;
// 	observers:any = {};
// 	attached:any[] = [];
// 	_detached = false;
// 	_destroyed = false;
// 	_list:any;
// 	_listDestroyed = false;
// 	_mediatorIndex:any[] = [];
// 	_fragment:any;

// 	_properties:any = {
// 		each: 'scope',
// 		classList: {
// 			className: '',
// 			add(name:string) { this.className = name; }
// 		}
// 	};

// 	fragmentReplacedNew:any;
// 	fragmentReplacedOld:any;

// 	constructor(kwArgs?:any) {
// 		var self = this;

// 		this._list = {
// 			_renderSource: <any> null,
// 			_destroyed: false,
// 			domNode: 'some node',
// 			set(key:string, value:any) { this[key] = value; },
// 			renderArray(source:any) { this._renderSource = source; },
// 			destroy() {
// 				self._listDestroyed = true;
// 			}
// 		};

// 		// same number of mediators as items in source array
// 		this._mediatorIndex.push(createMediator());
// 		this._mediatorIndex.push(createMediator());

// 		this._fragment = {
// 			parentNode: {
// 				replaceChild(newRoot:any, oldRoot:any) {
// 					console.log('replacing child...');
// 					self.fragmentReplacedNew = newRoot;
// 					self.fragmentReplacedOld = oldRoot;
// 				}
// 			}
// 		};

// 		if (kwArgs) {
// 			for (var key in kwArgs) {
// 				this._properties[key] = kwArgs[key];
// 			}
// 		}

// 		if (!this.get('id')) {
// 			this.set('id', 'MockWidget' + MockWidget.createdCount++);
// 		}
// 	}

// 	observe(key:any, observer:any) {
// 		this.observers[key] = observer;
// 	}

// 	attach(widget:any) {
// 		this.attached.push(widget);
// 	}

// 	detach() {
// 		this._detached = true;
// 	}

// 	destroy() {
// 		this._destroyed = true;
// 	}

// 	get(key:string):any {
// 		return this._properties[key];
// 	}

// 	set(key:string, value:any) {
// 		var oldValue = this._properties[key];
// 		this._properties[key] = value;
// 		if (key in this.observers) {
// 			this.observers[key](value, oldValue);
// 		}
// 	}

// 	_widgetIndex = {};

// 	_getMediatorByKey(key:any) {
// 		return this._mediatorIndex[key];
// 	}

// 	on(key:any, callback:any) {
// 	}
// }

// export = MockWidget;
