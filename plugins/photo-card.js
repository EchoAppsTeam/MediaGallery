(function($) {
"use strict";

var plugin = Echo.Plugin.manifest("PhotoCard", "Echo.StreamServer.Controls.Card");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	var self = this;
	this.component.registerVisualizer({
		"id": "photo",
		"objectTypes": {
			"http://activitystrea.ms/schema/1.0/image": ["rootItems"],
			"http://activitystrea.ms/schema/1.0/article": ["rootItems", function() {
				return self.component.get("data.object.parsedContent.oembed.thumbnail_width") >= self.config.get("minArticleImageWidth");
			}]
		},
		"init": function() {
			self.extendTemplate("replace", "data", plugin.templates.label);
			self.extendTemplate("insertAsFirstChild", "subwrapper", plugin.templates.photo);
		}
	});
};

plugin.config = {
	"minArticleImageWidth": 320
};

plugin.labels = {
	"noMediaAvailable": "No media available",
	"clickToExpand": "Click to expand"
};

plugin.templates.photo =
	'<div class="{plugin.class:item}">' +
		'<div class="{plugin.class:photo}">' +
			'<div class="{plugin.class:photoContainer}">' +
				'<img class="{plugin.class:photoThumbnail}" src="{data:object.parsedContent.oembed.url}" title="{data:object.parsedContent.oembed.title}">' +
			'</div>' +
		'</div>' +
	'</div>';

plugin.templates.label =
	'<div class="{plugin.class:photoLabel}">' +
		'<div class="{plugin.class:photoLabelContainer}">' +
			'<div class="{plugin.class:title}" title="{data:object.parsedContent.oembed.title}">' +
				'<a class="echo-clickable" href="{data:object.parsedContent.oembed.url}" target="_blank">{data:object.parsedContent.oembed.title}</a>' +
			'</div>' +
			'<div class="{plugin.class:description}">{data:object.parsedContent.oembed.description}</div>' +
		'</div>' +
	'</div>';

plugin.events = {
	"Echo.Apps.Conversations.onAppResize": function() {
		this.view.render({"name": "photoContainer"});
	}
};

plugin.renderers.title = function(element) {
	var title = this.component.get("data.object.parsedContent.oembed.title");
	var url = this.component.get("data.object.parsedContent.oembed.url");
	if (title) {
		element.attr("title", title)
			.find("a").text(title).attr("href", url);
	} else {
		element.hide();
	}
	return element;
};

plugin.renderers.description = function(element) {
	var description = this.component.get("data.object.parsedContent.oembed.description");
	if (description) {
		element.text(Echo.Utils.stripTags(description));
	} else {
		element.hide();
	}
	return element;
};

plugin.renderers.photoThumbnail = function(element) {
	var self = this;
	var isArticle = this.component.get("data.object.parsedContent.oembed.type") === "link";
	var thumbnail = isArticle
		? this.component.get("data.object.parsedContent.oembed.thumbnail_url")
		: this.component.get("data.object.parsedContent.oembed.url");
	var img = $("<img />");
	img.attr("class", element.attr("class"));
	if (this.component.config.get("limits.maxMediaWidth")) {
		img.css("max-width", this.component.config.get("limits.maxMediaWidth"));
	}
	if (element.attr("title")) {
		img.attr("title", element.attr("title"));
	}
	img.load(function(e) {
		self.events.publish({
			"topic": "onMediaLoad"
		});
	}).error(function(e) {
		if (isArticle) {
			self.view.get("photo").hide();
		} else {
			img.replaceWith(self.substitute({
				"template": '<div class="{plugin.class:noMediaAvailable}"><span>{plugin.label:noMediaAvailable}</span></div>'
			}));
		}
	}).attr("src", thumbnail);
	return element.replaceWith(img);
};

plugin.renderers.photoContainer = function(element) {

	this.component.view.get("content")
		.addClass(this.cssPrefix + "enabled");
	var expanded = this.cssPrefix + "expanded";
	var self = this;
	var oembed = this.component.get("data.object.parsedContent.oembed", {});
	var thumbnailWidth = this.view.get("photoThumbnail").width();
	var expandedHeight = oembed.height;
	var collapsedHeight = (thumbnailWidth || oembed.width) * 9 / 16;
	var imageWidth = oembed.width;
	var imageHeight = oembed.height;
	if (!imageWidth || !imageHeight) {
		imageWidth = oembed.thumbnail_width;
		imageHeight = oembed.thumbnail_height;
	}
	if (!element.hasClass(expanded) && oembed.height > collapsedHeight && imageHeight >= 2 * imageWidth) {
		var transitionCss = Echo.Utils.foldl({}, ["", "-o-", "-ms-", "-moz-", "-webkit-"], function(key, acc) {
			acc[key + "transition"] = "max-height ease 500ms";
		});

		element.addClass("echo-clickable")
			.attr("title", this.labels.get("clickToExpand"))
			.css("max-height", 250)
			.one("click", function() {
				self.events.publish({
					"topic": "onMediaExpand"
				});
				element.css(transitionCss)
					.css("max-height", expandedHeight)
					.removeClass("echo-clickable")
					.addClass(expanded)
					.attr("title", "");
			});
	} else {
		element.css("max-height", expandedHeight);
	}

	return element;
};

plugin.renderers.photoLabelContainer = function(element) {
	if (!this.component.get("data.object.parsedContent.oembed.description") && !this.component.get("data.object.parsedContent.oembed.title")) {
		element.hide();
	} else {
		this.view.get("photoContainer").css({
			"min-height": 55, // first number is added for default item avatar
			"min-width": 200
		});
	}
	return element;
};

plugin.css =
	'.{class:depth-0} .{plugin.class:item} { margin: -15px -16px 15px -16px; }' +
	'.{plugin.class:photo} .{plugin.class:noMediaAvailable} { position: relative; min-height: 145px; padding: 75px 10px 0 10px; background: #000; color: #FFF; min-width: 260px; text-align: center; }' +
	'.{plugin.class:photo} { position: relative; left: 0; top: 0; zoom: 1; }' +
	'.{plugin.class:photoContainer} { display: block; overflow: hidden; text-align: center; background-color: #000; }' +

	'.echo-sdk-ui .{plugin.class:photoLabel} a:link, .echo-sdk-ui .{plugin.class:photoLabel} a:visited, .echo-sdk-ui .{plugin.class:photoLabel} a:hover, .echo-sdk-ui .{plugin.class:photoLabel} a:active { color: #000000; }' +
	'.{plugin.class:photoLabelContainer} { padding: 15px 0 10px 0; }' +
	'.{plugin.class:photoLabelContainer} > div:nth-child(2) { margin: 5px 0 0 0; }' +
	'.{plugin.class:title} { font-weight: bold; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; font-size: 18px; line-height: 22px; }' +
	'.{plugin.class:description} { line-height: 21px; font-size: 15px; }' +

	'.{class:depth-0}.{plugin.class:enabled} .{class:body} { margin-bottom: 0px; overflow: visible; }' +
	'.{class:depth-0}.{plugin.class:enabled} .{class:data} { padding-top: 0px; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);

