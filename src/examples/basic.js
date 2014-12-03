define(function(require) {
	'use strict';

	var Form = require('model/form'),
		FormView = require('view/form_view'),
		Template = require('text!template/basic.html'),
		log = require('lib/log'); /* jshint ignore: line */
	require('model/validation');

	/* begin example */
	// define an array of form elements
	// each element should have a type and an el
	// label is optional
	// each element can provide its own validator function
	var elements = [
		{
			el: '.name',
			type: 'text',
			label: 'First Name',
			value: 'A first name',
			validator: function(value) {
				if (value.toLowerCase() === 'bob') {
					return 'Your first name can’t be Bob.';
				}
				if (value.toLowerCase() === 'david') {
					return 'Your first name can’t be David.';
				}
			}
		},
		{
			el: '.description',
			type: 'textarea',
			label: 'Description',
			value: 'A sample description',
			rows: 4,
			validator: function(value) {
				if (! value) return 'A description is required.'
			}
		},
		{
			el: '.terms',
			type: 'checkbox',
			label: 'I accept the terms of service.'
		},
	];

	// define a form model
	// pass in our array of elements
	var form = new Form({
		elements: elements
	});

	// create a form view to display the form
	var form_view = new FormView({
		template: _.template(Template),
		model: form
	});
	/* end example */

	return form_view;

});
