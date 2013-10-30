module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    uglify:
      my_target:
        files:
          'build/<%= pkg.name %>.min.js': ['public/js/admin/*.js', 'public/js/admin/configs/*.js', 'public/js/admin/app/*.js', 'public/js/admin/core/*.js']
      options:
        banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"yyyy-mm-dd\") %> */\n"

#      build:
#        src: "public/js/admin/*.js"
#        dest: "build/<%= pkg.name %>.min.js"


  # Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks "grunt-contrib-uglify"

  # Default task(s).
  grunt.registerTask "default", ["uglify"]