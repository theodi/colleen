module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: {
                src: [ 'web/wnu/' ]
            }
        },

        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'client/css/', src: ['**'], dest: 'web/wnu/css/'},
                    {expand: true, cwd: 'client/js/', src: ['**'], dest: 'web/wnu/js/'},
                    {expand: true, cwd: 'client/lib/', src: ['**'], dest: 'web/wnu/lib/'},
                    {expand: true, cwd: 'client/images/', src: ['**'], dest: 'web/wnu/images/'},
                    {expand: true, cwd: 'client/data/', src: ['**'], dest: 'web/wnu/data/'},
                    //{ src:"client/data/projects.json", dest:"web/wnu/data/projects.json" },
                    //{ src:"client/data/project_rules.json", dest:"web/wnu/data/project_rules.json" },
                    { src:"client/index.html", dest:"web/wnu/index.html" },
                    { src:"client/chart.html", dest:"web/wnu/chart.html" }
                ]
            }
        },

        concat: {
            // concat task configuration goes here.
            build: {
            }
        },

        uglify: {
            options: {
                //banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dynamic_mappings: {
                // Grunt will search for "**/*.js" under "lib/" when the "uglify" task
                // runs and build the appropriate src-dest file mappings then, so you
                // don't need to update the Gruntfile when files are added or removed.
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: 'client/js/',      // Src matches are relative to this path.
                        src: ['*.js'], // Actual pattern(s) to match.
                        dest: 'web/wnu/js/',   // Destination path prefix.
                        ext: '.js',   // Dest filepaths will have this extension.
                        extDot: 'first'   // Extensions in filenames begin after the first dot
                    }
                ]
            }
        },


        watch: {
            scripts: {
                files: 'client/*',
                tasks: ['clean','copy'],//,'uglify'],
                options: {
                    interrupt: true,
                    debounceDelay: 1000
                }
            }
        },

        jasmine: {
            options: {
                specs: 'spec/*.spec.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // Default task(s).
    grunt.registerTask('default', ['clean','copy']);//,'uglify']);
};
