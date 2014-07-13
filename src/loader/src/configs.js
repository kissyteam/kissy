/**
 * @ignore
 * Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    var Loader = S.Loader,
        Package = Loader.Package,
        Utils = Loader.Utils,
        host = S.Env.host,
        Config = S.Config,
        location = host.location,
        configFns = Config.fns;

    // how to load mods by path
    Config.loadModsFn = function (rs, config) {
        S.getScript(rs.url, config);
    };

    // how to get mod url
    Config.resolveModFn = function (mod) {
        var name = mod.name,
            filter, t, url,
        // deprecated! do not use path config
            subPath = mod.path;
        var packageInfo = mod.getPackage();

        if (!packageInfo) {
            return name;
        }

        var packageBase = packageInfo.getBase();
        var packageName = packageInfo.name;
        var extname = mod.getType();
        var suffix = '.' + extname;

        if (!subPath) {
            // special for css module
            name = name.replace(/\.css$/, '');
            filter = packageInfo.getFilter() || '';

            if (typeof filter === 'function') {
                subPath = filter(name, extname);
            } else if (typeof filter === 'string') {
                if (filter) {
                    filter = '-' + filter;
                }
                subPath = name + filter + suffix;
            }
        }

        // core package
        if (packageName === 'core') {
            url = packageBase + subPath;
        } else if (name === packageName) {
            // packageName: a/y use('a/y');
            // do not use this on production, can not be combo ed with other modules from same package
            url = packageBase.substring(0, packageBase.length - 1) + filter + suffix;
        } else {
            subPath = subPath.substring(packageName.length + 1);
            url = packageBase + subPath;
        }

        if ((t = mod.getTag())) {
            t += suffix;
            url += '?t=' + t;
        }
        return url;
    };

    configFns.requires = shortcut('requires');

    configFns.alias = shortcut('alias');

    configFns.packages = function (config) {
        var Config = this.Config,
            packages = Config.packages;
        if (config) {
            Utils.each(config, function (cfg, key) {
                // object type
                var name = cfg.name = cfg.name || key;
                var base = cfg.base || cfg.path;
                if (base) {
                    cfg.base = normalizePath(base, true);
                }
                if (packages[name]) {
                    packages[name].reset(cfg);
                } else {
                    packages[name] = new Package(cfg);
                }
            });
            return undefined;
        } else if (config === false) {
            Config.packages = {
                core: packages.core
            };
            return undefined;
        } else {
            return packages;
        }
    };

    configFns.modules = function (modules) {
        if (modules) {
            Utils.each(modules, function (modCfg, modName) {
                var url = modCfg.url;
                if (url) {
                    modCfg.url = normalizePath(url);
                }
                var mod = Utils.createModule(modName, modCfg);
                // #485, invalid after add
                if (mod.status === Loader.Status.INIT) {
                    Utils.mix(mod, modCfg);
                }
            });
        }
    };

    configFns.base = function (base) {
        var self = this,
            corePackage = Config.packages.core;

        if (!base) {
            return corePackage && corePackage.getBase();
        }

        self.config('packages', {
            core: {
                base: base
            }
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
        base = Utils.normalizeSlash(base);
        if (isDirectory && base.charAt(base.length - 1) !== '/') {
            base += '/';
        }
        if (location) {
            if (Utils.startsWith(base, 'http:') ||
                Utils.startsWith(base, 'https:') ||
                Utils.startsWith(base, 'file:')) {
                return base;
            }
            base = location.protocol + '//' + location.host + Utils.normalizePath(location.pathname, base);
        }
        return base;
    }
})(KISSY);
