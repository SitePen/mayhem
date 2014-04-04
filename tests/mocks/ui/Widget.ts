import Widget = require('../../../ui/Widget');
import MockRenderer = require('./Renderer');
class MockWidget extends Widget {}
MockWidget.prototype._renderer = new MockRenderer();
export = MockWidget;
