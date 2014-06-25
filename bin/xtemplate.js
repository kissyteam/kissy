#!/usr/bin/env node
//noinspection JSUnresolvedFunction,JSUnresolvedVariable
/**
 * Generate xtemplate function by xtemplate file using kissy xtemplate.
 * @author yiminghe@gmail.com
 */
var program = require('commander');
var compileModuleCode = require('../lib/xtemplate/compile-module');
var encoding = 'utf-8';
var util = require('../lib/util'),
    chokidar = require('chokidar'),
    fs = require('fs'),
    path = require('path');

program
    .option('-p, --folderPath <folderPath>', 'Set template folder path')
    .option('-s, --suffix [suffix]', 'Set xtemplate file suffix', '')
    .option('-w, --watch', 'Watch xtemplate file change')
    .option('--no-kwrap', 'Wrap code by KISSY module')
    .parse(process.argv);

var options = program.options;

options.forEach(function (o) {
    var name = o.name();
    if (o.required && !(name in program)) {
        program.optionMissingArgument(o);
    }
});

var folderPath = program.folderPath,
    suffix = program.suffix || 'xtpl',
    kwrap = program.kwrap,
    cwd = process.cwd();

var suffixReg = new RegExp('\\.' + util.escapeRegExp(suffix) + '$', 'g');

folderPath = path.resolve(cwd, folderPath);


function normalizeSlash(str) {
    return str.replace(/\\/g, '/');
}

function compile(tplFilePath, modulePath, kwrap) {
    var moduleCode = compileModuleCode({
        kwrap: kwrap,
        encoding: encoding,
        path: tplFilePath
    });
    fs.writeFileSync(modulePath, moduleCode, encoding);
    console.info('generate xtpl module: ' + modulePath + ' at ' + (new Date().toLocaleString()));
}

function generate(filePath) {
    var modulePath;
    if (filePath.match(suffixReg)) {
        modulePath = filePath.replace(suffixReg, '.js');
        compile(filePath, modulePath, kwrap);
    }
}


if (program.watch) {
    var watcher = chokidar.watch(folderPath, {ignored: /^\./, persistent: true});
    watcher.on('add', generate).on('change', generate);
} else {
    var walk = require('walk');
    //noinspection JSUnresolvedFunction
    var walker = walk.walk(folderPath);
    walker.on('file', function (root, fileStats, next) {
        var filePath = normalizeSlash(root + '/' + fileStats.name);
        generate(filePath);
        next();
    });
}