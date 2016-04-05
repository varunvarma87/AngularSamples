'use strict';


module.exports = function contentjson(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-content-json');

	// Options
	return {
		options: {
			src: "locales",
			dest: ".build/locales"
		}
	};
};
