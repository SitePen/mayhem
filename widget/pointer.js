define(["dojo/_base/kernel", "dojo/aspect", "dojo/dom", "dojo/on", "dojo/has", "dojo/mouse", "dojo/_base/window"],
function(dojo, aspect, dom, on, has, mouse, win){

	//
	// NOTE: This is a stopgap implementation based on dojo/touch. We plan to implement better, simpler pointer event support later on.
	//

	var hasTouch = has("touch");

	// TODO: get iOS version from dojo/sniff after #15827 is fixed
	var ios4 = false;
	if(has("ios")){
		var ua = navigator.userAgent;
		var v = ua.match(/OS ([\d_]+)/) ? RegExp.$1 : "1";
		var os = parseFloat(v.replace(/_/, '.').replace(/_/g, ''));
		ios4 = os < 5;
	}

	var touchmove, hoveredNode;

	if(hasTouch){
		// Keep track of currently hovered node
		hoveredNode = win.body();	// currently hovered node

		win.doc.addEventListener("touchstart", function(evt){
			// Precede touchstart event with touch.over event.  DnD depends on this.
			// Use addEventListener(cb, true) to run cb before any touchstart handlers on node run,
			// and to ensure this code runs even if the listener on the node does event.stop().
			var oldNode = hoveredNode;
			hoveredNode = evt.target;
			on.emit(oldNode, "mayhemtouchout", {
				target: oldNode,
				relatedTarget: hoveredNode,
				bubbles: true
			});
			on.emit(hoveredNode, "mayhemtouchover", {
				target: hoveredNode,
				relatedTarget: oldNode,
				bubbles: true
			});
		}, true);

		// Fire synthetic touchover and touchout events on nodes since the browser won't do it natively.
		on(win.doc, "touchmove", function(evt){
			var newNode = win.doc.elementFromPoint(
				evt.pageX - (ios4 ? 0 : win.global.pageXOffset), // iOS 4 expects page coords
				evt.pageY - (ios4 ? 0 : win.global.pageYOffset)
			);
			if(newNode && hoveredNode !== newNode){
				// touch out on the old node
				on.emit(hoveredNode, "mayhemtouchout", {
					target: hoveredNode,
					relatedTarget: newNode,
					bubbles: true
				});

				// touchover on the new node
				on.emit(newNode, "mayhemtouchover", {
					target: newNode,
					relatedTarget: hoveredNode,
					bubbles: true
				});

				hoveredNode = newNode;
			}
		});

		// Define synthetic touch.move event that unlike the native touchmove, fires for the node the finger is
		// currently dragging over rather than the node where the touch started.
		touchmove = function(node, listener){
			return on(win.doc, "touchmove", function(evt){
				if(node === win.doc || dom.isDescendant(hoveredNode, node)){
					evt.target = hoveredNode;
					listener.call(this, evt);
				}
			});
		};
	}

	function _handle(type) {
		return function (node, listener) {
			return on(node, type, listener);
		};
	}

	var pointer = {
		down: _handle(hasTouch ? "touchstart": "mousedown"),
		up: _handle(hasTouch ? "touchend": "mouseup"),
		cancel: hasTouch ? _handle("touchcancel") : mouse.leave,
		move: hasTouch ? touchmove :_handle("mousemove"),
		over: _handle(hasTouch ? "mayhemtouchover": "mouseover"),
		out: _handle(hasTouch ? "mayhemtouchout": "mouseout"),
		enter: mouse._eventHandler(hasTouch ? "mayhemtouchover" : "mouseover"),
		leave: mouse._eventHandler(hasTouch ? "mayhemtouchout" : "mouseout")
	};
	/*=====
	touch = {
		// summary:
		//		This module provides unified pointer event handlers for desktop and mobile widgets.
		//		It is based on http://www.w3.org/TR/2013/WD-pointerevents-20130219/
		//		and supports all pointer events except gotpointercapture and lostpointercapture.
		//
		// example:
		//		Used with a widget:
		//		|	define(["mayhem/widget/pointer", "mayhem/widget/Widget"], function(pointer, Widget){
		//		|		var widget = new Widget();
		//		|		widget.on(pointer.down, function(e){});
		//		|		widget.on(pointer.move, function(e){});
		//		|		widget.on(pointer.up, function(e){});
		//		|		widget.on(pointer.cancel, function(e){});

		down: function(widget, listener){
			// summary:
			//		Register a listener for the pointerdown event
			// widget:
			//		Target widget to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		move: function(widget, listener){
			// summary:
			//		Register a listener for the pointermove event
			// widget:
			//		Target widget to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		up: function(node, listener){
			// summary:
			//		Register a listener for the pointerup event
			// widget:
			//		Target widget to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		cancel: function(widget, listener){
			// summary:
			//		Register a listener for the pointercancel event
			// widget:
			//		Target widget to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		over: function(widget, listener){
			// summary:
			//		Register a listener for the pointerover event
			// widget:
			//		Target widget to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		out: function(widget, listener){
			// summary:
			//		Register a listener for the pointerout event
			// widget:
			//		Target widget to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		enter: function(widget, listener){
			// summary:
			//		Register a listener for the pointerenter event
			// widget:
			//		Target widget to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		leave: function(widget, listener){
			// summary:
			//		Register a listener for the pointerleave event
			// widget:
			//		Target widget to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		}
	};
	=====*/

	return pointer;
});
