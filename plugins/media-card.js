(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCard", "Echo.StreamServer.Controls.Card");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	Echo.Utils.addCSS('.' + this.cssClass + ' {max-width:' + this.config.get("presentation.maxCardWidth") + 'px; }');
};

//TODO: rewrite it in correct way asap (before release)
plugin.component.renderers.content = function(element) {
	var item = this.component;
	var itemType = item.visualizer.id;
	var layoutMode = this.config.get("presentation.mediaLayoutMode");

	if (layoutMode === "compact") {
		var photoLabel = item.view.get("plugin-PhotoCard-photoLabelContainer");
		var videoLabel = item.view.get("plugin-VideoCard-label");
		photoLabel && photoLabel.hide();
		videoLabel && videoLabel.hide();
		item.parentRenderer("content", arguments);
	} else if (layoutMode === "pure") {
		if (itemType === "photo") {
			element.empty().append(item.view.get("plugin-PhotoCard-photoThumbnail"));
		} else {
			element.empty().append(item.view.get("plugin-VideoCard-video"));
		}
	} else {
		item.parentRenderer("content", arguments);
	}
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

		//this timeout is used to reduce isotope rendering number
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
