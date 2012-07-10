/* mode:javascript; tab-width:2; indent-tabs-mode:nil; */
/*global module:false*/

var path, _und, async;

path = require('path');
_und = require('underscore');
async = require('async');

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
            dest: './src'
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
            dir: 'dist-compiled',
            appDir: 'dist',
            baseUrl: '.',
            paths: {
                jquery    : '../libs/jquery/jquery-1.7.2'
            },
            pragmas: {
                doExclude: true
            },
            modules: [{name: 'priority'}],
            skipModuleInsertion: false,
            optimizeAllPluginResources: true,
            findNestedDependencies: true
        },
        install: {
            src: [
                'src/index.html',
                'src/priority.js',
                'src/*_tmpl.js', 
                'src/style.css', 
                'libs/jquery/jquery-1.7.2.js', 
                'libs/require.js' ],
            dest: 'dist'
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
        mocha: {
            src: ['test/*_mocha.coffee']
        },
        uglify: {}
    });
    
    // Default task.
    grunt.registerTask('default', 'lint qunit concat min');
    
    grunt.registerHelper('haml', function(src, dest, done) {
        var args = {
            cmd: 'haml',
            args: ["--unix-newlines", "--no-escape-attrs", "--double-quote-attributes", src]
        };
        grunt.utils.spawn(args, function(err, result) { 
            if (err) console.log(err);
            var out = path.basename(src, '.haml');
            grunt.file.write(path.join(dest, out + '.html'), result.stdout);
            done();
        });
    });
    
    grunt.registerTask('haml', 'Compile HAML', function() {
        var done = this.async(),
            sources = grunt.file.expandFiles(grunt.config([this.name, 'src'])),
            dest = grunt.config([this.name, 'dest']);

        async.forEachSeries(sources, 
            function(path, cb) { grunt.helper('haml', path, dest, cb) },
            done);
    });

    grunt.registerHelper('templatize', function(src, dest, done) {
        var file = grunt.file.read(src),
            out = path.basename(src, '.html');
        grunt.file.write(path.join(dest, out + '.js'), 'define(' + _und.template(file).source + ');');
        done();
    });

    grunt.registerTask('templatize', 'Compile Underscored HTML to Javascript', function() {
        var done = this.async(),
            sources = grunt.file.expandFiles(grunt.config([this.name, 'src'])),
            dest = grunt.config([this.name, 'dest']);

        if (sources.length === 0) {
            return done();
        }
        async.forEachSeries(sources, 
            function(path, cb) { grunt.helper('templatize', path, dest, cb); },
            done);
    });

    grunt.registerTask('dev', 'coffee:dev recess:dev haml templatize install');

    grunt.registerHelper('install', function(src, dest, done) {
        grunt.file.copy(src, path.join(dest, path.basename(src)));
        if (done) { done(); }
    });

    grunt.registerTask('install', function() {
        var sources = grunt.file.expandFiles(grunt.config([this.name, 'src'])),
            dest = grunt.config([this.name, 'dest']);
        sources.forEach(function(path) { grunt.helper('install', path, dest, null);});
    });

    grunt.registerHelper('mocha', function(command, test, done) {
        var args = {
            cmd: 'mocha',
            args: ['--compilers', 'coffee:coffee-script', '-R', 'tap', '-C', test]
        };

        grunt.utils.spawn(args, function(err, result) {
            if (err) {
                console.log(err.stderr)
                done();
                return;
            }
            console.log(result.stdout);
            done();
        });
    });

    grunt.registerTask('mocha', 'Run Mocha Tests', function() {
        var done = this.async(),
            task = this.name,
            sources = grunt.file.expandFiles(grunt.config([this.name, 'src'])),
            dest = grunt.config([this.name, 'dest']);
        
        sources.sort();
        async.forEachSeries(
            sources, 
            function(path, cb) { 
                grunt.helper('mocha', grunt.config([task, 'cmd']), path, cb);
            },
            done);
    });

};
