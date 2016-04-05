'use strict';


module.exports = function (grunt) {

    // Load the project's grunt tasks from a directory
    require('grunt-config-dir')(grunt, {
        configDir: require('path').resolve('tasks')
    });

    // App tasks
    grunt.registerTask('auto', ['loopmocha:local']);
    grunt.registerTask('build', [ 'jshint', 'less', 'requirejs', 'i18n', 'content-json', 'copyto' ]);
    grunt.registerTask('test', [ 'jshint', 'mochacli' ]);
    grunt.registerTask('lint', [ 'jshint' ]);
    grunt.registerTask('content', [ 'content-json' ]);

    // Build tasks
    grunt.loadNpmTasks('grunt-ci-suite');

};
