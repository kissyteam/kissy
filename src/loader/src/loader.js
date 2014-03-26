/**
 * @ignore
 * mix loader into KISSY and infer KISSY baseUrl if not set
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    var logger = S.getLogger('s/loader');
    var Loader = S.Loader,
        Env = S.Env,
        Utils = Loader.Utils,
        processImmediate = S.setImmediate,
        ComboLoader = Loader.ComboLoader;

    Utils.mix(S, {
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
                sync,
                tryCount = 0,
                finalSuccess;

            if (typeof success === 'object') {
                //noinspection JSUnresolvedVariable
                sync = success.sync;
                //noinspection JSUnresolvedVariable
                error = success.error;
                //noinspection JSUnresolvedVariable
                success = success.success;
            }

            finalSuccess = function () {
                success.apply(S, Utils.getModules(modNames));
            };

            modNames = Utils.getModNamesAsArray(modNames);
            modNames = Utils.normalizeModNamesWithAlias(modNames);

            normalizedModNames = Utils.unalias(modNames);

            function loadReady() {
                ++tryCount;
                var errorList = [],
                    start,
                    ret;

                if ('@DEBUG@') {
                    start = +new Date();
                }

                ret = Utils.checkModsLoadRecursively(normalizedModNames, undefined, errorList);
                logger.debug(tryCount + ' check duration ' + (+new Date() - start));
                if (ret) {
                    Utils.attachModsRecursively(normalizedModNames);
                    if (success) {
                        if (sync) {
                            try {
                                finalSuccess();
                            } catch (e) {
                                S.log(e.stack || e, 'error');
                                /*jshint loopfunc:true*/
                                setTimeout(function () {
                                    throw e;
                                }, 0);
                            }

                        } else {
                            // standalone error trace
                            processImmediate(finalSuccess);
                        }
                    }
                } else if (errorList.length) {
                    if (error) {
                        if (sync) {
                            try {
                                error.apply(S, errorList);
                            } catch (e) {
                                S.log(e.stack || e, 'error');
                                /*jshint loopfunc:true*/
                                setTimeout(function () {
                                    throw e;
                                }, 0);
                            }
                        } else {
                            processImmediate(function () {
                                error.apply(S, errorList);
                            });
                        }
                    }
                    S.log(errorList, 'error');
                    S.log('loader: load above modules error', 'error');
                } else {
                    logger.debug(tryCount + ' reload ' + modNames);
                    loader.callback = loadReady;
                    loader.use(normalizedModNames);
                }
            }

            loader = new ComboLoader(loadReady);

            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            if (sync) {
                loader.flush();
            } else {
                processImmediate(function () {
                    loader.flush();
                });
            }
            return S;
        },

        /**
         * get module exports from KISSY module cache
         * @param {String} moduleName module name
         * @param {String} refName internal usage
         * @member KISSY
         * @return {*} exports of specified module
         */
        require: function (moduleName, refName) {
            var moduleNames = Utils.normalizeModNames([moduleName], refName);
            Utils.attachModsRecursively(moduleNames);
            return Utils.getModules(moduleNames)[1];
        }
    });

    Env.mods = {}; // all added mods
})(KISSY);

/*
 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback
 */