import MessageFormat = require('messageformat');

var generator:MessageFormat = new MessageFormat('en');

export var required = generator.compile('{field} is required');
