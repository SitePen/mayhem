/// <amd-dependency path="framework/templating/html!../views/Index.html" />
import Controller = require('framework/controller/Controller');
var IndexView:any = require('framework/templating/html!../views/Index.html');

class Index extends Controller {
	constructor(kwArgs:any = {}) {
		super(kwArgs);

		this.set({
			view: new IndexView()
		});
	}
}

export = Index;
