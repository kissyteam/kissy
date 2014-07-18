var path = require('path');
var XTemplateCompiler = require('../../lib/xtemplate').Compiler;
var fs = require('fs');
var esprima = require('esprima');
var escodegen = require('escodegen');

var header = [
    '/* Compiled By XTemplate */',
    '/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/'
].join('\n');
var kwrapHeader = 'KISSY.add(function(S,require,exports,module){';
var kwrapFooter = '});';

function myJsBeautify(str) {
    try {
        return escodegen.generate(esprima.parse(str, {
            attachComment: true
        }), {
            comment: true
        });
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
    var functionCode = XTemplateCompiler.compileToStr({
        content: tplContent,
        name: path,
        isModule: true,
        functionName: functionName
    });
    var codes = [
        header,
            'module.exports = ' + functionCode + ';',
        'module.exports.TPL_NAME = module.name;'
    ];
    if (kwrap) {
        codes.unshift(kwrapHeader);
        codes.push(kwrapFooter);
    }
    return myJsBeautify(codes.join('\n'));
}

module.exports = compile;