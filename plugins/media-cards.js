(function(jQuery) {
"use strict";

//var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCard", "Echo.StreamServer.Controls.Stream.Item");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	plugin.css = '.{plugin.class} {max-width:' + this.config.get("presentation.maxCardWidth") + 'px; }';
};

plugin.component.renderers.content = function(element) {
	var plugin = this;
	var item = this.component;
	return item.parentRenderer('content', arguments).css({
		"width": parseInt(plugin.config.get("presentation.maxCardWidth"), 10)
	});
};

plugin.events = {
	"Echo.Conversations.NestedCard.onMediaLoad" : function(topic, args) {
		this.events.publish({
			"topic": "onChangeView"
		});
	}
};

Echo.Plugin.create(plugin);

})(Echo.jQuery);
