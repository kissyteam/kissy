/**
 * gen package definition for develop mode
 * @author yiminghe@gmail.com
 */
/*jshint quotmark:false, camelcase:false*/
var cwd = normalizeSlash(process.cwd());
var path = require('path');
var startDir = normalizeSlash(path.resolve(cwd, 'src') + '/');
var base = '/kissy/src/';
var fs = require('fs');
var suffixLen = '/src'.length;
var header = [
    "/*",
    "    For dev mode only!" ,
    "*/" ,
    "/*jshint quotmark:false, unused:false*/",
    "KISSY.config('tag',+ new Date());" ,
    "var loc = location;",
    "if (loc.search.indexOf('build') === -1 && loc.search.indexOf('min') === -1) {",
    "KISSY.config('packages', "
].join('\n');

function normalizeSlash(str) {
    return str.replace(/\\/g, '/');
}

function collectSrcDir(dir, allSrc) {
    var files = fs.readdirSync(dir);
    files.forEach(function (f) {
        var c = dir + f;
        var state = fs.statSync(c);
        if (state.isDirectory()) {
            if (f === 'src' || f === 'assets') {
                c = c.replace(/\/-$/, '');
                allSrc.push(c);
            } else {
                collectSrcDir(c + '/', allSrc);
            }
        }
    });
}

module.exports = function () {
    var allSrc = [];
    collectSrcDir(startDir, allSrc);
    var mod = {};
    allSrc.forEach(function (v) {
        v = '/kissy/' + v.replace(cwd + '/', '');
        var name;
        if (path.basename(v) === 'src') {
            name = v.substring(base.length, v.length - suffixLen).replace(/\/-(\/|$)/, '$1');
            mod[name] = {
                base: v + '/' + path.basename(name)
            };
        } else {
            name = v.substring(base.length).replace(/\/-(\/|$)/, '$1');
            mod[name] = {
                base: v
            };
        }
    });
    return [header, JSON.stringify(mod, null, 4), ');}'].join('\n');
};
