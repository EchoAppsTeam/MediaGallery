module.exports = {
	'third-party': {
		expand: true,
		src: '**',
		cwd: '<%= dirs.src %>/third-party/<%= env.name === "development" ? "dev/" : "prod/" %>',
		dest: '<%= dirs.build %>/third-party/',
		flatten: true,
		filter: 'isFile'
	}
};
