(function($) {
"use strict";

if (Echo.AppServer.Dashboard.isDefined("Echo.Apps.MediaGallery.Dashboard")) return;

var dashboard = Echo.AppServer.Dashboard.manifest("Echo.Apps.MediaGallery.Dashboard");

dashboard.inherits = Echo.Utils.getComponent("Echo.AppServer.Dashboards.AppSettings");

dashboard.labels = {
	"failedToFetchToken": "Failed to fetch customer dataserver token: {reason}"
};

dashboard.mappings = {
	"dependencies.appkey": {
		"key": "dependencies.StreamServer.appkey"
	},
	"dependencies.janrainapp": {
		"key": "dependencies.Janrain.appId"
	}
};

dashboard.dependencies = [{
	"url": "{config:cdnBaseURL.apps.appserver}/controls/configurator.js",
	"control": "Echo.AppServer.Controls.Configurator"
}, {
	"url": "{config:cdnBaseURL.apps.dataserver}/full.pack.js",
	"control": "Echo.DataServer.Controls.Pack"
}];

dashboard.config = {
	"appkeys": [],
	"janrainapps": []
};

dashboard.config.ecl = [{
	"name": "targetURL",
	"component": "Echo.DataServer.Controls.Dashboard.DataSourceGroup",
	"type": "string",
	"required": true,
	"config": {
		"title": "",
		"labels": {
			"dataserverBundleName": "Echo MediaGallery Auto-Generated Bundle for {instanceName}"
		},
		"apiBaseURLs": {
			"DataServer": "http://nds.echoenabled.com/api/"
		}
	}
}, {
	"component": "Group",
	"name": "presentation",
	"type": "object",
	"config": {
		"title": "Presentation"
	},
	"items":[{
		"component": "Input",
		"name": "maxCardWidth",
		"type": "number",
		"config": {
			"title": "Maximum card width",
			"desc": "Specify a maximum width (in pixels) of a media card.",
			"options": [],
			"data": {"sample": 250}
		}
	}, {
		"component": "Input",
		"name": "columnWidth",
		"type": "number",
		"config": {
			"title": "Cards columns width",
			"desc": "Specify column width (in pixels).",
			"options": [],
			"data": {"sample": 270}
		}
	}]
}, {
	"component": "Group",
	"name": "dependencies",
	"type": "object",
	"config": {
		"title": "Dependencies"
	},
	"items": [{
		"component": "Select",
		"name": "appkey",
		"type": "string",
		"config": {
			"title": "StreamServer application key",
			"desc": "Specifies the application key for this instance",
			"options": []
		}
	}, {
		"component": "Select",
		"name": "janrainapp",
		"type": "string",
		"config": {
			"title": "Janrain application ID",
			"validators": ["required"],
			"options": []
		}
	}]
}, {
	"component": "Dashboard",
	"name": "advanced",
	"type": "object",
	"config": {
		"title": "Advanced",
		"component": "Echo.Apps.Conversations.Dashboard",
		"url": "http://cdn.echoenabled.com/apps/echo/conversations/v1.3/dashboard.js",
		"config": {
			"disableSettings": ["targetURL", "dependencies"]
		}
	},
	"items": []
}];

dashboard.config.normalizer = {
	"ecl": function(obj, component) {
		var self = this;
		return $.map(obj, function(field) {
			if (field.name === "advanced") {
				field.config = $.extend(true, field.config, {
					"config": {
						"data": self.get("data"),
						"request": self.get("request")
					}
				});
			}
			return field;
		});
	}
};

dashboard.init = function() {
	var self = this, parent = $.proxy(this.parent, this);
	this._fetchDataServerToken(function() {
		self.config.set("ecl", self._prepareECL(self.config.get("ecl")));
		parent();
	});
};

dashboard.methods.declareInitialConfig = function() {
	var keys = this.config.get("appkeys", []);
	var apps = this.config.get("janrainapps", []);
	return {
		"targetURL": this._assembleTargetURL(),
		"dependencies": {
			"Janrain": {
				"appId": apps.length ? apps[0].name : undefined
			},
			"StreamServer": {
				"appkey": keys.length ? keys[0].key : undefined
			}
		}
	};
};

dashboard.methods._prepareECL = function(items) {
	var self = this;

	var instructions = {
		"targetURL": function(item) {
			item.config = $.extend({
				"instanceName": self.get("data.instance.name"),
				"domains": self.config.get("domains"),
				"apiToken": self.config.get("dataserverToken"),
				"valueHandler": function() {
					return self._assembleTargetURL();
				}
			}, item.config);
			return item;
		},
		"dependencies.appkey": function(item) {
			item.config.options = $.map(self.config.get("appkeys"), function(appkey) {
				return {
					"title": appkey.key,
					"value": appkey.key
				};
			});
			return item;
		},
		"dependencies.janrainapp": function(item) {
			item.config.options = $.map(self.config.get("janrainapps"), function(app) {
				return {
					"title": app.name,
					"value": app.name
				};
			});
			return item;
		}
	};
	return (function traverse(items, path) {
		return $.map(items, function(item) {
			var _path = path ? path + "." + item.name : item.name;
			if (item.type === "object" && item.items) {
				item.items = traverse(item.items, _path);
			} else if (instructions[_path]) {
				item = instructions[_path](item);
			}
			return item;
		});
	})(items, "");
};

dashboard.methods._fetchDataServerToken = function(callback) {
	var self = this;
	Echo.AppServer.API.request({
		"endpoint": "customer/{id}/subscriptions",
		"id": this.get("data.customer").id,
		"onData": function(response) {
			var token = Echo.Utils.foldl("", response, function(subscription, acc) {
				return subscription.product.name === "dataserver"
					? subscription.extra.token
					: acc;
			});
			if (token) {
				self.config.set("dataserverToken", token);
				callback.call(self);
			} else {
				self._displayError(
					self.labels.get("failedToFetchToken", {
						"reason": self.labels.get("dataserverSubscriptionNotFound")
					})
				);
			}
		},
		"onError": function(response) {
			self._displayError(self.labels.get("failedToFetchToken", {"reason": response.data.msg}));
		}
	}).send();
};

dashboard.methods._displayError = function(message) {
	this.showMessage({
		"type": "error",
		"message": message,
		"target": this.config.get("target")
	});
	this.ready();
};

dashboard.methods._assembleTargetURL = function() {
	var re =  new RegExp("\/" + this.get("data.instance.name") + "$");
	var targetURL = this.get("data.instance.config.targetURL");

	if (!targetURL || !targetURL.match(re)) {
		targetURL =  "http://" + this.config.get("domains")[0] + "/social-source-input/" + this.get("data.instance.name");
	}

	return targetURL;
};

Echo.AppServer.Dashboard.create(dashboard);

})(Echo.jQuery);
