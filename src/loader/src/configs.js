/**
 * @ignore
 * Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Path = S.Path,
        Package = Loader.Package,
        Utils = Loader.Utils,
        host = S.Env.host,
        Config = S.Config,
        location = host.location,
        simulatedLocation,
        locationHref,
        configFns = Config.fns;

    if (location && (locationHref = location.href)) {
        simulatedLocation = new S.Uri(locationHref);
    }

    // how to load mods by path
    Config.loadModsFn = function (rs, config) {
        S.getScript(rs.path, config);
    };

    // how to get mod uri
    Config.resolveModFn = function (mod) {
        var name = mod.name,
            min = '-min',
            t, subPath;

        var packageInfo = mod.getPackage();
        var packageUri = packageInfo.getUri();
        var packageName = packageInfo.getName();
        var extname = '.' + mod.getType();

        name = Path.join(Path.dirname(name), Path.basename(name, extname));

        if (packageInfo.isDebug()) {
            min = '';
        }

        subPath = name + min + extname;
        if (packageName) {
            subPath = Path.relative(packageName, subPath);
        }
        var uri = packageUri.resolve(subPath);
        if ((t = mod.getTag())) {
            t += '.' + mod.getType();
            uri.query.set('t', t);
        }
        return uri;
    };

    var PACKAGE_MEMBERS = ['alias', 'debug', 'tag', 'group', 'combine', 'charset'];

    configFns.core = function (cfg) {
        var base = cfg.base;
        if (base) {
            cfg.uri = normalizePath(base, true);
            delete cfg.base;
        }
        this.Env.corePackage.reset(cfg);
    };

    configFns.packages = function (config) {
        var name,
            Config = this.Config,
            ps = Config.packages = Config.packages || {};
        if (config) {
            S.each(config, function (cfg, key) {
                // 兼容数组方式
                name = cfg.name || key;
                var path = cfg.base || cfg.path;
                var newConfig = {
                    name: name
                };
                S.each(PACKAGE_MEMBERS, function (m) {
                    if (m in cfg) {
                        newConfig[m] = cfg[m];
                    }
                });
                if (path) {
                    path += '/';
                    if (!cfg.ignorePackageNameInUri) {
                        path += name + '/';
                    }
                    newConfig.uri = normalizePath(path, true);
                }
                if (ps[name]) {
                    ps[name].reset(newConfig);
                } else {
                    ps[name] = new Package(newConfig);
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
            S.each(modules, function (modCfg, modName) {
                var path = modCfg.path;
                if (path) {
                    modCfg.uri = normalizePath(path);
                    delete modCfg.path;
                }
                var mod = Utils.createModuleInfo(modName, modCfg);
                // #485, invalid after add
                if (mod.status === Loader.Status.INIT) {
                    S.mix(mod, modCfg);
                }
            });
        }
    };

    configFns.base = function (base) {
        var self = this,
            Config = self.Config,
            baseUri;

        if (!base) {
            return Config.baseUri.toString();
        }

        baseUri = normalizePath(base, true);
        Config.baseUri = baseUri;

        var corePackage = self.Env.corePackage;

        if (!corePackage) {
            corePackage = self.Env.corePackage = new Package({
                name: ''
            });
        }

        corePackage.uri = baseUri;

        return undefined;
    };

    function normalizePath(base, isDirectory) {
        var baseUri;
        base = base.replace(/\\/g, '/');
        if (isDirectory && base.charAt(base.length - 1) !== '/') {
            base += '/';
        }
        if (simulatedLocation) {
            baseUri = simulatedLocation.resolve(base);
        } else {
            // add scheme for S.Uri
            // currently only for nodejs
            if (!S.startsWith(base, 'file:')) {
                base = 'file:' + base;
            }
            baseUri = new S.Uri(base);
        }
        return baseUri;
    }
})(KISSY);
