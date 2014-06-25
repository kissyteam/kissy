var path = require('path');
var XTemplateCompiler = require('../xtemplate').Compiler;
var fs = require('fs');
var esprima = require('esprima');
var escodegen = require('escodegen');

var jshint = '/*jshint quotmark:false, loopfunc:true, ' +
    'indent:false, asi:true, unused:false, boss:true, sub:true*/\n';

function myJsBeautify(str) {
    try {
        return escodegen.generate(esprima.parse(str));
    } catch (e) {
        console.log('syntax error: ');
        console.log(str);
        throw e;
    }
}

function getFunctionName(name) {
    name = path.basename(name, path.extname(name));
    name = name.replace(/[-.]([a-z])/ig, function () {
        return arguments[1].toUpperCase();
    });
    return name;
}

function compile(cfg) {
    if (typeof cfg === 'string') {
        cfg = {
            path: cfg
        };
    }
    var kwrap = cfg.kwrap;
    var path = cfg.path;
    var tplContent = fs.readFileSync(path, cfg.encoding || 'utf-8');
    var functionName = getFunctionName(path);
    return '/** Compiled By xtpl */\n' +
        myJsBeautify((kwrap ? 'KISSY.add(function(S,require,exports,module){\n' : '') +
            jshint +
            'var ' + functionName + ' = ' +
            XTemplateCompiler.compileToStr(tplContent, path, true) + ';\n' +
            functionName + '.TPL_NAME = module.name;\n' +
            'module.exports = ' + functionName + ';\n' +
            (kwrap ? '});' : ''));
}

module.exports = compile;