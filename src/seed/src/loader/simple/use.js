/**
 * @ignore
 * @fileOverview use and attach mod for kissy simple loader
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {
    if (S.Env.nodejs) {
        return;
    }

    var Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils,
        IE = utils.IE,
        LOADING = data.LOADING,
        LOADED = data.LOADED,
        ERROR = data.ERROR,
        ALL_REQUIRES = '__allRequires',
        CURRENT_MODULE = '__currentModule',
        ATTACHED = data.ATTACHED;

    function LoadChecker() {
        this.listeners = [];
        this.results = {};
        this.registeredMod = {};
    }

    LoadChecker.prototype = {

        addListener: function (fn, modName) {
            if (!modName || !this.registeredMod[modName]) {
                this.listeners.unshift(fn);
                if (modName) {
                    this.registeredMod[modName] = 1;
                }
                return 1;
            }
            return 0;
        },

        removeListener: function (fn) {
            var listeners = this.listeners;
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        },

        check: function () {
            S.each(this.listeners.slice(0), function (fn) {
                fn();
            });
        },

        inResult: function (modName) {
            return modName in this.results;
        }

    };


    S.augment(Loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * @member KISSY.Loader
         *
         * for example:
         *      @example
         *      S.use('mod-name', callback);
         *      S.use('mod1,mod2', callback);
         *
         * @param {String|String[]} modNames names of mods to be loaded,if string then separated by space
         * @param {Function} callback callback when modNames are all loaded,
         * with KISSY as first argument and mod 's value as the following arguments
         */
        use: function (modNames, callback) {
            var self = this,
                loadChecker = new LoadChecker(),
                SS = self.SS;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(SS, modNames);

            var normalizedModNames = utils.unalias(SS, modNames), end;

            loadChecker.addListener(end = function () {
                var all = S.reduce(normalizedModNames, function (a, modName) {
                    return a && loadChecker.inResult(modName);
                }, 1);
                if (all) {
                    // prevent call duplication
                    loadChecker.removeListener(end);
                    callback && callback.apply(SS, utils.getModules(SS, modNames));
                    callback = null;
                }
            });

            attachMods(self, normalizedModNames, loadChecker);

            return self;
        }
    });

    function attachMods(self, mods, loadChecker) {
        S.each(mods, function (m) {
            attachModByName(self, m, loadChecker);
        });
    }

    function attachModByName(self, modName, loadChecker) {

        var SS = self.SS,
            debug = S.Config.debug,
            mods = SS.Env.mods,
            mod;

        utils.createModuleInfo(SS, modName);
        mod = mods[modName];

        function ready() {

            if (mod.status == ATTACHED) {
                return 1;
            } else if (mod.status != LOADED) {
                return 0;
            }

            var requires = mod.getNormalizedRequires(),
                all = S.reduce(requires, function (a, r) {
                    return a && loadChecker.inResult(r)
                }, 1);

            if (all) {
                utils.attachMod(SS, mod);
                return 1;
            } else {
                return 0;
            }
        }

        function end() {
            if (ready()) {
                loadChecker.removeListener(end);
                loadChecker.results[modName] = 1;
                // a module is ready, need to notify other modules globally
                // chain effect
                loadChecker.check();
                return 1;
            }
            return 0;
        }

        if (end()) {
            return;
        }

        if (loadChecker.addListener(end, modName)) {
            attachModRecursive(self, mod, loadChecker);
            if (debug) {
                cyclicCheck(SS, modName);
            }
        } else if (debug) {
            // this mod is already listened
            checkCyclicRecursive(SS, modName);
        }
    }

    function checkCyclicRecursive(SS, modName) {
        // S.log('checkCyclicRecursive :' + modName, 'warn');
        cyclicCheck(SS, modName);
        var requires = SS.Env.mods[modName].getNormalizedRequires();
        S.each(requires, function (r) {
            if (SS.Env.mods[r].status != ATTACHED) {
                checkCyclicRecursive(SS, r);
            }
        });
    }

    // Attach a module and all required modules.
    function attachModRecursive(self, mod, loadChecker) {

        var requires = mod.getNormalizedRequires();

        // attach all required modules
        attachMods(self, requires, loadChecker);

        if (mod.status < LOADING) {
            // load and attach this module
            loadModByScript(self, mod, loadChecker);
        }

    }

    // Load a single module.
    function loadModByScript(self, mod, loadChecker) {

        var SS = self.SS,
            modName = mod.getName(),
            charset = mod.getCharset(),
            url = mod.getFullPath(),
            isCss = mod.getType() == 'css';

        mod.status = LOADING;

        if (IE && !isCss) {
            self.__startLoadModuleName = modName;
            self.__startLoadTime = Number(+new Date());
        }

        S.getScript(url, {
            // syntaxError in all browser will trigger this
            // same as #111 : https://github.com/kissyteam/kissy/issues/111
            success: function () {
                if (isCss) {
                    // css does not set LOADED because no add for css! must be set manually
                    utils.registerModule(SS, modName, S.noop);
                } else {
                    var currentModule;
                    // does not need this step for css
                    // standard browser(except ie9) fire load after KISSY.add immediately
                    if (currentModule = self[CURRENT_MODULE]) {
                        S.log('standard browser get mod name after load : ' + modName);
                        utils.registerModule(SS,
                            modName, currentModule.fn,
                            currentModule.config);
                        self[CURRENT_MODULE] = null;
                    }
                }
                checkAndHandle();
            },
            error: checkAndHandle,
            // source:mod.name + '-init',
            charset: charset
        });

        function checkAndHandle() {
            if (mod.fn) {
                var requires = mod.getNormalizedRequires();

                if (requires.length) {
                    attachMods(self, requires, loadChecker);
                } else {
                    // a mod is loaded, need to check globally at least once
                    loadChecker.check();
                }
            } else {
                // ie will call success even when getScript error(404)
                _modError();
            }
        }

        function _modError() {
            S.log(modName + ' is not loaded! can not find module in path : ' + url, 'error');
            mod.status = ERROR;
        }

    }

    // check cyclic dependency between mods
    function cyclicCheck(SS, modName) {
        // one mod 's all requires mods to run its callback
        var mods = SS.Env.mods,
            mod = mods[modName],
            __allRequires = mod[ALL_REQUIRES] = mod[ALL_REQUIRES] || {},
            requires = mod.getNormalizedRequires(),
            myName = mod.name,
            rMod,
            r__allRequires;

        S.each(requires, function (r) {
            rMod = mods[r];
            __allRequires[r] = 1;
            if (rMod && (r__allRequires = rMod[ALL_REQUIRES])) {
                S.mix(__allRequires, r__allRequires);
            }
        });

        if (__allRequires[myName]) {
            S.log(__allRequires, 'error');
            var JSON = S.Env.host.JSON,
                error = '';
            if (JSON) {
                error = JSON.stringify(__allRequires);
            }
            S.error('find cyclic dependency by mod ' + myName + ' between mods: ' + error);
        }
    }
})(KISSY);

/*
 2012-09-20 yiminghe@gmail.com refactor
 - 参考 async 重构，去除递归回调
 */