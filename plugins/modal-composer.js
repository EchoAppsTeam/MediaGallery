(function(jQuery) {
"use strict";

var plugin = Echo.Plugin.manifest("ModalComposer", "Echo.Apps.Conversations");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.templates.submitPanel =
	'<div class="{plugin.class:submitPanel}">' +
		'<div class="{plugin.class:submitHead}">' +
			'<div class="{plugin.class:submitHeadBrand}">{plugin.label:submitHeadBrand}</div>' +
			'<div class="{plugin.class:submitHeadText}">{plugin.label:submitHeadText}</div>' +
		'</div>' +
		'<button class="{plugin.class:submitButton} btn btn-primary btn-small"></button>' +
		'<div class="echo-clear"></div>' +
	'</div>' +
	'<div class="{class:postComposer}"></div>';

plugin.labels = {
	"submitHeadBrand": "Participate in our amazing video wall",
	"submitHeadText": "Tweet, Instagram, or Facebook with #awesome tag or submit your photos right on the page!",
	"submitButtonText": "Submit your media"
};

plugin.init = function() {
	this.extendTemplate("replace", "postComposer", plugin.templates.submitPanel);
};

plugin.component.renderers.postComposer = function(element) {
	this.component.parentRenderer("postComposer", arguments);
	//element.hide();
	return element;
};

plugin.renderers.submitButton = function(element) {
	var component = this.component;
	new Echo.GUI.Button({
		"target": element,
		"icon": false,
		"disabled": false,
		"label": this.labels.get("submitButtonText")
	});
	element.click(function() {
		var composer = component.view.get("postComposer");
		new Echo.GUI.Modal({
			"show": true,
			"data": {
				"body": composer
			}
		});
		composer.show();
	});
	return element;
};

plugin.css =
	'.{plugin.class:submitPanel} { background-color: #f0f0f0; border: 1px solid #d5d5d5; }' +
	'.{plugin.class:submitHead} { max-width: 350px; float: left; margin: 10px; color: #515151; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }' +
	'.echo-sdk-ui .{plugin.class:submitPanel} > .{plugin.class:submitButton} { float:right; margin: 55px 10px 10px 0px; }' +
	'.{plugin.class:submitHeadBrand} { font-size: 21px; line-height: 35px; }' +
	'.{plugin.class:submitHeadText} { font-size: 14px; line-height: 20px; }' +
	'.{class:postComposer} { display: none; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
