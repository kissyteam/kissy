/**
 * @ignore
 * mix loader into KISSY and infer KISSY baseUrl if not set
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    var    logger = S.getLogger('s/loader');
    var Loader = S.Loader,
        Env = S.Env,

        Utils = Loader.Utils,
        processImmediate = S.setImmediate,
        ComboLoader = Loader.ComboLoader;

    function WaitingModules(fn) {
        S.mix(this, {
            fn: fn,
            waitMods: {}
        });
    }

    WaitingModules.prototype = {
        constructor: WaitingModules,

        notifyAll: function () {
            var self = this,
                fn = self.fn;
            if (fn && S.isEmptyObject(self.waitMods)) {
                self.fn = null;
                fn();
            }
        },

        add: function (modName) {
            this.waitMods[modName] = 1;
        },

        remove: function (modName) {
            delete this.waitMods[modName];
        },

        contains: function (modName) {
            return this.waitMods[modName];
        }
    };

    Loader.WaitingModules = WaitingModules;

    S.mix(S, {
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
            ComboLoader.add(name, factory, cfg, S, arguments.length);
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
                finalSuccess,
                waitingModules = new WaitingModules(loadReady);

            if (S.isPlainObject(success)) {
                //noinspection JSUnresolvedVariable
                sync = success.sync;
                //noinspection JSUnresolvedVariable
                error = success.error;
                //noinspection JSUnresolvedVariable
                success = success.success;
            }

            finalSuccess = function () {
                success.apply(S, Utils.getModules(S, modNames));
            };

            modNames = Utils.getModNamesAsArray(modNames);
            modNames = Utils.normalizeModNamesWithAlias(S, modNames);

            normalizedModNames = Utils.unalias(S, modNames);

            function loadReady() {
                ++tryCount;
                var errorList = [],
                    start = S.now(),
                    ret;
                ret = Utils.checkModsLoadRecursively(normalizedModNames, S, undefined, errorList);
                logger.debug(tryCount + ' check duration ' + (S.now() - start));
                if (ret) {
                    Utils.attachModsRecursively(normalizedModNames, S);
                    if (success) {
                        if (sync) {
                            finalSuccess();
                        } else {
                            // standalone error trace
                            processImmediate(finalSuccess);
                        }
                    }
                } else if (errorList.length) {
                    if (error) {
                        if (sync) {
                            error.apply(S, errorList);
                        } else {
                            processImmediate(function () {
                                error.apply(S, errorList);
                            });
                        }
                    }
                } else {
                    logger.debug(tryCount + ' reload ' + modNames);
                    waitingModules.fn = loadReady;
                    loader.use(normalizedModNames);
                }
            }

            loader = new ComboLoader(S, waitingModules);

            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            if (sync) {
                waitingModules.notifyAll();
            } else {
                processImmediate(function () {
                    waitingModules.notifyAll();
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
            if (moduleName) {
                var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName], refName));
                Utils.attachModsRecursively(moduleNames, S);
                return Utils.getModules(S, moduleNames)[1];
            }
        }
    });

    Env.mods = {}; // all added mods
})(KISSY);

/*
 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback
 */