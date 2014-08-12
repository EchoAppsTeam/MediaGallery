module.exports = {
	options: {
		tasks: {
			dev: [
				'copy:third-party',
				'patch:isotope',
				'copy:js',
				'concat'
			],
			min: [
				'copy:third-party',
				'patch:isotope',
				'copy:js',
				'uglify',
				'concat'
			]
		}
	}
};
