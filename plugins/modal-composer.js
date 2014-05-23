(function(jQuery) {
"use strict";

var plugin = Echo.Plugin.manifest("ModalComposer", "Echo.Apps.Conversations");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.templates.submitPanel =
	'<div class="{plugin.class:submitPanel}">' +
		'<div class="{plugin.class:submitHead}">' +
			'<div class="{plugin.class:submitHeadTitle}">{plugin.config:nativeSubmissions.title}</div>' +
			'<div class="{plugin.class:submitHeadDescription}">' +
				'{plugin.config:nativeSubmissions.description}' +
				'<button class="btn btn-primary pull-right {plugin.class:submitButton}"></button>' +
				'<div class="echo-clear" />' +
			'</div>' +
		'</div>' +
		'<div class="{class:postComposer}"></div>' +
	'</div>';

plugin.init = function() {
	if (this.config.get("nativeSubmissions.visible")) {
		this.extendTemplate("replace", "postComposer", plugin.templates.submitPanel);
	}
};

plugin.component.renderers.postComposer = function(element) {
	this.component.parentRenderer("postComposer", arguments);
	new Echo.GUI.Modal({
		"show": !!this.get("composerRendered"),
		"extraClass": this.cssClass,
		"data": {
			"title": this.config.get("nativeSubmissions.buttonText"),
			"body": element
		}
	});
	// this variable is a flag to prevent modal window
	// opening on initial plugin loading (we are to do it on click)
	this.set("composerRendered", true);
};

plugin.renderers.submitButton = function(element) {
	var self = this;
	new Echo.GUI.Button({
		"target": element,
		"label": this.config.get("nativeSubmissions.buttonText")
	});
	element.click(function() {
		self.component.render({"name": "postComposer"});
	});
	return element;
};

plugin.css =
	'.{plugin.class} a.dropdown-toggle { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }' +
	'.{plugin.class:submitPanel} { background-color: #f0f0f0; border: 1px solid #d5d5d5; margin-bottom: 15px; }' +
	'.{plugin.class:submitHead} { margin: 25px; color: #515151; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }' +
	'.{plugin.class:submitHeadTitle} { font-size: 26px; line-height: 35px; }' +
	'.{plugin.class:submitHeadDescription} { font-size: 18px; line-height: 30px; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
