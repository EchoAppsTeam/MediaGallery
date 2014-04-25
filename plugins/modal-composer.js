(function(jQuery) {
"use strict";

var plugin = Echo.Plugin.manifest("ModalComposer", "Echo.Apps.Conversations");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.templates.submitPanel =
	'<div class="{plugin.class:submitPanel}">' +
		'<div class="{plugin.class:submitHead}">' +
			'<div class="{plugin.class:submitHeadBrand}">{plugin.label:title}</div>' +
			'<div class="{plugin.class:submitHeadText}">{plugin.label:description}</div>' +
		'</div>' +
		'<button class="{plugin.class:submitButton} btn btn-primary"></button>' +
		'<div class="echo-clear"></div>' +
		'<div class="{class:postComposer}"></div>' +
	'</div>';

plugin.init = function() {
	this.labels.set({
		"title": this.config.get("nativeSubmissions.title"),
		"description": this.config.get("nativeSubmissions.description"),
		"buttonText": this.config.get("nativeSubmissions.buttonText")
	});
	if (this.config.get("nativeSubmissions.visible")) {
		this.extendTemplate("replace", "postComposer", plugin.templates.submitPanel);
	}
};

plugin.component.renderers.postComposer = function(element) {
	this.component.parentRenderer("postComposer", arguments);
	new Echo.GUI.Modal({
		"show": !!this.get("composerRendered"),
		"data": {
			"title": this.labels.get("buttonText"),
			"body": element
		}
	});
	// this variable is a flag to prevent modal window
	// opening on initial plugin loading (we are to do it on click)
	this.set("composerRendered", true);
};

// TODO: think about composer and modal window reuseability
plugin.renderers.submitButton = function(element) {
	var self = this;
	new Echo.GUI.Button({
		"target": element,
		"icon": false,
		"disabled": false,
		"label": this.labels.get("buttonText")
	});
	element.click(function() {
		self.component.render({"name": "postComposer"});
	});
	return element;
};

plugin.css =
	'.{class:postComposer} > a.dropdown-toggle {font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;}' +
	'.{plugin.class:submitPanel} { background-color: #f0f0f0; border: 1px solid #d5d5d5; margin-bottom: 15px; }' +
	'.{plugin.class:submitHead} { max-width: 350px; float: left; margin: 20px 0 20px 20px; color: #515151; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }' +
	'.echo-sdk-ui .{plugin.class:submitPanel} > .{plugin.class:submitButton} { float:right; margin: 65px 20px 10px 0px; }' +
	'.{plugin.class:submitHeadBrand} { font-size: 21px; line-height: 35px; }' +
	'.{plugin.class:submitHeadText} { font-size: 14px; line-height: 20px; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
