(function(jQuery) {
"use strict";

var plugin = Echo.Plugin.manifest("PinboardVisualization", "Echo.StreamServer.Controls.Stream");

if (Echo.Plugin.isDefined(plugin)) return;

var ua = navigator.userAgent.toLowerCase();

var isMozillaBrowser = !!(
	!~ua.indexOf("chrome")
	&& !~ua.indexOf("webkit")
	&& !~ua.indexOf("opera")
	&& (
		/(msie) ([\w.]+)/.exec(ua)
		|| ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)
	)
);

plugin.config = {
	"isotope": {
		"animationOptions": {
			"duration": isMozillaBrowser ? 0 : 2750,
			"easing": "linear",
			"queue": false
		},
		"masonry": {
			"columnWidth": 270
		},
		"animationEngine": isMozillaBrowser ? "jquery" : "best-available"
	}
};

plugin.init = function() {
	this.component.config.set("slideTimeout", 0);
	this.config.set("masonry.columnWidth", this.config.get("columnWidth"));
};

plugin.enabled = function() {
	return document.compatMode !== "BackCompat";
};

plugin.dependencies = [{
	"loaded": function() { return !!Echo.jQuery().isotope; },
	"url": "{config:cdnBaseURL.sdk}/third-party/jquery/jquery.isotope.min.js"
}];

plugin.events = {
	"Echo.Conversations.NestedCard.onMediaLoad": function(topic, args) {
	//	this._refreshView();
	},
	"Echo.StreamServer.Controls.Stream.Item.Plugins.MediaCard.onChangeView": function(topic, args) {
		this._refreshView();
	}
};

plugin.methods._refreshView = function() {
	var plugin = this, stream = this.component;
	var body = stream.view.get("body");
	var hasEntries = stream.threads.length;
	body.data("isotope")
		? (hasEntries
			? body.isotope("reloadItems").isotope({"sortBy": "original-order"})
			: body.isotope("destroy"))
		: hasEntries && body.isotope(
			plugin.config.get("isotope")
		);
};

plugin.css =
	'.{plugin.class} .isotope { -webkit-transition-property: height, width; -moz-transition-property: height, width; -o-transition-property: height, width; transition-property: height, width;  -webkit-transition-duration: 0.8s; -moz-transition-duration: 0.8s; -o-transition-duration: 0.8s; transition-duration: 0.8s; }' +
	'.{plugin.class} .isotope .isotope-item { -webkit-transition-property: -webkit-transform, opacity; -moz-transition-property: -moz-transform, opacity; -o-transition-property: top, left, opacity; transition-property:transform, opacity; -webkit-transition-duration: 0.8s; -moz-transition-duration: 0.8s; -o-transition-duration: 0.8s; transition-duration: 0.8s; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
