/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import domConstruct = require('dojo/dom-construct');
import WidgetRenderer = require('../../../ui/dom/Widget');
import Widget = require('../../../ui/Widget');
import declare = require('dojo/_base/declare');
import util = require('../util');
import domUtil = require('../../../ui/dom/util');

var parentNode:Node,
	renderer:any;

function getChildren(parent:Node) {
	var children = [];
	for (var i = 0; i < parent.childNodes.length; i++) {
		children.push(parent.childNodes[i]);
	}
	return children;
}


registerSuite({
	name: 'ui/dom/Widget',

	setup() {
		Widget.prototype._renderer = new WidgetRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	beforeEach() {
	    renderer = new WidgetRenderer();
	},

	afterEach() {
		renderer = util.destroy(renderer);
	},

	'#add': function () {
		var widget:any = new Widget(),
			newWidget1:any = new Widget(),
			newWidget2:any = new Widget(),
			newWidget3:any = new Widget();

		renderer.add(widget, newWidget1);
		assert.deepEqual(getChildren(widget._firstNode.parentNode), [
			widget._firstNode,
			newWidget1._firstNode,
			newWidget1._lastNode,
			widget._lastNode
		], 'Widget should contain newWidget1 nodes');

		renderer.add(widget, newWidget2);
		assert.deepEqual(getChildren(widget._firstNode.parentNode), [
			widget._firstNode,
			newWidget1._firstNode,
			newWidget1._lastNode,
			newWidget2._firstNode,
			newWidget2._lastNode,
			widget._lastNode
		], 'Widget should contain newWidget2 nodes');

		renderer.add(widget, newWidget3, newWidget2);
		assert.deepEqual(getChildren(widget._firstNode.parentNode), [
			widget._firstNode,
			newWidget1._firstNode,
			newWidget1._lastNode,
			newWidget3._firstNode,
			newWidget3._lastNode,
			newWidget2._firstNode,
			newWidget2._lastNode,
			widget._lastNode
		], 'Widget should contain newWidget3 nodes');
	},

	'#attachContent': function () {
		var widget:any = new Widget();

		// give the widget some test content
		var content:Node = domUtil.toDom('<h1>foo</h1>');
		widget._innerFragment = content;

		assert.deepEqual(getChildren(widget._firstNode.parentNode), [
			widget._firstNode,
			widget._lastNode
		], 'Widget children should be firstNode and lastNode');

		// attach the content to this renderer
		renderer.attachContent(widget);

		assert.deepEqual(getChildren(widget._firstNode.parentNode), [
			widget._firstNode,
			content,
			widget._lastNode
		], 'Widget children should include content');
	},

	// '#destroy': function () {
	// 	assert.doesNotThrow(function () {
	// 		renderer.destroy();
	// 	}, 'Destroying widget renderer should not throw');
	// 	assert.isNull(renderer._fragment, '_fragment should be null');
	// 	assert.isNull(renderer._firstNode, '_firstNode should be null');
	// 	assert.isNull(renderer._lastNode, '_lastNode should be null');
	// },

	//it('should assign the widget id to the widget\'s DOM node', function () {
	//    widget = new Widget();
	//    expect(widget.get('domNode').id).to.equal(widget.get('id'));
	//});

	//it('should set Widget id before calling _create()', function () {
	//    var idDuringCreate;
	//    var CustomWidget = declare(Widget, {
	//        _create: function () {
	//            idDuringCreate = this.id;
	//        }
	//    });

	//    widget = new CustomWidget({ id: 'expected-id' });
	//    expect(idDuringCreate).to.equal('expected-id');
	//});

	//it('should add a .widget property to domNode during creation', function () {
	//    widget = new Widget();
	//    expect(widget.domNode.widget).to.equal(widget);
	//});

	//it('should remove the .widget property from domNode when the widget is destroyed', function () {
	//    widget = new Widget();
	//    widget.destroy();
	//    expect(widget.domNode).to.not.have.property('widget');
	//});

	//it('should replace srcNodeRef if one is provided', function () {
	//    var nodeToReplace = domConstruct.create('div', null, parentNode);

	//    // Verify that there is only one child and it is the node to replace.
	//    expect(parentNode.childNodes.length).to.equal(1);
	//    expect(parentNode.firstChild).to.equal(nodeToReplace);

	//    widget = new Widget(null, nodeToReplace);
	//    widget.startup();

	//    // Verify that there is still only one child and that the child is now the widget's DOM node.
	//    expect(parentNode.childNodes.length).to.equal(1);
	//    expect(parentNode.firstChild).to.equal(widget.domNode);
	//});

	//it('should remove domNode from the DOM when the widget is destroyed', function () {
	//    widget = new Widget(null);

	//    expect(parentNode.childNodes.length).to.equal(0);
	//    parentNode.appendChild(widget.domNode);
	//    widget.startup();
	//    expect(parentNode.childNodes.length).to.equal(1);
	//    widget.destroy();
	//    expect(parentNode.childNodes.length).to.equal(0);
	//});

	//it('should destroy widget descendents in a post-order depth-first traversal', function () {
	//    var destroyedWidgets = [];
	//    var DestroyLoggingWidget = declare(Widget, {
	//        number: null,
	//        _destroy: function () {
	//            destroyedWidgets.push(this.number);
	//        }
	//    });
	//    // TODO: Update this hacky composition with one that uses the container interface once it is merged into Widget.
	//    var ComplexWidget = declare(DestroyLoggingWidget, {
	//        number: 8,
	//        _create: function () {
	//            this.inherited(arguments);

	//            var child1 = this.child1 = new DestroyLoggingWidget({ number: 3 }),
	//                grandChild1 = this.grandChild1 = new DestroyLoggingWidget({ number: 1 }),
	//                grandChild2 = this.grandChild2 = new DestroyLoggingWidget({ number: 2 }),
	//                child2 = this.child2 = new DestroyLoggingWidget({ number: 6 }),
	//                grandChild3 = this.grandChild3 = new DestroyLoggingWidget({ number: 4 }),
	//                grandChild4 = this.grandChild4 = new DestroyLoggingWidget({ number: 5 }),
	//                child3 = this.child3 = new DestroyLoggingWidget({ number: 7 });

	//            this.domNode.appendChild(child1.domNode);
	//            child1.domNode.appendChild(grandChild1.domNode);
	//            child1.domNode.appendChild(grandChild2.domNode);
	//            this.domNode.appendChild(child2.domNode);
	//            child2.domNode.appendChild(grandChild3.domNode);
	//            child2.domNode.appendChild(grandChild4.domNode);
	//            this.domNode.appendChild(child3.domNode);
	//        },
	//        startup: function () {
	//            this.child1.startup();
	//            this.grandChild1.startup();
	//            this.grandChild2.startup();
	//            this.child2.startup();
	//            this.grandChild3.startup();
	//            this.grandChild4.startup();
	//            this.child3.startup();
	//        }
	//    });

	//    widget = new ComplexWidget();
	//    widget.startup();
	//    widget.destroy();

	//    expect(destroyedWidgets).to.deep.equal([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
	//});

	//it('should apply styles to its DOM node', function () {
	//    var expectedBackgroundColor = 'green',
	//        expectedTextAlign = 'left';

	//    widget = new Widget({
	//        style: {
	//            backgroundColor: expectedBackgroundColor,
	//            textAlign: expectedTextAlign
	//        }
	//    });

	//    var style = widget.domNode.style;
	//    expect(style.backgroundColor).to.equal(expectedBackgroundColor);
	//    expect(style.textAlign).to.equal(expectedTextAlign);
	//});

	//it('should apply a CSS class to the widget when the className property is set', function () {
	//    widget = new Widget({
	//        className: 'expectedClassName'
	//    });
	//    expect(domClass.contains(widget.domNode, 'expectedClassName')).to.be.true;
	//});

	//it('should remove the previous CSS class applied via className when setting a new className', function () {
	//    widget = new Widget({
	//        className: 'unexpectedClassName'
	//    });
	//    widget.set('className', 'expectedClassName');
	//    expect(domClass.contains(widget.domNode, 'unexpectedClassName')).to.be.false;
	//    expect(domClass.contains(widget.domNode, 'expectedClassName')).to.be.true;
	//});

	//
	// Test Widget's container behavior
	//

	//var TestContainer = declare(Widget, {
	//    _create: function (propertiesToMixIn) {
	//        this.inherited(arguments);

	//        var domNode = this.domNode,
	//            insertionPointSpecs = (propertiesToMixIn && propertiesToMixIn.insertionPointSpecs) || [];
	//        array.forEach(insertionPointSpecs, function (insertionPointSpec) {
	//            var insertionPointNode = domConstruct.create('div', { 'data-dojo-insertion-point': '' });
	//            if (insertionPointSpec) {
	//                domAttr.set(insertionPointNode, 'data-dojo-content-select', insertionPointSpec);
	//            }
	//            domNode.appendChild(insertionPointNode);
	//        });
	//    }
	//});

	//it('should support adding children via addChild()', function () {
	//    var container = new TestContainer(),
	//        widget = new Widget({ className: 'child-to-add' });

	//    container.addChild(widget);

	//    var matchingNodes = query('.child-to-add', container.domNode);
	//    expect(matchingNodes.length).to.equal(1);
	//    expect(matchingNodes[0].widget).to.equal(widget);
	//});

	//it('should support removing children via removeChild()', function () {
	//    var container = new TestContainer(),
	//        widget = new Widget({ className: 'child-to-remove' });

	//    container.addChild(widget);
	//    container.removeChild(widget);

	//    var matchingNodes = query('.child-to-remove', container.domNode);
	//    expect(matchingNodes.length).to.equal(0);
	//});

	//it('should identify insertion points with a data-dojo-insertion-point attribute', function () {
	//    var CustomTestContainer = declare(Widget, {
	//        _create: function () {
	//            this.inherited(arguments);

	//            this.expectedInsertionPointNode = domConstruct.create('div', { 'data-dojo-insertion-point': '' });
	//            this.domNode.appendChild(this.expectedInsertionPointNode);
	//        }
	//    });

	//    var container = new CustomTestContainer();
	//    expect(container._insertionPoints).to.contain(container.expectedInsertionPointNode);
	//});

	//it('should distribute a new child widget to an insertion points according to selection criteria', function () {
	//    var container = new TestContainer({
	//            insertionPointSpecs: [ '.child-goes-here' ]
	//        }),
	//        widget = new Widget({ className: 'child-goes-here' });

	//    container.addChild(widget);
	//    var insertionPoint = query('[data-dojo-content-select=".child-goes-here"]', container.domNode)[0];
	//    expect(insertionPoint).to.not.be.undefined;
	//    expect(insertionPoint.childNodes.length).to.equal(1);
	//    expect(insertionPoint.childNodes[0].widget).to.equal(widget);
	//});

	//it('should distribute child widgets to first matching insertion point', function () {
	//    var container = new TestContainer({
	//            insertionPointSpecs: [ '.child-goes-here', '.child-goes-here' ]
	//        }),
	//        widget = new Widget({ className: 'child-goes-here' });

	//    container.addChild(widget);
	//    var insertionPoints = query('[data-dojo-content-select=".child-goes-here"]', container.domNode);
	//    expect(insertionPoints.length).to.equal(2);
	//    expect(insertionPoints[0].childNodes.length).to.equal(1);
	//    expect(insertionPoints[0].childNodes[0].widget).to.equal(widget);
	//    expect(insertionPoints[1].childNodes.length).to.equal(0);
	//});

	//it('should append an unmatched child widget to the end of the container', function () {
	//    var container = new TestContainer({
	//            insertionPointSpecs: [ '.criteria1', '.criteria2' ]
	//        }),
	//        widget = new Widget();

	//    container.addChild(widget);
	//    expect(container.domNode.lastChild.widget).to.equal(widget);
	//});

	//it('should treat an insertion point without selection criteria as matching all child candidates', function () {
	//    var container = new TestContainer({
	//            insertionPointSpecs: [ '' ]
	//        }),
	//        widget = new Widget({ className: 'arbitrary-class-name' });

	//    container.addChild(widget);
	//    var insertionPoint = query('[data-dojo-insertion-point]', container.domNode)[0];
	//    expect(insertionPoint.childNodes.length).to.equal(1);
	//    expect(insertionPoint.childNodes[0].widget).to.equal(widget);
	//});

	//
	// Test Widget's Evented-like behavior.
	//

	//it('should add an event listener with widget.on()', function () {
	//    widget = new Widget();

	//    var eventListenerCalled = false;
	//    widget.on('expected-event', function () {
	//        eventListenerCalled = true;
	//    });
	//    widget.emit('expected-event');
	//    expect(eventListenerCalled).to.be.true;
	//});

	//it('should call event listener with the widget as \'this\'', function () {
	//    widget = new Widget();

	//    widget.on('expected-event', function () {
	//        expect(this).to.equal(widget);
	//    });
	//    widget.emit('expected-event');
	//});

	//it('should stop DOM event bubbling when emitting a corresponding bubbling widget event', function () {
	//    widget = new NestedWidget();
	//    parentNode.appendChild(widget.domNode);
	//    widget.startup();

	//    var outerListenerCallCount = 0,
	//        innerListenerCallCount = 0;
	//    function outerListener() { outerListenerCallCount++; }
	//    function innerListener() { innerListenerCallCount++; }

	//    widget.on('click', outerListener);
	//    widget._innerWidget.on('click', innerListener);
	//    widget._innerWidget.domNode.click();

	//    // Expect each listener to have been called once.
	//    // If the outer widget had received the DOM event, it would have emitted an additional 'click' event.
	//    expect(outerListenerCallCount).to.equal(1);
	//    expect(innerListenerCallCount).to.equal(1);
	//});

	//it('should reflect the type of an emitted event in the event\'s type property', function () {
	//    widget = new Widget();

	//    widget.on('expected-event', function (event) {
	//        expect(event.type).to.equal('expected-event');
	//    });
	//    widget.emit('expected-event');
	//});

	//it('should define a boolean .bubbles property on all emitted events', function () {
	//    widget = new Widget();

	//    var emittedEvent;
	//    widget.on('expected-event', function (event) {
	//        emittedEvent = event;
	//    });
	//    widget.emit('expected-event');
	//    expect(emittedEvent).to.be.an('object');
	//    expect(emittedEvent.bubbles).to.be.a('boolean');
	//});

	//it('should define a boolean .cancelable property on all emitted events', function () {
	//    widget = new Widget();

	//    var emittedEvent;
	//    widget.on('expected-event', function (event) {
	//        emittedEvent = event;
	//    });
	//    widget.emit('expected-event');
	//    expect(emittedEvent).to.be.an('object');
	//    expect(emittedEvent.cancelable).to.be.a('boolean');
	//});

	//it('should bubble bubblable events', function () {
	//    widget = new NestedWidget();

	//    var eventBubbled = false;
	//    widget.on('expected-event', function () {
	//        eventBubbled = true;
	//    });
	//    widget._innerWidget.emit('expected-event', { bubbles: true });

	//    expect(eventBubbled).to.be.true;
	//});

	//it('should call event listener with current widget as \'this\' for bubbled events', function () {
	//    widget = new NestedWidget();

	//    var expectedListenerContext = widget,
	//        actualListenerContext;
	//    widget.on('expected-event', function () {
	//        actualListenerContext = this;
	//    });
	//    widget._innerWidget.emit('expected-event', { bubbles: true });

	//    expect(actualListenerContext).to.equal(expectedListenerContext);
	//});

	//it('should no longer call a listener after it has been removed', function () {
	//    widget = new Widget();

	//    var listenerCalled = false;
	//    var handle = widget.on('expected-event', function () {
	//        listenerCalled = true;
	//    });
	//    widget.emit('expected-event');
	//    expect(listenerCalled).to.be.true;

	//    handle.remove();
	//    listenerCalled = false;
	//    widget.emit('expected-event');
	//    expect(listenerCalled).to.be.false;
	//});

	//it('should stop bubbling an event when event.stopPropagation() is called', function () {
	//    widget = new NestedWidget();

	//    var eventBubbled = false;
	//    widget.on('expected-event', function () {
	//        eventBubbled = true;
	//    });
	//    widget._innerWidget.on('expected-event', function (event) {
	//        event.stopPropagation();
	//    });
	//    widget._innerWidget.emit('expected-event', { bubbles: true });

	//    expect(eventBubbled).to.be.false;
	//});

	//it('should call its _<eventtype>InitListener function when when adding the first listener for a given event type', function () {
	//    widget = new Widget();

	//    var calledInitListener = false;
	//    aspect.after(widget, '_clickInitListener', function () {
	//        calledInitListener = true;
	//    });
	//    widget.on('click', function () {});
	//    expect(calledInitListener).to.be.true;
	//});

	//it('should not call its _<eventtype>InitListener function when when adding an additional listener for a given event type', function () {
	//    widget = new Widget();

	//    var calledInitListener = false;
	//    aspect.after(widget, '_clickInitListener', function () {
	//        calledInitListener = true;
	//    });
	//    widget.on('click', function () {});
	//    calledInitListener = false;
	//    widget.on('click', function () {});
	//    expect(calledInitListener).to.be.false;
	//});

	//it('should call the shared listener\'s remove() when all listeners have been removed', function () {
	//    widget = new Widget();

	//    var calledSharedListenerRemove = false;
	//    aspect.around(widget, '_clickInitListener', function () {
	//        return function () {
	//            return { remove: function () { calledSharedListenerRemove = true; } };
	//        };
	//    });

	//    var listenerHandle1 = widget.on('click', function () {}),
	//        listenerHandle2 = widget.on('click', function () {});

	//    expect(calledSharedListenerRemove).to.be.false;
	//    listenerHandle1.remove();
	//    expect(calledSharedListenerRemove).to.be.false;
	//    listenerHandle2.remove();
	//    expect(calledSharedListenerRemove).to.be.true;
	//});

	//it('should return false from emit() if an event is canceled', function () {
	//    widget = new Widget();

	//    widget.on('expected-event', function (event) {
	//        event.preventDefault();
	//    });
	//    var emitReturnValue = widget.emit('expected-event', { cancelable: true });

	//    expect(emitReturnValue).to.be.false;
	//});

	//it('should return true from emit() if a cancelable event is not canceled', function () {
	//    widget = new Widget();

	//    widget.on('expected-event', function () {});
	//    var emitReturnValue = widget.emit('expected-event', { cancelable: true });

	//    expect(emitReturnValue).to.be.true;
	//});

	//it('should call originating event\'s preventDefault() when widget event\'s preventDefault() is called', function () {
	//    widget = new Widget();

	//    var preventDefaultCalled = false;
	//    widget.on('expected-event', function (event) {
	//        event.preventDefault();
	//    });
	//    widget.emit('expected-event', {
	//        cancelable: true,
	//        preventDefault: function () {
	//            preventDefaultCalled = true;
	//        }
	//    });

	//    expect(preventDefaultCalled).to.be.true;
	//});
});
