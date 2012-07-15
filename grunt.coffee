path = require("path")
_und = require("underscore")
async = require("async")
fs = require("fs")
coffee = require('coffee-script')

HAML_TO_HTML = ['src/index.haml']
HAML_TO_JS =   ['src/*_tmpl.haml']
LESS_TO_CSS =  ['src/*.less']
COFFEE_TO_JS = ['src/*.coffee']

DIST = "./dist"

module.exports = (grunt) ->
    grunt.loadNpmTasks "grunt-coffee"
    grunt.loadNpmTasks "grunt-recess"
    grunt.loadNpmTasks "grunt-requirejs"

    grunt.initConfig
        pkg: "<json:PriorityIgnore.json>"
        meta:
            banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " + "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" + "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\n\" : \"\" %>" + "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>;" + " Licensed <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */"

        qunit:
            files: [ "test/**/*.html" ]

        lint:
            files: [ "grunt.js", "src/**/*.js", "test/**/*.js" ]

        watch:
            files: "<config:lint.files>"
            tasks: "lint qunit"

        server:
            port: 8081
            base: DIST

        haml:
            dev:
                src: HAML_TO_HTML
                dest: DIST

        hamltojs:
            dev:
                src: HAML_TO_JS
                dest: DIST

        coffee:
            dev:
                src: COFFEE_TO_JS
                dest: DIST
                options:
                    bare: false

        recess:
            dev:
                src: LESS_TO_CSS
                dest: path.join(DIST, '/style.css')
                options:
                    compile: true

        jshint:
            options:
                curly: true
                eqeqeq: true
                immed: true
                latedef: true
                newcap: true
                noarg: true
                sub: true
                undef: true
                boss: true
                eqnull: true
                browser: true

        globals:
            jQuery: true

        requirejs:
            dir: "dist-compiled"
            appDir: "dist"
            baseUrl: "."
            paths:
                jquery: "../assets/jquery/jquery-1.7.2"
            pragmas:
                doExclude: true
            modules: [ name: "priority" ]
            skipModuleInsertion: false
            optimizeAllPluginResources: true
            findNestedDependencies: true

        install:
            src: [
                "assets/jquery/jquery-1.7.2.js"
                "assets/require.js"
                "assets/lawnchair/lawnchair.js"
                "assets/images/*.png"
            ]
            dest: "dist"

        mocha:
            src: [ "test/*_mocha.coffee" ]

        uglify: {}


    grunt.registerTask "default", "coffee:dev recess:dev haml:dev hamltojs:dev install"

    #  _  _   _   __  __ _      _         _  _ _____ __  __ _
    # | || | /_\ |  \/  | |    | |_ ___  | || |_   _|  \/  | |
    # | __ |/ _ \| |\/| | |__  |  _/ _ \ | __ | | | | |\/| | |__
    # |_||_/_/ \_\_|  |_|____|  \__\___/ |_||_| |_| |_|  |_|____|
    #

    grunt.registerHelper "haml", (src, dest, done) ->
        args =
          cmd: "haml"
          args: [ "--unix-newlines", "--no-escape-attrs", "--double-quote-attributes", src ]

        grunt.utils.spawn args, (err, result) ->
            console.log err  if err
            out = path.basename(src, ".haml")
            grunt.file.write path.join(dest, out + ".html"), result.stdout
            done()

    grunt.registerMultiTask "haml", "Compile HAML", ->
        done = @async()
        sources = grunt.file.expandFiles(this.file.src)
        dest = this.file.dest
        async.forEachSeries sources, ((path, cb) ->
            grunt.helper "haml", path, dest, cb
        ), done


    #  _  _ _____ __  __ _      _            _ ___
    # | || |_   _|  \/  | |    | |_ ___   _ | / __|
    # | __ | | | | |\/| | |__  |  _/ _ \ | || \__ \
    # |_||_| |_| |_|  |_|____|  \__\___/  \__/|___/
    #

    grunt.registerHelper "templatize", (src, dest, done) ->
        file = grunt.file.read(src)
        out = path.basename(src, ".html")
        grunt.file.write path.join(dest, out + ".js"), "define(function() { return " + _und.template(result.stdout).source + "});"
        done()

    grunt.registerMultiTask "templatize", "Compile Underscored HTML to Javascript", ->
        done = @async()
        sources = grunt.file.expandFiles(this.file.src)
        dest = this.file.dest
        return done()  if sources.length is 0
        async.forEachSeries sources, ((path, cb) ->
            grunt.helper "templatize", path, dest, cb
        ), done

    #  _  _   _   __  __ _      _            _ ___
    # | || | /_\ |  \/  | |    | |_ ___   _ | / __|
    # | __ |/ _ \| |\/| | |__  |  _/ _ \ | || \__ \
    # |_||_/_/ \_\_|  |_|____|  \__\___/  \__/|___/
    #

    grunt.registerHelper "hamltojs", (src, dest, done) ->
        args =
          cmd: "haml"
          args: [ "--unix-newlines", "--no-escape-attrs", "--double-quote-attributes", src ]

        grunt.utils.spawn args, (err, result) ->
            console.log err  if err
            out = path.basename(src, ".haml")
            grunt.file.write path.join(dest, out + ".js"), "define(function() { return " + _und.template(result.stdout).source + "});"
            done()

    grunt.registerMultiTask "hamltojs", "Compile Underscored HAML to Javascript", ->
        done = @async()
        sources = grunt.file.expandFiles(this.file.src)
        dest = this.file.dest
        return done()  if sources.length is 0
        async.forEachSeries sources, ((path, cb) ->
            grunt.helper "hamltojs", path, dest, cb
        ), done

    #   ___
    #  / __|___ _ __ _  _
    # | (__/ _ \ '_ \ || |
    #  \___\___/ .__/\_, |
    #          |_|   |__/

    grunt.registerHelper "install", (src, dest, done) ->
        grunt.file.copy src, path.join(dest, path.basename(src))
        done()  if done

    grunt.registerTask "install", ->
        sources = grunt.file.expandFiles(grunt.config([ @name, "src" ]))
        dest = grunt.config([ @name, "dest" ])
        sources.forEach (path) ->
            grunt.helper "install", path, dest, null

    #  __  __         _           _____       _
    # |  \/  |___  __| |_  __ _  |_   _|__ __| |_ ___
    # | |\/| / _ \/ _| ' \/ _` |   | |/ -_|_-<  _(_-<
    # |_|  |_\___/\__|_||_\__,_|   |_|\___/__/\__/__/
    #

    grunt.registerHelper "mocha", (command, test, done) ->
        args =
            cmd: "mocha"
            args: [ "--compilers", "coffee:coffee-script", "-R", "xunit", "-C", test ]

        grunt.utils.spawn args, (err, result) ->
            if err
                console.log err.stderr
                done()
                return
            fs.appendFileSync "tmp/results.xml", result.stdout
            done()

    grunt.registerTask "mocha", "Run Mocha Tests", ->
        done = @async()
        task = @name
        sources = grunt.file.expandFiles(grunt.config([ @name, "src" ]))
        dest = grunt.config([ @name, "dest" ])
        sources.sort()
        grunt.file.mkdir "tmp"
        fs.writeFileSync "tmp/results.xml", ""
        async.forEachSeries sources, ((path, cb) ->
            grunt.helper "mocha", grunt.config([ task, "cmd" ]), path, cb
        ), done

    #   ___              _    ___      __  __
    #  / __|_ _ _  _ _ _| |_ / __|___ / _|/ _|___ ___
    # | (_ | '_| || | ' \  _| (__/ _ \  _|  _/ -_) -_)
    #  \___|_|  \_,_|_||_\__|\___\___/_| |_| \___\___|
    #

    grunt.registerTask "gruntjs", "convert grunt.coffee to grunt.js", ->
        jFileName = path.join __dirname, "grunt.js"
        cFileName = path.join __dirname, "grunt.coffee"

        jStat = fs.statSync jFileName
        cStat = fs.statSync cFileName

        jmTime = jStat.mtime
        cmTime = cStat.mtime

        if cmTime < jmTime
            grunt.verbose.writeln "grunt.js newer than grunt.coffee, skipping compile"
            return

        cSource = fs.readFileSync cFileName, "utf-8"

        try
            jSource = coffee.compile cSource,
                bare: true
        catch e
            grunt.fail.fatal e

        fs.writeFileSync jFileName, jSource, "utf-8"

        grunt.log.writeln "compiled #{cFileName} to #{jFileName}"