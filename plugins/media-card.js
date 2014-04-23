(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCard", "Echo.StreamServer.Controls.Card");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	Echo.Utils.addCSS('.' + this.cssClass + ' {max-width:' + this.config.get("presentation.maxCardWidth") + 'px; }');
};

plugin.component.renderers.content = function(element) {
	var item = this.component;
	if (this.config.get("presentation.streamlineMode")) {
		item.view.get("wrapper").addClass("flip-container");
		var subwrapper = item.view.get("subwrapper").addClass("flipper");
		var front = $("<div class='front'>").append(subwrapper.children(".echo-streamserver-controls-card-plugin-PhotoCard-item"));
		var back = $("<div class='back'>").append(subwrapper.children(":not(.echo-streamserver-controls-card-plugin-PhotoCard-item)"));
		subwrapper.empty().append(front).append(back);
	}

	if (this.config.get("presentation.hideMediaItemsLabel")) {
		var photoLabel = item.view.get("plugin-PhotoCard-photoLabelContainer");
		var videoLabel = item.view.get("plugin-VideoCard-label");
		photoLabel && photoLabel.hide();
		videoLabel && videoLabel.hide();
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

plugin.css =
	'.flip-container { -webkit-perspective: 1000; -moz-perspective: 1000; -o-perspective: 1000; perspective: 1000;}' +
	'.flip-container:hover .flipper, .flip-container.hover .flipper {-webkit-transform: rotateY(180deg); -moz-transform: rotateY(180deg); -o-transform: rotateY(180deg); transform: rotateY(180deg);}' +
	'.flip-container, .front, .back { width: 219px; height: 219px;}' +
	'.flip-container {width: 240px; float: left; margin-left: -10px; height: 230px; }' +
	'.front, .back { top: 0; bottom: 0; left: 0; right: 0 }' +
	'.flipper { -webkit-transition: 0.6s; -webkit-transform-style: preserve-3d; -moz-transition: 0.6s; -moz-transform-style: preserve-3d; -o-transition: 0.6s; -o-transform-style: preserve-3d; transition: 0.6s; transform-style: preserve-3d; position: relative; }' +
	'.front, .back { -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; -o-backface-visibility: hidden; backface-visibility: hidden; position: absolute; top: 0; left: 0;}' +
	'.front { z-index: 1000; }' +
	'.back { -webkit-transform: rotateY(180deg); -moz-transform: rotateY(180deg); -o-transform: rotateY(180deg); transform: rotateY(180deg); }';


Echo.Plugin.create(plugin);

})(Echo.jQuery);
