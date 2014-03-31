var fs = require('fs');
var path = require('path');
var dirname = __dirname;
var root = path.join(dirname, '../../');
var S = require(path.join(root, 'lib/seed.js'));
var program = require(path.join(root, 'bin/lib/commander.js'));

program.option('--suffix [suffix]')
    .option('--dir [dir]')
    .option('--module')
    .option('--output <output>')
    .parse(process.argv);

var suffix = program.suffix || '/meta';
var isModule = program.module;
var output = program.output;
var dir = program.dir || path.join(root, 'src/');
var HEAD = isModule ? 'KISSY.add(function(S){\n' : '(function(S){\n';
var FOOT = isModule ? '\n});' : '\n})(KISSY);';
var requireFiles = [];
var aliasFiles = [];

function getFiles(dir) {
    var files = fs.readdirSync(dir);
    for (var i in files) {
        if (!files.hasOwnProperty(i)) {
            continue;
        }
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name);
        } else if (S.endsWith(dir, suffix)) {
            if (files[i] === 'deps.json') {
                requireFiles.push(name);
            } else if (files[i] === 'alias.js') {
                aliasFiles.push(name);
            }
        }
    }
}

getFiles(dir);

var requires = {};
var aliasCode = '';

S.each(requireFiles, function (r) {
    /*jshint evil:true */
    S.mix(requires, eval('(' + fs.readFileSync(r, {
        encoding: 'utf-8'
    }) + ')'));
});

requires = require('deps-optimizer').optimize(requires);

S.each(aliasFiles, function (r) {
    aliasCode += fs.readFileSync(r, {
        encoding: 'utf-8'
    }) + '\n';
});

var code = 'S.config("requires",' + JSON.stringify(requires, undefined, 4) + ');\n';

if (S.trim(aliasCode)) {
    code += 'var Feature = S.Feature, UA = S.UA;\n';
    code += 'function alias(cfg) {\n' +
        '    S.config("alias", cfg);\n' +
        '}\n';
    code += aliasCode;
}

fs.writeFileSync(output, '/*jshint indent:false, quotmark:false*/\n' + HEAD + code + FOOT);