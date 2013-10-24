var path = require('path');
var cwd = normalizeSlash(process.cwd());
var apiDir = normalizeSlash(path.resolve(cwd, '../../kissyteam.github.com/1.4/api') + '/');
var srcDir = normalizeSlash(path.resolve(cwd, 'src') + '/');
var jsduckDir = normalizeSlash(path.resolve(cwd, 'tools/jsduck') + '/');
var saveTo = jsduckDir + 'jsduck.json';
var tplJson = jsduckDir + 'jsduck.tpl.json';
var base = '/kissy/src/';
var fs = require('fs-extra');
var S = global.KISSY = global.S = require(cwd + '/build/kissy-nodejs');
var config = JSON.parse(fs.readFileSync(tplJson, {
    encoding: 'utf-8'
}));
var request = require('request');

function normalizeSlash(str) {
    return str.replace(/\\/g, '/');
}

function collectSrcDir(dir, allSrc) {
    var files = fs.readdirSync(dir);
    files.forEach(function (f) {
        var c = dir + f;
        var state = fs.statSync(c);
        if (state.isDirectory()) {
            if (f == 'src') {
                allSrc.push(normalizeSlash(path.relative(jsduckDir, c)));
            } else if (f != 'coverage') {
                collectSrcDir(c + '/', allSrc);
            }
        }
    });
}

var js_beautify = require('js-beautify').js_beautify;

function my_js_beautify(str) {
    var opts = {
        'indent_size': '4',
        'indent_char': ' ',
        'preserve_newlines': true,
        'brace_style': 'collapse',
        'keep_array_indentation': false,
        "wrap_line_length": 40,
        'space_after_anon_function': true
    };
    return js_beautify(str, opts);
}

var allSrc = [];

collectSrcDir(srcDir, allSrc);

config['--'] = allSrc;

fs.writeFileSync(saveTo, my_js_beautify(JSON.stringify(config)));

console.log('saved to: ' + saveTo);

var jsduckExe = 'd:/Program Files (x86)/jsduck-5.2/jsduck.exe';
var spawn = require('child_process').spawn,
    jsduck = spawn(jsduckExe, [], {
        cwd: jsduckDir
    });

jsduck.stdout.on('data', function (data) {
    console.log('jsduck out: ' + data);
});

jsduck.stderr.on('data', function (data) {
    console.log('jsduck error: ' + data);
});

jsduck.on('close', function (code) {
    console.log('jsduck exited with code ' + code);
    postDoc();
});

function postDoc() {
    fs.copySync(jsduckDir + 'template', cwd + '/docs/');
    fs.unlinkSync(apiDir)
    fs.copySync(cwd + '/docs/', apiDir);
}