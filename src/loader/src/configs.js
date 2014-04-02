/**
 * @ignore
 * Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Package = Loader.Package,
        Utils = Loader.Utils,
        host = S.Env.host,
        Config = S.Config,
        location = host.location,
        locationPath = '',
        configFns = Config.fns;

    if (location) {
        locationPath = location.protocol + '//' + location.host + location.pathname;
    }

    // how to load mods by path
    Config.loadModsFn = function (rs, config) {
        S.getScript(rs.url, config);
    };

    // how to get mod url
    Config.resolveModFn = function (mod) {
        var name = mod.name,
            min = '-min',
            t, url, subPath;
        var packageInfo = mod.getPackage();
        var packageBase = packageInfo.getBase();
        var packageName = packageInfo.getName();
        var extname = '.' + mod.getType();
        // special for css module
        name = name.replace(/\.css$/, '');
        if (packageInfo.isDebug()) {
            min = '';
        }

        // packageName: a/y use('a/y');
        if (name === packageName) {
            url = packageBase.substring(0, packageBase.length - 1) + min + extname;
        } else {
            subPath = name + min + extname;
            if (packageName) {
                subPath = subPath.substring(packageName.length + 1);
            }
            url = packageBase + subPath;
        }

        if ((t = mod.getTag())) {
            t += '.' + mod.getType();
            url += '?t=' + t;
        }
        return url;
    };

    configFns.core = function (cfg) {
        var base = cfg.base;
        var corePackage = Config.corePackage;
        if (base) {
            cfg.base = normalizePath(base, true);
        }
        if (!corePackage) {
            corePackage = Config.corePackage = new Package({
                name: ''
            });
        }
        corePackage.reset(cfg);
    };

    configFns.requires = shortcut('requires');

    configFns.alias = shortcut('alias');

    configFns.packages = function (config) {
        var Config = this.Config,
            ps = Config.packages = Config.packages || {};
        if (config) {
            Utils.each(config, function (cfg, key) {
                // object type
                var name = cfg.name = cfg.name || key;
                var base = cfg.base || cfg.path;
                if (base) {
                    cfg.base = normalizePath(base, true);
                }
                if (ps[name]) {
                    ps[name].reset(cfg);
                } else {
                    ps[name] = new Package(cfg);
                }
            });
            return undefined;
        } else if (config === false) {
            Config.packages = {};
            return undefined;
        } else {
            return ps;
        }
    };

    configFns.modules = function (modules) {
        if (modules) {
            Utils.each(modules, function (modCfg, modName) {
                var url = modCfg.url;
                if (url) {
                    modCfg.url = normalizePath(url);
                }
                var mod = Utils.createModuleInfo(modName, modCfg);
                // #485, invalid after add
                if (mod.status === Loader.Status.INIT) {
                    Utils.mix(mod, modCfg);
                }
            });
        }
    };

    configFns.base = function (base) {
        var self = this,
            corePackage = Config.corePackage;

        if (!base) {
            return corePackage && corePackage.getBase();
        }

        self.config('core', {
            base: base
        });

        return undefined;
    };

    function shortcut(attr) {
        return function (config) {
            var newCfg = {};
            for (var name in config) {
                newCfg[name] = {};
                newCfg[name][attr] = config[name];
            }
            S.config('modules', newCfg);
        };
    }

    function normalizePath(base, isDirectory) {
        if (base.indexOf('\\') !== -1) {
            base = base.replace(/\\/g, '/');
        }
        if (isDirectory && base.charAt(base.length - 1) !== '/') {
            base += '/';
        }
        if (locationPath) {
            if (base.charAt(0) === '/') {
                base = location.protocol + '//' + location.host + base;
            } else {
                base = Utils.normalizePath(locationPath, base);
            }
        }
        return base;
    }
})(KISSY);
