(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCard", "Echo.StreamServer.Controls.Card");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	Echo.Utils.addCSS('.' + this.cssClass + ' {max-width:' + this.config.get("presentation.maxCardWidth") + 'px; }');
};

(function() {

	var eventsToRefresh = [
		"Echo.StreamServer.Controls.Card.onRender",
		"Echo.Conversations.NestedCard.onMediaLoad",
		"Echo.StreamServer.Controls.CardComposer.onCollapse",
		"Echo.StreamServer.Controls.CardComposer.onExpand",
		"Echo.StreamServer.Controls.CardComposer.onRender",
		"Echo.StreamServer.Controls.CardComposer.onPostComplete",
		"Echo.StreamServer.Controls.CardComposer.onPostError",
		"Echo.StreamServer.Controls.Card.onDelete",
		"Echo.StreamServer.Controls.Card.onAdd",
		"Echo.StreamServer.Controls.Card.onChildrenExpand"
	];

	var publishingCallback = function(topic, args) {
		this.events.publish({
			"topic": "onChangeView"
		});
	};

	$.map(eventsToRefresh, function(eventName) {
		plugin.events[eventName] = publishingCallback;
	});
})();

Echo.Plugin.create(plugin);

})(Echo.jQuery);
