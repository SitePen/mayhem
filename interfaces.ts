/// <reference path="binding/interfaces.ts" />

interface IHandle {
	remove: () => void;
}

interface IApplication {
	dataBindingRegistry: IDataBinderRegistry;
}

interface IComponent {
	app: IApplication;
}

interface IMediator {
	routeState: Object;
	notify: (property:string, value:any) => void;
}

class Mediator {
	constructor(public routeState) {}
	notify(property:string, value:any) {

	}
}

function computed(descriptor:/*Object*/any):IComputedProperty {
	descriptor = <IComputedProperty> Object.create(descriptor, {
		isComputed: { value: true }
	});

	return descriptor;
}

var mediator:IMediator = new Mediator({
	routeState: null,
	computedProperty: computed({
		get: function () {
			return this.a + ' ' + this.b;
		},
		set: function (value:any) {
			value = value.split(' ');
			this.set({
				a: value[0],
				b: value[1]
			});
		}
	})
});
