class List {
	properties:any = {};

	renderArgs:any;

	domNode = {
		className: 'mockList'
	}

	destroyed = false;

	destroy() {
		this.destroyed = true;
	}

	set(key:string, value:any) {
		this.properties[key] = value;

		if (key === 'store') {
			value.query().forEach(function (item:any) {
				this.renderRow(item);
			}, this);
		}
	}

	get(key:string):any {
		return this.properties[key];
	}

	renderRow() {}

	insertRow(object:any, parent:any, beforeNode:any, i:any, options:any) {}

	renderArray(source:any[]) {
		this.renderArgs = arguments;
		source.forEach(function (item, index) {
			this.insertRow(item, null, null, index, null);
		}, this);
	}
}

export = List;
