/// <reference path="../dojo" />
define([
	'./binding/BindingError',
	'./binding/BindingProxty',
	'./binding/ProxtyBinder',
	'./binding/proxties/Es5Proxty',
	'./binding/proxties/MetadataProxty',
	'./binding/proxties/MethodProxty',
	'./binding/proxties/NestedProxty',
	'intern/dojo/has!host-browser?./binding/proxties/NodeTargetProxty',
	'./binding/proxties/ObjectTargetProxty',
	'./binding/proxties/ObservableProxty',
	'./binding/proxties/StatefulProxty'
], function () {});
