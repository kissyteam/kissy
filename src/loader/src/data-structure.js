/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Config = S.Config,
        Utils = Loader.Utils,
        mix = Utils.mix;

    function checkGlobalIfNotExist(self, property) {
        return property in self ?
            self[property] :
            Config[property];
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

        /**
         * Tag for package.
         * tag can not contain ".", eg: Math.random() !
         * @return {String}
         */
        getTag: function () {
            return checkGlobalIfNotExist(this, 'tag');
        },

        /**
         * Get package name.
         * @return {String}
         */
        getName: function () {
            return this.name;
        },

        /**
         * get package url
         */
        getBase: function () {
            return this.base;
        },

        /**
         * Whether is debug for this package.
         * @return {Boolean}
         */
        isDebug: function () {
            return checkGlobalIfNotExist(this, 'debug');
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
        self.exports = {};

        /**
         * status of current modules
         */
        self.status = Loader.Status.INIT;

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
    }

    Module.prototype = {
        kissy: 1,

        constructor: Module,

        /**
         * resolve module by name.
         * @param {String|String[]} relativeName relative module's name
         * @param {Function|Object} fn KISSY.use callback
         * @returns {String} resolved module name
         */
        use: function (relativeName, fn) {
            relativeName = Utils.getModNamesAsArray(relativeName);
            return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
        },

        // use by xtemplate include
        resolve: function (relativeName) {
            return Utils.normalizePath(this.name, relativeName);
        },

        /**
         * require other modules from current modules
         * @param {String} moduleName name of module to be required
         * @returns {*} required module exports
         */
        require: function (moduleName) {
            return S.require(moduleName, this.name);
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

        getAlias: function () {
            var self = this,
                name = self.name,
                aliasFn,
                packageInfo,
                alias = self.alias;
            if (!('alias' in self)) {
                packageInfo = self.getPackage();
                if (packageInfo.alias) {
                    alias = packageInfo.alias(name);
                }
                if (!alias && (aliasFn = Config.alias)) {
                    alias = aliasFn(name);
                }
            }
            return alias;
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
         * Get the name of current module
         * @return {String}
         */
        getName: function () {
            return this.name;
        },

        /**
         * Get the package which current module belongs to.
         * @return {KISSY.Loader.Package}
         */
        getPackage: function () {
            var self = this;
            if (!self.packageInfo) {
                var packages = Config.packages || {},
                    modNameSlash = self.name + '/',
                    pName = '',
                    p;
                for (p in packages) {
                    if (Utils.startsWith(modNameSlash, p + '/') && p.length > pName.length) {
                        pName = p;
                    }
                }
                self.packageInfo = packages[pName] || Config.corePackage;
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

        /**
         * get alias required module names
         * @returns {String[]} alias required module names
         */
        getRequiresWithAlias: function () {
            var self = this,
                requiresWithAlias = self.requiresWithAlias,
                requires = self.requires;
            if (!requires || requires.length === 0) {
                return requires || [];
            } else if (!requiresWithAlias) {
                self.requiresWithAlias = requiresWithAlias =
                    Utils.normalizeModNamesWithAlias(requires, self.name);
            }
            return requiresWithAlias;
        },

        /**
         * Get module objects required by this module
         * @return {KISSY.Loader.Module[]}
         */
        getRequiredMods: function () {
            var self = this;
            var mods = [];
            Utils.each(self.getNormalizedRequires(), function (r, i) {
                mods[i] = Utils.createModuleInfo(r);
            });
            return mods;
        },

        /**
         * Get module names required by this module
         * @return {String[]}
         */
        getNormalizedRequires: function () {
            var self = this,
                normalizedRequires,
                normalizedRequiresStatus = self.normalizedRequiresStatus,
                status = self.status,
                requires = self.requires;
            if (!requires || requires.length === 0) {
                return requires || [];
            } else if ((normalizedRequires = self.normalizedRequires) &&
                // 事先声明的依赖不能当做 loaded 状态下真正的依赖
                (normalizedRequiresStatus === status)) {
                return normalizedRequires;
            } else {
                self.normalizedRequiresStatus = status;
                self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
                return self.normalizedRequires;
            }
        }
    };

    Loader.Module = Module;
})(KISSY);