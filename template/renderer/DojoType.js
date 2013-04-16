define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function DojoTypeRenderer(astNode) {
		//	summary:
		//		Manages the rendering of content that is just plain text.
		//	astNode:
		//		The AST node describing the content to be rendered

		var attachPoint = astNode.attachPoint,
			attachEvent = astNode.attachEvent,
			attachAction = astNode.attachAction;

		this.dojoType = astNode.dojoType;
		this.dojoProps = new Renderers.Statements(astNode.dojoProps);
		if (attachPoint) {
			this.attachPoint = new Renderers.DojoAttachPoint(attachPoint);
		}
		if (attachEvent) {
			this.attachEvent = new Renderers.DojoAttachEvent(attachEvent);
		}
		if (attachAction) {
			this.attachAction = new Renderers.DojoAttachEvent(attachAction);
		}
	}

	DojoTypeRenderer.prototype = {
		constructor: DojoTypeRenderer,

		render: function () {
			//	summary:
			//		Render a data-dojo-type Element
			//	returns: Element
			//		The domNode of the widget that gets generated

			// TODO: we probably want to do something more granular than this.  currently (i think)
			// it will update all props whenever one of them changes.

			// since the deps are collected when we parse, we rely on them being loaded before we
			// render.  however, when working from source, they won't have been loaded when we are
			// constructed so only call require during rendering and not in the constructor.
			var Ctor = require(this.dojoType),
				dojoProps = this.dojoProps,
				attachPoint = this.attachPoint,
				attachEvent = this.attachEvent,
				attachAction = this.attachAction,
				args = [].slice.call(arguments, 0, 3),
				widget,
				props = bind(function () {
					var properties = [].slice.call(arguments),
						prop,
						props = {};

					while (properties.length) {
						prop = properties.pop();
						props[prop.name] = prop.value;
					}

					return props;
				}).to(dojoProps.render.apply(dojoProps, arguments));

			return bind(function (props) {
				if (widget) {
					widget.set(props);
				}
				else {
					widget = new Ctor(props);
					if (attachPoint) {
						attachPoint.render.apply(attachPoint, args.concat(widget));
					}
					if (attachEvent) {
						attachEvent.render.apply(attachEvent, args.concat(widget));
					}
					if (attachAction) {
						attachAction.render.apply(attachAction, args.concat(widget));
					}
				}

				return widget.domNode;
			}).to(props);
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return DojoTypeRenderer;
});