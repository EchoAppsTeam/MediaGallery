(function($) {
"use strict";

if (Echo.AppServer.Dashboard.isDefined("Echo.Apps.MediaGallery.Dashboard")) return;

var dashboard = Echo.AppServer.Dashboard.manifest("Echo.Apps.MediaGallery.Dashboard");

dashboard.inherits = Echo.Utils.getComponent("Echo.AppServer.Dashboards.AppSettings");

dashboard.vars = {
	"nestedOverrides": {
		"original": {
			"advanced": {
				"replyComposer": {
					"visible": true
				},
				"topPosts": {
					"replyNestingLevels": 2
				},
				"allPosts": {
					"replyNestingLevels": 2
				}
			}
		},
		"custom": {
			"advanced": {
				"replyComposer": {
					"visible": false
				},
				"topPosts": {
					"replyNestingLevels": 0
				},
				"allPosts": {
					"replyNestingLevels": 0
				}
			}
		}
	}
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

dashboard.config.ecl = [{
	"component": "Checkbox",
	"name": "mediaContentOnly",
	"type": "boolean",
	"default": false,
	"config": {
		"title": "Only Photos and Videos",
		"desc": "If True, only photos and videos will be displayed"
	}
}, {
	"component": "Group",
	"name": "nativeSubmissions",
	"type": "object",
	"config": {
		"title": "Native Submissions"
	},
	"items":[{
		"component": "Checkbox",
		"name": "visible",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Allow Native Submissions",
			"desc": "If True, users are provided the opportunity to upload photos and videos directly on the page"
		}
	}, {
		"component": "Input",
		"name": "title",
		"type": "string",
		"config": {
			"title": "Submission panel title",
			"desc": "Specify a title for native submissions panel.",
			"options": [],
			"data": {"sample": "Pinboard Call to Action"}
		}
	}, {
		"component": "Input",
		"name": "description",
		"type": "string",
		"config": {
			"title": "Submission panel description",
			"desc": "Specify a description for native submissions panel.",
			"options": [],
			"data": {"sample": "More detailed instructions on participating in our Pinboard"}
		}
	}, {
		"component": "Input",
		"name": "buttonText",
		"type": "string",
		"default": "Submit your photos",
		"config": {
			"title": "Submit button text",
			"desc": "Specify a text for submit button.",
			"options": [],
			"data": {"sample": "Submit your photos"}
		}
	}]
}, {
	"component": "Group",
	"name": "presentation",
	"type": "object",
	"config": {
		"title": "Presentation"
	},
	"items":[{
		"component": "Input",
		"name": "minColumnWidth",
		"type": "number",
		"config": {
			"title": "Minimum column width",
			"desc": "Specify a minimum width of a column in a grid (in pixels)",
			"options": [],
			"data": {"sample": 250}
		}
	}, {
		"component": "Select",
		"name": "isotopeLayoutMode",
		"type": "string",
		"default": "masonry",
		"config": {
			"title": "Stream layout",
			"desc": "",
			"options": [{
				"title": "Masonry",
				"value": "masonry"
			}, {
				"title": "Vertical",
				"value": "vertical"
			}, {
				"title": "FitRows",
				"value": "fitRows"
			}],
			"data": {}
		}
	}, {
		"component": "Select",
		"name": "mediaLayoutMode",
		"type": "string",
		"default": "full",
		"config": {
			"title": "Media Cards layout",
			"desc": "",
			"options": [{
				"title": "Full",
				"value": "full"
			}, {
				"title": "Compact",
				"value": "compact"
			}, {
				"title": "Media only",
				"value": "pure"
			}],
			"data": {}
		}
	}]
}, {
	"component": "Group",
	"name": "dependencies",
	"type": "object",
	"config": {
		"title": "Dependencies",
		"expanded": false
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
	}, {
			"component": "Fieldset",
			"name": "FilePicker",
			"type": "object",
			"items": [{
				"component": "Input",
				"name": "apiKey",
				"type": "string",
				"config": {
					"title": "FilePicker API key",
					"desc": "Specifies the Filepicker api key for this instance",
					"options": []
				}
			}]
		}, {
			"component": "Fieldset",
			"name": "embedly",
			"type": "object",
			"items": [{
				"component": "Input",
				"name": "apiKey",
				"type": "string",
				"config": {
					"title": "Embed.ly API Key"
				}
			}]
		}]
}, {
	"component": "Dashboard",
	"name": "advanced",
	"type": "object",
	"config": {
		"title": "Advanced",
		"component": "Echo.Apps.Conversations.Dashboard",
		"url": "//cdn.echoenabled.com/apps/echo/conversations/v2/dashboard.js",
		"config": {
			"disableSettings": ["targetURL", "dependencies"]
		}
	},
	"items": []
}, {
	"name": "targetURL",
	"component": "Echo.DataServer.Controls.Dashboard.DataSourceGroup",
	"type": "string",
	"required": true,
	"config": {
		"title": "",
		"expanded": false,
		"labels": {
			"dataserverBundleName": "Echo MediaGallery Auto-Generated Bundle for {instanceName}"
		},
		"apiBaseURLs": {
			"DataServer": "{%= apiBaseURLs.DataServer %}/"
		}
	}
}];

dashboard.config.normalizer = {
	"ecl": function(obj, component) {
		var self = this;
		return $.map(obj, function(field) {
			if (field.name === "advanced") {
				field.config = $.extend(true, field.config, {
					"config": {
						"data": $.extend(true, {
							"instance": {
								"config": component.get("nestedOverrides.custom")
							}
						}, self.get("data")),
						"request": self.get("request")
					}
				});
			}
			return field;
		});
	}
};

dashboard.init = function() {
	this.parent();
};

Echo.AppServer.Dashboard.create(dashboard);

})(Echo.jQuery);
