/* global hljs  */
define(function(require) {
	'use strict';

	var
	BasicExample			= require('examples/basic'),
	BasicCode				= require('text!examples/basic.js'),
	RelatedExample			= require('examples/related_model'),
	RelatedCode				= require('text!examples/related_model.js'),
	ExampleTemplate			= require('text!template/form.html'),
	log						= require('lib/log'); /* jshint ignore: line */
	require('lib/setPrefixedClassname');

	var jshint = new RegExp('\\s+\/\\* jshint.*\\*\/', 'gim');
	var begin = new RegExp('[^•]+\/\\* begin example \\*\/', 'gim');
	var end = new RegExp('\\s+\/\\* end example \\*\/[^•]+', 'gim');

	var example_region = new Marionette.Region({
		el: '.example-region'
	});

	var view_model = new Backbone.Model({
		example: 'basic',
		theme: 'inline'
	});

	var examples = {
		'basic': {
			label: 'Basic form',
			description: 'A basic form with three elements. Each element provides its own validator. The first error returned by the validator is shown. Try entering "Bob" or "David" as your first name to see an example.',
			view: BasicExample,
			code: BasicCode,
			template: ExampleTemplate
		},
		'related_model': {
			label: 'Form with a related model',
			description: 'Here, all validation is defined in a separate <code>User</code> model, which is used as the <code>related_model</code> for the form. Each element uses a <code>related_key</code> to associate it with a specific attribute of the user. The element gets its initial value from that user attribute and displays any errors associated with that attribute. Try entering a long first name, or try entering a username that breaks one of the rules shown in the example code below.',
			view: RelatedExample,
			code: RelatedCode,
			template: ExampleTemplate
		},
	};

	// TODO create a view controller for all this outer stuff

	var showExample = function(example_name) {
		var example = examples[example_name];
		if (example) {
			var viewer = new ExampleViewer({
				example: example
			});
			example_region.show(viewer);
		} else {
			example_region.empty();
		}
	};

	var example_chooser = $('.chooser select.examples');

	_.each(_.keys(examples), function(key) {
		var option = $('<option />');
		option.val(key);
		option.text(examples[key].label);
		example_chooser.append(option);
	});
	example_chooser.on('change', function() {
		view_model.set('example', this.value);
	});
	view_model.on('change:example', function(model, example) {
		showExample(example);
	});


	var theme_chooser = $('.chooser select.themes');
	theme_chooser.on('change', function() {
		view_model.set('theme', this.value);
	});

	var ExampleViewer = Marionette.LayoutView.extend({
		template: 'script.example',
		ui: {
			form: 'form',
			title: '.title',
			description: 'article',
			code: 'pre.code code',
			template: 'pre.template code'
		},
		viewModelEvents: {
			'change:theme': 'setTheme'
		},
		initialize: function() {
			_.bindAll(this, 'focusFirstInput');
			this.bindEntityEvents(view_model, this.viewModelEvents)
		},
		onRender: function() {
			this.setTheme();
			this.showDescription();
			this.showFormView();
			this.showExampleCode();
			this.showExampleTemplate();
			this.highlightCode();
		},
		onShow: function() {
			_.defer(this.focusFirstInput);
		},
		setTheme: function() {
			var theme = view_model.get('theme');
			this.ui.form.setPrefixedClassname('freeform', theme);
		},
		showDescription: function() {
			this.ui.title.text(this.options.example.label);
			this.ui.description.html(this.options.example.description);
		},
		showFormView: function() {
			var view = this.options.example.view;
			view.setElement(this.ui.form);
			view.render();
		},
		showExampleCode: function() {
			var code = this.options.example.code;
			code = code.replace(jshint, '');
			code = code.replace(begin, '');
			code = code.replace(end, '');
			code += '\n\n'
			code += '\t// show the form in some region\n';
			code += '\tmy_region.show(form_view);\n\n';

			this.ui.code.text(code);
		},
		showExampleTemplate: function() {
			var template = this.options.example.template;
			this.ui.template.text(template);
		},
		highlightCode: function() {
			this.$('pre code').each(function(i, block) {
				hljs.highlightBlock(block);
			});
		},
		focusFirstInput: function() {
			this.$('input, select, textarea').first().focus().select();
		}
	});

	showExample(view_model.get('example'));


});
