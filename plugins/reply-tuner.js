(function(jQuery) {
"use strict";

var plugin = Echo.Plugin.manifest("RepliesTuner", "Echo.StreamServer.Controls.CardComposer");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.component.renderers.media = function(element) {
	var item = this.component;
	var self = this;
	item.view.get("clipButton").one("click", function(e) {
		self.events.publish({"topic": "onChangeView"});
	});
	item.parentRenderer("media", arguments);
	return element;
};

Echo.Plugin.create(plugin);

})(Echo.jQuery);
