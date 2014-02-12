//noinspection JSUnresolvedVariable
var currentDir = __dirname;
var S = require(process.cwd() + '/build/kissy-nodejs.js');
var XTemplateNodeJs = S.nodeRequire('xtemplate/nodejs');
var packageSet = 0;
var Path = require('path');

function normalizeSlash(str) {
    return str.replace(/\\/g, '/');
}

exports.renderFile = function (path, options, callback) {
    // console.log(options);
    if (!packageSet) {
        packageSet = 1;
        S.config('packages', {
            'views': {
                base: Path.dirname(options.settings.views)
            }
        });
    }
    var extname = options.settings['view engine'];
    var moduleName = normalizeSlash(path.substring(currentDir.length + 1).slice(0, -extname.length - 1));
    try {
        callback(null, XTemplateNodeJs.loadFromModuleName(moduleName, {
            cache: options.cache,
            extname: extname
        }).render(options));
    } catch (e) {
        callback(e);
    }
};