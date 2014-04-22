(function(jQuery) {
"use strict";

var plugin = Echo.Plugin.manifest("ModalComposer", "Echo.Apps.Conversations");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {};

plugin.component.renderers.postComposer = function(element) {
	arguments[0] = this.config.get("target");
	this.component.parentRenderer("postComposer", arguments);
	return element;
};

Echo.Plugin.create(plugin);

})(Echo.jQuery);
