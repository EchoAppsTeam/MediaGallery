(function($) {
"use strict";

if (Echo.App.isDefined("Echo.Apps.MediaGallery")) return;

var gallery = Echo.App.manifest("Echo.Apps.MediaGallery");

gallery.config = {
	"refreshOnUserInvalidate": false,
	"targetURL": undefined,
	"mediaContentOnly": false,
	"nativeSubmissions": {
		"visible": true,
		"title": "",
		"description": "",
		"buttonText": "Submit your photos"
	},
	"presentation": {
		"minColumnWidth": 250,
		"isotopeLayoutMode": "masonry",
		"mediaLayoutMode": "full"
	},
	"dependencies": {
		"FilePicker": {"apiKey": undefined},
		"embedly": {"apiKey": undefined},
		"Janrain": {"appId": undefined},
		"StreamServer": {
			"appkey": undefined,
			"apiBaseURL": "{%= apiBaseURLs.StreamServer.apiBaseURL %}/",
			"submissionProxyURL": "{%= apiBaseURLs.StreamServer.submissionProxyURL %}",
			"liveUpdates": {
				"transport": "websockets",
				"websockets": {
					"URL": "{%= apiBaseURLs.StreamServer.websockets %}/"
				}
			}
		}
	},
	"advanced": {
		"topPosts": {
			"visible": false,
			"asyncItemsRendering": true,
			"displayCounter": false,
			"initialIntentsDisplayMode": "compact",
			"slideTimeout": 0,
			"replyNestingLevels": 1,
			"children": {
				"moreButtonSlideTimeout": 0,
				"itemsSlideTimeout": 0
			}
		},
		"allPosts": {
			"asyncItemsRendering": true,
			"displayCounter": false,
			"initialIntentsDisplayMode": "compact",
			"slideTimeout": 0,
			"replyNestingLevels": 1,
			"children": {
				"moreButtonSlideTimeout": 0,
				"itemsSlideTimeout": 0
			}
		},
		"auth": {
			"allowAnonymousSubmission": true
		},
		"replyComposer": {
			"visible": false,
			"contentTypes": {
				"photos": { "enabled": false },
				"links": { "enabled": false }
			}
		}
	}
};

gallery.dependencies = [{
	"url": "//cdn.echoenabled.com/apps/echo/conversations/v2/app.js",
	"app": "Echo.Apps.Conversations"
}, {
	"loaded": function() { return !!Echo.GUI; },
	"url": "{config:cdnBaseURL.sdk}/gui.pack.js"
}, {
	"url": "{config:cdnBaseURL.sdk}/gui.pack.css"
}];

gallery.templates.main =
	'<div class="{class:content}"></div>';

gallery.renderers.content = function(element) {
	var self = this;
	var presentation = this.config.get("presentation");
	var getItemMarkers = function(section) {
		return self.config.get("mediaContentOnly") ? ["photo", "video"] : self.config.get("advanced." + section + ".itemMarkers");
	};
	this.initComponent({
		"id": "Conversations",
		"component": "Echo.Apps.Conversations",
		"config": $.extend(true, {}, this.config.get("advanced"), {
			"target": element,
			"targetURL": this.config.get("targetURL"),
			"postComposer": {
				"visible": this.config.get("nativeSubmissions.visible"),
				// FIXME: contentTypes are added to set photoComposer as default one.
				// we need such ability in Conversations app (as a parameter, imho).
				"contentTypes": {
					"photos": {},
					"comments": {},
					"links": {}
				}
			},
			"replyComposer": {
				"visible": (presentation.mediaLayoutMode !== "pure" &&
						this.config.get("advanced.replyComposer.visible"))
			},
			"allPosts": {
				"itemMarkers": getItemMarkers("allPosts"),
				"plugins": [{
					"name": "MediaCard",
					"presentation": presentation
				}, {
					"name": "MediaCardCollection",
					"presentation": presentation
				}]
			},
			"topPosts": {
				"itemMarkers": getItemMarkers("topPosts"),
				"plugins": [{
					"name": "MediaCard",
					"presentation": presentation
				}, {
					"name": "MediaCardCollection",
					"presentation": presentation
				}]
			},
			"plugins": [{
				"name": "ModalComposer",
				"nativeSubmissions": this.config.get("nativeSubmissions")
			}],
			"dependencies": this.config.get("dependencies")
		})
	});
	return element;
};

gallery.css =
	'.echo-sdk-ui .{class} .echo-streamserver-controls-cardcollection-more { margin-left: 5px; margin-right: 5px; }' +
	'.echo-sdk-ui .{class} .echo-streamserver-controls-cardcollection-messageText, .echo-sdk-ui .{class} .nav.echo-apps-conversations-streamHeader { margin-left: 5px; margin-right: 5px; }';

Echo.App.create(gallery);

})(Echo.jQuery);
