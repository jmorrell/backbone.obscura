module.exports = function (grunt) {
  grunt.initConfig({

    browserify: {
      basic: {
        src: [],
        dest: 'build/backbone.pinhole.js',
        options: {
          external: [ 'underscore', 'backbone' ],
          alias: ['./index.js:pinhole']
        }
      }
    },

    umd: {
      default: {
        src: 'build/backbone.pinhole.js',
        template: './templates/umd.hbs',
        objectToExport: "require('pinhole')",
        globalAlias: 'Backbone.Pinhole',
        deps: {
          'default': ['_', 'Backbone'],
          amd: ['underscore', 'backbone'],
          cjs: ['underscore', 'backbone'],
          global: ['_', 'Backbone']
        },
        browserifyMapping: '{"backbone":Backbone,"underscore":_}'
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('default', ['browserify', 'umd']);
};
