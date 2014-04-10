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
var HEAD = isModule ? 'KISSY.add(function(S){' : '(function(S){';
var FOOT = isModule ? '});' : '})(KISSY);';
var requireFiles = [];
var jsFiles = [];

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
            var file = files[i];
            if (file === 'deps.json') {
                requireFiles.push(name);
            } else if (S.endsWith(file, '.js')) {
                jsFiles.push(name);
            }
        }
    }
}

getFiles(dir);

var requires = {};
var jsCode = [''];

S.each(requireFiles, function (r) {
    /*jshint evil:true */
    S.mix(requires, eval('(' + fs.readFileSync(r, {
        encoding: 'utf-8'
    }) + ')'));
});

requires = require('deps-optimizer').optimize(requires);

S.each(jsFiles, function (r) {
    jsCode.push(fs.readFileSync(r, {
        encoding: 'utf-8'
    }));
});

var code = ['S.config("requires",' + JSON.stringify(requires, undefined, 4) + ');'];

if (S.trim(jsCode)) {
    code = code.concat(['var Feature = S.Feature,',
        '    UA = S.UA,',
        '    win = window,',
        '    isTouchGestureSupported = Feature.isTouchGestureSupported(),',
        '    add = S.add,',
        '    emptyObject = {};',
    '']);
    code = code.concat(['function alias(name, aliasName) {',
        '   var cfg;',
        '   if(typeof name ==="string") {' ,
        '       cfg = {};' ,
        '       cfg[name] = aliasName;',
        '   } else {' ,
        '       cfg = name;',
        '   }',
        '   S.config("alias", cfg);' ,
        '}']);
    code = code.concat(jsCode);
}

code = ['/*jshint indent:false, quotmark:false*/', HEAD].concat(code).concat(FOOT);

fs.writeFileSync(output, code.join('\n'));