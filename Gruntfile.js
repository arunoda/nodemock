module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

	jshint: {
	  // define the files to lint
	  files: ['./lib/**/*.js'],
	  // configure JSHint (documented at http://www.jshint.com/docs/)
	  options: {
	      // more options here if you want to override JSHint defaults
	    globals: {
	      console: true,
	      module: true
	    }
	  }
	},

    nodeunit: {
      all: ['test/*.js']
    }
  });

  // load our plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks("grunt-contrib-nodeunit");

  // and define our tasks
  // this would be run by typing "grunt test" on the command line
  grunt.registerTask('test', ['nodeunit']);

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('default', ['jshint', 'nodeunit']);
};