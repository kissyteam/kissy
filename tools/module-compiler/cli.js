/**
 * build a package by command line
 * @author yiminghe@gmail.com
 */
var Path = require('path');
var program = require('commander');
program
    .option('--packageName <packageName>')
    .option('--packageBase <packageBase>')
    .option('--destFile <destFile>')
    .option('--depFile <depFile>')
    .parse(process.argv);

var packageName = program.packageName;
var packageBase = program.packageBase;
var destFile = program.destFile;
var depFile = program.depFile;

packageBase = packageBase.replace(/\\/g, '/');

var compile = require('./compile');

compile(packageName, [{
    // 'event/base'
    'name': packageName,
    'path': packageBase + Path.basename(packageName)
}], destFile, depFile);