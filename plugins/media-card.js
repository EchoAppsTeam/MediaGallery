(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCard", "Echo.StreamServer.Controls.Card");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	var cssClass = '.' + this.cssClass;
	Echo.Utils.addCSS(cssClass + ' { width:' + this.config.get("presentation.maxCardWidth") + 'px; }', cssClass);
};

plugin.component.renderers.content = function(element) {
	var item = this.component;
	var itemType = item.visualizer ? item.visualizer.id : "comment";
	var layoutMode = this.config.get("presentation.mediaLayoutMode");

	if (layoutMode === "compact") {
		var label = itemType === "photo"
			? item.view.get("plugin-PhotoCard-photoLabelContainer")
			: itemType === "video"
				? item.view.get("plugin-VideoCard-label")
				: undefined;

		label && label.hide();
	} else if (layoutMode === "pure") {
		var media = itemType === "photo"
			? item.view.get("plugin-PhotoCard-photoThumbnail")
			: itemType === "video"
				? item.view.get("plugin-VideoCard-video")
				: undefined;

		return media
			? element.empty().append(media)
			: item.parentRenderer("content", arguments);
	}
	item.parentRenderer("content", arguments);
	return element;
};

(function() {

	var eventsToRefresh = [
		"Echo.StreamServer.Controls.Card.onRender",
		"Echo.StreamServer.Controls.Card.Plugins.PhotoCard.onMediaLoad",
		"Echo.StreamServer.Controls.CardComposer.onCollapse",
		"Echo.StreamServer.Controls.CardComposer.onExpand",
		"Echo.StreamServer.Controls.CardComposer.onRender",
		"Echo.StreamServer.Controls.CardComposer.onPostComplete",
		"Echo.StreamServer.Controls.CardComposer.onPostError",
		"Echo.StreamServer.Controls.Card.onDelete",
		"Echo.StreamServer.Controls.Card.onAdd",
		"Echo.StreamServer.Controls.Card.onChildrenExpand"
	];

	var timeout;

	var publishingCallback = function(topic, args) {
		var self = this;
		if (timeout) {
			clearTimeout(timeout);
		}

		// this timeout is used to reduce isotope renderings
		// number by suppressing generating rival events
		timeout = setTimeout(function() {
			self.events.publish({
				"topic": "onChangeView"
			});
		}, 50);
	};

	$.map(eventsToRefresh, function(eventName) {
		plugin.events[eventName] = publishingCallback;
	});
})();

Echo.Plugin.create(plugin);

})(Echo.jQuery);
