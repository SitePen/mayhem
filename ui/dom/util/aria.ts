import has = require('../../../has');

// Get aria attribute associated with property name for given role
export function getStateName(role:string, property:string):string {
	if (property === 'selected') {
		switch (role) {
			case 'button':
				return 'aria-pressed';
			case 'checkbox':
			case 'menuitemcheckbox':
			case 'radio':
			case 'menuitemradio':
				return 'aria-checked';
		}
	}
}

// Set aria state attribute value appropriately depending on its type
export function setState(element:HTMLElement, stateName:string, value:any):void {
	if (stateSetters[stateName]) {
		stateSetters[stateName](element, stateName, value);
	}
	else if (has('debug')) {
		console.warn('Unable to set aria attribute associated with ' + stateName + ' on element:', element);
	}
}

var stateSetters = {
	'aria-checked': tristateSetter,
	'aria-pressed': tristateSetter
};

function tristateSetter(element:HTMLElement, stateName:string, value:boolean):void {
	if (value === undefined) {
		// Remove attribute if undefined
		element.removeAttribute(stateName);
	}
	else {
		// Indeterminate "mixed" state indicated by null
		element.setAttribute(stateName, value === null ? 'mixed' : '' + !!value);
	}
}
