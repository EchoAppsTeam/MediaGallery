(function($) {
"use strict";

if (Echo.App.isDefined("Echo.Apps.MediaGallery")) return;

var gallery = Echo.App.manifest("Echo.Apps.MediaGallery");

gallery.config = {
	"targetURL": undefined,
	"presentation": {
		"maxCardWidth": 250,
		"layoutMode": "masonry" //"fitRows"
	},
	"dependencies": {
		"Janrain": {"appId": undefined},
		"StreamServer": {"appkey": undefined}
	},
	"advanced": {}
};

gallery.dependencies = [{
	"url": "//cdn.echoenabled.com/apps/echo/conversations/v1.3/app.js",
	"app": "Echo.Apps.Conversations"
}, {
	"url": "{config:cdnBaseURL.sdk}/streamserver.pack.js",
	"app": "Echo.StreamServer.Controls.Stream"
}];

gallery.templates.main =
	'<div class="{class:container}">' +
		'<div class="{class:content}"></div>' +
	'</div>';

gallery.init = function() {
	this._removeUserInvalidationFrom(this);
	this.render();
	this.ready();
};

gallery.renderers.content = function(element) {
	this.initComponent({
		"id": "Conversations",
		"component": "Echo.Apps.Conversations",
		"config": $.extend(true, {}, this.config.get("advanced"), {
			"target": element,
			"targetURL": this.config.get("targetURL"),
			"postComposer": {
				"visible": false
			},
			"topPosts": {
				"visible": false
			},
			"allPosts": {
				"asyncItemsRendering": true,
				"displayCounter": false,
				"initialIntentsDisplayMode": "compact",
				"replyNestingLevels": 1,
				"plugins": [{
					"name": "MediaCard",
					"presentation": {
						"maxCardWidth": this.config.get("presentation.maxCardWidth")
					}
				}, {
					"name": "PinboardVisualization",
					"presentation": {
						"maxCardWidth": this.config.get("presentation.maxCardWidth"),
						"layoutMode": this.config.get("presentation.layoutMode")
					}
				}]
			},
			"dependencies": this.config.get("dependencies")
		})
	});
	return element;
};

// removing "Echo.UserSession.onInvalidate" subscription from an app
// to avoid double-handling of the same evernt (by Canvas and by the widget itself)
gallery.methods._removeUserInvalidationFrom = function() {
	var topic = "Echo.UserSession.onInvalidate";
	$.map(Array.prototype.slice.call(arguments), function(inst) {
		$.each(inst.subscriptionIDs, function(id) {
			var obj = $.grep(Echo.Events._subscriptions[topic].global.handlers, function(o) {
				return o.id === id;
			})[0];
			if (obj && obj.id) {
				Echo.Events.unsubscribe({"handlerId": obj.id});
				return false;
			}
		});
	});
};

Echo.App.create(gallery);

})(Echo.jQuery);
