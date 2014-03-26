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
    extName: 'html',
    encoding: 'utf-8',
    cache: false
};

var packageSet, viewDir;
var Path = require('path');

function normalizeSlash(str) {
    return str.replace(/\\/g, '/');
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

function renderFile(path, options, callback) {
    if (!packageSet) {
        packageSet = 1;
        S.config('packages', {
            'views': {
                base: (viewDir = Path.dirname(options.settings.views)).replace(/\\/g,'/')
            }
        });
    }
    var extName = options.settings['view engine'];
    var encoding = options.settings['view encoding'];
    var moduleName = normalizeSlash(path.substring(viewDir.length + 1).slice(0, -extName.length - 1));
    try {
        var config = {
            cacheFile: options.cache,
            extName: extName
        };
        if (encoding) {
            config.encoding = encoding;
        }
        loadFromModuleName(moduleName, config, true).render(options, callback);
    } catch (e) {
        callback(e);
    }
}

function XTemplateNodejs() {
    XTemplateNodejs.superclass.constructor.apply(this, arguments);
}

function findTpl(moduleName, extName, encoding) {
    var module = new S.Loader.Module({
        name: moduleName,
        type: extName,
        runtime: S
    });

    var tpl;

    if (encoding === 'utf-8') {
        tpl = fs.readFileSync(module.getUrl(), {
            encoding: 'utf-8'
        });
    } else if (iconv) {
        var buf = fs.readFileSync(module.getUrl());
        tpl = iconv.decode(buf, encoding);
    } else {
        tpl = 'encoding: ' + encoding + ', npm install iconv-lite, please!';
    }
    return tpl;
}

S.extend(XTemplateNodejs, XTemplate, {
    load: function (subTplName) {
        return loadFromModuleName(subTplName, this.config, false);
    }
});

function loadFromModuleName(moduleName, config, init) {
    var cacheFile = config && config.cacheFile;
    if (cacheFile && cached[moduleName]) {
        return cached[moduleName];
    }
    if (init) {
        config = merge(config);
    }
    var tpl = findTpl(moduleName, config.extName, config.encoding);
    var ret = new XTemplateNodejs(tpl, config);
    ret.name = moduleName;
    if (cacheFile) {
        cached[moduleName] = ret;
    }
    return ret;
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
     * load xtemplate module on nodejs and return xtemplate instance
     * @param {String} moduleName xtemplate module name
     * @param config xtemplate config object
     * @param {String} [config.extName='html'] template file's extension name
     * @returns {KISSY.XTemplate} xtemplate instance
     */
    loadFromModuleName: function (moduleName, config) {
        return loadFromModuleName(moduleName, config, true);
    }
};

