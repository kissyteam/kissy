/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Path = S.Path,
        IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri',
        Utils = Loader.Utils;

    function forwardSystemPackage(self, property) {
        return property in self ?
            self[property] :
            self.runtime.Config[property];
    }

    /**
     * @class KISSY.Loader.Package
     * @private
     * This class should not be instantiated manually.
     */
    function Package(cfg) {
        S.mix(this, cfg);
    }

    Package.prototype = {
        constructor: Package,

        reset: function (cfg) {
            S.mix(this, cfg);
        },

        /**
         * Tag for package.
         * tag can not contain ".", eg: Math.random() !
         * @return {String}
         */
        getTag: function () {
            return forwardSystemPackage(this, 'tag');
        },

        /**
         * Get package name.
         * @return {String}
         */
        getName: function () {
            return this.name;
        },

        /**
         * Get package base.
         * @return {String}
         */
        'getBase': function () {
            return forwardSystemPackage(this, 'base');
        },

        getPrefixUriForCombo: function () {
            var self = this,
                packageName = self.name;
            return self.getBase() + (
                    packageName && !self.isIgnorePackageNameInUri() ?
                (packageName + '/') :
                ''
                );
        },

        /**
         * get package uri
         */
        getPackageUri: function () {
            var self = this;
            if (!self.packageUri) {
                self.packageUri = new S.Uri(this.getPrefixUriForCombo());
            }
            return self.packageUri;
        },

        /**
         * Get package baseUri
         * @return {KISSY.Uri}
         */
        getBaseUri: function () {
            return forwardSystemPackage(this, 'baseUri');
        },

        /**
         * Whether is debug for this package.
         * @return {Boolean}
         */
        isDebug: function () {
            return forwardSystemPackage(this, 'debug');
        },

        /**
         *  whether request mod file without insert package name into package base
         *  @return {Boolean}
         */
        isIgnorePackageNameInUri: function () {
            return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
        },

        /**
         * Get charset for package.
         * @return {String}
         */
        getCharset: function () {
            return forwardSystemPackage(this, 'charset');
        },

        /**
         * Whether modules are combined for this package.
         * @return {Boolean}
         */
        isCombine: function () {
            return forwardSystemPackage(this, 'combine');
        },

        /**
         * Get package group (for combo).
         * @returns {String}
         */
        getGroup: function () {
            return forwardSystemPackage(this, 'group');
        }
    };

    Loader.Package = Package;

    /**
     * @class KISSY.Loader.Module
     * @private
     * This class should not be instantiated manually.
     */
    function Module(cfg) {
        var module = this;
        /**
         * exports of this module
         */
        module.exports = {};

        /**
         * status of current modules
         */
        module.status = Loader.Status.INIT;

        /**
         * name of this module
         */
        module.name = undefined;
        /**
         * factory of this module
         */
        module.factory = undefined;
        // lazy initialize and commonjs module format
        module.cjs = 1;
        S.mix(module, cfg);
        module.waitedCallbacks = [];
    }

    function makeArray(arr) {
        var ret = [];
        for (var i = 0; i < arr.length; i++) {
            ret[i] = arr[i];
        }
        return ret;
    }

    function wrapUse(fn) {
        if (typeof fn === 'function') {
            fn = {
                success: fn
            };
        }
        if (fn && fn.success) {
            var original = fn.success;
            fn.success = function () {
                original.apply(this, makeArray(arguments).slice(1));
            };
            fn.sync = 1;
            return fn;
        }
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
        'use': function (relativeName, fn) {
            relativeName = Utils.getModNamesAsArray(relativeName);
            return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
        },

        /**
         * resolve path
         * @param {String} relativePath relative path
         * @returns {KISSY.Uri} resolve uri
         */
        'resolve': function (relativePath) {
            return this.getFullPathUri().resolve(relativePath);
        },

        // use by xtemplate include
        'resolveByName': function (relativeName) {
            return Utils.normalDepModuleName(this.name, relativeName);
        },

        /**
         * require other modules from current modules
         * @param {String} moduleName name of module to be required
         * @returns {*} required module exports
         */
        require: function (moduleName) {
            var self = this;
            if (typeof moduleName === 'string') {
                return S.require(moduleName, this.name);
            } else {
                var mods = moduleName;
                for (var i = 0; i < mods.length; i++) {
                    mods[i] = self.resolveByName(mods[i]);
                }
                var args = makeArray(arguments);
                args[0] = mods;
                args[1] = wrapUse(args[1]);
                S.use.apply(S, args);
            }

        },

        wait: function (callback) {
            this.waitedCallbacks.push(callback);
        },

        notifyAll: function () {
            var callback;
            var len = this.waitedCallbacks.length,
                i = 0;
            for (; i < len; i++) {
                callback = this.waitedCallbacks[i];
                try {
                    callback(this);
                } catch (e) {
                    S.log(e.stack || e, 'error');
                    /*jshint loopfunc:true*/
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            }
            this.waitedCallbacks = [];
        },

        /**
         * Get the type if current Module
         * @return {String} css or js
         */
        getType: function () {
            var self = this,
                v = self.type;
            if (!v) {
                if (Path.extname(self.name).toLowerCase() === '.css') {
                    v = 'css';
                } else {
                    v = 'js';
                }
                self.type = v;
            }
            return v;
        },

        /**
         * Get the fullpath uri of current module if load dynamically
         * @return {KISSY.Uri}
         */
        getFullPathUri: function () {
            var self = this,
                t,
                fullPathUri,
                packageBaseUri,
                packageInfo,
                packageName,
                path;
            if (!self.fullPathUri) {
                // fullpath can be specified
                if (self.fullpath) {
                    fullPathUri = new S.Uri(self.fullpath);
                } else {
                    packageInfo = self.getPackage();
                    packageBaseUri = packageInfo.getBaseUri();
                    path = self.getPath();
                    // #262
                    if (packageInfo.isIgnorePackageNameInUri() &&
                        // native mod does not allow ignore package name
                        (packageName = packageInfo.name)) {
                        path = Path.relative(packageName, path);
                    }
                    fullPathUri = packageBaseUri.resolve(path);
                    if ((t = self.getTag())) {
                        t += '.' + self.getType();
                        fullPathUri.query.set('t', t);
                    }
                }
                self.fullPathUri = fullPathUri;
            }
            return self.fullPathUri;
        },

        /**
         * Get the fullpath of current module if load dynamically
         * @return {String}
         */
        getFullPath: function () {
            var self = this,
                fullPathUri;
            if (!self.fullpath) {
                fullPathUri = self.getFullPathUri();
                self.fullpath = fullPathUri.toString();
            }
            return self.fullpath;
        },

        /**
         * Get the path (without package base)
         * @return {String}
         */
        getPath: function () {
            var self = this;
            return self.path || (self.path = defaultComponentJsName(self));
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
            return self.packageInfo ||
                (self.packageInfo = getPackage(self.runtime, self.name));
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
                    Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
            }
            return requiresWithAlias;
        },

        /**
         * Get module objects required by this module
         * @return {KISSY.Loader.Module[]}
         */
        getRequiredMods: function () {
            var self = this,
                runtime = self.runtime;
            return S.map(self.getNormalizedRequires(), function (r) {
                return Utils.createModuleInfo(runtime, r);
            });
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
                self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
                return self.normalizedRequires;
            }
        }
    };

    Loader.Module = Module;

    function defaultComponentJsName(m) {
        var name = m.name,
            extname = '.' + m.getType(),
            min = '-min';

        name = Path.join(Path.dirname(name), Path.basename(name, extname));

        if (m.getPackage().isDebug()) {
            min = '';
        }

        return name + min + extname;
    }

    var systemPackage = new Package({
        name: '',
        runtime: S
    });

    function getPackage(self, modName) {
        var packages = self.config('packages'),
            modNameSlash = modName + '/',
            pName = '',
            p;
        for (p in packages) {
            if (S.startsWith(modNameSlash, p + '/') && p.length > pName.length) {
                pName = p;
            }
        }
        return packages[pName] || systemPackage;
    }
})(KISSY);