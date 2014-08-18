/**
 * combine kissy module and generate deps.json
 * @author yiminghe@gmail.com
 */
var fs = require('fs');
var esprima = require('esprima');
/*global S: true*/
/*jshint quotmark:false */
var S = require('../../build/seed-nodejs');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var wrapModule = require('../common/wrap-module');

function splitSlash(str) {
    var parts = str.split(/\//);
    if (str.charAt(0) === '/' && parts[0]) {
        parts.unshift('');
    }
    if (str.charAt(str.length - 1) === '/' && str.length > 1 && parts[parts.length - 1]) {
        parts.push('');
    }
    return parts;
}

function normalizePath(parentPath, subPath) {
    var firstChar = subPath.charAt(0);
    if (firstChar !== '.') {
        return subPath;
    }
    var parts = splitSlash(parentPath);
    var subParts = splitSlash(subPath);
    parts.pop();
    for (var i = 0, l = subParts.length; i < l; i++) {
        var subPart = subParts[i];
        if (subPart === '.') {
        } else if (subPart === '..') {
            parts.pop();
        } else {
            parts.push(subPart);
        }
    }
    return parts.join('/').replace(/\/+/, '/');
}

function findRequires(ast) {
    var requires = [];
    estraverse.traverse(ast, {
        enter: function (node) {
            if (node.type === 'CallExpression') {
                var callee = node.callee;
                if (callee.type === 'Identifier' && callee.name === 'require') {
                    var args = node['arguments'];
                    if (args.length === 1 && args[0].type === 'Literal') {
                        requires.push(args[0].value);
                    }
                }
            }
        }
    });
    return requires;
}

// add name
// add deps array
function completeFullModuleFormat(ast, name, requires) {
    var addArguments = ast.body[0].expression['arguments'];
    var elements = [];
    for (var i = 0; i < requires.length; i++) {
        elements.push({
            type: 'Literal',
            value: requires[i]
        });
    }
    addArguments.unshift({
        type: 'ArrayExpression',
        elements: elements
    });
    addArguments.unshift({
        type: 'Literal',
        value: name
    });
}

function compileModule(modName, codes, requires) {
    if (codes[modName] !== undefined) {
        return;
    }
    codes[modName] = '';
    var mod = S.getModule(modName);
    // xtemplate -> xtemplate/runtime
    if (mod.getPackage().name === 'core' || !fs.existsSync(mod.getUrl())) {
        return;
    }
    var code = fs.readFileSync(mod.getUrl());

    var ast = esprima.parse(code, {
        attachComment: true
    });

    ast = wrapModule.wrapModuleAst(ast);

    var modRequires = findRequires(ast);
    completeFullModuleFormat(ast, modName, modRequires);
    try {
        codes[modName] = escodegen.generate(ast, {
            comment: true
        });
    } catch (e) {
        console.log('escodegen error: ' + modName);
        //console.log(ast);
        throw e;
    }
    modRequires = modRequires.map(function (r) {
        return normalizePath(modName, r);
    });
    // record after normalize
    requires[modName] = modRequires.concat();
    modRequires.forEach(function (requireName) {
        compileModule(requireName, codes, requires);
    });
}

function optimizeRequires(requires) {
    var names = Object.keys(requires);
    var ret = [];
    for (var name in requires) {
        var modRequires = requires[name];
        for (var i = 0; i < modRequires.length; i++) {
            var modRequire = modRequires[i];
            if (ret.indexOf(modRequire) === -1 && names.indexOf(normalizePath(name, modRequire)) === -1) {
                ret.push(modRequire);
            }
        }
    }
    return ret;
}

function compile(main, packages, destFile, depFile) {
    S.config('packages', packages);
    var codes = {};
    var requires = {};
    compileModule(main, codes, requires);
    var mods = [];
    var header = ['/*', 'combined modules:'];
    var codeContent = [];
    for (var c in codes) {
        if (codes[c]) {
            mods.push(c);
        }
        codeContent.push(codes[c]);
    }
    header = header.concat(mods);
    header = header.concat(['*/']);
    codeContent = header.concat(codeContent);
    fs.writeFileSync(destFile, codeContent.join('\n'));
    console.log('generate combined file: ' + destFile);
    var optimizedRequires = optimizeRequires(requires);
    if (optimizedRequires.length) {
        requires = {
        };
        requires[main] = optimizedRequires;
        fs.writeFileSync(depFile, JSON.stringify(requires));
        console.log('generate deps file: ' + depFile);
    } else if (fs.existsSync(depFile)) {
        fs.unlinkSync(depFile);
    }
}

module.exports = compile;

// main module
if (require.main === module) {
    (function () {
        var path = require('path');
        var root = path.join(__dirname, '../../src/');
        var main = 'feature';
        var packages = {
            'feature': {
                base: path.join(root, 'feature/src/feature')
            }
        };

        compile(main, packages, 'e:/tmp/combine.js', 'e:/tmp/combine.json');
    })();
}

/*
 note:
 esprima bug:
 x represents *
 return /xx@type String x/y;
 become
 return /xx@type String x/
 y;
 */

