/**
 * combine kissy module and generate deps.json
 * @type {exports}
 */
var fs = require('fs');
var esprima = require('esprima');
var S = require('../../lib/seed');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var normalizePath = S.Loader.Utils.normalizePath;

function findRequires(ast) {
    var requires = [];
    estraverse.traverse(ast, {
        enter: function (node) {
            if (node.type === 'CallExpression') {
                var callee = node.callee;
                if (callee.type === 'Identifier' && callee.name === 'require') {
                    requires.push(node['arguments'][0].value);
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
    if (!fs.existsSync(mod.getUrl())) {
        return;
    }
    var code = fs.readFileSync(mod.getUrl());
    var ast = esprima.parse(code, {
        attachComment: true
    });
    var modRequires = findRequires(ast);
    completeFullModuleFormat(ast, modName, modRequires);
    codes[modName] = escodegen.generate(ast, {
        comment: ast.comments
    });
    requires[modName] = modRequires.concat();
    S.Loader.Utils.normalDepModuleName(modName, modRequires);
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
    var backup = {
        packages: S.config('packages'),
        mods: S.Env.mods
    };
    S.Env.mods = {};
    S.config('packages', false);
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
    S.Env.mods = backup.mods;
    S.config('packages', backup.packages);
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

