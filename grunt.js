/* mode:javascript; tab-width:2; indent-tabs-mode:nil; */
/*global module:false*/

path = require('path');
_und = require('underscore');


module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-coffee');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-requirejs');
    
    // Project configuration.
    grunt.initConfig({
        pkg: '<json:PriorityIgnore.json>',
        meta: {
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        qunit: {
            files: ['test/**/*.html']
        },
        lint: {
            files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint qunit'
        },
        server: {
            port: 8081,
            base: './dist/'
        },
        haml: {
            src: ['src/**/*.haml'],
            dest: './src/'
        },
        templatize: {
            src: ['src/**/*_tmpl.html'],
            dest: './src'
        },
        coffee: {
            dev: {
                src: ['src/**/*.coffee'],
                dest: 'src',
                options: {
                    bare: false
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
                jQuery: true
            }
        },
        requirejs: {
            dir: 'dist',
            appDir: 'src',
            baseUrl: '.',
            paths: {
                jquery    : './libs/jquery',
            },
            pragmas: {
                doExclude: true
            },
            modules: [{name: 'priority'}],
            skipModuleInsertion: false,
            optimizeAllPluginResources: true,
            findNestedDependencies: true
        },
        recess: {
            dev: {
                src: ['src/style.less'],
                dest: 'src/style.css',
                options: { 
                    compile: true
                }
            }
        },
        uglify: {}
    });
    
    // Default task.
    grunt.registerTask('default', 'lint qunit concat min');
    
    grunt.registerHelper('haml', function(src, dest, done) {
        var args = {
            cmd: 'haml',
            args: ["--unix-newlines", "--no-escape-attrs", "--double-quote-attributes", src]
        }
        grunt.utils.spawn(args, function(err, result) { 
            var out = path.basename(src, '.haml');
            grunt.file.write(path.join(dest, out + '.html'), result.stdout)
            done()
        });
    });
    
    grunt.registerTask('haml', 'Compile HAML', function() {
        var done = this.async(),
            sources = grunt.file.expandFiles(grunt.config([this.name, 'src'])),
            dest = grunt.config([this.name, 'dest']);

        sources.forEach(function(path) {
            grunt.helper('haml', path, dest, done);
        });
    });

    grunt.registerHelper('templatize', function(src, dest, done) {
        var file = grunt.file.read(src);
        console.log('define(' + _und.template(file).source + ');');
        done();
    });

    grunt.registerTask('templatize', 'Compile Underscored HTML to Javascript', function() {
        var done = this.async(),
            sources = grunt.file.expandFiles(grunt.config([this.name, 'src'])),
            dest = grunt.config([this.name, 'dest']);
        
        if (sources.length == 0) 
            return done();

        sources.forEach(function(path) {
            grunt.helper('templatize', path, dest, done);
        });
    });
        
    grunt.registerTask('dev', 'coffee:dev recess:dev templatize haml');

};
