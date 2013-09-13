module.exports = function (grunt) {
  grunt.initConfig({

    browserify: {
      basic: {
        src: [],
        dest: './backbone.obscura.js',
        options: {
          external: [ 'underscore', 'backbone' ],
          alias: ['./index.js:obscura']
        }
      }
    },

    umd: {
      default: {
        src: './backbone.obscura.js',
        template: './templates/umd.hbs',
        objectToExport: "require('obscura')",
        globalAlias: 'Backbone.Obscura',
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
