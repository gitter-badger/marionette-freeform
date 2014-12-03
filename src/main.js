/* global hljs  */
define(function(require) {
	'use strict';

	var
	BasicExample			= require('examples/basic'),
	BasicCode				= require('text!examples/basic.js'),
	BasicTemplate			= require('text!template/basic.html'),
	RelatedExample			= require('examples/related_model'),
	RelatedCode				= require('text!examples/related_model.js'),
	RelatedTemplate			= require('text!template/form.html'),
	log						= require('lib/log'); /* jshint ignore: line */
	require('lib/setPrefixedClassname');

	var jshint = new RegExp('\\s+\/\\* jshint.*\\*\/', 'gim');
	var begin = new RegExp('[^•]+\/\\* begin example \\*\/', 'gim');
	var end = new RegExp('\\s+\/\\* end example \\*\/[^•]+', 'gim');

	var examples = {
		'basic': {
			label: 'Basic form',
			description: 'A basic form with a few elements. Each element provides its own validator. The first error returned by the validator is shown. Try entering "Bob" or "David" as your first name to see an example.',
			view: BasicExample,
			code: BasicCode,
			template: BasicTemplate
		},
		'related_model': {
			label: 'Form with a related model',
			description: 'Here, all validation is defined in a separate <code>User</code> model, which is used as the <code>related_model</code> for the form. Each element uses a <code>related_key</code> to associate it with a specific attribute of the user. The element gets its initial value from that user attribute and displays any errors associated with that attribute. Try entering a long first name, or try entering a username that breaks one of the rules shown in the example code below.',
			view: RelatedExample,
			code: RelatedCode,
			template: RelatedTemplate
		},
	};

	var chooser_region = new Marionette.Region({
		el: '.chooser-region'
	});
	var example_region = new Marionette.Region({
		el: '.example-region'
	});

	var view_model = new Backbone.Model({
		example: 'basic',
		theme: 'inline'
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

	var ChooserView = Marionette.LayoutView.extend({
		tagName: 'form',
		className: 'chooser',

		template: 'script.chooser',
		initialize: function() {
			this.listenTo(view_model, 'change:example', this.showCurrentExample);
		},

		ui: {
			examples: 'select.examples',
			themes: 'select.themes'
		},
		onRender: function() {
			this.addExampleOptions();
			this.showCurrentExample();
		},
		addExampleOptions: function() {
			_.each(_.keys(examples), function(key) {
				var option = $('<option />');
				option.val(key);
				option.text(examples[key].label);
				this.ui.examples.append(option);
			}, this);
			var example_name = view_model.get('example');
			this.ui.examples.val(example_name);
		},
		showCurrentExample: function() {
			var example_name = view_model.get('example');
			var example = examples[example_name];
			if (example) {
				this.viewer = new ExampleViewer({
					example: example
				});
				example_region.show(this.viewer);
			} else {
				example_region.empty();
				delete this.viewer;
			}
		},

		events: {
			'change @ui.examples': 'onChooseExample',
			'change @ui.themes': 'onChooseTheme'
		},
		onChooseExample: function() {
			var example = this.ui.examples.val();
			view_model.set('example', example);
		},
		onChooseTheme: function() {
			var theme = this.ui.themes.val();
			view_model.set('theme', theme);
		}
	});

	var chooser_view = new ChooserView();
	chooser_region.show(chooser_view);

});
