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
var instanceCache = {};

function getInstance(path, config, callback) {
    var cache = config.cache;
    if (cache && instanceCache[path]) {
        return callback(0, instanceCache[path]);
    }
    readFile(path, config.encoding, cache, function (error, tpl) {
        if (error) {
            callback(error);
        } else {
            var instance = new XTemplateNodejs(tpl, config);
            if (cache) {
                instanceCache[path] = instance;
            }
            callback(undefined, instance);
        }
    });
}

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

        getInstance(path, config, function (error, engine) {
            if (error) {
                callback(error);
            } else {
                engine.render(options, callback);
            }
        });
    } catch (e) {
        callback(e);
    }
}

function XTemplateNodejs() {
    XTemplateNodejs.superclass.constructor.apply(this, arguments);
}

S.extend(XTemplateNodejs, XTemplate, {
    getTplContent: function (path, callback) {
        this.extName = this.extName || Path.extname(this.config.name);
        path += this.extName;
        var rootConfig = this.config;
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

    __express: renderFile,

    clearCache: function (path) {
        var content = fileCache[path];
        delete instanceCache[path];
        if (content !== undefined) {
            delete fileCache[path];
            XTemplate.clearCache(content);
        }
    }
};

