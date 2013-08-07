/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 6 21:57
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 xtemplate/nodejs
*/

/**
 * load tpl from file in nodejs
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/nodejs', function (S, XTemplate) {
    var fs = require('fs');
    var cached = {};

    return  {
        loadFromModuleName: function (moduleName, config) {
            config = S.merge(config, {
                cacheFile: 1
            });
            config.extname = config.extname || 'html';
            var loader = getLoader(config);
            config.name = moduleName;
            config.loader = loader;
            var tpl = loader(moduleName);
            delete config.extname;
            return new XTemplate(tpl, config);
        }
    };

    function getLoader(cfg) {
        var cacheFile = cfg.cacheFile;
        var extname = cfg.extname;
        return function (subTplName) {
            if (cacheFile && cached[subTplName]) {
                return cached[subTplName];
            }
            var module = new S.Loader.Module({
                name: subTplName,
                type: extname,
                runtime: S
            });

            var tpl = fs.readFileSync(new S.Uri(module.getFullPath()).getPath(), {
                encoding: 'utf-8'
            });
            if (cacheFile) {
                cached[subTplName] = tpl;
            }
            return tpl;
        }
    }
}, {
    requires: ['xtemplate']
});

