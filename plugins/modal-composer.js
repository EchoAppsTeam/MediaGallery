(function($) {
"use strict";

var plugin = Echo.Plugin.manifest("ModalComposer", "Echo.Apps.Conversations");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.templates.submitPanel =
	'<div class="{plugin.class:submitPanel}">' +
		'<div class="{plugin.class:submitHead}">' +
			'<div class="{plugin.class:submitHeadBrand}">{plugin.config:nativeSubmissions.title}</div>' +
			'<div class="{plugin.class:submitHeadText}">{plugin.config:nativeSubmissions.description}</div>' +
		'</div>' +
		'<button class="btn btn-primary btn-large {plugin.class:submitButton}"></button>' +
		'<div class="echo-clear"></div>' +
		'<div class="{class:postComposer}"></div>' +
	'</div>';

plugin.init = function() {
	if (this.config.get("nativeSubmissions.visible")) {
		this.extendTemplate("replace", "postComposer", plugin.templates.submitPanel);
	}
};

plugin.events = {
	"Echo.StreamServer.Controls.CardComposer.onPostComplete": function() {
		this._destroyModal();
	}
};

plugin.component.renderers.postComposer = function(element) {
	this.component.parentRenderer("postComposer", arguments);
	var modal = new Echo.GUI.Modal({
		"show": !!this.get("composerRendered"),
		"extraClass": this.cssClass,
		"footer": false,
		"data": {
			"title": this.config.get("nativeSubmissions.buttonText"),
			"body": element
		},
		"onHide": $.proxy(this._destroyModal, this)
	});
	this.set("modal", modal);

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
		// trying to reuse previously created popup first,
		// if it doesn't exist - build a new one!
		if (self.get("modal")) {
			self.get("modal").show();
		} else {
			self.component.view.render({"name": "postComposer"});
		}
	});
	return element;
};

plugin.methods.destroy = function() {
	this._destroyModal();
};

plugin.methods._destroyModal = function() {
	if (!this.get("modal")) return; // modal doesn't exist
	this.get("modal").hide();
	this.remove("modal");
};

plugin.css =
	'.echo-sdk-ui .{plugin.class} .modal-body .echo-streamserver-controls-cardcomposer-container { padding: 0px; border: 0px; }' +
	'.echo-sdk-ui .{plugin.class} .modal-body .echo-apps-conversations-postComposer { margin-bottom: 0px; }' +
	'.echo-sdk-ui .{plugin.class} .modal-body .echo-streamserver-controls-cardcomposer-auth, .echo-sdk-ui .{plugin.class} .modal-header h3 { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }' +
	'.{plugin.class} a.dropdown-toggle { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }' +
	'.{plugin.class:submitPanel} { background-color: #f0f0f0; border: 1px solid #d5d5d5; margin: 5px 5px 15px 5px; }' +
	'.{plugin.class:submitHead} { margin: 30px 40px 15px 40px; color: #515151; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }' +
	'.echo-sdk-ui .{plugin.class:submitPanel} > .{plugin.class:submitButton} { margin: 0px 40px 30px 40px; }' +
	'.{plugin.class:submitHeadBrand} { font-size: 30px; letter-spacing: -1px; margin-bottom: 5px; }' +
	'.{plugin.class:submitHeadText} { font-size: 18px; line-height: 30px; font-weight: 200; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
