/**
 * @ignore
 * @fileOverview setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Path = S.Path, Loader = S.Loader, Utils = Loader.Utils;

    /**
     * @class KISSY.Loader.Package
     * @private
     * This class should not be instantiated manually.
     */
    function Package(cfg) {
        S.mix(this, cfg);
    }

    S.augment(Package,
        {
            /**
             * Tag for package.
             * @return {String}
             */
            getTag: function () {
                var self = this;
                return self.tag || self.SS.Config.tag;
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
            getBase: function () {
                var self = this;
                return self.base || self.SS.Config.base;
            },

            /**
             * Get package baseUri
             * @return {KISSY.Uri}
             */
            getBaseUri: function () {
                var self = this;
                return self.baseUri || self.SS.Config.baseUri;
            },

            /**
             * Whether is debug for this package.
             * @return {Boolean}
             */
            isDebug: function () {
                var self = this, debug = self.debug;
                return debug === undefined ? self.SS.Config.debug : debug;
            },

            /**
             * Get charset for package.
             * @return {String}
             */
            getCharset: function () {
                var self = this;
                return self.charset || self.SS.Config.charset;
            },

            /**
             * Whether modules are combined for this package.
             * @return {Boolean}
             */
            isCombine: function () {
                var self = this, combine = self.combine;
                return combine === undefined ? self.SS.Config.combine : combine;
            }
        });

    Loader.Package = Package;

    /**
     * @class KISSY.Loader.Module
     * @private
     * This class should not be instantiated manually.
     */
    function Module(cfg) {
        this.status = Loader.STATUS.INIT;
        S.mix(this, cfg);
    }

    S.augment(Module,
        {
            /**
             * Set the value of current module
             * @param v value to be set
             */
            setValue: function (v) {
                this.value = v;
            },

            /**
             * Get the type if current Module
             * @return {String} css or js
             */
            getType: function () {
                var self = this, v;
                if ((v = self.type) === undefined) {
                    if (Path.extname(self.name).toLowerCase() == '.css') {
                        v = 'css';
                    } else {
                        v = 'js';
                    }
                    self.type = v;
                }
                return v;
            },

            /**
             * Get the fullpath of current module if load dynamically
             * @return {String}
             */
            getFullPath: function () {
                var self = this, t, fullpathUri, packageBaseUri;
                if (!self.fullpath) {
                    packageBaseUri = self.getPackage().getBaseUri();
                    fullpathUri = packageBaseUri.resolve(self.getPath());
                    if (t = self.getTag()) {
                        fullpathUri.query.set('t', t);
                    }
                    self.fullpath = Utils.getMappedPath(self.SS, fullpathUri.toString());
                }
                return self.fullpath;
            },

            /**
             * Get the path (without package base)
             * @return {String}
             */
            getPath: function () {
                var self = this;
                return self.path ||
                    (self.path = defaultComponentJsName(self))
            },

            /**
             * Get the value of current module
             * @return {*}
             */
            getValue: function () {
                return this.value;
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
                    (self.packageInfo = getPackage(self.SS, self));
            },

            /**
             * Get the tag of current module
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

            getNormalizedRequires: function () {
                var self = this, normalizedRequires,
                    normalizedRequiresStatus = self.normalizedRequiresStatus,
                    status = self.status,
                    requires = self.requires;
                if (!requires || requires.length == 0) {
                    return requires || [];
                } else if ((normalizedRequires = self.normalizedRequires) &&
                    // 事先声明的依赖不能当做 loaded 状态下真正的依赖
                    (normalizedRequiresStatus == status)) {
                    return normalizedRequires;
                } else {
                    self.normalizedRequiresStatus = status;
                    return self.normalizedRequires =
                        Utils.normalizeModNames(self.SS, requires, self.name);
                }
            }
        });

    Loader.Module = Module;


    function defaultComponentJsName(m) {
        var name = m.name,
            extname = (Path.extname(name) || '').toLowerCase(),
            min = '-min';

        if (extname != '.css') {
            extname = '.js';
        }

        name = Path.join(Path.dirname(name), Path.basename(name, extname));

        if (m.getPackage().isDebug()) {
            min = '';
        }
        return name + min + extname;
    }

    function getPackage(self, mod) {
        var modName = mod.name,
            Env = self.Env,
            packages = Env.packages || {},
            pName = '',
            p,
            packageDesc;

        for (p in packages) {
            if (packages.hasOwnProperty(p)) {
                // longest match
                if (S.startsWith(modName, p) &&
                    p.length > pName.length) {
                    pName = p;
                }
            }
        }

        packageDesc = packages[pName] ||
            Env.defaultPackage ||
            (Env.defaultPackage = new Loader.Package({
                SS: self,
                // need packageName as key
                name: ''
            }));

        return packageDesc;
    }


})(KISSY);
/*
 TODO: implement conditional loader
 */