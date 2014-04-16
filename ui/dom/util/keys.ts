export import map = require('dojo/keys');
import on = require('dojo/on');

export function press(key:any):Function {
	return function(node:Node, listener:Function):IHandle {
		return on(node, 'keypress', function(event:Event):any {
			var pressed = event['charOrCode'];
			if (pressed === key || pressed === map[key]) {
				listener.call(node, arguments);
			}
		});
	};
}
