module.exports = function(grunt) {
	'use strict';
	return {
		isotope: {
			options: {
				patcher: function(text) {
					// TODO: allow ? to be at hte line beginning
					// check requireOperatorBeforeLineBreak from jscs
					var re = grunt.config('env.name') === 'development' ?
						/window.jQuery/g :
						/\w{1,2}\.jQuery/g;
					return text.replace(re, 'Echo.jQuery');
				}
			},
			files: [{
				src: ['<%= dirs.build %>/third-party/isotope.pkgd.js']
			}]
		}
	};
};
