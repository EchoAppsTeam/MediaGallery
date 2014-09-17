module.exports = function(grunt) {
	'use strict';
	return {
		isotope: {
			options: {
				patcher: function(text) {
					var jqueryRe = grunt.config('env.name') === 'development'
						? /window.jQuery/g
						: /\w{1,2}\.jQuery/g;
					var defineRe = grunt.config('env.name') === 'development'
						? /typeof define === 'function' \&\& define\.amd/g
						: /"function"==typeof define&&define.amd/g;
					return text
						.replace(jqueryRe, 'Echo.jQuery')
						.replace(defineRe, 'false');
				}
			},
			files: [{
				src: ['<%= dirs.build %>/third-party/isotope.pkgd.js']
			}]
		}
	};
};
