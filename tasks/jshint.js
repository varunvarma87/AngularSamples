'use strict';


module.exports = function jshint(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Options
	return {
		files: [
            'index.js',
            'routes/*.js',
            'lib/*.js',
            'public/js/*.js'
        ],
		options: {
		    jshintrc: '.jshintrc'
		}
	};
};
