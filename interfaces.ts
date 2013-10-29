/// <reference path="binding/interfaces.ts" />
/// <reference path="dojo.d.ts" />

interface IApplication {
	dataBindingRegistry: IDataBindingRegistry;
}

interface IComponent extends IStateful {
	app: IApplication;
}

interface IMediator extends IComponent {
	routeState: Object;
	model: IModel;
}

interface IModel extends IComponent {}
