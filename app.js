(function($) {
"use strict";

if (Echo.App.isDefined("Echo.Apps.MediaGallery")) return;

var gallery = Echo.App.manifest("Echo.Apps.MediaGallery");

gallery.config = {
	"refreshOnUserInvalidate": false,
	"targetURL": undefined,
	"nativeSubmissions": {
		"visible": true,
		"title": "Participate in our amazing video wall",
		"description": "Tweet, Instagram, or Facebook with #awesome tag or submit your photos right on the page!",
		"buttonText": "Submit your media"
	},
	"presentation": {
		"maxCardWidth": 250,
		"isotopeLayoutMode": "masonry",
		"mediaLayoutMode": "full"
	},
	"dependencies": {
		"FilePicker": {"apiKey": undefined},
		"embedly": {"apiKey": undefined},
		"Janrain": {"appId": undefined},
		"StreamServer": {"appkey": undefined}
	},
	"advanced": {
		"replyComposer": {
			"visible": true,
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
	'<div class="{class:container}">' +
		'<div class="{class:content}"></div>' +
	'</div>';

gallery.renderers.content = function(element) {
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
					"photos": {
						"renderer": "PhotoCard",
						"enabled": true,
						"sources": "COMPUTER, IMAGE_SEARCH, INSTAGRAM, PICASA, FLICKR, FACEBOOK, DROPBOX, URL, WEBCAM"
					},
					"comments": {
						"renderer": "CommentCard",
						"enabled": true,
						"resolveURLs": true,
						"attachments": {
							"visible": false,
							"sources": "COMPUTER, IMAGE_SEARCH, INSTAGRAM, PICASA, FLICKR, FACEBOOK, DROPBOX, URL, WEBCAM"
						}
					},
					"links": {
						"renderer": "LinkCard",
						"enabled": true,
						"blockedDomains": []
					}
				}
			},
			"replyComposer": {
				"visible": (this.config.get("presentation.mediaLayoutMode") !== "pure" && this.config.get("advanced.replyComposer.visible"))
			},
			"topPosts": { "visible": false },
			"allPosts": {
				"asyncItemsRendering": false,
				"displayCounter": false,
				"initialIntentsDisplayMode": "compact",
				"replyNestingLevels": 1,
				"plugins": [{
					"name": "MediaCard",
					"presentation": {
						"maxCardWidth": this.config.get("presentation.maxCardWidth"),
						"mediaLayoutMode": this.config.get("presentation.mediaLayoutMode")
					}
				}, {
					"name": "MediaCardCollection",
					"presentation": {
						"maxCardWidth": this.config.get("presentation.maxCardWidth"),
						"isotopeLayoutMode": this.config.get("presentation.isotopeLayoutMode")
					}
				}, {
					// FIXME: this plugin contains changes, that should be delivered into conversations asap
					// there is added onMediaLoad event (into photoThumbnail.load(...) function)
					"name": "PhotoCard"
				}]
			},
			"auth": {
				"allowAnonymousSubmission": true
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

Echo.App.create(gallery);

})(Echo.jQuery);
