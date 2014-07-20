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
	"columnMargin": 10, // margin between columns
	"itemDeleteDebounceTimeout": 100, // in ms
	"containerResizeDebounceTimeout": 250 // in ms
};

plugin.init = function() {
	var plugin = this;

	// define Isotope layout mode based on the data we got from "presentation" field
	this.config.set("isotope.layoutMode", this.config.get("presentation.isotopeLayoutMode"));

	this._resizeHandler = Echo.Utils.debounce(function() {
		plugin._refreshView(true);
	}, this.config.get("containerResizeDebounceTimeout"));

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

plugin.events = {
	"Echo.StreamServer.Controls.Card.onRender": function(_, args) {
		var item = this.component.items[args.card.data.unique];
		// define column properties (width/margin) for root items only
		if (item && item.isRoot()) {
			this._defineColumnPropertiesFor(item);
		}
	},
	"Echo.StreamServer.Controls.Card.onDelete": function(_, args) {
		// debounce _refreshView for delete operation (as a result of items
		// rolling window logic) to avoid massive function invocation when
		// we receive live updates in chunks (more than one item in a single
		// live update)
		if (!this._onItemDeleteHandler) {
			this._onItemDeleteHandler = Echo.Utils.debounce(
				$.proxy(this._refreshView, this),
				this.config.get("itemDeleteDebounceTimeout")
			);
		}

		this._onItemDeleteHandler();
	}
};

$.map(["Echo.StreamServer.Controls.CardCollection.onRender",
	"Echo.StreamServer.Controls.CardCollection.onRefresh",
	"Echo.StreamServer.Controls.CardCollection.onItemsRenderingComplete",
	"Echo.StreamServer.Controls.Card.Plugins.MediaCard.onChangeView",
	"Echo.StreamServer.Controls.CardComposer.Plugins.RepliesTuner.onChangeView"
], function(name) {
	plugin.events[name] = function() {
		this._refreshView();
	};
});

plugin.methods.destroy = function() {
	$(window).off("resize", this._resizeHandler);
};

plugin.methods._calcColumnWidth = function() {
	var plugin = this;
	var stream = this.component;
	var itemsCount = stream.threads.length;
	var columnWidth = plugin.config.get("presentation.minColumnWidth");

	// initial "CardCollection.onItemsRenderingComplete" event
	// happens when "body" is not yet in the DOM tree, so we use
	// Collection target to calculate width in this case
	var bodyWidth = stream.view.get("body").width() ||
			stream.config.get("target").width();

	if (itemsCount && bodyWidth) {
		var columns = Math.floor(bodyWidth / columnWidth) || 1;

		// if we have less items than projected columns count,
		// let existing items take the whole width of container
		if (columns > itemsCount) {
			columns = itemsCount;
		}

		// if bodyWidth % columns = 0, Isotope can't handle
		// the last column and shows minus one column, in this case
		// we subtract 1px from the column width to let Isotope
		// handle the last column properly
		var adjustment = bodyWidth % columns === 0 ? 1 : 0;
		columnWidth = Math.floor(bodyWidth / columns) - adjustment;

	}
	return columnWidth;
};

plugin.methods._defineColumnPropertiesFor = function(items, isWindowResized) {
	// take care of situations where column width:
	//  - is unknown, i.e. it was not calculated yet
	//  - should be recelculated due to window resize
	if (!this.config.get("isotope.masonry.columnWidth") || isWindowResized) {
		this.config.set("isotope.masonry.columnWidth", this._calcColumnWidth());
	}

	var width = this.config.get("isotope.masonry.columnWidth");
	var margin = this.config.get("columnMargin");
	$.map($.isArray(items) ? items : [items], function(item) {
		item.config.get("target").css({
			"margin-left": (margin / 2) + "px", // center-align cards
			"width": (width - margin) + "px"
		});
	});
};

plugin.methods._refreshView = function(isWindowResized) {
	var plugin = this;
	var stream = this.component;
	var body = stream.view.get("body");
	var hasEntries = stream.threads.length;

	if (hasEntries && isWindowResized) {
		this._defineColumnPropertiesFor(stream.threads, true);
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
