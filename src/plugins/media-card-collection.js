(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("MediaCardCollection", "Echo.StreamServer.Controls.CardCollection");

if (Echo.Plugin.isDefined(plugin)) return;

var isMozillaBrowser = 'MozAppearance' in document.documentElement.style;

plugin.vars = {
	"appContainerWidth": undefined,
	"refreshViewDebounced": undefined
};

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
	"refreshViewDebounceTimeout": 150 // in ms
};

plugin.init = function() {
	// define Isotope layout mode based on the data we got from "presentation" field
	this.config.set("isotope.layoutMode", this.config.get("presentation.isotopeLayoutMode"));
};

plugin.enabled = function() {
	return document.compatMode !== "BackCompat";
};

plugin.dependencies = [{
	"loaded": function() {
		return !!Echo.jQuery().isotope;
	},
	"url": "{%= appBaseURLs.prod %}/third-party/isotope.pkgd.js"
}];

plugin.events = {
	"Echo.StreamServer.Controls.Card.onRender": function(_, args) {
		var item = this.component.items[args.card.data.unique];
		// define column properties (width/margin) for root items only
		if (item && item.isRoot()) {
			this._updateItemLayout(item, this._calcColumnWidth());
		}
	}
};

$.map(["Echo.StreamServer.Controls.CardCollection.onRender",
	"Echo.StreamServer.Controls.CardCollection.onRefresh",
	"Echo.StreamServer.Controls.CardCollection.onItemsRenderingComplete"
], function(name) {
	plugin.events[name] = function() {
		this._refreshView();
	};
});

$.map(["Echo.StreamServer.Controls.Card.onDelete",
	"Echo.Apps.Conversations.onAppResize",
	"Echo.Apps.Conversations.onTabShown",
	"Echo.StreamServer.Controls.Card.Plugins.MediaCard.onChangeView",
	"Echo.StreamServer.Controls.CardComposer.Plugins.RepliesTuner.onChangeView"
], function(name) {
	plugin.events[name] = function() {
		if (!this.get("refreshViewDebounced")) {
			this.set("refreshViewDebounced", Echo.Utils.debounce(
				$.proxy(this._refreshView, this),
				this.config.get("refreshViewDebounceTimeout")
			));
		}
		this.get("refreshViewDebounced")();
	};
});

plugin.methods._isAppWidthChanged = function() {
	var currentWidth = this._getAppWidth();
	if (this.get("appContainerWidth") !== currentWidth) {
		// keep current width in plugin var to compare
		// its value next time the function is called
		this.set("appContainerWidth", currentWidth);
		return true;
	}
	return false;
};

plugin.methods._getAppWidth = function() {
	// initial "CardCollection.onItemsRenderingComplete" event
	// happens when "body" is not yet in the DOM tree, so we use
	// Collection target to calculate width in this case
	return this.component.view.get("body").width() ||
		this.component.config.get("target").width();
};

plugin.methods._calcColumnWidth = function() {
	var plugin = this;
	var bodyWidth = this._getAppWidth();
	var itemsCount = this.component.threads.length;
	var columnWidth = plugin.config.get("presentation.minColumnWidth");

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

plugin.methods._applyColumnPropertiesFor = function(items) {
	var self = this;
	// take care of situations where column width:
	//  - is unknown, i.e. it was not calculated yet
	//  - should be recalculated due to window/container resize
	var isWidthChanged = this._isAppWidthChanged();
	var columnWidth = this._calcColumnWidth();
	var currentColumnWidth = this.config.get("isotope.masonry.columnWidth");
	if (!currentColumnWidth || isWidthChanged || columnWidth !== currentColumnWidth) {
		this.config.set("isotope.masonry.columnWidth", columnWidth);
	}

	// exit if an app width was not changed
	if (!isWidthChanged && columnWidth === currentColumnWidth) return;

	$.map(items, function(item) {
		self._updateItemLayout(item, columnWidth);
	});
};

plugin.methods._updateItemLayout = function(item, width) {
	var margin = this.config.get("columnMargin");
	return item.config.get("target").css({
		"margin-left": (margin / 2) + "px", // center-align cards
		"width": (width - margin) + "px"
	});
};

plugin.methods._refreshView = function() {
	var plugin = this;
	var stream = this.component;
	var body = stream.view.get("body");
	var hasEntries = stream.threads.length;

	// Isotope doesn't work properly with hidden elements
	// so we just prevent any Isotope calls while container is not visible.
	if (!body.is(":visible")) {
		return;
	}

	if (hasEntries) {
		this._applyColumnPropertiesFor(stream.threads);
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
