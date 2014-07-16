(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCardCollection", "Echo.StreamServer.Controls.CardCollection");

if (Echo.Plugin.isDefined(plugin)) return;

var isMozillaBrowser = 'MozAppearance' in document.documentElement.style;

plugin.config = {
	"isotope": {
		"animationOptions": {
			"duration": isMozillaBrowser ? 0 : 2750,
			"easing": "linear",
			"queue": false
		},
		"layoutMode": "masonry",
		// use only jQuery engine for animation in mozilla browsers
		// due to the issues with video display with CSS transitions
		"animationEngine": isMozillaBrowser ? "jquery" : "best-available"
	},
	"columnsMargin": 10, // margin between columns
	"containerResizeDebounceTimeout": 250 // in ms
};

plugin.init = function() {
	// define Isotope layout mode based on the data we got from "presentation" field
	this.config.set("isotope.layoutMode", this.config.get("presentation.isotopeLayoutMode"));

	this._resizeHandler = Echo.Utils.debounce(
		$.proxy(this._refreshView, this),
		this.config.get("containerResizeDebounceTimeout")
	);
	$(window).on("resize", this._resizeHandler);
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

var refreshViewCallback = function(topic, args) {
	this._refreshView();
};

$.map(["Echo.StreamServer.Controls.CardCollection.onRender",
	"Echo.StreamServer.Controls.CardCollection.onRefresh",
	"Echo.StreamServer.Controls.CardCollection.onItemsRenderingComplete",
	"Echo.StreamServer.Controls.Card.Plugins.MediaCard.onChangeView",
	"Echo.StreamServer.Controls.CardComposer.Plugins.RepliesTuner.onChangeView"
], function(eventName) {
	plugin.events[eventName] = refreshViewCallback;
});

plugin.methods.destroy = function() {
	$(window).off("resize", this._resizeHandler);
};

plugin.methods._refreshView = function() {
	var plugin = this;
	var stream = this.component;
	var columnsMargin = plugin.config.get("columnsMargin");
	var hasEntries = stream.threads.length;
	var minColumnWidth = plugin.config.get("presentation.minColumnWidth");
	var body = stream.view.get("body");

	// initial "CardCollection.onItemsRenderingComplete" event
	// happens when "body" is not yet in the DOM tree, so we use
	// Collection target to calculate width in this case
	var bodyWidth = body.width() || stream.config.get("target").width();

	if (hasEntries && bodyWidth) {
		var columns = Math.floor(bodyWidth / minColumnWidth) || 1;

		// if we have less items that projected columns count,
		// let existing items take the whole width of container
		if (columns > stream.threads.length) {
			columns = stream.threads.length;
		}

		// if bodyWidth % columns = 0, Isotope can't handle
		// the last column and shows minus one column, in this case
		// we subtract 1px from the column width to let Isotope
		// handle the last column properly
		var adjustment = bodyWidth % columns === 0 ? 1 : 0;
		var columnWidth = Math.floor(bodyWidth / columns) - adjustment;

		this.config.set("isotope.masonry.columnWidth", columnWidth);

		// apply width and margin to all top level items
		body.children().css({
			"margin-left": (columnsMargin / 2) + "px", // center-align cards
			"width": (columnWidth - columnsMargin) + "px"
		});
	}

	if (body.data("isotope")) {
		if (hasEntries) {
			body.isotope("reloadItems").isotope({"sortBy": "original-order"});
		} else {
			body.isotope("destroy");
		}
	} else if (hasEntries) {
		// init Isotope and *unbind* native resize sniffer,
		// since we are handling window resize event ourselves
		body.isotope(plugin.config.get("isotope")).isotope("unbindResize");
	}
};

plugin.css =
	'.{plugin.class} .isotope { -webkit-transition-property: height, width; -moz-transition-property: height, width; -o-transition-property: height, width; transition-property: height, width;  -webkit-transition-duration: 0.8s; -moz-transition-duration: 0.8s; -o-transition-duration: 0.8s; transition-duration: 0.8s; }' +
	'.{plugin.class} .isotope .isotope-item { -webkit-transition-property: -webkit-transform, opacity; -moz-transition-property: -moz-transform, opacity; -o-transition-property: top, left, opacity; transition-property:transform, opacity; -webkit-transition-duration: 0.8s; -moz-transition-duration: 0.8s; -o-transition-duration: 0.8s; transition-duration: 0.8s; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
