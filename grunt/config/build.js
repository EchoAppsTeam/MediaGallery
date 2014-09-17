module.exports = {
	options: {
		tasks: {
			dev: [
				'copy:third-party',
				'wrap',
				'patch:isotope',
				'copy:js',
				'concat'
			],
			min: [
				'copy:third-party',
				'wrap',
				'patch:isotope',
				'copy:js',
				'uglify',
				'concat'
			]
		}
	}
};
