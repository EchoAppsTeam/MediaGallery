module.exports = {
	options: {
		header: [
			'(function() {',
			'var define = undefined;'
		],
		footer: [
			'}).call(this);'
		]
	},
	'third-party': {
		files: [{
			expand: true,
			cwd: '<%= dirs.build %>',
			src: ['third-party/*.js']
		}]
	}
};
