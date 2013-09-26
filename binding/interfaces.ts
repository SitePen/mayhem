/// <reference path="../interfaces.ts" />

interface IDataBinderRegistry {
	add(binder:IDataBinder, index:number): IHandle;
	test(binding:string, source:Object, destination:Object): boolean;
	bind(binding:string, source:Object, destination:Object): IDataBinderHandle;
}

interface IDataBinder {
	test(binding:string, source:Object, destination:Object): boolean;
	bind(binding:string, source:Object, destination:Object, callback:(value:any) => void): IDataBinderHandle;
}

interface IComputedProperty {
	isComputed: boolean;
	get(): any;
	set?(value:any): void;
}

interface IDataBinderHandle extends IHandle {
	to:IMediator;
	notify(value:any): void;
}

/*class DefaultDataBinder implements IDataBinder {
	test(binding:string) {


		return true;
	}

	bind(binding:string, context:IMediator) {
		var property:string = 'foo';
		if(context[property].isComputed){}

		return {
			remove: function () {

			}
		};
	}
}
*/
