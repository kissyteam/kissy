/**
 * @ignore
 * mix loader into KISSY and infer KISSY baseUrl if not set
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Env = S.Env,
        Utils = Loader.Utils,
        ComboLoader = Loader.ComboLoader;
    var logger = S.getLogger('s/loader');
    var mods = Env.mods = {};

    Utils.mix(S, {
        getModule: function (modName) {
            return Utils.getOrCreateModuleInfo(modName);
        },

        getPackage: function (packageName) {
            return S.Config.packages[packageName];
        },

        /**
         * Registers a module with the KISSY global.
         * @param {String} name module name.
         * it must be set if combine is true in {@link KISSY#config}
         * @param {Function} factory module definition function that is used to return
         * exports of this module
         * @param {KISSY} factory.S KISSY global instance
         * @param {Object} [cfg] module optional config data
         * @param {String[]} cfg.requires this module's required module name list
         * @member KISSY
         *
         *
         *      // dom module's definition
         *      KISSY.add('dom', function(S, xx){
         *          return {css: function(el, name, val){}};
         *      },{
         *          requires:['xx']
         *      });
         */
        add: function (name, factory, cfg) {
            ComboLoader.add(name, factory, cfg, arguments.length);
        },
        /**
         * Attached one or more modules to global KISSY instance.
         * @param {String|String[]} modNames moduleNames. 1-n modules to bind(use comma to separate)
         * @param {Function} success callback function executed
         * when KISSY has the required functionality.
         * @param {KISSY} success.S KISSY instance
         * @param success.x... modules exports
         * @member KISSY
         *
         *
         *      // loads and attached overlay,dd and its dependencies
         *      KISSY.use('overlay,dd', function(S, Overlay){});
         */
        use: function (modNames, success) {
            var normalizedModNames,
                loader,
                error,
                tryCount = 0;

            if (typeof success === 'object') {
                //noinspection JSUnresolvedVariable
                error = success.error;
                //noinspection JSUnresolvedVariable
                success = success.success;
            }

            modNames = Utils.getModNamesAsArray(modNames);
            modNames = Utils.normalizeModNamesWithAlias(modNames);

            normalizedModNames = Utils.unalias(modNames);

            var unloadedModNames = normalizedModNames;

            function loadReady() {
                ++tryCount;
                var errorList = [],
                    start;

                if ('@DEBUG@') {
                    start = +new Date();
                }

                var unloadedMods = loader.calculate(unloadedModNames, errorList);
                var unloadModsLen = unloadedMods.length;
                logger.debug(tryCount + ' check duration ' + (+new Date() - start));
                if (errorList.length) {
                    if (error) {
                        try {
                            error.apply(S, errorList);
                        } catch (e) {
                            S.log(e.stack || e, 'error');
                            /*jshint loopfunc:true*/
                            setTimeout(function () {
                                throw e;
                            }, 0);
                        }
                    }
                    S.log(errorList, 'error');
                    S.log('loader: load above modules error', 'error');
                } else if (loader.isCompleteLoading()) {
                    Utils.attachModsRecursively(normalizedModNames);
                    if (success) {
                        try {
                            success.apply(S, Utils.getModules(modNames));
                        } catch (e) {
                            S.log(e.stack || e, 'error');
                            /*jshint loopfunc:true*/
                            setTimeout(function () {
                                throw e;
                            }, 0);
                        }
                    }
                } else {
                    // in case all of its required mods is loading by other loaders
                    loader.callback = loadReady;
                    if (unloadModsLen) {
                        logger.debug(tryCount + ' reload ');
                        unloadedModNames = [];
                        for (var i = 0; i < unloadModsLen; i++) {
                            unloadedModNames.push(unloadedMods[i].name);
                        }
                        loader.use(unloadedMods);
                    }
                }
            }

            loader = new ComboLoader(loadReady);

            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            loadReady();
            return S;
        },

        /**
         * get module exports from KISSY module cache
         * @param {String} moduleName module name
         * @member KISSY
         * @return {*} exports of specified module
         */
        require: function (moduleName) {
            // cache module read
            if (mods[moduleName] && mods[moduleName].status === Loader.Status.ATTACHED) {
                return mods[moduleName].exports;
            }
            var moduleNames = Utils.normalizeModNames([moduleName]);
            Utils.attachModsRecursively(moduleNames);
            return Utils.getModules(moduleNames)[1];
        }
    });
})(KISSY);

/*
 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback
 */