var COFFEE_TO_JS, DIST, HAML_TO_HTML, HAML_TO_JS, LESS_TO_CSS, async, coffee, fs, path, _und;

path = require("path");

_und = require("underscore");

async = require("async");

fs = require("fs");

coffee = require('coffee-script');

HAML_TO_HTML = ['src/index.haml'];

HAML_TO_JS = ['src/*_tmpl.haml'];

LESS_TO_CSS = ['src/*.less'];

COFFEE_TO_JS = ['src/*.coffee'];

DIST = "./dist";

module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-coffee");
  grunt.loadNpmTasks("grunt-recess");
  grunt.loadNpmTasks("grunt-requirejs");
  grunt.initConfig({
    pkg: "<json:PriorityIgnore.json>",
    meta: {
      banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " + "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" + "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\n\" : \"\" %>" + "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>;" + " Licensed <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */"
    },
    qunit: {
      files: ["test/**/*.html"]
    },
    lint: {
      files: ["grunt.js", "src/**/*.js", "test/**/*.js"]
    },
    watch: {
      files: "<config:lint.files>",
      tasks: "lint qunit"
    },
    server: {
      port: 8081,
      base: DIST
    },
    haml: {
      dev: {
        src: HAML_TO_HTML,
        dest: DIST
      }
    },
    hamltojs: {
      dev: {
        src: HAML_TO_JS,
        dest: DIST
      }
    },
    coffee: {
      dev: {
        src: COFFEE_TO_JS,
        dest: DIST,
        options: {
          bare: false
        }
      }
    },
    recess: {
      dev: {
        src: LESS_TO_CSS,
        dest: path.join(DIST, '/style.css'),
        options: {
          compile: true
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
      }
    },
    globals: {
      jQuery: true
    },
    requirejs: {
      dir: "dist-compiled",
      appDir: "dist",
      baseUrl: ".",
      paths: {
        jquery: "../libs/jquery/jquery-1.7.2"
      },
      pragmas: {
        doExclude: true
      },
      modules: [
        {
          name: "priority"
        }
      ],
      skipModuleInsertion: false,
      optimizeAllPluginResources: true,
      findNestedDependencies: true
    },
    install: {
      src: ["libs/jquery/jquery-1.7.2.js", "libs/require.js", "libs/lawnchair/lawnchair.js"],
      dest: "dist"
    },
    mocha: {
      src: ["test/*_mocha.coffee"]
    },
    uglify: {}
  });
  grunt.registerTask("default", "coffee:dev recess:dev haml:dev hamltojs:dev install");
  grunt.registerHelper("haml", function(src, dest, done) {
    var args;
    args = {
      cmd: "haml",
      args: ["--unix-newlines", "--no-escape-attrs", "--double-quote-attributes", src]
    };
    return grunt.utils.spawn(args, function(err, result) {
      var out;
      if (err) {
        console.log(err);
      }
      out = path.basename(src, ".haml");
      grunt.file.write(path.join(dest, out + ".html"), result.stdout);
      return done();
    });
  });
  grunt.registerMultiTask("haml", "Compile HAML", function() {
    var dest, done, sources;
    done = this.async();
    sources = grunt.file.expandFiles(this.file.src);
    dest = this.file.dest;
    return async.forEachSeries(sources, (function(path, cb) {
      return grunt.helper("haml", path, dest, cb);
    }), done);
  });
  grunt.registerHelper("templatize", function(src, dest, done) {
    var file, out;
    file = grunt.file.read(src);
    out = path.basename(src, ".html");
    grunt.file.write(path.join(dest, out + ".js"), "define(function() { return " + _und.template(result.stdout).source + "});");
    return done();
  });
  grunt.registerMultiTask("templatize", "Compile Underscored HTML to Javascript", function() {
    var dest, done, sources;
    done = this.async();
    sources = grunt.file.expandFiles(this.file.src);
    dest = this.file.dest;
    if (sources.length === 0) {
      return done();
    }
    return async.forEachSeries(sources, (function(path, cb) {
      return grunt.helper("templatize", path, dest, cb);
    }), done);
  });
  grunt.registerHelper("hamltojs", function(src, dest, done) {
    var args;
    args = {
      cmd: "haml",
      args: ["--unix-newlines", "--no-escape-attrs", "--double-quote-attributes", src]
    };
    return grunt.utils.spawn(args, function(err, result) {
      var out;
      if (err) {
        console.log(err);
      }
      out = path.basename(src, ".haml");
      grunt.file.write(path.join(dest, out + ".js"), "define(function() { return " + _und.template(result.stdout).source + "});");
      return done();
    });
  });
  grunt.registerMultiTask("hamltojs", "Compile Underscored HAML to Javascript", function() {
    var dest, done, sources;
    done = this.async();
    sources = grunt.file.expandFiles(this.file.src);
    dest = this.file.dest;
    if (sources.length === 0) {
      return done();
    }
    return async.forEachSeries(sources, (function(path, cb) {
      return grunt.helper("hamltojs", path, dest, cb);
    }), done);
  });
  grunt.registerHelper("install", function(src, dest, done) {
    grunt.file.copy(src, path.join(dest, path.basename(src)));
    if (done) {
      return done();
    }
  });
  grunt.registerTask("install", function() {
    var dest, sources;
    sources = grunt.file.expandFiles(grunt.config([this.name, "src"]));
    dest = grunt.config([this.name, "dest"]);
    return sources.forEach(function(path) {
      return grunt.helper("install", path, dest, null);
    });
  });
  grunt.registerHelper("mocha", function(command, test, done) {
    var args;
    args = {
      cmd: "mocha",
      args: ["--compilers", "coffee:coffee-script", "-R", "xunit", "-C", test]
    };
    return grunt.utils.spawn(args, function(err, result) {
      if (err) {
        console.log(err.stderr);
        done();
        return;
      }
      fs.appendFileSync("tmp/results.xml", result.stdout);
      return done();
    });
  });
  grunt.registerTask("mocha", "Run Mocha Tests", function() {
    var dest, done, sources, task;
    done = this.async();
    task = this.name;
    sources = grunt.file.expandFiles(grunt.config([this.name, "src"]));
    dest = grunt.config([this.name, "dest"]);
    sources.sort();
    grunt.file.mkdir("tmp");
    fs.writeFileSync("tmp/results.xml", "");
    return async.forEachSeries(sources, (function(path, cb) {
      return grunt.helper("mocha", grunt.config([task, "cmd"]), path, cb);
    }), done);
  });
  return grunt.registerTask("gruntjs", "convert grunt.coffee to grunt.js", function() {
    var cFileName, cSource, cStat, cmTime, jFileName, jSource, jStat, jmTime;
    jFileName = path.join(__dirname, "grunt.js");
    cFileName = path.join(__dirname, "grunt.coffee");
    jStat = fs.statSync(jFileName);
    cStat = fs.statSync(cFileName);
    jmTime = jStat.mtime;
    cmTime = cStat.mtime;
    if (cmTime < jmTime) {
      grunt.verbose.writeln("grunt.js newer than grunt.coffee, skipping compile");
      return;
    }
    cSource = fs.readFileSync(cFileName, "utf-8");
    try {
      jSource = coffee.compile(cSource, {
        bare: true
      });
    } catch (e) {
      grunt.fail.fatal(e);
    }
    fs.writeFileSync(jFileName, jSource, "utf-8");
    return grunt.log.writeln("compiled " + cFileName + " to " + jFileName);
  });
};
