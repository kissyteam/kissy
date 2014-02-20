/**
 * @ignore
 * load tpl from file in nodejs
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    /*global requireNode*/
    var fs = requireNode('fs');
    var iconv = requireNode('iconv-lite');
    var XTemplate = require('xtemplate');
    var cached = {};
    var globalConfig = {
        extname: 'html',
        encoding: 'utf-8'
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

    /**
     * load xtemplate from file on nodejs
     * @class KISSY.XTemplate.Nodejs
     * @singleton
     */
    return  {
        config: function (options) {
            S.mix(globalConfig, options);
        },

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
    };

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
            } else {
                var buf = fs.readFileSync(new S.Uri(module.getPath()).getPath());
                tpl = iconv.decode(buf, encoding);
            }

            if (cacheFile) {
                cached[subTplName] = tpl;
            }
            return tpl;
        };
    }
});