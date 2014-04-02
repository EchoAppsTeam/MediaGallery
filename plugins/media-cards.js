(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCard", "Echo.StreamServer.Controls.Stream.Item");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	plugin.css = '.{plugin.class} {max-width:' + this.config.get("presentation.maxCardWidth") + 'px; }';
};

plugin.component.renderers.content = function(element) {
	var plugin = this;
	var item = this.component;
	item.parentRenderer("content", arguments).css({
		"width": parseInt(plugin.config.get("presentation.maxCardWidth"), 10)
	});
	// TODO: it is done to prevent modeSwitch display css property
	// changing (none->block) on hover. Should be done in moderation plugin.
	item.view.get("frame").children("." + item.cssPrefix + "modeSwitch").remove();
	return element;
};



(function() {

	var eventsToRefresh = [
		"Echo.StreamServer.Controls.Stream.Item.onRerenderer",
		"Echo.Conversations.NestedCard.onMediaLoad",
		"Echo.StreamServer.Controls.Stream.Item.Plugins.ReplyCardUI.onCollapse",
		"Echo.StreamServer.Controls.Stream.Plugins.ReplyCardUI.onFormExpand",
		"Echo.StreamServer.Controls.Submit.onRenderer",
		"Echo.StreamServer.Controls.Submit.Plugins.Edit.onEditError",
		"Echo.StreamServer.Controls.Submit.Plugins.Edit.onEditComplete",
		"Echo.StreamServer.Controls.Submit.onPostComplete",
		"Echo.StreamServer.Controls.Stream.Item.onRerender",
		"Echo.StreamServer.Controls.Stream.Item.onDelete"
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

plugin.css =
	'.{class:date} { font-size: 10px; }' +
	'div.{class} div.{class:frame} div.{class:authorName} { font-size: 14px; }' +
	'div.{class} div.{class:content} div.{class:avatar} { width: 25px; height: 25px; }' +
	'div.{class} div.{class:content} div.{class:avatar} > div { width: 25px; height: 25px; }' +
	'div.{class} div.{class:frame} > div:first-child > div:first-child { vertical-align: top; padding-top: 3px; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
