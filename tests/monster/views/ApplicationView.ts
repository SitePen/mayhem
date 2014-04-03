import Master = require('framework/ui/Master');
import FramedPlaceholder = require('framework/ui/FramedPlaceholder');
import Text = require('framework/ui/Text');

class ApplicationView extends Master {
	_render():void {
		super._render();
		this.addPlaceholder('default');
	}
}

export = ApplicationView;
