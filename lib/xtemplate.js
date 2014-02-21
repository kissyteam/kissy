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
var XTemplate = module.exports = S.nodeRequire('xtemplate');

var cached = {};

var globalConfig = {
    extname: 'html',
    encoding: 'utf-8'
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

function getLoader(cfg) {
    // cache also means cacheFile on server side
    var cacheFile = cfg.cache;
    var extname = cfg.extname;
    var encoding = cfg.encoding;

    return function (subTplName) {
        if (cacheFile && cached[subTplName]) {
            return cached[subTplName];
        }

        var module = new S.Loader.Module({
            name: subTplName,
            type: extname,
            runtime: S
        });

        var tpl;

        if (encoding === 'utf-8') {
            tpl = fs.readFileSync(new S.Uri(module.getPath()).getPath(), {
                encoding: 'utf-8'
            });
        } else if (iconv) {
            var buf = fs.readFileSync(new S.Uri(module.getPath()).getPath());
            tpl = iconv.decode(buf, encoding);
        } else {
            tpl = 'encoding: ' + encoding + ', npm install iconv-lite, please!';
        }

        if (cacheFile) {
            cached[subTplName] = tpl;
        }
        return tpl;
    };
}

function loadFromModuleName(moduleName, config) {
    config = merge(config);
    var loader = getLoader(config);
    config.name = moduleName;
    config.loader = loader;
    var tpl = loader(moduleName);
    delete config.extname;
    return new XTemplate(tpl, config);
}

function renderFile(path, options, callback) {
    // console.log(options);
    if (!packageSet) {
        packageSet = 1;
        S.config('packages', {
            'views': {
                base: (viewDir = Path.dirname(options.settings.views))
            }
        });
    }
    var extname = options.settings['view engine'];
    var moduleName = normalizeSlash(path.substring(viewDir.length + 1).slice(0, -extname.length - 1));
    try {
        callback(null, loadFromModuleName(moduleName, {
            cache: options.cache,
            extname: extname
        }).render(options));
    } catch (e) {
        callback(e);
    }
}

/**
 * load xtemplate from file on nodejs
 * @class KISSY.XTemplate.Nodejs
 * @singleton
 */
S.mix(XTemplate, {
    config: function (options) {
        S.mix(globalConfig, options);
    },

    __express: renderFile,

    /**
     * load xtemplate module on nodejs and return xtemplate instance
     * @param {String} moduleName xtemplate module name
     * @param config xtemplate config object
     * @param {String} [config.extname='html'] template file's extension name
     * @returns {KISSY.XTemplate} xtemplate instance
     */
    loadFromModuleName: function (moduleName, config) {
        config = merge(config);
        var loader = getLoader(config);
        config.name = moduleName;
        config.loader = loader;
        var tpl = loader(moduleName);
        delete config.extname;
        return new XTemplate(tpl, config);
    }
});

