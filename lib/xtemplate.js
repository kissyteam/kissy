/**
 * @ignore
 * load tpl from file in nodejs
 * @author yiminghe@gmail.com
 */
var S = require('./seed');
var fs = require('fs');
var Path = require('path');
var iconv;
try {
    iconv = require('iconv-lite');
} catch (e) {
}
var XTemplate = S.nodeRequire('xtemplate');

var globalConfig = {
    encoding: 'utf-8'
};

function normalizeSlash(path) {
    if (path.indexOf('\\') !== -1) {
        path = path.replace(/\\/g, '/');
    }
    return path;
}

function merge(config) {
    var ret = {};
    for (var i in globalConfig) {
        ret[i] = globalConfig[i];
    }
    if (config) {
        for (i in config) {
            ret[i] = config[i];
        }
    }
    return ret;
}

var fileCache = {};

function readFile(path, encoding, cache, callback) {
    if (cache && fileCache[path]) {
        return callback(null, fileCache[path]);
    }
    if (encoding === 'utf-8') {
        fs.readFile(path, {
            encoding: encoding
        }, function (error, content) {
            if (error) {
                callback(error);
            } else {
                if (cache) {
                    fileCache[path] = content;
                }
                callback(undefined, content);
            }
        });
    } else if (iconv) {
        fs.readFile(path, function (error, buf) {
            if (error) {
                callback(error);
            } else {
                var content = iconv.decode(buf, encoding);
                if (cache) {
                    fileCache[path] = content;
                }
                callback(undefined, content);
            }
        });
    } else {
        callback('encoding: ' + encoding + ', npm install iconv-lite, please!');
    }
}

function renderFile(path, options, callback) {
    path = normalizeSlash(path);
    var encoding = options.settings['view encoding'];

    try {
        var config = {
            name: path,
            cache: options.cache
        };
        if (encoding) {
            config.encoding = encoding;
        }

        config = merge(config);

        if (XTemplate.pool.hasInstance(path)) {
            XTemplate.pool.getInstance(undefined, config, XTemplateNodejs).render(options, callback);
        } else {
            readFile(path, config.encoding, config.cache, function (error, tpl) {
                if (error) {
                    callback(error);
                } else {
                    XTemplate.pool.getInstance(tpl, config, XTemplateNodejs).render(options, callback);
                }
            });
        }
    } catch (e) {
        callback(e);
    }
}

function XTemplateNodejs() {
    XTemplateNodejs.superclass.constructor.apply(this, arguments);
}

S.extend(XTemplateNodejs, XTemplate, {
    load: function (path, session, callback) {
        path += Path.extname(this.name);
        XTemplateNodejs.superclass.load.call(this, path, session, callback);
    },
    loadContent: function (path, callback) {
        var rootConfig = this.getRoot().config;
        readFile(path, rootConfig.encoding, rootConfig.cache, callback);
    }
});

/**
 * load xtemplate from file on nodejs
 * @singleton
 */
module.exports = {
    config: function (options) {
        S.mix(globalConfig, options);
    },

    XTemplate: XTemplate,

    __express: renderFile
};

