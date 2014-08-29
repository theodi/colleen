module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            hooks: ['.git/hooks/pre-commit'],
            build: {
                src: [ 'web/wnu/' ]
            }
        },

        targethtml: {
            dist: {
                files: {
                    'web/wnu/index.html': 'client/index.html'
                }
            }
        },

        copy: {
            main: {
                files: [

                    {expand: true, cwd: 'client/css/', src: ['**'], dest: 'web/wnu/css/'},
                    {expand: true, cwd: 'client/images/', src: ['**'], dest: 'web/wnu/images/'},
                    // wnu data
                    {expand: true, cwd: 'client/data/', src: ['*.json','*.csv'], dest: 'web/wnu/data/', filter: 'isFile'},
                    {src:'client/js/config.js', dest:'web/wnu/js/config.js' },

                    // chart
                    {src:'client/chart.html', dest:'web/wnu/chart.html' },
                    {expand: true, cwd: 'client/lib/', src: ['**'], dest: 'web/wnu/lib/'},
                    {src:'client/js/chart.js',dest:'web/wnu/js/chart.js'}
                    /*
                    { src:'client/lib/lodash/lodash.compat.min.js',dest:'web/wnu/lib/lodash/lodash.compat.min.js'},
                    { src:'client/lib/jquery/datetimepicker/jquery.datetimepicker.js',dest:'web/wnu/lib/jquery/datetimepicker/jquery.datetimepicker.js'},
                    { src:'client/lib/d3/nv.d3.min.js', dest:'web/wnu/lib/d3/nv.d3.min.js'},

                    */
                ]
            }
        },

        uglify: {

            js: {
                files: { 'web/wnu/js/wnu.min.js': [
                    'client/lib/lodash/lodash.compat.min.js',
                    'client/lib/snap/snap.svg-min.js',
                    'client/lib/chroma/chroma.min.js',
                    'client/lib/springy/springy.js',
                    'client/js/*.js',
                    '!client/js/chart.js',
                    '!client/js/config.js'

                ] }
            }


        },

        watch: {
            scripts: {
                files: 'client/*',
                tasks: ['clean','targethtml','copy','uglify'],
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

        /*
        githooks: {
            all: {
                'pre-commit': 'jasmine'
            }
        }
        */
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-githooks');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-targethtml');

    // Default task(s).
    grunt.registerTask('default', ['clean','targethtml','copy','uglify']);//,'githooks']);
};
