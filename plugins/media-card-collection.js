(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCardCollection", "Echo.StreamServer.Controls.CardCollection");

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
		"layoutMode": undefined,
		"animationEngine": isMozillaBrowser ? "jquery" : "best-available"
	},
	"cardBottomMargin": 10 // we need this value (currently 10px) to calculate proper columns width,
};							// and keep margin value at X and Y axis similar

plugin.init = function() {
	var isotopeLayoutMode = this.config.get("presentation.isotopeLayoutMode");
	this.component.config.set("slideTimeout", 0);
	this.config.set("isotope.layoutMode", isotopeLayoutMode);
	if (isotopeLayoutMode === "masonry") {
		var columnWidth = this.config.get("presentation.maxCardWidth") + this.config.get ("cardBottomMargin");
		this.config.set("isotope." + isotopeLayoutMode + ".columnWidth", columnWidth);
	}
};

plugin.enabled = function() {
	return document.compatMode !== "BackCompat";
};

plugin.dependencies = [{
	"loaded": function() {
		return !!Echo.jQuery().isotope;
	},
	"url": "{%= baseURLs.prod %}/third-party/isotope.pkgd.js"
}];

(function() {
	var eventsToRefresh = [
		"Echo.StreamServer.Controls.CardCollection.onRender",
		"Echo.StreamServer.Controls.CardCollection.onRefresh",
		"Echo.StreamServer.Controls.CardCollection.onItemsRenderingComplete",
		"Echo.StreamServer.Controls.Card.Plugins.MediaCard.onChangeView"
	];
	var refreshViewCallback = function(topic, args) {
		this._refreshView();
	};
	$.map(eventsToRefresh, function(eventName) {
		plugin.events[eventName] = refreshViewCallback;
	});
})();

plugin.methods._refreshView = function() {
	var plugin = this, stream = this.component;
	var body = stream.view.get("body");
	var hasEntries = stream.threads.length;
	body.data("isotope")
		? (hasEntries
			? body.isotope("reloadItems").isotope({"sortBy": "original-order"})
			: body.isotope("destroy"))
		: hasEntries && body.isotope(plugin.config.get("isotope"));
};

plugin.css =
	'.{plugin.class} .isotope { -webkit-transition-property: height, width; -moz-transition-property: height, width; -o-transition-property: height, width; transition-property: height, width;  -webkit-transition-duration: 0.8s; -moz-transition-duration: 0.8s; -o-transition-duration: 0.8s; transition-duration: 0.8s; }' +
	'.{plugin.class} .isotope .isotope-item { -webkit-transition-property: -webkit-transform, opacity; -moz-transition-property: -moz-transform, opacity; -o-transition-property: top, left, opacity; transition-property:transform, opacity; -webkit-transition-duration: 0.8s; -moz-transition-duration: 0.8s; -o-transition-duration: 0.8s; transition-duration: 0.8s; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
