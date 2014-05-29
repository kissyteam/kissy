/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Config = S.Config,
        Status = Loader.Status,
        ATTACHED = Status.ATTACHED,
        ATTACHING = Status.ATTACHING,
        Utils = Loader.Utils,
        createModule = Utils.createModule,
        mix = Utils.mix;

    function checkGlobalIfNotExist(self, property) {
        return property in self ? self[property] : Config[property];
    }

    /**
     * @class KISSY.Loader.Package
     * @private
     * This class should not be instantiated manually.
     */
    function Package(cfg) {
        mix(this, cfg);
    }

    Package.prototype = {
        constructor: Package,

        reset: function (cfg) {
            mix(this, cfg);
        },

        getFilter: function () {
            return checkGlobalIfNotExist(this, 'filter');
        },

        /**
         * Tag for package.
         * tag can not contain ".", eg: Math.random() !
         * @return {String}
         */
        getTag: function () {
            return checkGlobalIfNotExist(this, 'tag');
        },

        /**
         * get package url
         */
        getBase: function () {
            return this.base;
        },

        /**
         * Get charset for package.
         * @return {String}
         */
        getCharset: function () {
            return checkGlobalIfNotExist(this, 'charset');
        },

        /**
         * Whether modules are combined for this package.
         * @return {Boolean}
         */
        isCombine: function () {
            return checkGlobalIfNotExist(this, 'combine');
        },

        /**
         * Get package group (for combo).
         * @returns {String}
         */
        getGroup: function () {
            return checkGlobalIfNotExist(this, 'group');
        }
    };

    Loader.Package = Package;

    /**
     * @class KISSY.Loader.Module
     * @private
     * This class should not be instantiated manually.
     */
    function Module(cfg) {
        var self = this;
        /**
         * exports of this module
         */
        self.exports = undefined;

        /**
         * status of current modules
         */
        self.status = Status.INIT;

        /**
         * name of this module
         */
        self.name = undefined;

        /**
         * factory of this module
         */
        self.factory = undefined;

        // lazy initialize and commonjs module format
        self.cjs = 1;

        mix(self, cfg);

        self.waits = {};

        self.require = function (moduleName) {
            var requiresModule = createModule(self.resolve(moduleName));
            Utils.attachModules(requiresModule.getNormalizedModules());
            return requiresModule.getExports();
        };

        self.require.resolve = function (relativeName) {
            return self.resolve(relativeName);
        };

        // relative name resolve cache
        self.resolveCache = {};
    }

    Module.prototype = {
        kissy: 1,

        constructor: Module,

        resolve: function (relativeName) {
            var resolveCache = this.resolveCache;
            if (resolveCache[relativeName]) {
                return resolveCache[relativeName];
            }
            resolveCache[relativeName] = Utils.normalizePath(this.name, relativeName);
            return resolveCache[relativeName];
        },

        add: function (loader) {
            this.waits[loader.id] = loader;
        },

        remove: function (loader) {
            delete this.waits[loader.id];
        },

        contains: function (loader) {
            return this.waits[loader.id];
        },

        flush: function () {
            Utils.each(this.waits, function (loader) {
                loader.flush();
            });
            this.waits = {};
        },

        /**
         * Get the type if current Module
         * @return {String} css or js
         */
        getType: function () {
            var self = this,
                v = self.type;
            if (!v) {
                if (Utils.endsWith(self.name, '.css')) {
                    v = 'css';
                } else {
                    v = 'js';
                }
                self.type = v;
            }
            return v;
        },

        getExports: function () {
            return this.getNormalizedModules()[0].exports;
        },

        getAlias: function () {
            var self = this,
                name = self.name;
            if (self.normalizedAlias) {
                return self.normalizedAlias;
            }
            var alias = getShallowAlias(self);
            var ret = [];
            if (alias[0] === name) {
                ret = alias;
            } else {
                for (var i = 0, l = alias.length; i < l; i++) {
                    var aliasItem = alias[i];
                    if (aliasItem && aliasItem !== name) {
                        var mod = createModule(aliasItem);
                        var normalAlias = mod.getAlias();
                        if (normalAlias) {
                            ret.push.apply(ret, normalAlias);
                        } else {
                            ret.push(aliasItem);
                        }
                    }
                }
            }
            self.normalizedAlias = ret;
            return ret;
        },

        getNormalizedModules: function () {
            var self = this;
            if (self.normalizedModules) {
                return self.normalizedModules;
            }
            self.normalizedModules = Utils.map(self.getAlias(), function (alias) {
                return createModule(alias);
            });
            return self.normalizedModules;
        },

        /**
         * Get the path url of current module if load dynamically
         * @return {String}
         */
        getUrl: function () {
            var self = this;
            if (!self.url) {
                self.url = S.Config.resolveModFn(self);
            }
            return self.url;
        },

        /**
         * Get the package which current module belongs to.
         * @return {KISSY.Loader.Package}
         */
        getPackage: function () {
            var self = this;
            if (!self.packageInfo) {
                var packages = Config.packages,
                    modNameSlash = self.name + '/',
                    pName = '',
                    p;
                for (p in packages) {
                    if (Utils.startsWith(modNameSlash, p + '/') && p.length > pName.length) {
                        pName = p;
                    }
                }
                self.packageInfo = packages[pName] || packages.core;
            }
            return self.packageInfo;
        },

        /**
         * Get the tag of current module.
         * tag can not contain ".", eg: Math.random() !
         * @return {String}
         */
        getTag: function () {
            var self = this;
            return self.tag || self.getPackage().getTag();
        },

        /**
         * Get the charset of current module
         * @return {String}
         */
        getCharset: function () {
            var self = this;
            return self.charset || self.getPackage().getCharset();
        },

        setRequiresModules: function (requires) {
            var self = this;
            var requiredModules = self.requiredModules = Utils.map(normalizeRequires(requires, self), function (m) {
                return createModule(m);
            });
            var normalizedRequiredModules = [];
            Utils.each(requiredModules, function (mod) {
                normalizedRequiredModules.push.apply(normalizedRequiredModules, mod.getNormalizedModules());
            });
            self.normalizedRequiredModules = normalizedRequiredModules;
        },

        getNormalizedRequiredModules: function () {
            var self = this;
            if (self.normalizedRequiredModules) {
                return self.normalizedRequiredModules;
            }
            self.setRequiresModules(self.requires);
            return self.normalizedRequiredModules;
        },

        getRequiredModules: function () {
            var self = this;
            if (self.requiredModules) {
                return self.requiredModules;
            }
            self.setRequiresModules(self.requires);
            return self.requiredModules;
        },

        attachSelf: function () {
            var self = this,
                factory = self.factory,
                exports;

            if (typeof factory === 'function') {
                self.exports = {};
                // compatible and efficiency
                // KISSY.add(function(S,undefined){})
                // 需要解开 index，相对路径
                // 但是需要保留 alias，防止值不对应
                //noinspection JSUnresolvedFunction
                var requires = self.requires;
                exports = factory.apply(self,
                    // KISSY.add(function(S){module.require}) lazy initialize
                    (
                        self.cjs ? [S,
                                requires && requires.length ?
                                self.require :
                                undefined,
                            self.exports,
                            self] :
                            [S].concat(Utils.map(self.getRequiredModules(), function (m) {
                                return m.getExports();
                            }))
                        )
                );
                if (exports !== undefined) {
                    // noinspection JSUndefinedPropertyAssignment
                    self.exports = exports;
                }
            } else {
                //noinspection JSUndefinedPropertyAssignment
                self.exports = factory;
            }

            self.status = ATTACHED;
        },

        attach: function () {
            var self = this,
                status;
            status = self.status;
            // attached or circular dependency
            if (status >= ATTACHING) {
                self.status = ATTACHED;
                return;
            }
            self.status = ATTACHING;
            if (self.cjs) {
                // commonjs format will call require in module code again
                self.attachSelf();
            } else {
                Utils.each(self.getNormalizedRequiredModules(), function (m) {
                    m.attach();
                });
                self.attachSelf();
            }
            return self;
        }
    };

    function pluginAlias(name) {
        var index = name.indexOf('!');
        if (index !== -1) {
            var pluginName = name.substring(0, index);
            name = name.substring(index + 1);
            var Plugin = createModule(pluginName).attach().exports || {};
            if (Plugin.alias) {
                name = Plugin.alias(S, name, pluginName);
            }
        }
        return name;
    }

    function normalizeRequires(requires, self) {
        requires = requires || [];
        var l = requires.length;
        for (var i = 0; i < l; i++) {
            requires[i] = self.resolve(requires[i]);
        }
        return requires;
    }

    function getShallowAlias(mod) {
        var name = mod.name,
            packageInfo,
            alias = mod.alias;
        if (typeof alias === 'string') {
            mod.alias = alias = [alias];
        }
        if (alias) {
            return alias;
        }
        packageInfo = mod.getPackage();
        if (packageInfo.alias) {
            alias = packageInfo.alias(name);
        }
        alias = mod.alias = alias || [
            pluginAlias(name)
        ];
        return alias;
    }

    Loader.Module = Module;
})(KISSY);