/**
 * @ignore
 * load tpl from file in nodejs
 * @author yiminghe@gmail.com
 */
var S = require('./seed');
var fs = require('fs');
var iconv;
try {
    iconv = require('iconv-lite');
} catch (e) {
}
var XTemplate = S.nodeRequire('xtemplate');

var cached = {};

var globalConfig = {
    extName: '.html',
    encoding: 'utf-8',
    cache: false
};

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

function renderFile(path, options, callback) {
    if (path.indexOf('\\') !== -1) {
        path = path.replace(/\\/g, '/');
    }
    var extName = '.' + options.settings['view engine'];
    var encoding = options.settings['view encoding'];
    try {
        var config = {
            cacheFile: options.cache,
            extName: extName
        };
        if (encoding) {
            config.encoding = encoding;
        }
        load(path, merge(config), function (error, engine) {
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
    load: function (path, callback) {
        path += this.config.extName;
        return load(path, this.config, callback);
    }
});

function load(path, config, callback) {
    var cacheFile = config && config.cacheFile;

    if (cacheFile && cached[path]) {
        callback(undefined, cached[path]);
        return;
    }

    function run(error, tpl) {
        if (error) {
            callback(error);
        } else {
            var engine = new XTemplateNodejs(tpl, config);
            engine.name = path;
            if (cacheFile) {
                cached[path] = engine;
            }
            callback(undefined, engine);
        }
    }

    var encoding = config.encoding;

    if (encoding === 'utf-8') {
        fs.readFile(path, {
            encoding: encoding
        }, run);
    } else if (iconv) {
        fs.readFile(path, function (error, buf) {
            if (error) {
                callback(error);
            } else {
                run(undefined, iconv.decode(buf, encoding));
            }
        });
    } else {
        callback('encoding: ' + encoding + ', npm install iconv-lite, please!');
    }
}

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

    /**
     * load templates on nodejs and return xtemplate instance
     * @param {String} path
     * @param config xtemplate config object
     * @param {String} [config.extName='html'] template file's extension name
     * @param {Function} callback
     * @returns {KISSY.XTemplate} xtemplate instance
     */
    load: function (path, config, callback) {
        return load(path, merge(config), callback);
    },

    'clearCache': function (moduleName) {
        if (moduleName) {
            cached[moduleName] = null;
        } else {
            cached = {};
        }
    }
};

