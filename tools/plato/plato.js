var walk = require('walk');
var plato = require('plato');
var path = require('path');
var fs = require('fs');
var util = require('../common/util');
var mkdirp = require('mkdirp');
var excludes = ['/demo/', '/meta/', '/tests/', '/coverage/'];
var fsExtra = require('fs-extra');

function normalizeSlash(str) {
    return str.replace(/\\/g, '/');
}

function run(moduleName, callback) {
    var srcPath = path.join(__dirname, '../../src/' + moduleName + '/');
    if (!fs.existsSync(srcPath)) {
        callback('not exists');
        return;
    }

//noinspection JSUnresolvedFunction
    var walker = walk.walk(srcPath);

    var reportsDir = path.join(__dirname, '../../reports/' + moduleName + '/');

    fsExtra.removeSync(reportsDir);

    mkdirp.sync(reportsDir);

    var jshintContent = fs.readFileSync(path.join(__dirname, '../../.jshintrc'), {
        encoding: 'utf-8'
    });

    var jshintrc = JSON.parse(jshintContent);

    var options = {
        title: moduleName + ' Complex Report',
        jshint: {
            options: jshintrc,
            globals: jshintrc.globals
        }
    };

    var files = [];

    walker.on('file', function (root, fileStats, next) {
        if (util.endsWith(fileStats.name, '.js')) {
            var filePath = normalizeSlash(root + '/' + fileStats.name);
            for (var i = 0; i < excludes.length; i++) {
                if (filePath.indexOf(excludes[i]) !== -1) {
                    next();
                    return;
                }
            }
            files.push(filePath);
        }
        next();
    }).on('end', function () {
        plato.inspect(files, reportsDir, options, callback);
    });
}

exports.run = run;