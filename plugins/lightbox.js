(function(jQuery) {
"use strict";

//var $ = jQuery;

var plugin = Echo.Plugin.manifest("LightBox", "Echo.StreamServer.Controls.CardCollection");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.dependencies = [{
	"loaded": function() {
		return !!window.Galleria;
	},
	"url": "http:{%= baseURLs.prod %}/third-party/galleria-1.3.5.js"
}];

plugin.component.renderers.body = function(element) {
	this.component.parentRenderer("body", arguments);
	window.Galleria.loadTheme('third-party/galleria.classic.js')
		.run(element, {
			"height": 500,
			"transition": "fade",
			"imageCrop": false,
			"imagePosition": "50% 50%"
		});
	return element;
};

Echo.Plugin.create(plugin);

})(Echo.jQuery);
