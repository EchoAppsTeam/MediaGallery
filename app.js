(function($) {
"use strict";

if (Echo.App.isDefined("Echo.Apps.MediaGallery")) return;

var gallery = Echo.App.manifest("Echo.Apps.MediaGallery");

gallery.config = {
	"targetURL": undefined,
	"nativeSubmissions": true,
	"presentation": {
		"maxCardWidth": 250,
		"layoutMode": "masonry",
		"streamlineMode": false
	},
	"dependencies": {
		"Janrain": {"appId": undefined},
		"StreamServer": {"appkey": undefined}
	},
	"advanced": {}
};

gallery.dependencies = [{
	"url": "//echoplatform.com/sandbox/staging/apps/echo/conversations/v1.4/app.js",
	"app": "Echo.Apps.Conversations"
}, {
	"loaded": function() { return !!Echo.GUI; },
	"url": "{config:cdnBaseURL.sdk}/gui.pack.js"
}, {
	"url": "{config:cdnBaseURL.sdk}/gui.pack.css"
}];

gallery.templates.main =
	'<div class="{class:container}">' +
		'<div class="{class:submitPanel}">' +
			'<div class="{class:submitHead}">' +
				'<div class="{class:submitHeadBrand}">{label:submitHeadBrand}</div>' +
				'<div class="{class:submitHeadText}">{label:submitHeadText}</div>' +
			'</div>' +
			'<button class="{class:submitButton} btn btn-primary btn-small"></button>' +
		'</div>' +
		'<div class="{class:content}"></div>' +
	'</div>';

gallery.labels = {
	"submitHeadBrand": "Participate in our amazing video wall",
	"submitHeadText": "Tweet, Instagram, or Facebook with #awesome tag or submit your photos right on the page!",
	"submitButtonText": "Submit your media"
};

gallery.init = function() {
	this._removeUserInvalidationFrom(this);
	this.render();
	this.ready();
};

gallery.renderers.submitPanel = function(element) {
	return element;
};

gallery.renderers.submitButton = function(element) {
	var self = this;
	new Echo.GUI.Button({
		"target": element,
		"icon": false,
		"disabled": false,
		"label": this.labels.get("submitButtonText")
	});
	this.set("modalComposer", new Echo.GUI.Modal({
		"show": false,
		"data": {
			"title": this.labels.get("submitButtonText")
		}
	}));
	element.click(function() {
		self.get("modalComposer").show();
	});
	return element;
};

gallery.renderers.content = function(element) {
	var composerTarget = this.get("modalComposer").element.children(".modal-body");
	this.initComponent({
		"id": "Conversations",
		"component": "Echo.Apps.Conversations",
		"config": $.extend(true, {}, this.config.get("advanced"), {
			"target": element,
			"targetURL": this.config.get("targetURL"),
			"postComposer": {
				"visible": this.config.get("nativeSubmissions")
			},
			"replyComposer": {
				"visible": !this.config.get("presentation.streamlineMode"),
				"contentTypes": {
					"comments": {
						"enabled": false
					},
					"links": {
						"enabled": false
					}
				}
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
						"maxCardWidth": this.config.get("presentation.maxCardWidth"),
						"streamlineMode": this.config.get("presentation.streamlineMode")
					}
				}, {
					"name": "MediaCardCollection",
					"presentation": {
						"maxCardWidth": this.config.get("presentation.maxCardWidth"),
						"layoutMode": this.config.get("presentation.layoutMode")
					}
				}]
			},
			"auth": {
				"allowAnonymousSubmission": true
			},
			"plugins": [{
				"name": "ModalComposer",
				"target": composerTarget
			}],
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

gallery.css =
	'.{class:submitPanel} { width: 100%; background-color: #f0f0f0; min-height: 90px; border: 1px solid #d5d5d5; }' +
	'.{class:submitHead} { width: 35%; float: left; margin: 10px; color: #515151; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }' +
	'.{class:submitPanel} > .{class:submitButton} { float:right; margin: 55px 10px 0px 0px; }' +
	'.{class:submitHeadBrand} { font-size: 21px; line-height: 35px; }' +
	'.{class:submitHeadText} { font-size: 14px; line-height: 20px; }';

Echo.App.create(gallery);

})(Echo.jQuery);
