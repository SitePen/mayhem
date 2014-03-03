import _DijitContainer = require('./_DijitContainer');

// TODO: only dijit/_Container widgets should extend _DijitContainer
class _Widget extends _DijitContainer {
}

_Widget.configure(_DijitContainer);

export = _Widget;
