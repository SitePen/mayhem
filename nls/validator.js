define({
	root: {
		genericFieldName: "Field",
		validationError: "Validation failed",
		required: "${name} is required",
		notANumber: "${name} must be a number",
		notAnInteger: "${name} must be an integer",
		numberTooSmall: "${name} must be greater than ${min}",
		numberTooLarge: "${name} must be smaller than ${max}",
		notADate: "${name} is not a valid date",
		dateTooSmall: "${name} must be after ${min}",
		dateTooLarge: "${name} must be before ${min}",
		stringTooShort: "${name} must be more than ${minLength} characters long",
		stringTooLong: "${name} must be less than ${maxLength} characters long",
		stringNotMatchingRegExp: "${name} must match the pattern ${regExp}"
	}
});